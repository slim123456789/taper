"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { type User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // 1. Get initial user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // 2. Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') setIsOpen(false); // Close menu on logout
    });

    // 3. Close on click outside
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMessage("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setMessage("Link sent!");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The listener above will handle the UI update
  };

  // Shared Style
  const pillStyle = "whitespace-nowrap rounded-full border border-white/18 bg-white/[0.02] px-4 py-1.5 text-[11px] font-medium text-slate-50 hover:border-white/35 hover:bg-white/[0.05] transition-colors";

  return (
    <div ref={containerRef} className="relative z-50">
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={pillStyle}
      >
        {user ? "Account" : "Sign In"}
      </button>

      {/* POPOVER MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[260px] animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl border border-white/15 bg-[#0A0A0A]/95 p-4 shadow-2xl backdrop-blur-md">
            
            {/* Header with Close Button */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {user ? "Your Profile" : "Account Access"}
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-200">✕</button>
            </div>

            {/* STATE 1: LOGGED IN */}
            {user ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">Signed in as</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-white">
                    {user.email}
                  </p>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* STATE 2: LOGGED OUT (Login Form) */
              <>
                {message ? (
                  <div className="py-2 text-center">
                    <p className="text-[11px] font-medium text-emerald-400">{message}</p>
                    <button onClick={() => setIsOpen(false)} className="mt-3 w-full rounded-lg bg-white/5 py-1.5 text-[10px] text-slate-400 hover:bg-white/10">Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[12px] text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
                      autoFocus
                      required
                    />
                    <button type="submit" disabled={loading} className="w-full rounded-lg bg-white py-2 text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-slate-200 disabled:opacity-50">
                      {loading ? "Sending..." : "Send Magic Link"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}