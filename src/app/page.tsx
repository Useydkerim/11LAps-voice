'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 relative overflow-hidden">
      {/* Go to Home Page Button */}
      <button
        className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/80 text-blue-700 font-semibold shadow hover:bg-blue-100 transition-colors"
        onClick={() => router.push('/home')}
      >
        ← Go to Home Page
      </button>
      <div className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-[100px] animate-pulse" />
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900 drop-shadow-lg">Realtime Voice Agent</h1>
      <p className="mb-8 text-lg text-gray-700 max-w-xl text-center">
        Experience real-time voice chat in your browser. Sign in to get started and connect instantly with our AI-powered voice agent.
      </p>
      <button
        className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
        onClick={() => setShowAuth(true)}
      >
        Get Started
      </button>
      {showAuth && <AuthForm />}
      <small className="text-xs text-gray-500 mt-10">
        The app requires microphone access to work.
      </small>
    </main>
  );
}

