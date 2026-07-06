'use client';

import React, { useState, useMemo } from 'react';
import { login, signup } from "@/lib/auth/actions";
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

/**
 * FLF Rental — Auth (Sign in / Sign up)
 */
export default function LoginPage() {
  const [activeTab, setActiveTab]       = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword]         = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [termsError, setTermsError]     = useState(false);
  const { theme, toggleTheme } = useTheme();

  const passwordMetrics = useMemo(() => {
    if (!password) return { score: 0, label: '—' };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) s++;
    const labels = ['—', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score: Math.min(s, 4), label: labels[Math.min(s, 4)] };
  }, [password]);

  // SUPABASE AUTH
  const handleSignIn = async (formData: FormData) => {
    const result = await login(formData);
    if (result && !result.success) {
      toast.error('Sign in failed', { description: result.message });
    }
  };

  const handleSignUp = async (formData: FormData) => {
    if (!termsChecked) {
      setTermsError(true);
      toast.error('Terms required', { description: 'You must agree to the Terms and Privacy Policy to create an account.' });
      return;
    }
    const result = await signup(formData);
    if (result && !result.success) {
      toast.error('Sign up failed', { description: result.message });
    } else if (result && result.emailConfirmation) {
      toast.success('Almost there!', { description: 'Check your email and click the confirmation link to activate your account.' });
    }
  };

  const handleComingSoon = () => {
    toast.info("Coming Soon!", {
      description: "This feature is still in development. If you want it, please donate to lexatuan@gmail.com"
    });
  };

  const handlePreparing = () => {
    toast.error("Ještě nic není!", {
      description: "More na co furt klikas"
    });
  };

  return (
    <div className="min-h-screen bg-paper flex font-sans selection:bg-accent/20">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] w-full min-h-screen">

        {/* Brand Panel (Left) */}
        <aside className="hidden lg:flex bg-green-800 text-paper p-9 px-11 pb-11 flex-col relative overflow-hidden">
          {/* Film Grain Texture */}
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.92  0 0 0 0 0.85  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`
            }}
          />

          {/* Accent Glow */}
          <div className="absolute -right-[60px] -top-[60px] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle_at_center,rgba(184,67,30,0.22),transparent_60%)] pointer-events-none z-0" />

          <div className="flex items-center gap-2.5 font-serif text-[19px] tracking-tight relative z-10">
            <span className="w-[30px] h-[30px] bg-paper text-ink rounded-md grid place-items-center font-mono text-[11px] font-semibold">
              FLF
            </span>
            <span>Inventory<em className="italic text-accent font-normal">&nbsp;system</em></span>
          </div>

          <div className="mt-auto relative z-10">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent mb-[18px] flex items-center gap-2.5 after:content-[''] after:flex-1 after:max-w-[120px] after:h-px after:bg-accent after:opacity-45">
              Inventory · A team workspace
            </div>
            <h1 className="font-serif text-[56px] leading-[1.02] tracking-tight font-normal text-paper mb-[18px] max-w-[12ch]">
              Know <em className="italic text-accent font-normal">where</em> every piece of your gear is, <em className="italic text-accent font-normal">every</em> day.
            </h1>
            <p className="text-[15px] leading-[1.55] text-paper/65 max-w-[42ch]">
              A quiet, focused inventory system for content teams. Track cameras, lenses, audio, and lighting — check things out, log returns, and keep a clean record of what's where.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-7 pt-[22px] border-t border-paper/12">
              <div>
                <div className="font-serif text-[28px] font-medium tracking-tight leading-none">52<em className="text-accent italic font-normal">+</em></div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-paper/55 mt-1.5">items tracked</div>
              </div>
              <div>
                <div className="font-serif text-[28px] font-medium tracking-tight leading-none">10</div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-paper/55 mt-1.5">team members</div>
              </div>
              <div>
                <div className="font-serif text-[28px] font-medium tracking-tight leading-none">99<em className="text-accent italic font-normal">.4%</em></div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-paper/55 mt-1.5">return rate</div>
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between gap-4 text-[11.5px] text-paper/50 font-mono tracking-wider">
              <span>FLF · Studio A · Rental ops</span>
              <span className="text-accent opacity-85">v 1.0 — 2026</span>
            </div>
          </div>
        </aside>

        {/* Form Panel (Right) */}
        <section className="bg-paper flex flex-col p-7 lg:p-10 pb-9 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12.5px] text-muted flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
              English (US)
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 grid place-items-center rounded-md border border-transparent text-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4"/><path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
                )}
              </button>
              <a href="/" className="text-[12.5px] text-ink-2 no-underline border-b border-dotted border-border-strong hover:text-accent hover:border-accent">
                Back to inventory →
              </a>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-full max-w-[400px]">

              {/* Tabs */}
              <div className="inline-flex bg-surface-2 border border-border rounded-full p-[3px] mb-6 relative">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`relative z-10 px-[18px] py-[7px] rounded-full text-[13px] font-medium tracking-tight transition-colors duration-160 cursor-pointer ${activeTab === 'signin' ? 'text-paper' : 'text-ink-2'}`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`relative z-10 px-[18px] py-[7px] rounded-full text-[13px] font-medium tracking-tight transition-colors duration-160 cursor-pointer ${activeTab === 'signup' ? 'text-paper' : 'text-ink-2'}`}
                >
                  Create account
                </button>
                <div
                  className="absolute top-[3px] bottom-[3px] bg-ink rounded-full transition-all duration-220 ease-[cubic-bezier(0.32,0.72,0.24,1)]"
                  style={{
                    left: activeTab === 'signin' ? '3px' : '80px',
                    width: activeTab === 'signin' ? '80px' : '120px'
                  }}
                />
              </div>

              {activeTab === 'signin' ? (
                /* Sign-in Panel */
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-serif text-[32px] font-medium tracking-tight leading-[1.1] mb-2">
                    Welcome <em className="italic text-accent font-normal">back</em>.
                  </h2>
                  <p className="text-[14px] text-muted mb-[26px]">Sign in to manage and check out gear.</p>

                  <div className="grid grid-cols-2 gap-2 mb-[18px]">
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2.25 border border-border-strong bg-surface text-ink rounded-lg text-[13px] font-medium hover:bg-surface-2 hover:border-ink-2 transition-colors cursor-pointer"
                      onClick={handleComingSoon}
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5C9.5 39.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"/></svg>
                      Google
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2.25 border border-border-strong bg-surface text-ink rounded-lg text-[13px] font-medium hover:bg-surface-2 hover:border-ink-2 transition-colors cursor-pointer"
                      onClick={handleComingSoon}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.7 2.2-4 2.3-4-1.2-1.8-3.2-2.1-3.9-2.1-1.6-.2-3.2 1-4.1 1-.9 0-2.2-1-3.6-1-1.8 0-3.6 1.1-4.5 2.8-1.9 3.3-.5 8.3 1.4 11 .9 1.3 2 2.8 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.2.9 3.6.9 1.5 0 2.5-1.4 3.4-2.7 1.1-1.5 1.5-3 1.5-3.1-.1-.1-2.9-1.1-2.9-4.4zM13.9 4.8C14.6 3.9 15.1 2.7 15 1.5c-1 .1-2.3.7-3 1.6-.7.7-1.3 2-1.1 3.1 1.1.1 2.3-.5 3-1.4z"/></svg>
                      Apple
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-muted my-[14px] before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
                    or with email
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSignIn(new FormData(e.currentTarget)); }} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-muted font-semibold flex justify-between items-center">
                        Work email
                      </label>
                      <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] gap-2.5 transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                        <span className="text-muted grid place-items-center">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                        </span>
                        <input type="email" name='email' placeholder="you@studio.com" className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted" required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-muted font-semibold flex justify-between items-center">
                        Password
                        <a onClick={handlePreparing} className="normal-case tracking-normal font-medium text-[12px] text-accent no-underline hover:underline cursor-pointer">Forgot?</a>
                      </label>
                      <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] gap-2.5 transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                        <span className="text-muted grid place-items-center">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name='password'
                          placeholder="••••••••"
                          className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="bg-transparent border-0 text-muted grid place-items-center cursor-pointer p-0.5 hover:text-ink-2"
                        >
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[13px] text-ink-2 mt-0.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" className="hidden peer" defaultChecked />
                        <span className="w-4 h-4 rounded border border-border-strong bg-surface grid place-items-center text-transparent transition-all peer-checked:bg-ink peer-checked:border-ink peer-checked:text-paper">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>
                        </span>
                        Keep me signed in
                      </label>
                      <a onClick={handleComingSoon} className="text-accent no-underline hover:underline cursor-pointer">Use SSO instead</a>
                    </div>

                    <button type="submit" className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-ink bg-ink text-paper text-[14px] font-medium tracking-tight mt-1.5 transition-colors hover:bg-ink-2 active:translate-y-px group cursor-pointer">
                      Sign in
                      <svg className="transition-transform duration-160 group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                  </form>

                  <div className="text-center mt-[22px] text-[13px] text-muted">
                    New to FLF? <button onClick={() => setActiveTab('signup')} className="bg-transparent border-0 text-accent font-medium cursor-pointer px-0.5 hover:underline">Create an account</button>
                  </div>
                </div>
              ) : (
                /* Sign-up Panel */
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-serif text-[32px] font-medium tracking-tight leading-[1.1] mb-2">
                    Join your <em className="italic text-accent font-normal">team's</em> cage.
                  </h2>
                  <p className="text-[14px] text-muted mb-[26px]">Create an account to start tracking gear with your crew.</p>

                  <div className="grid grid-cols-2 gap-2 mb-[18px]">
                    <button onClick={handleComingSoon} className="inline-flex items-center justify-center gap-2 px-3 py-2.25 border border-border-strong bg-surface text-ink rounded-lg text-[13px] font-medium hover:bg-surface-2 hover:border-ink-2 transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5C9.5 39.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"/></svg>
                      Google
                    </button>
                    <button onClick={handleComingSoon} className="inline-flex items-center justify-center gap-2 px-3 py-2.25 border border-border-strong bg-surface text-ink rounded-lg text-[13px] font-medium hover:bg-surface-2 hover:border-ink-2 transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.7 2.2-4 2.3-4-1.2-1.8-3.2-2.1-3.9-2.1-1.6-.2-3.2 1-4.1 1-.9 0-2.2-1-3.6-1-1.8 0-3.6 1.1-4.5 2.8-1.9 3.3-.5 8.3 1.4 11 .9 1.3 2 2.8 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.2.9 3.6.9 1.5 0 2.5-1.4 3.4-2.7 1.1-1.5 1.5-3 1.5-3.1-.1-.1-2.9-1.1-2.9-4.4zM13.9 4.8C14.6 3.9 15.1 2.7 15 1.5c-1 .1-2.3.7-3 1.6-.7.7-1.3 2-1.1 3.1 1.1.1 2.3-.5 3-1.4z"/></svg>
                      Apple
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-muted my-[14px] before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
                    or with email
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSignUp(new FormData(e.currentTarget)); }} className="flex flex-col gap-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-muted font-semibold">First name</label>
                        <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                          <input type="text" name="firstName" placeholder="Maya" className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted" required />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-muted font-semibold">Last name</label>
                        <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                          <input type="text" name="lastName" placeholder="Chen" className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted" required />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-muted font-semibold">Work email</label>
                      <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] gap-2.5 transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                        <span className="text-muted grid place-items-center">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                        </span>
                        <input type="email" placeholder="you@studio.com" name='email' className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted" required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-muted font-semibold">Password</label>
                      <div className="flex items-center bg-surface border border-border-strong rounded-lg px-3 h-[42px] gap-2.5 transition-all focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft">
                        <span className="text-muted grid place-items-center">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name='password'
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-transparent border-0 outline-0 flex-1 text-[14px] text-ink h-full tracking-tight placeholder:text-muted"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="bg-transparent border-0 text-muted grid place-items-center cursor-pointer p-0.5 hover:text-ink-2"
                        >
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>

                      {/* Password strength */}
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        <div className={`h-[3px] rounded-sm transition-colors duration-200 ${passwordMetrics.score >= 1 ? (passwordMetrics.score === 1 ? 'bg-status-red' : passwordMetrics.score === 2 ? 'bg-status-amber' : 'bg-status-green') : 'bg-border'}`} />
                        <div className={`h-[3px] rounded-sm transition-colors duration-200 ${passwordMetrics.score >= 2 ? (passwordMetrics.score === 2 ? 'bg-status-amber' : 'bg-status-green') : 'bg-border'}`} />
                        <div className={`h-[3px] rounded-sm transition-colors duration-200 ${passwordMetrics.score >= 3 ? 'bg-status-green' : 'bg-border'}`} />
                        <div className={`h-[3px] rounded-sm transition-colors duration-200 ${passwordMetrics.score >= 4 ? 'bg-status-green' : 'bg-border'}`} />
                      </div>
                      <div className="flex justify-between text-[11.5px] text-muted mt-1.5 font-mono tracking-tight">
                        <span>Strength: <strong className="font-medium text-ink-2">{passwordMetrics.label}</strong></span>
                        <span>{password.length} / 8 min</span>
                      </div>
                    </div>

                    <div className="mt-1.5">
                      <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="hidden peer"
                          checked={termsChecked}
                          onChange={(e) => { setTermsChecked(e.target.checked); if (e.target.checked) setTermsError(false); }}
                        />
                        <span className={`w-4 h-4 rounded border bg-surface grid place-items-center text-transparent transition-all peer-checked:bg-ink peer-checked:border-ink peer-checked:text-paper mt-0.5 shrink-0 ${termsError ? 'border-red-500 ring-2 ring-red-500/30' : 'border-border-strong'}`}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>
                        </span>
                        <span className={`text-[12.5px] leading-[1.5] ${termsError ? 'text-red-500' : 'text-ink-2'}`}>
                          I agree to the <a href="#" className="text-accent no-underline hover:underline">Terms</a> and <a href="#" className="text-accent no-underline hover:underline">Privacy Policy</a>.
                          {termsError && <span className="ml-1 font-medium">(Required)</span>}
                        </span>
                      </label>
                    </div>

                    <button type="submit" className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-ink bg-ink text-paper text-[14px] font-medium tracking-tight mt-1.5 transition-colors hover:bg-ink-2 active:translate-y-px group cursor-pointer">
                      Create account
                      <svg className="transition-transform duration-160 group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                  </form>

                  <div className="text-center mt-[22px] text-[13px] text-muted">
                    Already have an account? <button onClick={() => setActiveTab('signin')} className="bg-transparent border-0 text-accent font-medium cursor-pointer px-0.5 hover:underline">Sign in</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-[11.5px] text-muted font-mono tracking-wider">
            <span>© 2026 FLF Rental</span>
            <div className="flex gap-3">
              <a href="#" className="text-muted no-underline hover:text-ink-2">Privacy</a>
              <span>·</span>
              <a href="#" className="text-muted no-underline hover:text-ink-2">Terms</a>
              <span>·</span>
              <a href="#" className="text-muted no-underline hover:text-ink-2">Contact</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
