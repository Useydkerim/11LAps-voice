'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Select from 'react-select';
import SidebarNav from '@/components/SidebarNav';

// Country data: flag, name, code
const COUNTRY_OPTIONS = [
  { value: '+1', label: '🇺🇸 United States (+1)' },
  { value: '+44', label: '🇬🇧 United Kingdom (+44)' },
  { value: '+90', label: '🇹🇷 Turkey (+90)' },
  { value: '+49', label: '🇩🇪 Germany (+49)' },
  { value: '+33', label: '🇫🇷 France (+33)' },
  { value: '+61', label: '🇦🇺 Australia (+61)' },
  { value: '+81', label: '🇯🇵 Japan (+81)' },
  { value: '+34', label: '🇪🇸 Spain (+34)' },
  { value: '+39', label: '🇮🇹 Italy (+39)' },
  { value: '+91', label: '🇮🇳 India (+91)' },
  // ... (for brevity, add all countries as needed)
];

function splitPhone(phone: string) {
  for (const { value } of COUNTRY_OPTIONS) {
    if (phone.startsWith(value)) {
      return { countryCode: value, local: phone.slice(value.length) };
    }
  }
  return { countryCode: '+1', local: phone };
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random&size=128';

export default function ProfilePage() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    photoURL: ''
  });
  const [countryOption, setCountryOption] = useState(COUNTRY_OPTIONS[0]);
  const [localPhone, setLocalPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Auth and load profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/home');
      } else {
        setUser(firebaseUser);
        setForm((prev) => ({ ...prev, email: firebaseUser.email || '' }));
        // Load profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const { countryCode, local } = splitPhone(data.phone || '');
            const foundOption = COUNTRY_OPTIONS.find(opt => opt.value === countryCode) || COUNTRY_OPTIONS[0];
            setCountryOption(foundOption);
            setLocalPhone(local);
            setForm({
              name: data.name || '',
              lastName: data.lastName || '',
              phone: data.phone || '',
              email: firebaseUser.email || '',
              photoURL: data.photoURL || ''
            });
            setPreviewURL(null); // Reset preview on load
            setSelectedFile(null);
          }
        } catch (err: any) {
          setError('Failed to load profile.');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db, router]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setSuccess('');
    setError('');
  };

  const handlePhoneChange = (option: any, local: string) => {
    setCountryOption(option);
    setLocalPhone(local);
    setForm((prev) => ({ ...prev, phone: option.value + local }));
    setDirty(true);
    setSuccess('');
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess('');
    setError('');
    let photoURL = form.photoURL;
    try {
      if (selectedFile) {
        setUploading(true);
        const avatarRef = storageRef(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, selectedFile);
        photoURL = await getDownloadURL(avatarRef);
        setUploading(false);
      }
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        lastName: form.lastName,
        phone: countryOption.value + localPhone,
        email: form.email,
        photoURL: photoURL || ''
      });
      setForm(prev => ({ ...prev, photoURL }));
      setSuccess('Profile saved!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setDirty(false);
      setSelectedFile(null);
      setPreviewURL(null);
    } catch (err: any) {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setDirty(true);
    setSuccess('');
    setError('');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-row items-stretch justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-0 md:px-4">
      <SidebarNav user={{ name: form.name, photoURL: previewURL || form.photoURL }} active="profile" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 mt-8">
          <div className="flex flex-col items-center mb-6 md:hidden">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-purple-300 cursor-pointer hover:opacity-80 transition"
              onClick={handleAvatarClick}
              title="Click to upload a new profile picture"
            >
              <img
                src={previewURL || form.photoURL || DEFAULT_AVATAR}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-xs text-gray-500 mt-2">Click avatar to upload</span>
            {uploading && <span className="text-xs text-purple-600 mt-1">Uploading...</span>}
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
          <form className="space-y-4" onSubmit={handleSave}>
            <input
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              value={form.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
            />
            <div className="flex gap-2 items-center">
              <div className="w-2/5">
                <Select
                  options={COUNTRY_OPTIONS}
                  value={countryOption}
                  onChange={option => handlePhoneChange(option, localPhone)}
                  classNamePrefix="react-select"
                  isSearchable
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring"
                value={localPhone}
                onChange={e => handlePhoneChange(countryOption, e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring bg-gray-100"
              value={form.email}
              disabled
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:scale-105 transition-transform duration-200"
              disabled={saving || !dirty || uploading}
            >
              {(saving || uploading) ? 'Saving...' : 'Save'}
            </button>
            {success && <div className="text-green-600 text-center text-sm mt-2">{success}</div>}
            {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </main>
  );
} 