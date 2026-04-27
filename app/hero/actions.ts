'use server';

import { GoogleGenAI } from '@google/genai';

export async function estimateComputePower(hardwareText: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are an expert computational hardware analyst for actuarial models. 
The user will provide a list of their hardware (CPU, GPU, etc...).
Your job is to estimate their total compute power in TeraFLOPS (FP32).

Give a brief response formatted exactly like this:
TOTAL TFLOPS: <number>
EQUIVALENT YEAR (World's #1 Supercomputer): <year>
EQUIVALENT YEAR (Entire World's combined supercomputing power): <year>
ANALYSIS: <1-2 sentences of punchy, actuary-focused analysis of how this hardware changes Monte Carlo simulations or risk modeling.>

Hardware input: "${hardwareText}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return { success: true, text: response.text };
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return { success: false, error: err.message || 'Failed to estimate compute.' };
  }
}
