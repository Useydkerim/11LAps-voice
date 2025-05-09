'use client';

import dynamic from 'next/dynamic';

const VoiceComponent = dynamic(() => import('./VoiceComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Loading Voice Chat...</h1>
      </div>
    </div>
  ),
});

export default function VoiceComponentWrapper() {
  return <VoiceComponent />;
} 