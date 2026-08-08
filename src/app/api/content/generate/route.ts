import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!genAI) {
      // Return a simulated response if no API key is provided
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ 
        content: `[Simulated AI Response - Missing GEMINI_API_KEY]\n\nHere is a draft for your ${platform || 'post'}:\n\n${prompt} \n\n#agency #growth #marketing` 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `You are an expert social media and content manager. Generate highly engaging, professional content for ${platform || 'social media'} based on the following instruction:\n\n"${prompt}"\n\nOnly output the post content itself. Do not include introductory phrases like "Here is your post:". Use appropriate formatting and hashtags.`;
    
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({ content: text.trim() });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
