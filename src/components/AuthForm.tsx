'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'flag-icons/css/flag-icons.min.css';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AuthForm() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save phone and photoURL to Firestore after sign up
        let photoURL = '';
        if (selectedFile) {
          setUploading(true);
          const avatarRef = storageRef(storage, `avatars/${userCredential.user.uid}`);
          await uploadBytes(avatarRef, selectedFile);
          photoURL = await getDownloadURL(avatarRef);
          setUploading(false);
        }
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          phone,
          photoURL,
        });
        // Optionally update Firebase Auth profile
        if (photoURL) {
          await updateProfile(userCredential.user, { photoURL });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <PhoneInput
          country={'us'}
          value={phone}
          onChange={phone => {
            setPhone(phone);
            setError('');
          }}
          inputClass="!w-full !px-4 !py-2 !border !rounded !focus:outline-none !focus:ring"
          buttonClass="!bg-gray-50"
          dropdownClass="!bg-white"
          enableSearch
        />
        {isSignUp && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-purple-300 cursor-pointer hover:opacity-80 transition"
              onClick={() => document.getElementById('profile-upload')?.click()}
              title="Click to upload a profile picture"
            >
              <img
                src={previewURL || '/default-avatar.png'}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-xs text-gray-500">Click avatar to upload (optional)</span>
            {uploading && <span className="text-xs text-purple-600 mt-1">Uploading...</span>}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:scale-105 transition-transform duration-200"
          disabled={loading || uploading}
        >
          {loading || uploading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      <div className="my-4 text-center text-gray-500">or</div>
      <button
        onClick={handleGoogleAuth}
        className="w-full py-2 rounded bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
        disabled={loading}
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.7 30.74 0 24 0 14.82 0 6.71 5.8 2.69 14.09l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.18 5.59C43.99 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.18-5.59c-2.01 1.35-4.6 2.15-8.72 2.15-6.38 0-11.87-3.63-14.33-8.79l-7.98 6.2C6.71 42.2 14.82 48 24 48z"/></g></svg>
        Continue with Google
      </button>
      {error && <div className="mt-4 text-red-500 text-center text-sm">{error}</div>}
      <div className="mt-6 text-center">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => setIsSignUp(!isSignUp)}
          type="button"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
} 