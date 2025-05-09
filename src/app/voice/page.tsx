"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import VoiceChatClient from "@/components/VoiceChatClient";
import SidebarNav from '@/components/SidebarNav';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function VoicePage() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name?: string; photoURL?: string }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/home");
      } else {
        setUser(firebaseUser);
        // Fetch user info from Firestore
        try {
          const db = getFirestore(app);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo({ name: data.name || '', photoURL: data.photoURL || '' });
          } else {
            setUserInfo({ name: firebaseUser.displayName || '', photoURL: firebaseUser.photoURL || '' });
          }
        } catch {
          setUserInfo({ name: firebaseUser.displayName || '', photoURL: firebaseUser.photoURL || '' });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-row items-stretch justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-0 md:px-4">
      <SidebarNav user={userInfo} active="voice" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <VoiceChatClient />
      </div>
    </main>
  );
} 