import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  FileText,
  CreditCard,
  Menu,
  TrendingUp,
  Wrench,
  Zap,
  FolderOpen,
  PieChart,
  Settings,
  Info,
  Shield,
  Layers,
  Users,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useRentFlow } from '@/contexts/RentFlowContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rbzExchangeRate, activeRole, currentUser } = useRentFlow();
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  // Hide on auth & splash pages
  const hidePaths = ['/', '/splash', '/login', '/signin', '/register'];
  if (hidePaths.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/apps', icon: Home, matchPaths: ['/apps', '/dashboard'] },
    { label: 'Spaces', path: '/properties', icon: Building2, matchPaths: ['/properties'] },
    { label: 'Invoices', path: '/invoices', icon: FileText, matchPaths: ['/invoices'] },
    { label: 'Payments', path: '/payments', icon: CreditCard, matchPaths: ['/payments'] },
  ];

  const moreModules = [
    { label: 'Dashboard', path: '/dashboard', icon: Home, desc: 'Real-time property metrics & KPIs' },
    { label: 'Portfolios', path: '/portfolios', icon: Layers, desc: 'Malls, Story Buildings & Plazas' },
    { label: 'Tenants CRM', path: '/tenants', icon: Users, desc: 'Leaseholders & contacts' },
    { label: 'WhatsApp Reminders', path: '/whatsapp', icon: MessageSquare, desc: 'Automated overdue wa.me notices' },
    { label: 'Leases & Agreements', path: '/leases', icon: FileCheck2, desc: 'Digital signatures & covenants' },
    { label: 'Turnover Rent', path: '/turnover-rent', icon: TrendingUp, desc: 'Retail breakpoint sales' },
    { label: 'Maintenance & Repairs', path: '/maintenance', icon: Wrench, desc: 'HVAC, lifts & work orders' },
    { label: 'CAM & Infrastructure', path: '/infrastructure', icon: Zap, desc: 'Diesel generator levy & solar' },
    { label: 'Reports & Analytics', path: '/reports', icon: PieChart, desc: 'Commercial financial audits' },
    { label: 'Documents & Vault', path: '/documents', icon: FolderOpen, desc: 'Title deeds & floor plans' },
    { label: 'Integrations & EcoCash', path: '/integrations', icon: Shield, desc: 'Bank APIs & WhatsApp' },
    { label: 'System Settings', path: '/settings', icon: Settings, desc: 'Exchange rates & reset utilities' },
    { label: 'About RentFlow', path: '/about', icon: Info, desc: 'Quiet Couture real estate' },
  ];

  return (
    <>
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.matchPaths.includes(location.pathname);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Sheet Trigger */}
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex-1 flex flex-col items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5 stroke-[1.8px]" />
              <span className="text-[10px] mt-1 tracking-tight">More</span>
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-6 bg-card border-t border-border">
            <SheetHeader className="text-left pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-base font-serif font-bold text-foreground">
                    RentFlow Apps Hub
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Commercial Operations & Management Modules
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  1 USD = {rbzExchangeRate} ZiG
                </Badge>
              </div>
            </SheetHeader>

            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {moreModules.map((mod) => {
                const ModIcon = mod.icon;
                const isCurrent = location.pathname === mod.path;
                return (
                  <button
                    key={mod.path}
                    type="button"
                    onClick={() => {
                      navigate(mod.path);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border/60 hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <ModIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">{mod.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{mod.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span>User: <strong className="text-foreground">{currentUser?.name}</strong></span>
              <span>Role: <strong className="text-primary">{activeRole}</strong></span>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      {/* Mobile spacer so page content isn't covered by bottom navigation bar */}
      <div className="md:hidden h-16 w-full shrink-0" />
    </>
  );
};
