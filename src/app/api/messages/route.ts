import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, isErrorResponse } from '@/lib/auth';

// Initialize Gemini (only if key exists)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }

    let realChannelId = channelId;
    const userTarget = await prisma.user.findUnique({ where: { id: channelId } });
    
    if (userTarget) {
      realChannelId = [user.id, userTarget.id].sort().join('_');
    }

    const messages = await prisma.message.findMany({
      where: { channelId: realChannelId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: true
      }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.sender.name,
      senderId: msg.senderId,
      time: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: msg.content,
      avatar: msg.sender.avatar || msg.sender.name.charAt(0)
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { channelId, content } = await req.json();

    if (!channelId || !content) {
      return NextResponse.json({ error: 'channelId and content are required' }, { status: 400 });
    }

    // Determine if the channel is actually a user (DM) by checking if a user exists with this ID
    // If not, it's a regular channel.
    let realChannelId = channelId;
    const userTarget = await prisma.user.findUnique({ where: { id: channelId } });
    
    if (userTarget) {
      // Generate a deterministic, unique ID for this pair of users
      realChannelId = [user.id, userTarget.id].sort().join('_');
      
      const dmChannelName = `DM: ${user.name} & ${userTarget.name}`;
      
      const dmChannel = await prisma.channel.upsert({
        where: { id: realChannelId },
        update: {},
        create: { id: realChannelId, name: dmChannelName, type: 'dm', isAI: userTarget.isAI }
      });
    }

    // Save the user's message
    const userMessage = await prisma.message.create({
      data: {
        content,
        senderId: user.id, // Authenticated user
        channelId: realChannelId,
      },
      include: { sender: true }
    });

    // If they sent a message to the Gemini AI DM, trigger Gemini response
    if (userTarget && userTarget.isAI && userTarget.id === 'user-gemini') {
      
      // Async function to call Gemini and save response
      // We don't await this so the user gets their message back immediately (optimistic UI)
      // The polling will pick up the AI response when it's ready.
      const generateAIResponse = async () => {
        try {
          let aiResponseContent = "I'm sorry, I don't have my API key configured yet. Please add GEMINI_API_KEY to the .env file.";
          
          if (genAI) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(content);
            aiResponseContent = result.response.text();
          }

          await prisma.message.create({
            data: {
              content: aiResponseContent,
              senderId: 'user-gemini',
              channelId: realChannelId,
            }
          });
        } catch (aiError) {
          console.error("Failed to generate AI response:", aiError);
          await prisma.message.create({
            data: {
              content: "Error communicating with AI service.",
              senderId: 'user-gemini',
              channelId: realChannelId,
            }
          });
        }
      };

      generateAIResponse();
    }

    return NextResponse.json({
      id: userMessage.id,
      sender: userMessage.sender.name,
      senderId: userMessage.senderId,
      time: userMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userMessage.content,
      avatar: userMessage.sender.avatar || userMessage.sender.name.charAt(0)
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
