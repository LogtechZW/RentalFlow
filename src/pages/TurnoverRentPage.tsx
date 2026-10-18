import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { TurnoverSalesDeclaration } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calculator,
  CheckCircle2,
  FileCheck,
  Building2,
  Store,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const TurnoverRentPage: React.FC = () => {
  const {
    turnoverDeclarations,
    tenants,
    properties,
    spaces,
    addTurnoverDeclaration,
    addSpacePaymentAdjustment,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState<boolean>(false);

  // Joina City Interactive Breakpoint Calculator State
  const joinaCityProperty = properties.find(p => p.name.includes('Joina City')) || properties[0];
  const joinaTenants = tenants.filter(t => t.propertyId === joinaCityProperty?.id);
  const defaultTenant = joinaTenants[0] || tenants[0];

  const [calcTenantId, setCalcTenantId] = useState<string>(defaultTenant?.id || 'ten-1');
  const [calcBreakpointType, setCalcBreakpointType] = useState<'natural' | 'artificial'>('natural');
  const [calcBaseRentUSD, setCalcBaseRentUSD] = useState<number>(2400);
  const [calcTurnoverRate, setCalcTurnoverRate] = useState<number>(6.0); // 6%
  const [calcArtificialThresholdUSD, setCalcArtificialThresholdUSD] = useState<number>(35000);
  const [calcDeclaredGrossSalesUSD, setCalcDeclaredGrossSalesUSD] = useState<number>(48500);

  // Form states for generic modal
  const [tenantId, setTenantId] = useState<string>(tenants[0]?.id || 'ten-1');
  const [period, setPeriod] = useState<string>('October 2026');
  const [grossSales, setGrossSales] = useState<string>('42000');
  const [breakpoint, setBreakpoint] = useState<string>('30000');
  const [rate, setRate] = useState<string>('5.0');

  const canDeclare = ['Property Manager', 'Accountant', 'Administrator', 'Tenant'].includes(activeRole);

  // Active calculator tenant data
  const selectedCalcTenant = tenants.find(t => t.id === calcTenantId) || defaultTenant;
  const selectedCalcSpace = spaces.find(s => s.currentTenantName === selectedCalcTenant?.tradingName || s.propertyId === selectedCalcTenant?.propertyId);

  // Calculate Natural vs Artificial Breakpoint
  const naturalBreakpointThreshold = calcTurnoverRate > 0 ? (calcBaseRentUSD / (calcTurnoverRate / 100)) : 0;
  const effectiveBreakpointThreshold = calcBreakpointType === 'natural' ? naturalBreakpointThreshold : calcArtificialThresholdUSD;
  const excessSalesUSD = Math.max(0, calcDeclaredGrossSalesUSD - effectiveBreakpointThreshold);
  const calculatedTurnoverRentUSD = excessSalesUSD * (calcTurnoverRate / 100);
  const totalCombinedMonthlyRentUSD = calcBaseRentUSD + calculatedTurnoverRentUSD;

  // Handle direct billing from Joina City calculator
  const handlePostTurnoverRentToLedger = () => {
    if (!selectedCalcTenant) {
      toast.error('Please select a retail tenant.');
      return;
    }

    const targetSpace = selectedCalcSpace || spaces.find(s => s.propertyId === selectedCalcTenant.propertyId);

    // Add to declarations table
    addTurnoverDeclaration({
      tenantId: selectedCalcTenant.id,
      tenantName: selectedCalcTenant.tradingName,
      propertyName: joinaCityProperty?.name || 'Joina City',
      unitNumber: selectedCalcTenant.unitNumber || '101',
      month: 'October 2026',
      declaredGrossSalesUSD: calcDeclaredGrossSalesUSD,
      thresholdUSD: effectiveBreakpointThreshold,
      turnoverRatePercent: calcTurnoverRate,
      calculatedTurnoverRentUSD: calculatedTurnoverRentUSD,
      status: 'Invoiced',
    });

    // If space found, post directly to space ledger adjustment
    if (targetSpace) {
      addSpacePaymentAdjustment(targetSpace.id, {
        spaceId: targetSpace.id,
        date: new Date().toISOString().split('T')[0],
        description: `Retail Turnover Rent (${calcBreakpointType === 'natural' ? 'Natural' : 'Artificial'} Breakpoint: Sales $${calcDeclaredGrossSalesUSD.toLocaleString()} vs Threshold $${effectiveBreakpointThreshold.toLocaleString()} @ ${calcTurnoverRate}%)`,
        chargeUSD: calculatedTurnoverRentUSD,
        paymentUSD: 0,
        balanceUSD: calculatedTurnoverRentUSD,
        reference: `TO-RENT-${Date.now()}`,
        type: 'Turnover',
      });
    }

    toast.success(
      `Turnover Rent of $${calculatedTurnoverRentUSD.toFixed(2)} USD (ZiG ${(calculatedTurnoverRentUSD * rbzExchangeRate).toLocaleString()}) billed and posted to ${selectedCalcTenant.tradingName}'s Space Payment Ledger!`
    );
  };

  const handleDeclare = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === tenantId);
    const prop = properties.find(p => p.id === tenant?.propertyId);

    const sales = parseFloat(grossSales) || 0;
    const bp = parseFloat(breakpoint) || 0;
    const pct = parseFloat(rate) || 0;

    const excess = Math.max(0, sales - bp);
    const turnoverRent = excess * (pct / 100);

    addTurnoverDeclaration({
      tenantId,
      tenantName: tenant?.tradingName || 'Retail Tenant',
      propertyName: prop?.name || 'Commercial Center',
      unitNumber: tenant?.unitNumber || '101',
      month: period,
      declaredGrossSalesUSD: sales,
      thresholdUSD: bp,
      turnoverRatePercent: pct,
      calculatedTurnoverRentUSD: turnoverRent,
      status: 'Invoiced',
    });

    toast.success(`Turnover sales declared! Calculated Turnover Rent: $${turnoverRent.toFixed(2)} USD.`);
    setIsDeclareModalOpen(false);
  };

  const totalTurnoverRentUSD = turnoverDeclarations.reduce((sum, d) => sum + d.calculatedTurnoverRentUSD, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Turnover Rent' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Turnover Rent Covenants & Breakpoints
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono border-primary/40 text-primary">
                Joina City Retail Standard
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Natural and artificial sales breakpoints, gross POS revenue audits, and automated percentage rental billing.
            </p>
          </div>

          {canDeclare && (
            <Button size="sm" onClick={() => setIsDeclareModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Submit Turnover Declaration</span>
            </Button>
          )}
        </div>

        {/* Joina City Retail Turnover Rent Breakpoint Calculator & Billing Hub */}
        <Card className="border border-primary/30 shadow-md bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>Joina City Retail Turnover Rent Breakpoint Calculator</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Simulate and calculate natural vs artificial sales breakpoints with instant 1-click billing to tenant space ledgers.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5 bg-muted p-1 rounded-md border border-border">
                <Button
                  type="button"
                  variant={calcBreakpointType === 'natural' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCalcBreakpointType('natural')}
                  className="h-7 text-xs px-2.5 font-medium"
                >
                  Natural Breakpoint (Base Rent ÷ Rate)
                </Button>
                <Button
                  type="button"
                  variant={calcBreakpointType === 'artificial' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCalcBreakpointType('artificial')}
                  className="h-7 text-xs px-2.5 font-medium"
                >
                  Artificial / Fixed Threshold ($)
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Interactive Form Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-md border border-border/60 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Joina City Retail Tenant</Label>
                <Select
                  value={calcTenantId}
                  onValueChange={(val) => {
                    setCalcTenantId(val);
                    const t = tenants.find(x => x.id === val);
                    if (t) {
                      setCalcBaseRentUSD(t.monthlyRentUSD || t.rentAmountUSD || 2200);
                      setCalcTurnoverRate(t.turnoverRentRatePercent || 5.5);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tradingName} (Unit {t.unitNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Contracted Base Rent (USD)</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={calcBaseRentUSD}
                    onChange={(e) => setCalcBaseRentUSD(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-medium"
                  />
                  <span className="text-xs text-muted-foreground font-mono">$</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Agreed Turnover Rate (%)</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.1"
                    value={calcTurnoverRate}
                    onChange={(e) => setCalcTurnoverRate(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-medium"
                  />
                  <span className="text-xs text-muted-foreground font-mono">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">
                  {calcBreakpointType === 'natural' ? 'Computed Natural Breakpoint' : 'Negotiated Breakpoint ($)'}
                </Label>
                {calcBreakpointType === 'natural' ? (
                  <div className="h-8 flex items-center px-2 bg-muted rounded border border-border text-xs font-mono font-bold text-foreground">
                    ${naturalBreakpointThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={calcArtificialThresholdUSD}
                    onChange={(e) => setCalcArtificialThresholdUSD(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-medium"
                  />
                )}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px] text-muted-foreground">Declared Monthly POS Gross Sales (USD)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calcDeclaredGrossSalesUSD}
                    onChange={(e) => setCalcDeclaredGrossSalesUSD(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-bold text-foreground"
                  />
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    ≈ ZiG {(calcDeclaredGrossSalesUSD * rbzExchangeRate).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <Button
                  onClick={handlePostTurnoverRentToLedger}
                  className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Post Turnover Rent to Space Ledger & Billing</span>
                </Button>
              </div>
            </div>

            {/* Live Breakpoint Calculation Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  Breakpoint Threshold
                </span>
                <div className="text-lg font-bold font-serif text-foreground">
                  ${effectiveBreakpointThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {calcBreakpointType === 'natural' ? 'Base ÷ Rate' : 'Negotiated Cap'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  Excess Sales Above Breakpoint
                </span>
                <div className={`text-lg font-bold font-serif ${excessSalesUSD > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  ${excessSalesUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {excessSalesUSD > 0 ? 'Taxable overage' : 'No excess turnover'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 space-y-1 text-emerald-950">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-800 block">
                  Turnover Rent Payable
                </span>
                <div className="text-lg font-bold font-serif text-emerald-800">
                  ${calculatedTurnoverRentUSD.toFixed(2)} USD
                </div>
                <div className="text-[10px] font-mono text-emerald-700">
                  ZiG {(calculatedTurnoverRentUSD * rbzExchangeRate).toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  Total Monthly Rent Due
                </span>
                <div className="text-lg font-bold font-serif text-foreground">
                  ${totalCombinedMonthlyRentUSD.toFixed(2)} USD
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Base ${calcBaseRentUSD.toLocaleString()} + Turnover ${calculatedTurnoverRentUSD.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highlight Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Total Turnover Revenue</span>
                <span className="text-xl font-bold font-serif text-primary">
                  ${totalTurnoverRentUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </span>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  ZiG {(totalTurnoverRentUSD * rbzExchangeRate).toLocaleString()}
                </span>
              </div>
              <TrendingUp className="w-6 h-6 text-primary shrink-0" />
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Active Retail Declarations</span>
                <span className="text-xl font-bold font-serif text-foreground">
                  {turnoverDeclarations.length} Audited Periods
                </span>
                <span className="text-[11px] text-muted-foreground block">Food court & retail boutiques</span>
              </div>
              <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">Calculation Model</span>
                <span className="text-xl font-bold font-serif text-foreground">Natural & Artificial Breakpoints</span>
                <span className="text-[11px] text-muted-foreground block">Excess Gross Sales × Rate %</span>
              </div>
              <Calculator className="w-6 h-6 text-sky-600 shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Declarations Table */}
        <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card shadow-sm">
          <Table className="[&>div]:max-w-full text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Period</TableHead>
                <TableHead className="whitespace-nowrap">Tenant & Unit</TableHead>
                <TableHead className="whitespace-nowrap">Property</TableHead>
                <TableHead className="whitespace-nowrap text-right">Gross Sales (USD)</TableHead>
                <TableHead className="whitespace-nowrap text-right">Breakpoint Threshold</TableHead>
                <TableHead className="whitespace-nowrap text-right">Turnover Rate</TableHead>
                <TableHead className="whitespace-nowrap text-right">Calculated Rent (USD)</TableHead>
                <TableHead className="whitespace-nowrap text-right">Equivalent (ZiG)</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnoverDeclarations.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap font-semibold font-mono text-foreground">
                    {d.month}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium text-foreground">{d.tenantName}</div>
                    <div className="text-[10px] text-muted-foreground">Unit {d.unitNumber}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {d.propertyName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono font-medium">
                    ${d.declaredGrossSalesUSD.toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono text-muted-foreground">
                    ${d.thresholdUSD.toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono text-primary font-semibold">
                    {d.turnoverRatePercent}%
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                    ${d.calculatedTurnoverRentUSD.toFixed(2)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono text-muted-foreground">
                    ZiG {(d.calculatedTurnoverRentUSD * rbzExchangeRate).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] h-5 border-emerald-300 text-emerald-700">
                      {d.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Submit Declaration Modal */}
      <Dialog open={isDeclareModalOpen} onOpenChange={setIsDeclareModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleDeclare}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Declare Retail Sales Turnover</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Computes percentage rent owed on turnover exceeding agreed breakpoint.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Retail Tenant</Label>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tradingName} (Unit {t.unitNumber} - {t.propertyName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Billing Audit Period</Label>
                <Input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Gross POS Sales (USD) *</Label>
                  <Input
                    type="number"
                    value={grossSales}
                    onChange={(e) => setGrossSales(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Breakpoint Threshold ($)</Label>
                  <Input
                    type="number"
                    value={breakpoint}
                    onChange={(e) => setBreakpoint(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Turnover Percentage Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDeclareModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Calculate & Post Surcharge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

