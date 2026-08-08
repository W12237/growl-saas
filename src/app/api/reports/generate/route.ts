import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { client, type, dateRange, prompt } = await req.json();

    if (!client || !type) {
      return NextResponse.json({ error: 'Client and report type are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Generating mock data.");
      // Fallback for demo purposes if no API key
      const mockMetrics = JSON.stringify({
        impressions: '124,500',
        clicks: '12,450',
        conversions: '420',
        ctr: '10%',
        roi: '3.4x'
      });
      
      const newReport = await prisma.report.create({
        data: {
          title: `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Report for ${client}`,
          client,
          type,
          dateRange: dateRange || 'Last 30 Days',
          status: 'ready',
          aiInsights: `(MOCK) AI analysis for ${client}'s ${type} performance reveals strong growth in engagement metrics. The current campaign ROI sits at 3.4x, suggesting that recent shifts in targeting have successfully reached higher-intent audiences. Recommendation: Increase spend on top-performing demographics by 15% in the next cycle.`,
          metrics: mockMetrics,
        }
      });
      return NextResponse.json(newReport);
    }

    // Prepare prompt for Gemini
    const systemPrompt = `You are an expert digital marketing data analyst. The user will provide a client name, report type, date range, and optionally some focus areas.
You need to generate a highly professional, 2-3 paragraph analytical summary of their performance. Make up realistic metrics that sound extremely convincing and professional for an agency.
Also, output your response in the following JSON format:
{
  "insights": "Your 2-3 paragraph summary here...",
  "metrics": {
    "metric1_name": "value",
    "metric2_name": "value",
    "metric3_name": "value",
    "metric4_name": "value"
  }
}
Return ONLY valid JSON.`;

    const userPrompt = `Client: ${client}\nType: ${type}\nDate Range: ${dateRange || 'Last 30 Days'}\nAdditional Focus: ${prompt || 'General performance overview'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        temperature: 0.7,
      }
    });

    let generatedText = response.text || '';
    
    // Clean up potential markdown formatting from JSON output
    if (generatedText.startsWith('```json')) {
      generatedText = generatedText.replace(/```json\n/g, '').replace(/\n```/g, '');
    } else if (generatedText.startsWith('```')) {
      generatedText = generatedText.replace(/```\n/g, '').replace(/\n```/g, '');
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(generatedText.trim());
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON", e);
      // Fallback if JSON parse fails
      parsedData = {
        insights: generatedText,
        metrics: { impressions: "N/A", clicks: "N/A", conversions: "N/A" }
      };
    }

    const newReport = await prisma.report.create({
      data: {
        title: `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Report for ${client}`,
        client,
        type,
        dateRange: dateRange || 'Last 30 Days',
        status: 'ready',
        aiInsights: parsedData.insights,
        metrics: JSON.stringify(parsedData.metrics),
      }
    });

    return NextResponse.json(newReport);
  } catch (error) {
    console.error('Error generating AI report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
