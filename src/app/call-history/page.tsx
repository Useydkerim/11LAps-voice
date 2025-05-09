"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

interface HistoryItem {
  history_item_id: string;
  voice_name: string;
  text: string;
  date_unix: number;
  state: string;
}

export default function CallHistoryPage() {
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<{ name?: string; photoURL?: string }>({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        window.location.href = "/home";
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
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Fetch call history from API route
    fetch("/api/elevenlabs/history")
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, []);

  const openModal = (item: HistoryItem) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const playAudio = async () => {
    if (!selected) return;
    setAudioLoading(true);
    try {
      const res = await fetch(`/api/elevenlabs/audio?history_item_id=${selected.history_item_id}`);
      if (!res.ok) throw new Error('Failed to fetch audio');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err) {
      alert('Failed to play audio');
    } finally {
      setAudioLoading(false);
    }
  };

  if (loadingUser) {
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-row items-stretch justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-0 md:px-4">
      <SidebarNav user={userInfo} active="history" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full py-12 px-4">
          <h1 className="text-2xl font-bold mb-6">Call History</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Agent</th>
                  <th className="px-4 py-2 text-left">Evaluation</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.history_item_id} className="border-t">
                    <td className="px-4 py-2">{new Date(item.date_unix * 1000).toLocaleString()}</td>
                    <td className="px-4 py-2">{item.voice_name}</td>
                    <td className="px-4 py-2">
                      {item.state === "created" ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Successful</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => openModal(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Modal for call details */}
          {modalOpen && selected && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeModal}>&times;</button>
                <h2 className="text-xl font-semibold mb-2">Call Details</h2>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Date: {new Date(selected.date_unix * 1000).toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mb-1">Agent: {selected.voice_name}</div>
                  <div className="text-sm text-gray-500 mb-1">Evaluation: {selected.state === "created" ? "Successful" : "Failed"}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold mb-1">Transcript:</div>
                  <div className="bg-gray-50 p-2 rounded text-sm whitespace-pre-line">{selected.text}</div>
                </div>
                {/* Play Audio button and audio element */}
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  onClick={playAudio}
                  disabled={audioLoading}
                >
                  {audioLoading ? 'Loading...' : 'Play Audio'}
                </button>
                <audio ref={audioRef} hidden />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 