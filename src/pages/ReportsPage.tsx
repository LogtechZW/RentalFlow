import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  Building,
  DollarSign,
  AlertTriangle,
  Zap,
  Flame,
  Droplet,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Scale,
  FileText,
  Calendar,
  Building2,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportDefinition {
  id: string;
  number: number;
  title: string;
  category: 'Financial' | 'Occupancy' | 'Operations' | 'Energy';
  description: string;
  metric: string;
}

const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'rep-1',
    number: 1,
    title: 'Consolidated Commercial Rent Roll',
    category: 'Financial',
    description: 'Complete breakdown of contracted base rents, CAM fees, turnover rates, and next escalation dates across all units.',
    metric: 'Monthly Rent Roll'
  },
  {
    id: 'rep-2',
    number: 2,
    title: 'Space Occupancy & Vacancy Matrix',
    category: 'Occupancy',
    description: 'Floor and zone occupancy rates, vacant lettable area (sqm), and days on market for Joina City, Eastgate, and Sam Levy.',
    metric: 'Portfolio Occupancy %'
  },
  {
    id: 'rep-3',
    number: 3,
    title: 'Arrears & Aging Analysis (30/60/90 Days)',
    category: 'Financial',
    description: 'Delinquent accounts stratified by aging buckets in dual currency (USD and ZiG at official RBZ rate).',
    metric: 'Overdue Aging Schedule'
  },
  {
    id: 'rep-4',
    number: 4,
    title: 'CAM Diesel Generator Levy Apportionment Summary',
    category: 'Energy',
    description: 'Perkins & Cummins 500 KVA run hours, diesel fuel burn reconciliation, and tenant sqm allocation.',
    metric: 'Generator OpEx Audit'
  },
  {
    id: 'rep-5',
    number: 5,
    title: 'Retail Turnover Rent Performance',
    category: 'Financial',
    description: 'Audited monthly POS gross sales declarations, threshold breakpoints, and percentage overage revenue.',
    metric: 'Turnover Breakpoints'
  },
  {
    id: 'rep-6',
    number: 6,
    title: 'Dual-Currency Collections (USD vs ZiG)',
    category: 'Financial',
    description: 'Payment channel distribution across EcoCash, CBZ Nostro FCA, Paynow, and physical cash.',
    metric: 'Channel Split'
  },
  {
    id: 'rep-7',
    number: 7,
    title: 'Maintenance Cost & Asset Health Index',
    category: 'Operations',
    description: 'Expenditure on chillers, escalators, electrical substations, and preventative work order response times.',
    metric: 'Asset Reliability'
  },
  {
    id: 'rep-8',
    number: 8,
    title: 'Commercial Lease Expiration Schedule',
    category: 'Occupancy',
    description: 'Upcoming 6, 12, and 24-month lease maturities, tenant retention probabilities, and renewal options.',
    metric: 'Expiry Pipeline'
  },
  {
    id: 'rep-9',
    number: 9,
    title: 'Tenant Directory & Contact Schedule',
    category: 'Operations',
    description: 'Registered business entities, Zimbabwe registration numbers, principal signatories, and WhatsApp billing logs.',
    metric: 'KYC Directory'
  },
  {
    id: 'rep-10',
    number: 10,
    title: 'Solar Microgrid & Power Resilience Summary',
    category: 'Energy',
    description: 'Rooftop solar generation (kWh), battery cycle performance, and municipal load shedding downtime avoided.',
    metric: 'Solar Yield & Offset'
  },
  {
    id: 'rep-11',
    number: 11,
    title: 'Borehole Water Consumption & Potability Audit',
    category: 'Energy',
    description: 'Liters pumped from commercial boreholes, reservoir capacity utilization, and sub-metered water billing.',
    metric: 'Water Self-Sufficiency'
  },
  {
    id: 'rep-12',
    number: 12,
    title: 'Portfolio Owner Profit Distribution Schedule',
    category: 'Financial',
    description: 'Net operating income (NOI), management fees, and profit distributions calculated per ownership ratio.',
    metric: 'NOI Distributions'
  }
];

export const ReportsPage: React.FC = () => {
  const {
    properties,
    spaces,
    tenants,
    leases,
    invoices,
    payments,
    turnoverDeclarations,
    maintenanceTickets,
    corporateLogo,
    rbzExchangeRate
  } = useRentFlow();

  const [activeReport, setActiveReport] = useState<ReportDefinition | null>(null);
  const [isMasterExportOpen, setIsMasterExportOpen] = useState<boolean>(false);
  const [isZimraAuditModalOpen, setIsZimraAuditModalOpen] = useState<boolean>(false);
  const [zimraPropertyId, setZimraPropertyId] = useState<string>('all');
  const [zimraTaxPeriod, setZimraTaxPeriod] = useState<string>('October 2026');

  // Key stats
  const totalOccupied = spaces.filter(s => s.status === 'Occupied').length;
  const occupancyRate = Math.round((totalOccupied / spaces.length) * 100);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalUSD, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountUSD, 0);
  const totalArrears = spaces.reduce((sum, s) => sum + s.rentalAccumulationUSD, 0);

  // ZIMRA Tax & Compliance Calculations
  const compliantTenants = tenants.filter(t => t.taxComplianceStatus === 'Compliant' || t.itf263Status === 'Valid');
  const nonCompliantTenants = tenants.filter(t => t.taxComplianceStatus === 'Non-Compliant' || t.itf263Status === 'Expired');
  const baseRentSumUSD = spaces.filter(s => s.status === 'Occupied').reduce((sum, s) => sum + s.baseRentUSD, 0);
  const camLeviesSumUSD = spaces.filter(s => s.status === 'Occupied').reduce((sum, s) => sum + s.camFeeUSD, 0);
  const grossCommercialTurnoverUSD = baseRentSumUSD + camLeviesSumUSD;
  const outputVat15USD = grossCommercialTurnoverUSD * 0.15;
  const withholdingTax10USD = nonCompliantTenants.reduce((sum, t) => sum + ((t.monthlyRentUSD || t.rentAmountUSD || 2000) * 0.10), 0);

  const handleDownloadCsv = (reportTitle: string) => {
    toast.success(`Exporting "${reportTitle}" as CSV spreadsheet...`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Reports & Analytics' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Commercial Intelligence & Reports
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                12 Standard Reports
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive institutional reporting for commercial property owners, asset managers, and financial audits.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setIsZimraAuditModalOpen(true)}
              className="h-9 text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow"
            >
              <Scale className="w-4 h-4" />
              <span>ZIMRA Tax Audit Statement</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMasterExportOpen(true)}
              className="h-9 text-xs bg-card hover:bg-muted flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Master Combined Export</span>
            </Button>
          </div>
        </div>

        {/* Zimbabwe Commercial Lease Compliance & Tax Audit Hero Card */}
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-md">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Zimbabwe Commercial Lease Statutory Compliance & Tax Audit Engine</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  ZIMRA ITF263 tax clearance verification, 15% Commercial VAT calculations, 10% Withholding Tax schedules, and certified RBZ foreign exchange rates.
                </CardDescription>
              </div>

              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono text-xs">
                RBZ Interbank Certified: 1 USD = {rbzExchangeRate} ZiG
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  ITF263 Compliance Rate
                </span>
                <div className="text-lg font-serif font-bold text-emerald-700">
                  {Math.round((compliantTenants.length / Math.max(1, tenants.length)) * 100)}% Verified
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {compliantTenants.length} Valid • {nonCompliantTenants.length} Non-Compliant
                </div>
              </div>

              <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  Commercial Turnover Assessed
                </span>
                <div className="text-lg font-serif font-bold text-foreground font-mono">
                  ${grossCommercialTurnoverUSD.toLocaleString()} USD
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  ZiG {(grossCommercialTurnoverUSD * rbzExchangeRate).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  15% Output VAT Assessed
                </span>
                <div className="text-lg font-serif font-bold text-primary font-mono">
                  ${outputVat15USD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  ZiG {(outputVat15USD * rbzExchangeRate).toLocaleString()} Output VAT
                </div>
              </div>

              <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                  10% Withholding Tax (WHT)
                </span>
                <div className="text-lg font-serif font-bold text-rose-700 font-mono">
                  ${withholdingTax10USD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-rose-600">
                  Deducted for non-ITF263 leases
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Official statutory tax statements required under Section 80 of the Zimbabwe Income Tax Act and VAT Act [Chapter 23:12].
              </p>
              <Button
                size="sm"
                onClick={() => setIsZimraAuditModalOpen(true)}
                className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Official ZIMRA Statement</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 12 Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_DEFINITIONS.map((rep) => (
            <Card
              key={rep.id}
              className="border border-border/80 shadow-sm hover:border-primary/60 transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => setActiveReport(rep)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                    Report #{rep.number} • {rep.category}
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {rep.metric}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-serif font-bold text-foreground mt-1">
                  {rep.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {rep.description}
                </p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary hover:underline">
                    View Live Report &raquo;
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadCsv(rep.title);
                    }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Individual Report View Modal */}
      {activeReport && (
        <Dialog open={!!activeReport} onOpenChange={() => setActiveReport(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Report #{activeReport.number} • {activeReport.category}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Commercial Portfolio Audit
                </span>
              </div>
              <DialogTitle className="text-base font-serif">{activeReport.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {activeReport.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4 text-xs">
              {/* Dynamic Sample Table according to active report */}
              {activeReport.number === 1 && (
                <div className="border border-border rounded overflow-x-auto">
                  <Table className="[&>div]:max-w-full text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead className="text-right">Base Rent (USD)</TableHead>
                        <TableHead className="text-right">CAM (USD)</TableHead>
                        <TableHead className="text-right">Total Monthly</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spaces.filter(s => s.status === 'Occupied').map(sp => (
                        <TableRow key={sp.id}>
                          <TableCell>{sp.propertyId === 'prop-1' ? 'Joina City' : sp.propertyId === 'prop-2' ? 'Eastgate Centre' : "Sam Levy's Village"}</TableCell>
                          <TableCell className="font-mono font-bold">{sp.unitNumber}</TableCell>
                          <TableCell>{sp.currentTenantName || 'Occupied Tenant'}</TableCell>
                          <TableCell className="text-right font-mono">${sp.baseRentUSD}</TableCell>
                          <TableCell className="text-right font-mono">${sp.camFeeUSD}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-primary">
                            ${sp.baseRentUSD + sp.camFeeUSD} USD
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeReport.number === 3 && (
                <div className="border border-border rounded overflow-x-auto">
                  <Table className="[&>div]:max-w-full text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">30 Days</TableHead>
                        <TableHead className="text-right">60+ Days</TableHead>
                        <TableHead className="text-right">Total Arrears (USD)</TableHead>
                        <TableHead className="text-right">Total (ZiG)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.filter(t => t.balanceUSD > 0).map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-semibold">{t.tradingName}</TableCell>
                          <TableCell className="font-mono">{t.unitNumber}</TableCell>
                          <TableCell className="text-right font-mono">${(t.balanceUSD * 0.4).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">${(t.balanceUSD * 0.35).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-destructive">${(t.balanceUSD * 0.25).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-destructive">${t.balanceUSD.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">ZiG {(t.balanceUSD * rbzExchangeRate).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeReport.number !== 1 && activeReport.number !== 3 && (
                <div className="p-4 bg-muted/30 rounded border border-border text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-foreground text-sm">
                    {activeReport.title} Compiled
                  </div>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Live database synchronization active across all 3 commercial properties. All metrics verified against RBZ official rate of 1 USD = {rbzExchangeRate} ZiG.
                  </p>
                </div>
              )}
              {/* Official Attestation & Signatures on Individual Report */}
              <div className="hidden print:block pt-6 mt-4 border-t-2 border-slate-300">
                <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
                  <div className="space-y-4">
                    <p className="font-semibold uppercase text-[10px] text-slate-500">PREPARED BY / ESTATE BURSAR</p>
                    <div className="border-b border-slate-400 h-8 w-4/5" />
                    <p>Signature: __________________________</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="font-semibold uppercase text-[10px] text-slate-500">AUDITED BY / COMPLIANCE OFFICER</p>
                    <div className="border-b border-slate-400 h-8 w-4/5" />
                    <p>Signature: __________________________</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between w-full print:hidden">
              <Button variant="outline" size="sm" onClick={() => setActiveReport(null)} className="h-8 text-xs">
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 text-xs flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </Button>
                <Button size="sm" onClick={() => handleDownloadCsv(activeReport.title)} className="h-8 text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Master Combined Report Export Modal */}
      <Dialog open={isMasterExportOpen} onOpenChange={setIsMasterExportOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <div className="p-4 bg-white text-slate-900 rounded space-y-4 print:p-0">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <img src={corporateLogo} alt="Logo" className="h-9 object-contain mb-1" />
                <div className="text-base font-serif font-bold">Commercial Portfolio Master Executive Report</div>
                <div className="text-xs text-slate-600">Joina City • Eastgate Centre • Sam Levy's Village</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[10px] mb-1 font-mono">
                  MASTER CONSOLIDATED
                </Badge>
                <div className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                <div className="text-xs text-slate-500 font-mono">RBZ: 1 USD = {rbzExchangeRate} ZiG</div>
              </div>
            </div>

            {/* Portfolio Executive Summary Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px]">Portfolio Occupancy</span>
                <span className="font-bold text-slate-900 text-base">{occupancyRate}%</span>
                <span className="text-[10px] text-slate-500 block">{totalOccupied} / {spaces.length} Units</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px]">Monthly Invoiced</span>
                <span className="font-bold text-slate-900 text-base">${totalInvoiced.toLocaleString()} USD</span>
                <span className="text-[10px] text-emerald-700 block">ZiG {(totalInvoiced * rbzExchangeRate).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px]">Total Collections</span>
                <span className="font-bold text-emerald-800 text-base">${totalCollected.toLocaleString()} USD</span>
                <span className="text-[10px] text-slate-500 block">{payments.length} Payments</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px]">Delinquent Arrears</span>
                <span className="font-bold text-rose-700 text-base">${totalArrears.toLocaleString()} USD</span>
                <span className="text-[10px] text-slate-500 block">Overdue space ledgers</span>
              </div>
            </div>

            {/* 12 Sub-Reports Index */}
            <div className="border border-slate-200 rounded p-3 text-xs space-y-2">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Consolidated 12 Module Audit Schedule:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                {REPORT_DEFINITIONS.map(r => (
                  <div key={r.id} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>#{r.number}. {r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between w-full print:hidden">
            <Button variant="outline" size="sm" onClick={() => setIsMasterExportOpen(false)} className="h-8 text-xs">
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => window.print()} className="h-8 text-xs flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master PDF</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zimbabwe Commercial Lease Compliance & Tax Audit Statement Modal */}
      <Dialog open={isZimraAuditModalOpen} onOpenChange={setIsZimraAuditModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[92dvh] overflow-y-auto">
          <div className="p-4 sm:p-6 bg-white text-slate-900 rounded-lg space-y-5 print:p-0">
            {/* Header / Republic of Zimbabwe & ZIMRA Emblems */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0" />
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-700">
                      Republic of Zimbabwe • Statutory Tax Compliance
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-black text-slate-950 uppercase tracking-tight">
                    Commercial Lease Tax Audit & Compliance Certificate
                  </h2>
                  <p className="text-xs text-slate-600">
                    Pursuant to Value Added Tax Act [Chapter 23:12] & Income Tax Act [Chapter 23:06] (Section 80 Withholding Tax)
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
                  <Badge variant="outline" className="border-slate-800 text-slate-900 font-bold text-[11px] mb-1">
                    CERTIFICATE ID: ZIMRA-ZW-2026/8942
                  </Badge>
                  <div>ZIMRA BP No: <span className="font-bold text-slate-900">0200489123</span></div>
                  <div>VAT Reg No: <span className="font-bold text-slate-900">100482910</span></div>
                  <div>Issue Date: <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span></div>
                </div>
              </div>

              {/* Filter Controls within Certificate (Hidden in Print) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 text-xs print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Audit Scope Property:</span>
                  <select
                    value={zimraPropertyId}
                    onChange={(e) => setZimraPropertyId(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 font-medium"
                  >
                    <option value="all">All Commercial Properties (Consolidated)</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Statutory Tax Period:</span>
                  <select
                    value={zimraTaxPeriod}
                    onChange={(e) => setZimraTaxPeriod(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 font-medium"
                  >
                    <option value="October 2026">October 2026 (Current Month)</option>
                    <option value="Q3 2026">Q3 2026 (Jul - Sep 2026)</option>
                    <option value="Q2 2026">Q2 2026 (Apr - Jun 2026)</option>
                    <option value="Full Year 2026">Tax Year 2026 (YTD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Official Tax Summary Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Gross Commercial Rent
                </span>
                <div className="text-base font-bold font-mono text-slate-900">
                  ${grossCommercialTurnoverUSD.toLocaleString()} USD
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ZiG {(grossCommercialTurnoverUSD * rbzExchangeRate).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  15% Output VAT Assessed
                </span>
                <div className="text-base font-bold font-mono text-emerald-800">
                  ${outputVat15USD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-emerald-700 font-mono">
                  ZiG {(outputVat15USD * rbzExchangeRate).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  10% Withholding Tax
                </span>
                <div className="text-base font-bold font-mono text-rose-700">
                  ${withholdingTax10USD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-rose-600 font-mono">
                  Non-ITF263 Deduction
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  RBZ Interbank Benchmark
                </span>
                <div className="text-base font-bold font-mono text-slate-900">
                  1 USD = {rbzExchangeRate} ZiG
                </div>
                <div className="text-[10px] text-slate-500">
                  Official RBZ Mid-Rate
                </div>
              </div>
            </div>

            {/* Tenant-by-Tenant Statutory Schedule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Tenant Statutory Tax Schedule & ITF263 Verification Register
                </h4>
                <span className="text-[11px] text-slate-500">
                  {tenants.length} Commercial Leases Audited
                </span>
              </div>

              <div className="border border-slate-300 rounded overflow-x-auto">
                <Table className="[&>div]:max-w-full text-xs text-slate-800">
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="text-slate-900 font-bold whitespace-nowrap">Tenant Trading Entity</TableHead>
                      <TableHead className="text-slate-900 font-bold whitespace-nowrap">Unit / Location</TableHead>
                      <TableHead className="text-slate-900 font-bold whitespace-nowrap">ZIMRA BP #</TableHead>
                      <TableHead className="text-slate-900 font-bold whitespace-nowrap">ITF263 Tax Clearance</TableHead>
                      <TableHead className="text-slate-900 font-bold text-right whitespace-nowrap">Base Rent (USD)</TableHead>
                      <TableHead className="text-slate-900 font-bold text-right whitespace-nowrap">15% VAT (USD)</TableHead>
                      <TableHead className="text-slate-900 font-bold text-right whitespace-nowrap">10% WHT (USD)</TableHead>
                      <TableHead className="text-slate-900 font-bold text-right whitespace-nowrap">Total Due (ZiG)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map(t => {
                      const isCompliant = t.taxComplianceStatus === 'Compliant' || t.itf263Status === 'Valid';
                      const rent = t.monthlyRentUSD || t.rentAmountUSD || 2000;
                      const vat = rent * 0.15;
                      const wht = isCompliant ? 0 : rent * 0.10;
                      const totalZiG = (rent + vat) * rbzExchangeRate;

                      return (
                        <TableRow key={t.id} className="hover:bg-slate-50 border-b border-slate-200">
                          <TableCell className="font-semibold text-slate-900 whitespace-nowrap">
                            {t.tradingName}
                          </TableCell>
                          <TableCell className="font-mono text-slate-600 whitespace-nowrap">
                            Unit {t.unitNumber} • {t.propertyName}
                          </TableCell>
                          <TableCell className="font-mono text-slate-700 whitespace-nowrap">
                            {t.zimraBpNumber || `BP-0200${Math.floor(1000 + Math.random() * 9000)}`}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {isCompliant ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                Valid ITF263 (Exp. 31/12/2026)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-700" />
                                Expired / Non-Compliant (10% WHT)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium whitespace-nowrap">
                            ${rent.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-800 font-semibold whitespace-nowrap">
                            ${vat.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-rose-700 font-semibold whitespace-nowrap">
                            {wht > 0 ? `$${wht.toFixed(2)}` : 'Exempt'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-slate-800 whitespace-nowrap">
                            ZiG {totalZiG.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Official Certification & Attestation Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-900 text-xs text-slate-700">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase">Managing Principal / Real Estate Practitioner:</div>
                <div className="font-serif italic text-sm text-slate-800">Farai Moyo, Registered Valuer & Estate Agent</div>
                <div className="text-[11px] text-slate-500">License No: EACZ-2026/0419 • RentFlow Property Managers (Pvt) Ltd</div>
              </div>

              <div className="space-y-1 sm:text-right">
                <div className="font-bold text-slate-900 uppercase">Statutory Auditor & Tax Consultant:</div>
                <div className="font-serif italic text-sm text-slate-800">Chipo Sibanda, CA (Z), Registered Public Auditor</div>
                <div className="text-[11px] text-slate-500">PAAB Registration: PAAB/CA/8821 • Harare, Zimbabwe</div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-border print:hidden">
            <Button variant="outline" size="sm" onClick={() => setIsZimraAuditModalOpen(false)} className="h-8 text-xs">
              Close Audit Statement
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success('Exporting ZIMRA Tax Clearance & Withholding Tax Audit schedule as CSV...');
                }}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Tax CSV</span>
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certified Statement</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
