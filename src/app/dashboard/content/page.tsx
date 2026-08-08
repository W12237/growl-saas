'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { ContentChatbot } from '@/components/content/ContentChatbot';
import { ContentList } from '@/components/content/ContentList';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ContentPlannerPage() {
  const { data: posts, mutate, isLoading } = useSWR('/api/content', fetcher, { fallbackData: [] });

  const handleSaveContent = async (content: string, platform: string | undefined) => {
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: platform || 'Twitter', 
          content,
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 86400000).toISOString() // Schedule for tomorrow
        }),
      });
      mutate(); // Refresh the posts list
    } catch (err) {
      console.error('Failed to save post', err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      });
      mutate();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleNewPost = () => {
    // Look for the chat input and focus it to encourage using the AI
    const input = document.querySelector('input[placeholder^="Draft a"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      <ContentChatbot onSaveContent={handleSaveContent} />
      <ContentList 
        posts={posts} 
        isLoading={isLoading} 
        onDelete={handleDeleteContent}
        onNewPost={handleNewPost}
      />
    </div>
  );
}
