'use client';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/chatqa/Navbar';

const ChatQA = dynamic(() => import('@/components/chatqa'), { ssr: false });

export default function ChatQAPage() {
  return (
    <main className="h-screen flex flex-col bg-chatqa-bg">
      <Navbar />
      <ChatQA />
    </main>
  );
}
