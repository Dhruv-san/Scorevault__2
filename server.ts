import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import rateLimit from 'express-rate-limit';
import { config } from './src/server/config';
import apiRoutes from './src/server/routes/apiRoutes';
import authRoutes from './src/server/routes/authRoutes';
import adminRoutes from './src/server/routes/adminRoutes';
import dataSourceRoutes from './src/server/routes/dataSourceRoutes';
import { errorHandler } from './src/server/middleware/apiHelpers';
import { repositoryFactory } from './src/server/repositories';

const app = express();

app.use(express.json());

// Rate Limiter for Authentication and Mutation endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' }
});

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Rate limit exceeded. Please slow down.' }
});

// Mount Rate-Limited API, Auth, Admin, and Data Source Governance routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', dataSourceRoutes);
app.use('/api/reviews', mutationLimiter);
app.use('/api/claims', mutationLimiter);
app.use('/api', apiRoutes);

// XML Sitemap Endpoint
app.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const instRepo = repositoryFactory.getInstitutionRepository();
    const cityRepo = repositoryFactory.getCityRepository();

    const institutions = await instRepo.getInstitutions();
    const cities = await cityRepo.getCities();

    const baseUrl = 'https://scorevault.in';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/search</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;

    institutions.forEach(inst => {
      xml += `  <url><loc>${baseUrl}/institution/${inst.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    cities.forEach(c => {
      const citySlug = encodeURIComponent(c.name.toLowerCase());
      xml += `  <url><loc>${baseUrl}/schools/${citySlug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
      xml += `  <url><loc>${baseUrl}/colleges/${citySlug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

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

// AI Education Advisor Endpoint
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { prompt, useThinking, institutionContext } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const ai = getAiClient();
    if (useThinking) {
      try {
        const systemInstruction = `You are the Scorevault Senior Admissions Counselor. Provide neutral advice for Indian institutions.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: `${institutionContext ? `Context: ${JSON.stringify(institutionContext)}\n\n` : ''}User Query: ${prompt}`,
          config: { systemInstruction }
        });
        return res.json({ reply: response.text || 'No response', mode: 'thinking_high' });
      } catch (err: any) {
        console.warn('Thinking model fallback:', err?.message);
      }
    }

    const systemInstruction = `You are Scorevault’s Indian Education Intelligence engine. Verify details with Google Search.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }] }
    });

    const candidate = response.candidates?.[0];
    res.json({
      reply: response.text || 'Unable to generate response',
      sources: candidate?.groundingMetadata?.groundingChunks || [],
      mode: 'search_grounded'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
});

app.use(errorHandler);

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
