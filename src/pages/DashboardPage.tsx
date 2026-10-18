import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SpaceLedgerModal } from '@/components/common/SpaceLedgerModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  ArrowUpRight,
  Layers,
  DollarSign,
  Fuel,
  Zap,
  Droplets,
  Building,
  Store,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    spaces,
    properties,
    portfolios,
    tenants,
    invoices,
    payments,
    rbzExchangeRate
  } = useRentFlow();

  const [selectedSpaceForLedger, setSelectedSpaceForLedger] = useState<Space | null>(null);

  // Financial and occupancy metrics matching commercialpotfoliooverview.png
  const totalSpaces = spaces.length;
  const occupiedSpaces = spaces.filter(s => s.status === 'Occupied' || s.status === 'Overdue').length;
  const occupancyPercentage = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;
  const totalLeasableArea = spaces.reduce((sum, s) => sum + (s.sizeSqm || 50), 0);

  const totalTargetRentUSD = spaces.reduce((sum, s) => sum + (s.targetRentUSD || s.baseRentUSD || 0), 0);
  const totalTargetRentZiG = totalTargetRentUSD * rbzExchangeRate;
  const totalCollectedUSD = spaces.reduce((sum, s) => sum + (s.paidThisMonthUSD || 0), 0);
  const collectionRate = totalTargetRentUSD > 0 ? (totalCollectedUSD / totalTargetRentUSD) * 100 : 0;
  const totalArrearsUSD = spaces.reduce((sum, s) => sum + (s.rentalAccumulationUSD || 0), 0);
  const overdueSpacesCount = spaces.filter(s => (s.rentalAccumulationUSD || 0) > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Sticky Global Header */}
      <Header breadcrumbs={[{ label: 'Dashboard' }]} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Toolbar matching commercialpotfoliooverview.png */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
                Commercial Portfolio Overview
              </h1>
              <Badge
                variant="outline"
                className="text-xs font-mono bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900 rounded-md py-0.5 px-2 font-medium"
              >
                1 USD = {rbzExchangeRate.toFixed(2)} Local Curr
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Managing retail malls, office towers, commercial suites, and facilities infrastructure.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate('/invoices')}
              className="h-9 px-3.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-4 h-4" />
              <span>Issue Dual-Currency Invoices</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (spaces.length > 0) {
                  setSelectedSpaceForLedger(spaces[0]);
                }
              }}
              className="h-9 px-3 text-xs border-slate-300 dark:border-slate-700 hover:bg-muted font-normal flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </Button>
          </div>
        </div>

        {/* 4 Top Metric Cards matching commercialpotfoliooverview.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Target Rent & ZiG Equivalent */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold font-serif text-foreground">
                ${totalTargetRentUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Equivalent: ZiG {totalTargetRentZiG.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Card 2: Collection Rate */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold font-serif text-foreground">
                {collectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Collected to date: ${totalCollectedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Card 3: Portfolio Arrears */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold font-serif text-rose-600">
                ${totalArrearsUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overdue spaces: {overdueSpacesCount} tenants
              </p>
            </div>
          </div>

          {/* Card 4: Occupancy & Area */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold font-serif text-foreground">
                {occupancyPercentage}% ({occupiedSpaces}/{totalSpaces} units)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total Leasable Area: {totalLeasableArea} sqm
              </p>
            </div>
          </div>
        </div>

        {/* Commercial Portfolios Collection Summary section matching commercialpotfoliooverview.png */}
        <section className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Commercial Portfolios Collection Summary</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Aggregated rental collection progress, space payments, and outstanding arrears grouped by portfolio.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/portfolios')}
              className="h-8 px-3 text-xs border-slate-300 dark:border-slate-700 hover:bg-muted font-normal flex items-center gap-1 shadow-2xs self-start sm:self-auto"
            >
              <span>All Portfolios ({portfolios.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolios.map(port => {
              const propsInPort = properties.filter(
                p => p.portfolioId === port.id || (port.propertyIds && port.propertyIds.includes(p.id))
              );
              const propIds = propsInPort.map(p => p.id);
              const spacesInPort = spaces.filter(s => propIds.includes(s.propertyId));
              const totalSp = spacesInPort.length;
              const occSp = spacesInPort.filter(s => s.status === 'Occupied' || s.status === 'Overdue').length;
              const monthlyTarget = spacesInPort.reduce((acc, s) => acc + (s.targetRentUSD || s.baseRentUSD || 0), 0);
              const accumPaid = spacesInPort.reduce((acc, s) => acc + (s.paidThisMonthUSD || 0), 0);
              const colRate = monthlyTarget > 0 ? Math.min(100, Math.round((accumPaid / monthlyTarget) * 100)) : 0;
              const arrs = spacesInPort.reduce((acc, s) => acc + (s.rentalAccumulationUSD || 0), 0);

              return (
                <div
                  key={port.id}
                  className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-slate-200 bg-slate-900/90 border-slate-700 rounded-md px-2 py-0.5"
                      >
                        {port.type || 'Story Building'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-amber-300 bg-amber-950/70 border-amber-800 rounded-md px-2 py-0.5"
                      >
                        🏙️ CBD
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-foreground tracking-tight">
                        {port.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {propsInPort.length} Buildings • {occSp}/{totalSp} Spaces Occupied
                      </p>
                    </div>

                    {/* Progress Bar & 3-column stats */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Collection Progress:</span>
                        <span className="font-semibold text-foreground">{colRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${colRate}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-slate-900/80 rounded-md p-1.5 border border-slate-800">
                          <span className="text-[10px] text-muted-foreground block">Target</span>
                          <span className="text-xs font-bold font-mono text-foreground">
                            ${monthlyTarget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="bg-slate-900/80 rounded-md p-1.5 border border-slate-800">
                          <span className="text-[10px] text-muted-foreground block">Collected</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            ${accumPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="bg-slate-900/80 rounded-md p-1.5 border border-slate-800">
                          <span className="text-[10px] text-muted-foreground block">Arrears</span>
                          <span className="text-xs font-bold font-mono text-rose-400">
                            ${arrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (spacesInPort.length > 0) {
                          setSelectedSpaceForLedger(spacesInPort[0]);
                        } else {
                          navigate('/properties');
                        }
                      }}
                      className="h-8 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-medium flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      <span>Space Ledger</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/portfolios')}
                      className="h-8 px-2 text-xs border-slate-300 dark:border-slate-700 hover:bg-muted font-normal flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>View Portfolio</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 Utility Facilities Status Cards matching commercialpotfoliooverview.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Backup Generators */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                    BACKUP GENERATORS
                  </span>
                </div>
                <Badge className="bg-amber-950/70 text-amber-300 border-amber-800 text-[10px] font-normal px-2 py-0">
                  Operational
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                0 hrs logged • $0 Diesel CAM share allocated
              </p>
            </div>
            <Link
              to="/infrastructure"
              className="text-xs font-medium text-amber-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Generator Fuel Logs</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2: Solar PV & FreedomWon Battery */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    SOLAR PV & FREEDOMWON BATTERY
                  </span>
                </div>
                <Badge className="bg-emerald-950/70 text-emerald-300 border-emerald-800 text-[10px] font-normal px-2 py-0">
                  98% SOC
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                680 kWh generated today • Common areas uninterrupted
              </p>
            </div>
            <Link
              to="/infrastructure"
              className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Solar Storage Details</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3: Commercial Borehole Supply */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                    COMMERCIAL BOREHOLE SUPPLY
                  </span>
                </div>
                <Badge className="bg-sky-950/70 text-sky-300 border-sky-800 text-[10px] font-normal px-2 py-0">
                  Tanks 92%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                City water: Offline (12 days) • Borehole yielding 28,000L/day
              </p>
            </div>
            <Link
              to="/infrastructure"
              className="text-xs font-medium text-blue-800 dark:text-blue-300 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Water Filtration Status</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Lower Split Layout: Recent Payments Stream & Commercial Operations Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Space Payments Stream */}
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Recent Space Payments Stream</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time confirmed payments and dual-currency receipts across commercial spaces.
                </p>
              </div>

              <Link
                to="/payments"
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>All Receipts</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {payments.length === 0 ? (
              <div className="py-14 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/60">
                No recent payment transactions recorded. Use the "Record Payment" button to log collections.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {payments.slice(0, 5).map((pay) => (
                  <div key={pay.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">{pay.tenantName || 'Tenant'}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {pay.referenceNumber} • {pay.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 font-mono block">
                        +${pay.amountUSD.toLocaleString()} USD
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ≈ ZiG {(pay.amountUSD * rbzExchangeRate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Commercial Operations Shortcuts */}
          <div className="lg:col-span-4 bg-card border border-border/80 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Commercial Operations
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quick shortcuts for commercial property managers & accountants.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  to="/portfolios"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted/60 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Property Portfolios</span>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-mono h-5 px-1.5">
                    {portfolios.length}
                  </Badge>
                </Link>

                <Link
                  to="/properties"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted/60 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Commercial Spaces & Malls</span>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-mono h-5 px-1.5">
                    {properties.length}
                  </Badge>
                </Link>

                <Link
                  to="/tenants"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted/60 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Tenants & Statements</span>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-mono h-5 px-1.5">
                    {tenants.length}
                  </Badge>
                </Link>

                <Link
                  to="/infrastructure"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted/60 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Backup Infrastructure Logs</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 text-center">
              <span className="text-[11px] text-muted-foreground">
                Commercial Multi-Currency Real Estate System
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Space Payment Ledger Modal */}
      {selectedSpaceForLedger && (
        <SpaceLedgerModal
          space={selectedSpaceForLedger}
          isOpen={!!selectedSpaceForLedger}
          onClose={() => setSelectedSpaceForLedger(null)}
          allSpaces={spaces}
          onNavigateSpace={(newSpace) => setSelectedSpaceForLedger(newSpace)}
        />
      )}

      {/* Global Enterprise Version Footer */}
      <Footer />
    </div>
  );
};
