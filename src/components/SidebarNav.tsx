import React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random&size=128';

interface SidebarNavProps {
  user: { name?: string; photoURL?: string };
  active: 'profile' | 'voice' | 'history';
}

export default function SidebarNav({ user, active }: SidebarNavProps) {
  const router = useRouter();
  const auth = getAuth();
  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/home');
  };
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
      <nav className="flex flex-col gap-2 w-full flex-1">
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
        <button
          className={`w-full text-left px-4 py-2 rounded font-semibold ${active === 'history' ? 'bg-purple-100 text-purple-700 cursor-default' : 'hover:bg-blue-100 text-blue-700'}`}
          onClick={() => active !== 'history' && router.push('/call-history')}
          disabled={active === 'history'}
        >
          Call History
        </button>
      </nav>
      <button
        className="w-full text-left px-4 py-2 rounded border border-red-200 text-red-600 font-semibold mt-8 hover:bg-red-50 transition"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </aside>
  );
} 