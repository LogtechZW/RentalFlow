import React from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ShieldCheck, Zap, DollarSign, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { corporateLogo } = useRentFlow();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'About' }]} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-3">
          <img src={corporateLogo} alt="RentFlowPro Logo" className="h-12 mx-auto object-contain mb-2" />
          <h1 className="text-3xl font-serif font-bold text-foreground">
            RentFlow Property Manager
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
              Enterprise v2.4.1
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Quiet Couture Royal Blue Edition
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Engineered specifically for commercial properties, multi-story office towers, and shopping centers in Zimbabwe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mb-2">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-foreground">Dual-Currency Sovereignty</h3>
              <p className="text-xs text-muted-foreground">
                Real-time RBZ official interbank exchange rates with automated dual USD & ZiG conversions across invoices, batch exports, and official receipts.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-foreground">CAM Diesel Levy Engine</h3>
              <p className="text-xs text-muted-foreground">
                Proportionally apportions heavy diesel generator fuel operating expenses across occupied commercial square meters during load shedding events.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-sm text-foreground">Hotel-Style Space Rack</h3>
              <p className="text-xs text-muted-foreground">
                Intuitive matrix rack inspired by hotel room grids, featuring custom 100-500 unit numbering and real-time space ledger adjustments.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 rounded-lg bg-card border border-border/80 space-y-4">
          <h2 className="text-lg font-serif font-bold text-foreground">Architectural Integrity & Compliance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>HTML5 Canvas Digital Signature Pad for leases & receipts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-role access (Property Owner, Manager, Accountant, Tenant)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mobile money & digital notification integrations (EcoCash USSD & WhatsApp API)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quiet Couture bespoke design system with royal blue palette</span>
            </div>
          </div>
        </div>

        {/* Developer Deployment Quote & Enterprise Support */}
        <div className="p-6 sm:p-8 rounded-lg bg-gradient-to-r from-slate-900 via-primary/90 to-slate-900 border border-primary/30 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>DIRECT ENTERPRISE ENGINEERING DESK</span>
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight text-white">
                Developer Deployment Quote & Bespoke Integrations
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                Need on-premise RBZ-compliant deployment, multi-tenant billing extensions, or bespoke custom modules for your commercial portfolio? Connect directly with the lead engineering team via instant WhatsApp dispatch.
              </p>
              <div className="text-xs text-slate-300 font-mono pt-1">
                Direct Line / WhatsApp: <span className="text-emerald-300 font-semibold">+263 77 987 1012</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="https://wa.me/263779871012"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <span className="font-mono text-[11px]">(+263 77 987 1012)</span>
              </a>

              <a
                href="https://wa.me/263779871012?text=Hi%20RentFlow%20Developer%2C%20I%20would%20like%20to%20request%20an%20enterprise%20commercial%20deployment%20quote%20for%20our%20Harare%20property%20portfolio."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-white text-slate-950 hover:bg-slate-100 text-xs font-semibold uppercase tracking-wider shadow-md transition-colors"
              >
                <span>Request Deployment Quote</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
