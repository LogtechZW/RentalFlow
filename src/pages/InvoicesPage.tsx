import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Invoice } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BatchInvoiceModal } from '@/components/common/BatchInvoiceModal';
import { OverdueAlertBanner } from '@/components/common/OverdueAlertBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ReceiptText,
  Plus,
  Printer,
  Search,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    properties,
    spaces,
    tenants,
    meterReadings,
    addInvoice,
    deleteInvoice,
    createBulkInvoices,
    bulkDeleteInvoices,
    corporateLogo,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState<boolean>(false);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState<boolean>(false);
  const [isBulkBillModalOpen, setIsBulkBillModalOpen] = useState<boolean>(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form states - Single Invoice
  const [tenantId, setTenantId] = useState<string>(tenants[0]?.id || 'ten-1');
  const [baseRentUSD, setBaseRentUSD] = useState<string>('2400');
  const [camFeeUSD, setCamFeeUSD] = useState<string>('450');
  const [generatorLevyUSD, setGeneratorLevyUSD] = useState<string>('120');
  const [billingPeriod, setBillingPeriod] = useState<string>('October 2026');

  // Form states - Batch Monthly Billing
  const [batchBillingMonth, setBatchBillingMonth] = useState<string>('October 2026');
  const [batchPropertyId, setBatchPropertyId] = useState<string>('all');

  const canManage = ['Property Manager', 'Accountant', 'Administrator'].includes(activeRole);

  const filteredInvoices = invoices.filter(inv => {
    if (propertyFilter !== 'all' && inv.propertyId !== propertyFilter) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchTenant = inv.tenantName.toLowerCase().includes(q);
      const matchUnit = inv.unitNumber.toLowerCase().includes(q);
      if (!matchNum && !matchTenant && !matchUnit) return false;
    }
    return true;
  });

  const handleCreateSingleInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === tenantId);
    const space = spaces.find(s => s.id === tenant?.unitId) || spaces.find(s => s.unitNumber === tenant?.unitNumber);
    const prop = properties.find(p => p.id === tenant?.propertyId);

    const bRent = parseFloat(baseRentUSD) || 0;
    const cam = parseFloat(camFeeUSD) || 0;
    const genLevy = parseFloat(generatorLevyUSD) || 0;
    const totalUSD = bRent + cam + genLevy;

    const newInvNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    addInvoice({
      invoiceNumber: newInvNum,
      tenantId: tenant?.id || 'ten-1',
      tenantName: tenant?.name || 'Tenant',
      propertyId: tenant?.propertyId || 'prop-1',
      propertyName: prop?.name || 'Commercial Center',
      unitId: space?.id || 'sp-101',
      unitNumber: tenant?.unitNumber || '101',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      billingPeriod,
      exchangeRate: rbzExchangeRate,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `Base Commercial Rent (${tenant?.unitNumber})`,
          amountUSD: bRent,
          amountZiG: bRent * rbzExchangeRate,
          type: 'Base Rent',
        },
        {
          id: `item-${Date.now()}-2`,
          description: 'CAM Service & Atrium Maintenance',
          amountUSD: cam,
          amountZiG: cam * rbzExchangeRate,
          type: 'CAM Charge',
        },
        {
          id: `item-${Date.now()}-3`,
          description: 'Diesel Generator Backup CAM Apportionment',
          amountUSD: genLevy,
          amountZiG: genLevy * rbzExchangeRate,
          type: 'Generator Levy',
        }
      ],
      totalUSD,
      totalZiG: totalUSD * rbzExchangeRate,
      status: 'Unpaid',
      paidUSD: 0,
      paidZiG: 0,
    });

    toast.success(`Invoice ${newInvNum} for $${totalUSD.toFixed(2)} USD generated!`);
    setIsNewInvoiceOpen(false);
  };

  const handleRunBulkCycle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const propFilter = batchPropertyId === 'all' ? [] : [batchPropertyId];
    const count = createBulkInvoices(propFilter, batchBillingMonth);
    const pendingCount = meterReadings.filter(m => m.invoicedStatus !== 'Invoiced').length;
    toast.success(`Generated ${count} monthly batch invoices for ${batchBillingMonth} including active check-meter utility charges!`);
    setIsBulkBillModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Invoices & Charges' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Overdue Payment Reminders Banner */}
        <OverdueAlertBanner />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Invoices & Commercial Charges
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {invoices.length} Invoices
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dual-currency USD & ZiG billing with base rent, CAM fees, and diesel generator levy line items.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBatchExportOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Batch PDF</span>
            </Button>

            {canManage && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsBulkBillModalOpen(true)}
                  className="h-9 text-xs flex items-center gap-1.5"
                  title="Generate invoices for all occupied units"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Bulk Bill Month</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsNewInvoiceOpen(true)}
                  className="h-9 text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Invoice</span>
                </Button>

                {invoices.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete All</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Invoices?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                          This will remove all generated invoice records and tax line items. Physical properties and space records remain untouched.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            bulkDeleteInvoices();
                            toast.success('All invoice records cleared.');
                          }}
                          className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete All Invoices
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-card border border-border rounded-md shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number, tenant, or unit number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Data Table */}
        <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card shadow-sm">
          <Table className="[&>div]:max-w-full text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Invoice #</TableHead>
                <TableHead className="whitespace-nowrap">Tenant & Unit</TableHead>
                <TableHead className="whitespace-nowrap">Property</TableHead>
                <TableHead className="whitespace-nowrap">Issue / Due</TableHead>
                <TableHead className="whitespace-nowrap text-right">Total (USD)</TableHead>
                <TableHead className="whitespace-nowrap text-right">Total (ZiG)</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No commercial invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setViewingInvoice(inv)}>
                    <TableCell className="whitespace-nowrap font-mono font-semibold text-foreground">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium text-foreground">{inv.tenantName}</div>
                      <div className="text-[10px] text-muted-foreground">Unit {inv.unitNumber}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {inv.propertyName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-[11px]">
                      <div>{inv.issueDate}</div>
                      <div className="text-[10px] text-muted-foreground">Due: {inv.dueDate}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono font-bold text-foreground">
                      ${inv.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                      ZiG {inv.totalZiG.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          inv.status === 'Paid' ? 'default' :
                          inv.status === 'Overdue' ? 'destructive' : 'secondary'
                        }
                        className="text-[10px] h-5"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingInvoice(inv);
                        }}
                        className="h-7 text-xs text-primary hover:underline"
                      >
                        View & Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* View Individual Invoice Modal with In-Page Switching and Universal Delete */}
      {viewingInvoice && (() => {
        const invIndex = filteredInvoices.findIndex(i => i.id === viewingInvoice.id);
        const hasPrev = invIndex > 0;
        const hasNext = invIndex >= 0 && invIndex < filteredInvoices.length - 1;

        return (
          <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto space-y-3">
              {/* In-Page Navigation Switcher Bar (Hidden in Print) */}
              <div className="flex items-center justify-between bg-muted/60 p-2 rounded-md print:hidden text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setViewingInvoice(filteredInvoices[invIndex - 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Invoice</span>
                </Button>

                <span className="text-[11px] font-mono text-muted-foreground">
                  Invoice {invIndex >= 0 ? invIndex + 1 : 1} of {filteredInvoices.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setViewingInvoice(filteredInvoices[invIndex + 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <span>Next Invoice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="p-4 bg-white text-slate-900 rounded space-y-4 print:p-0">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <img src={corporateLogo} alt="Logo" className="h-9 object-contain mb-1" />
                    <div className="text-base font-serif font-bold">{viewingInvoice.propertyName}</div>
                    <div className="text-xs text-slate-600">Unit {viewingInvoice.unitNumber} • Harare, Zimbabwe</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900">{viewingInvoice.invoiceNumber}</div>
                    <div className="text-xs text-slate-500">Period: {viewingInvoice.billingPeriod}</div>
                    <div className="text-xs text-slate-500">Due: {viewingInvoice.dueDate}</div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Billed Commercial Tenant</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingInvoice.tenantName}</span>
                </div>

                {/* Line Items */}
                <div className="border border-slate-200 rounded overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-100 p-2 font-semibold">
                    <span>Charge Description</span>
                    <span className="text-right">Amount (USD)</span>
                    <span className="text-right">Amount (ZiG)</span>
                  </div>
                  {viewingInvoice.items.map(item => (
                    <div key={item.id} className="grid grid-cols-3 p-2 border-t border-slate-100">
                      <span>{item.description}</span>
                      <span className="text-right font-mono">${item.amountUSD.toFixed(2)}</span>
                      <span className="text-right font-mono text-emerald-800">ZiG {item.amountZiG.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 p-3 bg-slate-50 border-t border-slate-300 font-bold text-sm">
                    <span>Total Amount Due</span>
                    <span className="text-right font-mono">${viewingInvoice.totalUSD.toFixed(2)} USD</span>
                    <span className="text-right font-mono text-emerald-800">ZiG {viewingInvoice.totalZiG.toLocaleString()}</span>
                  </div>
                </div>

                {/* Settlement instructions */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block">Settlement Instructions & Dual-Currency Regulation:</span>
                  <p>1. EcoCash Merchant Code: <strong>99420</strong> (Ref: {viewingInvoice.invoiceNumber})</p>
                  <p>2. CBZ Nostro FCA Account: <strong>102948201</strong> (Swift: CBZZWHRE)</p>
                  <p>Official RBZ Exchange Rate applied: 1 USD = {viewingInvoice.exchangeRate} ZiG</p>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    ZIMRA ITF263 Tax Clearance Valid | BP 200034182 | VAT Reg 10048291
                  </p>
                </div>

                {/* Official Authorized Signature & Certification Block (Print Only) */}
                <div className="hidden print:block pt-6 border-t-2 border-slate-300">
                  <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
                    <div className="space-y-4">
                      <p className="font-semibold uppercase text-[10px] text-slate-500">AUTHORIZED ESTATE FINANCE OFFICER</p>
                      <div className="border-b border-slate-400 h-10 w-4/5" />
                      <p>Signature: __________________________</p>
                      <p>Date: _____ / _____ / 2026</p>
                    </div>

                    <div className="space-y-4">
                      <p className="font-semibold uppercase text-[10px] text-slate-500">TENANT / ACKNOWLEDGED BY</p>
                      <div className="border-b border-slate-400 h-10 w-4/5" />
                      <p>Signature: __________________________</p>
                      <p>Date: _____ / _____ / 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between w-full print:hidden border-t border-border/60 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    deleteInvoice(viewingInvoice.id);
                    toast.success(`Invoice ${viewingInvoice.invoiceNumber} deleted.`);
                    setViewingInvoice(null);
                  }}
                  className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Invoice
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewingInvoice(null)} className="h-8 text-xs">
                    Close
                  </Button>
                  <Button size="sm" onClick={() => window.print()} className="h-8 text-xs flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Create Single Invoice Modal */}
      <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleCreateSingleInvoice}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Issue Commercial Invoice</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Dual-currency billing with base rent, CAM, and generator levy.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Tenant</Label>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} (Unit {t.unitNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Billing Period</Label>
                <Input
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Base Rent ($)</Label>
                  <Input
                    type="number"
                    value={baseRentUSD}
                    onChange={(e) => setBaseRentUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CAM Fee ($)</Label>
                  <Input
                    type="number"
                    value={camFeeUSD}
                    onChange={(e) => setCamFeeUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gen Levy ($)</Label>
                  <Input
                    type="number"
                    value={generatorLevyUSD}
                    onChange={(e) => setGeneratorLevyUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewInvoiceOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Issue Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Monthly Batch Invoicing Dialog */}
      <Dialog open={isBulkBillModalOpen} onOpenChange={setIsBulkBillModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-serif">Generate Monthly Batch Invoices</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Automated dual-currency billing bundling Base Rent, CAM Surcharges, and Un-invoiced Sub-Meter Utilities.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleRunBulkCycle} className="space-y-4 pt-2">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg space-y-1.5 text-xs text-blue-800 dark:text-blue-200">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Automatic Sub-Meter Utility Roll-In Active</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Any verified electricity (ZETDC 3-phase) and commercial water sub-meter readings will be dynamically calculated and rolled into the respective space tax invoices as itemized charges alongside statutory 15% VAT and base rent.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Billing Period / Month</Label>
                <Input
                  value={batchBillingMonth}
                  onChange={(e) => setBatchBillingMonth(e.target.value)}
                  placeholder="e.g. October 2026"
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Target Commercial Asset</Label>
                <Select value={batchPropertyId} onValueChange={setBatchPropertyId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Commercial Properties</SelectItem>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border border-border/70 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Occupied Commercial Units:</span>
                <span className="font-semibold font-mono">
                  {spaces.filter(s => s.status === 'Occupied' && (batchPropertyId === 'all' || s.propertyId === batchPropertyId)).length} Units
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unbilled Sub-Meter Readings:</span>
                <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  {meterReadings.filter(m => m.invoicedStatus !== 'Invoiced' && (batchPropertyId === 'all' || m.propertyId === batchPropertyId)).length} Readings
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Official RBZ Rate:</span>
                <span className="font-mono text-[11px] text-foreground font-semibold">1 USD = {rbzExchangeRate.toFixed(2)} ZiG</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkBillModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-primary text-primary-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Invoices</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Invoice Export Modal */}
      <BatchInvoiceModal
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
      />

      <Footer />
    </div>
  );
};
