'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Avatar } from '@/components/ui';
import useSWR from 'swr';
import { 
  MessageSquare, 
  Hash, 
  Search, 
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Send,
  Plus,
  Sparkles
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ChatDashboard() {
  const { t } = useLanguage();
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: auth } = useSWR('/api/auth/me', fetcher);
  const currentUser = auth?.user;

  // Fetch Sidebar Data (Channels & DMs)
  const { data: sidebarData } = useSWR('/api/channels', fetcher, { 
    fallbackData: { channels: [], directMessages: [] } 
  });
  const channels = sidebarData?.channels || [];
  const directMessages = sidebarData?.directMessages || [];

  // Fetch Messages for active channel (poll every 3 seconds for real-time feel)
  const { data: messagesData, mutate: mutateMessages } = useSWR(
    activeChannel ? `/api/messages?channelId=${activeChannel}` : null,
    fetcher,
    { refreshInterval: 3000, fallbackData: [] }
  );
  const messages = Array.isArray(messagesData) ? messagesData : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChannel) return;
    
    const msgContent = message;
    setMessage('');
    
    // Optimistic UI Update
    const optimisticMsg = {
      id: Math.random(),
      sender: currentUser?.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: msgContent,
      avatar: currentUser?.avatar || currentUser?.name?.charAt(0) || 'Y'
    };
    mutateMessages([...messages, optimisticMsg], false);
    
    // Send to backend
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: activeChannel, content: msgContent }),
    });
    
    // Re-validate to get true server data
    mutateMessages();
  };

  const getActiveChannelName = () => {
    const c = channels.find((c: any) => c.id === activeChannel);
    if (c) return c.name;
    const dm = directMessages.find((d: any) => d.id === activeChannel);
    if (dm) return dm.name;
    return 'general';
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Chat Sidebar */}
      <Card padding="none" className="w-64 lg:w-80 flex-shrink-0 flex flex-col border-white/5 relative overflow-hidden hidden md:flex bg-black/20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
              Chat
            </h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Input 
            icon={<Search className="w-4 h-4" />}
            placeholder="Search messages..." 
            className="bg-white/5 border-white/10"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Channels */}
          <div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
              Channels
              <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-0.5">
              {channels.map((channel: any) => (
                <div 
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeChannel === channel.id 
                      ? 'bg-white/10 text-white font-semibold' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 opacity-50" />
                    <span className="text-sm truncate">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <span className="bg-[#B6FF2E] text-[#0A0A0A] text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                      {channel.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
              Direct Messages
              <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-0.5">
              {directMessages.map((dm: any) => (
                <div 
                  key={dm.id}
                  onClick={() => {
                    // Quick fix because of our seed mapping vs api matching
                    const targetId = dm.isAI ? 'user-gemini' : dm.id;
                    setActiveChannel(targetId);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    (activeChannel === dm.id || activeChannel === (dm.isAI ? 'user-gemini' : '')) 
                      ? 'bg-white/10 text-white font-semibold' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {dm.isAI ? (
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B6FF2E] to-[#34D399] flex items-center justify-center border border-white/10 text-black">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#0A0A0A] bg-[#34D399] w-2.5 h-2.5" />
                      </div>
                    ) : (
                      <Avatar name={dm.name} size="xs" status={dm.status as any} />
                    )}
                    <span className="text-sm truncate">{dm.name}</span>
                  </div>
                  {dm.unread > 0 && (
                    <span className="bg-[#8B5CF6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                      {dm.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card padding="none" className="flex-1 flex flex-col border-white/5 relative overflow-hidden bg-black/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">
                {getActiveChannelName()}
              </h3>
              <p className="text-xs text-white/40">Company-wide announcements and general chatter.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:text-white hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:text-white hover:bg-white/10 transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:text-white hover:bg-white/10 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 flex flex-col min-h-0 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm">
              <MessageSquare className="w-8 h-8 mb-4 opacity-20" />
              <p>No messages yet in this channel.</p>
              <p>Be the first to say hello!</p>
            </div>
          ) : (
            <div className="flex flex-col justify-end min-h-full space-y-6">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex gap-4 group ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.sender === 'Gemini AI' ? (
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B6FF2E] to-[#34D399] flex items-center justify-center text-black">
                         <Sparkles className="w-4 h-4" />
                       </div>
                    ) : (
                      <Avatar name={msg.sender} size="sm" />
                    )}
                  </div>
                  <div className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`flex items-baseline gap-2 mb-1.5 ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-white text-sm">{msg.sender}</span>
                      <span className="text-xs text-white/30">{msg.time}</span>
                    </div>
                    <div className={`
                      px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.sender === 'You' 
                        ? 'bg-[#8B5CF6] text-white rounded-tr-sm shadow-[0_4px_15px_rgba(139,92,246,0.2)]' 
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                      }
                    `}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 relative z-10">
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 focus-within:bg-black/60 transition-colors">
            <button className="px-4 text-white/40 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Message..."
              className="flex-1 bg-transparent py-3.5 text-sm text-white focus:outline-none placeholder:text-white/30"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <div className="flex items-center gap-1 pr-2">
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  message.trim() 
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                    : 'bg-white/5 text-white/40'
                }`}
                onClick={handleSendMessage}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-white/30 font-medium">
              <strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
