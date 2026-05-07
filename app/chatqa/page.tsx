'use client';

import dynamic from 'next/dynamic';

const ChatQA = dynamic(() => import('@/components/chatqa'), { ssr: false });

export default function ChatQAPage() {
  return (
    <main className="h-full bg-chatqa-bg">
      <ChatQA />
    </main>
  );
}
