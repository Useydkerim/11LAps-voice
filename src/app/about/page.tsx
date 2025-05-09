'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 relative overflow-hidden px-4">
      <div className="absolute -z-10 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 blur-[100px] animate-pulse top-10 left-10" />
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Why Realtime Voice Agent?</h1>
      <p className="mb-8 text-lg text-gray-700 max-w-2xl text-center">
        Realtime Voice Agent is your gateway to seamless, AI-powered voice conversations in your browser. No downloads, no hassle—just instant, natural communication.
      </p>
      <ul className="mb-10 space-y-3 max-w-xl text-gray-800">
        <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span>Real-time voice chat with advanced AI</span></li>
        <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span>Secure authentication (Google & Email)</span></li>
        <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span>Personalized user profiles</span></li>
        <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span>Modern, responsive design</span></li>
        <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span>Powered by Next.js, Firebase, and ElevenLabs</span></li>
      </ul>
      <button
        className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
        onClick={() => router.push('/')}
      >
        Go to App
      </button>
    </main>
  );
} 