'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AuthenticationCardProps {
  className?: string;
}

const AuthenticationCard: React.FC<AuthenticationCardProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const user = data.session?.user;
      setSessionUserId(user?.id ?? null);
      setSessionEmail(user?.email ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      const user = sess?.user;
      setSessionUserId(user?.id ?? null);
      setSessionEmail(user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); isMounted = false; };
  }, []);

  const isAuthenticated = useMemo(() => !!sessionUserId, [sessionUserId]);

  async function handleSignUp() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (error) throw error;
      if (!data.session) {
        setInfoMessage('Check your email to confirm your account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Sign out failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4 ${className}`}>
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="text-circle-primary font-circlebodylarge">Signed in</div>
          <div className="text-sm text-circle-primary/80 break-words">User ID: {sessionUserId}</div>
          {sessionEmail ? (
            <div className="text-sm text-circle-primary/80 break-words">Email: {sessionEmail}</div>
          ) : null}
          <button
            className="w-full py-2 rounded-md bg-circle-primary text-white disabled:opacity-60"
            onClick={handleSignOut}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex rounded-lg overflow-hidden border border-circle-primary/20">
            <button
              className={`flex-1 py-2 ${mode === 'signIn' ? 'bg-circle-primary text-white' : 'bg-white text-circle-primary'}`}
              onClick={() => setMode('signIn')}
              disabled={isSubmitting}
            >
              Sign in
            </button>
            <button
              className={`flex-1 py-2 ${mode === 'signUp' ? 'bg-circle-primary text-white' : 'bg-white text-circle-primary'}`}
              onClick={() => setMode('signUp')}
              disabled={isSubmitting}
            >
              Sign up
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 rounded-md border border-circle-primary/30 outline-none"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 rounded-md border border-circle-primary/30 outline-none"
              autoComplete="current-password"
            />

            {errorMessage ? (
              <div className="text-sm text-red-600">{errorMessage}</div>
            ) : null}
            {infoMessage ? (
              <div className="text-sm text-green-700">{infoMessage}</div>
            ) : null}

            <button
              className="w-full py-2 rounded-md bg-circle-primary text-white disabled:opacity-60"
              onClick={mode === 'signIn' ? handleSignIn : handleSignUp}
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (mode === 'signIn' ? 'Signing in...' : 'Signing up...') : (mode === 'signIn' ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationCard;


