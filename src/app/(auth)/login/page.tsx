'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function createSession(idToken: string) {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Failed to create session');
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFEF0] flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(#00000008_1px,transparent_1px),linear-gradient(90deg,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-block border-[3px] border-black bg-[#FFE500] px-4 py-2 shadow-[4px_4px_0px_#000]">
            <span className="font-black text-xl tracking-tight text-black">AI MARKETING ANALYST</span>
          </div>
        </div>

        {/* Card */}
        <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="border-b-[3px] border-black bg-[#FFE500] px-6 py-4">
            <h1 className="font-black text-2xl text-black tracking-tight">SIGN IN</h1>
            <p className="text-sm font-bold text-black/70 mt-1">Access your marketing dashboard</p>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-3 shadow-[3px_3px_0px_#000]">
                <p className="text-sm font-bold text-black">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-[2px] border-black bg-white px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-[2px] bg-black" />
              <span className="text-xs font-black text-black">OR</span>
              <div className="flex-1 h-[2px] bg-black" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow bg-white"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border-[2px] border-black bg-[#FFE500] px-4 py-3 font-black text-sm shadow-[3px_3px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN →'}
              </button>
            </form>
          </div>

          <div className="border-t-[2px] border-black px-6 py-4">
            <p className="text-sm text-center font-medium text-black">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-black underline hover:text-[#FF6B6B] transition-colors">
                Register →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
