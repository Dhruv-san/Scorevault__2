import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { config } from './src/server/config';
import apiRoutes from './src/server/routes/apiRoutes';
import { errorHandler } from './src/server/middleware/apiHelpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Mount modular API routes
app.use('/api', apiRoutes);

// Lazy initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }
    aiClient = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Scorevault API', timestamp: new Date().toISOString() });
});

// AI Education Advisor & Fact-Checking Endpoint
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { prompt, useThinking, institutionContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();

    if (useThinking) {
      try {
        const systemInstruction = `You are the Scorevault Senior Admissions & Education Counselor. 
You provide neutral, rigorous, data-driven comparisons and advice for Indian schools, engineering colleges, universities, and MBA programs.
Tone: Objective, articulate, helpful, realistic about Indian competitive exams (JEE, NEET, CAT, CLAT, CBSE/ICSE), cutoffs, hostel life, return on investment, and placement realties.
Never use marketing jargon. Structure with clear insights and bullet points.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: `${institutionContext ? `Context about institutions: ${JSON.stringify(institutionContext)}\n\n` : ''}User Query: ${prompt}`,
          config: {
            systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH
            }
          }
        });

        return res.json({
          reply: response.text || 'No response generated.',
          mode: 'thinking_high',
          model: 'gemini-3.1-pro-preview'
        });
      } catch (err: any) {
        console.warn('Thinking model failed or requires paid key, falling back to gemini-3.5-flash with search:', err?.message);
      }
    }

    const systemInstruction = `You are Scorevault’s real-time Indian Education Intelligence engine.
You provide verified, current information regarding Indian schools, colleges, NIRF rankings, CBSE/ICSE boards, fees, placements, and campus updates.
Use Google Search data to verify recent details if applicable.
Context about the institutions being discussed: ${institutionContext ? JSON.stringify(institutionContext) : 'None'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [
          {
            googleSearch: {}
          }
        ]
      }
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    res.json({
      reply: response.text || 'Unable to generate response at this time.',
      sources: groundingMetadata?.groundingChunks || [],
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
      mode: 'search_grounded',
      model: 'gemini-3.5-flash'
    });

  } catch (error: any) {
    console.error('Advisor API error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process advice request',
      fallbackAdvice: 'Scorevault recommends cross-referencing NIRF reports, official AICTE/CBSE affiliation numbers, and verified student reviews.'
    });
  }
});

// Centralized error handler
app.use(errorHandler);

// Setup Vite or static serving
async function start() {
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Scorevault server running on http://0.0.0.0:${config.port}`);
  });
}

start();
