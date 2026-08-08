'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Success
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm" style={{ animation: 'fade-in-up 600ms ease-out' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
              <img src="/growl-logo-bg.png" alt="Growl Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Agency OS</h1>
              <p className="text-[10px] text-white/25 font-medium">by Growl</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
          <p className="text-sm text-white/40 mb-8">Sign in to your agency workspace</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-white/20 hover:text-white/40 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showPassword ? (
                    <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" x2="23" y1="1" y2="23"/></>
                  ) : (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  )}
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/[0.04] border-white/10 text-[#B6FF2E] focus:ring-[#B6FF2E]/25" />
                <span className="text-xs text-white/40">Remember me</span>
              </label>
              <Link href="#" className="text-xs font-semibold text-[#B6FF2E]/80 hover:text-[#B6FF2E] transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-white/25">
            Don&apos;t have an account?{' '}
            <a href="https://wa.me/+201032347389" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#B6FF2E]/80 hover:text-[#B6FF2E] transition-colors">
              Sign up via WhatsApp
            </a>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-[#070507]">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#664893]/20 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#B6FF2E]/10 blur-[120px]" />
        <div className="relative z-10 text-center max-w-md px-8" style={{ animation: 'fade-in-up 800ms ease-out 200ms backwards' }}>
          <div className="w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(182,255,46,0.3)]">
            <img src="/growl-logo-bg.png" alt="Growl Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            Your Agency&apos;s
            <span className="block text-gradient-mixed">Operating System</span>
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Manage clients, projects, campaigns, finances, and AI workflows — all in one premium platform built for modern marketing agencies.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
              <p className="text-xs font-semibold text-[#B6FF2E]/80">Empowering modern teams globally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
