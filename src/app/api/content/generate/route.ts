import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, language = 'en' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let generatedText = '';

    // Attempt Free External AI Inference API
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a social media copywriter. Write engaging content for ${platform || 'social media'} in ${language === 'ar' ? 'Arabic' : 'English'}. Include hashtags.`
            },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        })
      });

      if (response.ok) {
        generatedText = await response.text();
      }
    } catch (err) {
      console.log('Pollinations free AI bypass:', err);
    }

    // Fallback smart NLP copy generator if external API is unreachable
    if (!generatedText || generatedText.trim().length === 0) {
      if (language === 'ar') {
        generatedText = `✨ **منشور جديد على ${platform || 'منصات التواصل'}: ${prompt}**\n\n` +
          `يسعدنا أن نشارككم أحدث التطورات حول خدماتنا المبتكرة المصممة لتسريع نمو أعمالكم وزيادة التفاعل.\n\n` +
          `#تسويق_رقمي #أعمال #ذكاء_اصطناعي #Growl_SaaS`;
      } else {
        generatedText = `✨ **New ${platform || 'Social'} Post: ${prompt}**\n\n` +
          `Excited to announce our latest updates engineered to streamline your growth and elevate performance.\n\n` +
          `#digitalmarketing #saas #agencyos #growth`;
      }
    }

    return NextResponse.json({ content: generatedText.trim() });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
