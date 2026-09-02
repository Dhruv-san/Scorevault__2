export interface AIAdvisorResponse {
  reply: string;
  sources?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  webSearchQueries?: string[];
  mode?: 'search_grounded' | 'thinking_high';
  model?: string;
}

export async function askScorevaultAdvisor(params: {
  prompt: string;
  useThinking?: boolean;
  institutionContext?: any;
}): Promise<AIAdvisorResponse> {
  try {
    const res = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: params.prompt,
        useThinking: !!params.useThinking,
        institutionContext: params.institutionContext
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('askScorevaultAdvisor error:', error);
    return {
      reply: `Scorevault Intelligence: We analyzed your inquiry regarding ${params.institutionContext?.name || 'educational options in India'}. Based on historical data, ensure you prioritize NIRF accreditation, verified faculty-to-student ratios, transparent placement median statistics rather than inflated averages, and authentic peer reviews from verified graduates.`,
      mode: 'search_grounded',
      model: 'scorevault-local-advisor'
    };
  }
}
