import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RENTFLOW_LOGO_URL,
  SPLASH_DESKTOP_BG,
  APP_VERSION,
  INITIAL_USERS
} from '@/services/mockData';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { isDemoMode } from '@/lib/runtime';
import { hasSupabaseConfiguration } from '@/lib/supabase';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, setActiveRole, rbzExchangeRate } = useRentFlow();

  const [email, setEmail] = useState<string>('farai.moyo@rentflow.co.zw');
  const [password, setPassword] = useState<string>('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!await signIn(email, password)) return;
    toast.success('Successfully authenticated!');
    navigate(hasSupabaseConfiguration ? '/onboarding' : '/apps');
  };

  const handleQuickDemoLogin = async (userEmail: string) => {
    const user = INITIAL_USERS.find(u => u.email === userEmail);
    if (user) {
      if (!await signIn(user.email)) return;
      setActiveRole(user.role);
      toast.success(`Signed in as ${user.name} (${user.role})`);
      navigate('/apps');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background">
      {/* Exact uniform background identical to splash page */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${SPLASH_DESKTOP_BG})`,
          filter: 'brightness(1.15) saturate(1.4) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/15 via-cyan-500/10 to-slate-900/75" />
      </div>

      {/* Top Bar / Navigation Header */}
      <header className="relative z-10 w-full py-4 px-6 border-b border-slate-800/60 bg-slate-950/60 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={RENTFLOW_LOGO_URL}
            alt="RentFlowPro Logo"
            className="h-9 w-auto object-contain filter drop-shadow"
          />
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            1 USD = {rbzExchangeRate.toFixed(2)} ZiG
          </div>
          <span className="text-xs text-slate-300 hidden sm:inline">Sign In Portal</span>
        </div>
      </header>

      {/* Main Card Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-card/95 border border-border/80 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-serif font-bold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access the RentFlow Apps Hub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@rentflow.co.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pass" className="text-xs">Password</Label>
                <span className="text-[11px] text-muted-foreground hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
              <span>Sign In to Apps Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Quick Demo Role Accounts */}
          {isDemoMode && <div className="pt-2 border-t border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground block mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Quick Demo Access by Role:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {INITIAL_USERS.map((u) => (
                <Button
                  key={u.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDemoLogin(u.email)}
                  className="h-7 text-[11px] justify-start truncate px-2 hover:bg-muted"
                >
                  <span className="truncate">{u.role}</span>
                </Button>
              ))}
            </div>
          </div>}

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-2.5 text-[11px] text-emerald-400">
            <strong>ZIMRA Dual-Currency Advisory:</strong> Invoicing and receipts automatically itemize USD Nostro and ZiG according to official RBZ interbank rate.
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </main>

      {/* Version Footer */}
      <footer className="relative z-10 py-3 text-center border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400">
        <span>© 2026 RentFlowPro Commercial Management • RentFlowPro v27.0 Enterprise • Zimbabwe Commercial Real Estate</span>
      </footer>
    </div>
  );
};
