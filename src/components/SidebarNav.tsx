import React from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random&size=128';

interface SidebarNavProps {
  user: { name?: string; photoURL?: string };
  active: 'profile' | 'voice';
}

export default function SidebarNav({ user, active }: SidebarNavProps) {
  const router = useRouter();
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white/90 border-r border-gray-200 py-8 px-4 min-h-screen items-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-purple-300">
          <img
            src={user.photoURL || DEFAULT_AVATAR}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2 font-semibold text-gray-700 text-center truncate w-full max-w-[120px]">
          {user.name || 'User'}
        </div>
      </div>
      <nav className="flex flex-col gap-2 w-full">
        <button
          className={`w-full text-left px-4 py-2 rounded font-semibold ${active === 'profile' ? 'bg-purple-100 text-purple-700 cursor-default' : 'hover:bg-blue-100 text-blue-700'}`}
          onClick={() => active !== 'profile' && router.push('/profile')}
          disabled={active === 'profile'}
        >
          Profile
        </button>
        <button
          className={`w-full text-left px-4 py-2 rounded font-semibold ${active === 'voice' ? 'bg-purple-100 text-purple-700 cursor-default' : 'hover:bg-blue-100 text-blue-700'}`}
          onClick={() => active !== 'voice' && router.push('/voice')}
          disabled={active === 'voice'}
        >
          Voice Chat
        </button>
      </nav>
    </aside>
  );
} 