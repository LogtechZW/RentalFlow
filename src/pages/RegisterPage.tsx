import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { UserRole } from '@/types/rentflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RENTFLOW_LOGO_URL,
  SPLASH_DESKTOP_BG,
  APP_VERSION
} from '@/services/mockData';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useRentFlow();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Property Manager');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please enter your full name and email.');
      return;
    }
    if (!signUp(name, email, role)) return;
    toast.success('Account created! Please proceed to Sign In.');
    navigate('/signin');
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
        <div className="text-xs text-slate-300">
          <span>Registration Portal</span>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-card/95 border border-border/80 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-serif font-bold text-foreground">Create Account</h2>
            <p className="text-xs text-muted-foreground">
              Register for RentFlow Commercial Property Manager
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullname" className="text-xs">Full Name</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="fullname"
                  required
                  placeholder="e.g. Nyasha Musarurwa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs">Work Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="nyasha@enterprise.co.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-pass" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="reg-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Select Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Select initial role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Property Manager">Property Manager</SelectItem>
                  <SelectItem value="Property Owner">Property Owner</SelectItem>
                  <SelectItem value="Accountant">Accountant</SelectItem>
                  <SelectItem value="Tenant">Tenant</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-10 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Already registered?{' '}
            <Link to="/signin" className="font-semibold text-primary hover:underline">
              Sign In
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
