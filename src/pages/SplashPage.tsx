import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { UserRole } from '@/types/rentflow';
import { Button } from '@/components/ui/button';
import {
  SPLASH_DESKTOP_BG,
  SPLASH_MOBILE_BG,
  INITIAL_USERS
} from '@/services/mockData';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { isDemoMode } from '@/lib/runtime';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, setActiveRole, rbzExchangeRate } = useRentFlow();

  const handleInstantDemo = async (userEmail: string = 'farai.moyo@rentflow.co.zw', role: UserRole = 'Property Manager') => {
    if (!await signIn(userEmail)) return;
    setActiveRole(role);
    toast.success(`Welcome to RentFlowPro! Logged in as ${role}`);
    navigate('/apps');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between bg-transparent text-white">
      {/* Desktop Background Image - High-Definition artwork with pronounced lighter blue logo theme and building (Zero blur, full vivid clarity) */}
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${SPLASH_DESKTOP_BG})`,
          filter: 'brightness(1.15) saturate(1.4) contrast(1.1)',
        }}
      >
        {/* Lighter sky/cyan-blue wash from the logo theme lighting up the building on the left; gentle contrast on right behind container */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/15 via-cyan-500/10 to-slate-900/75" />
      </div>

      {/* Mobile Background Image - Crisp and illuminated with lighter sky/cyan blue */}
      <div
        className="block md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url(${SPLASH_MOBILE_BG})`,
          filter: 'brightness(1.12) saturate(1.35) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-cyan-600/10 to-slate-900/80" />
      </div>

      {/* Top Subtle Brand Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="font-serif font-bold text-sm tracking-wider uppercase text-slate-200">
            RentFlowPro Commercial
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-xs">
            1 USD = {rbzExchangeRate.toFixed(2)} ZiG
          </span>
        </div>
      </header>

      {/* DESKTOP VIEWPORT: Pronounced background image logo clearly visible on left, Side-by-Side with Continue to Sign-In Container on right */}
      <main className="relative z-10 flex-1 hidden md:flex items-center justify-end px-8 lg:px-16 xl:px-24 py-12 max-w-7xl mx-auto w-full">
        {/* Right Side: Continue to Sign In Container Box */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-2xl p-7 lg:p-8 shadow-2xl space-y-5">
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                  Sign In to Portal
                </h2>
                <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enterprise</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Commercial real estate portfolio management, dual-currency billing, sub-meter utilities, and ZIMRA compliance.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => navigate('/signin')}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold tracking-wider uppercase transition-all shadow-xl flex items-center justify-between px-5 group"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

              {isDemoMode && <Button
                variant="outline"
                size="lg"
                onClick={() => handleInstantDemo('farai.moyo@rentflow.co.zw', 'Property Manager')}
                className="w-full h-11 bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white text-xs font-medium tracking-wide flex items-center justify-between px-5 transition-all shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instant Estate Manager Demo
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-700/80 px-2 py-0.5 rounded text-slate-300">
                  1-Click
                </span>
              </Button>}
            </div>

            {/* Quick Role Credentials Switcher */}
            {isDemoMode && <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Quick Role Credentials:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {INITIAL_USERS.slice(0, 4).map((u) => (
                  <Button
                    key={u.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantDemo(u.email, u.role)}
                    className="h-8 text-[11px] bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-700 hover:text-white justify-start truncate px-2"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1.5 shrink-0" />
                    <span className="truncate">{u.role}</span>
                  </Button>
                ))}
              </div>
            </div>}

            {/* Register redirection */}
            <div className="pt-1 text-center text-xs text-slate-400 border-t border-slate-800/50">
              New property owner or commercial tenant?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE VIEWPORT: Pronounced background image logo with Continue to Sign-In Container at bottom (< md) */}
      <main className="relative z-10 flex md:hidden flex-1 flex-col justify-end p-4 pb-6">
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-slate-900/90 border border-slate-700/70 backdrop-blur-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1 border-b border-slate-800/70 pb-3 text-center">
              <h2 className="text-lg font-serif font-bold text-white">
                Sign In to Portal
              </h2>
              <p className="text-[11px] text-slate-300">
                Commercial Real Estate Management Engine
              </p>
            </div>

            <div className="space-y-2.5">
              <Button
                size="lg"
                onClick={() => navigate('/signin')}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold uppercase tracking-wider flex items-center justify-between px-4 shadow-lg"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              {isDemoMode && <Button
                variant="outline"
                size="lg"
                onClick={() => handleInstantDemo('farai.moyo@rentflow.co.zw', 'Property Manager')}
                className="w-full h-10 bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-700 text-xs font-medium flex items-center justify-between px-4 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demo Access
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </Button>}
            </div>

            {/* Quick Demo Roles */}
            {isDemoMode && <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider text-center">
                Quick Role Demo:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {INITIAL_USERS.slice(0, 4).map((u) => (
                  <Button
                    key={u.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantDemo(u.email, u.role)}
                    className="h-7 text-[10px] bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700 justify-start truncate px-2"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 mr-1 shrink-0" />
                    <span className="truncate">{u.role}</span>
                  </Button>
                ))}
              </div>
            </div>}

            <div className="text-center text-[11px] text-slate-400 pt-1">
              Need an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full py-3 px-6 text-center text-[11px] text-slate-400 border-t border-slate-800/50 bg-slate-950/40 backdrop-blur-[2px]">
        RentFlowPro Enterprise Commercial Property Management &copy; 2026. Harare, Zimbabwe.
      </footer>
    </div>
  );
};
