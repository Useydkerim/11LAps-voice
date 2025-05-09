'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthForm from '@/components/AuthForm';

export default function HomePage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-white px-4">
      {/* Login / Sign Up Button */}
      <button
        className="absolute top-6 right-6 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-transform duration-200"
        onClick={() => setShowAuth(true)}
      >
        Login / Sign Up
      </button>
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative">
            <button
              className="absolute -top-4 -right-4 bg-white rounded-full shadow p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAuth(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <AuthForm />
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center py-20">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900 drop-shadow-lg">
          Voice AI Agents for Everyone
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Instantly deploy real-time, AI-powered voice chat in your app or website.<br />
          No downloads. No hassle. Just seamless, human-like conversations.
        </p>
        <button
          className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={() => setShowAuth(true)}
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/80 rounded-xl p-8 shadow-md flex flex-col items-center">
          <span className="text-3xl mb-2">🎤</span>
          <h2 className="font-bold text-lg mb-2">Real-Time Voice Chat</h2>
          <p className="text-gray-600 text-center">
            Experience instant, natural conversations powered by advanced AI.
          </p>
        </div>
        <div className="bg-white/80 rounded-xl p-8 shadow-md flex flex-col items-center">
          <span className="text-3xl mb-2">🔒</span>
          <h2 className="font-bold text-lg mb-2">Secure Authentication</h2>
          <p className="text-gray-600 text-center">
            Sign in with Google or email. Your data is safe and private.
          </p>
        </div>
        <div className="bg-white/80 rounded-xl p-8 shadow-md flex flex-col items-center">
          <span className="text-3xl mb-2">⚡</span>
          <h2 className="font-bold text-lg mb-2">Fast & Reliable</h2>
          <p className="text-gray-600 text-center">
            Built on Next.js, Firebase, and ElevenLabs for speed and reliability.
          </p>
        </div>
        <div className="bg-white/80 rounded-xl p-8 shadow-md flex flex-col items-center">
          <span className="text-3xl mb-2">🧑‍💻</span>
          <h2 className="font-bold text-lg mb-2">Easy Integration</h2>
          <p className="text-gray-600 text-center">
            Add voice AI to your workflow in minutes with our simple API.
          </p>
        </div>
      </section>
    </main>
  );
} 