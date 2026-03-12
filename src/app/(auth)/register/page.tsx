'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      
      const idToken = await cred.user.getIdToken();
      
      // Create session
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) throw new Error('Failed to create session');

      // Create user doc
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      router.push('/settings/websites');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFEF0] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[linear-gradient(#00000008_1px,transparent_1px),linear-gradient(90deg,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-block border-[3px] border-black bg-[#FFE500] px-4 py-2 shadow-[4px_4px_0px_#000]">
            <span className="font-black text-xl tracking-tight text-black">AI MARKETING ANALYST</span>
          </div>
        </div>

        <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="border-b-[3px] border-black bg-black px-6 py-4">
            <h1 className="font-black text-2xl text-[#FFE500] tracking-tight">CREATE ACCOUNT</h1>
            <p className="text-sm font-bold text-white/70 mt-1">Start analyzing your marketing data</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-3 shadow-[3px_3px_0px_#000] mb-4">
                <p className="text-sm font-bold text-black">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-1 text-black uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow bg-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-black mb-1 text-black uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-black mb-1 text-black uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow bg-white"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border-[2px] border-black bg-black text-[#FFE500] px-4 py-3 font-black text-sm shadow-[3px_3px_0px_#FFE500] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#FFE500] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#FFE500] transition-all disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
              </button>
            </form>
          </div>

          <div className="border-t-[2px] border-black px-6 py-4">
            <p className="text-sm text-center font-medium text-black">
              Already have an account?{' '}
              <Link href="/login" className="font-black underline hover:text-[#4D79FF] transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
