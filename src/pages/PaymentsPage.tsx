import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Payment, PaymentMethod, Space } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SpaceRackGrid } from '@/components/common/SpaceRackGrid';
import { OverdueAlertBanner } from '@/components/common/OverdueAlertBanner';
import { SignaturePad } from '@/components/common/SignaturePad';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Plus,
  Printer,
  CheckCircle2,
  FileCheck,
  Search,
  Building,
  Trash2,
  PenTool,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentsPage: React.FC = () => {
  const {
    payments,
    invoices,
    spaces,
    tenants,
    properties,
    recordPayment,
    corporateLogo,
    rbzExchangeRate,
    activeRole,
    bulkDeletePayments
  } = useRentFlow();

  const [activeTab, setActiveTab] = useState<'matrix' | 'table'>('matrix');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [cashierSignature, setCashierSignature] = useState<string>('');
  const [payerSignature, setPayerSignature] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  // Form states - Record Payment
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || 'ten-1');
  const [amountUSD, setAmountUSD] = useState<string>('2400');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EcoCash');
  const [refNumber, setRefNumber] = useState<string>('EC-9041280');
  const [notes, setNotes] = useState<string>('Monthly Rent Settlement');

  const canRecord = ['Accountant', 'Property Manager', 'Administrator'].includes(activeRole);

  const handleSelectSpaceFromRack = (space: Space) => {
    setSelectedSpace(space);
    // Find tenant for space
    const matchingTenant = tenants.find(t => t.id === space.currentTenantId || t.unitNumber === space.unitNumber);
    if (matchingTenant) {
      setSelectedTenantId(matchingTenant.id);
    }
    const suggestedAmt = space.rentalAccumulationUSD > 0
      ? space.rentalAccumulationUSD
      : space.baseRentUSD;
    setAmountUSD(String(suggestedAmt));
    setNotes(`Rent settlement for ${space.unitPrefix || space.type} ${space.unitNumber}`);
    setIsRecordModalOpen(true);
    toast.info(`Selected ${space.unitPrefix || space.type} ${space.unitNumber} (${space.customName})`);
  };

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === selectedTenantId);
    const amt = parseFloat(amountUSD) || 0;
    if (amt <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    const targetSpace = selectedSpace || spaces.find(s => s.id === tenant?.unitId || s.unitNumber === tenant?.unitNumber);

    const created = recordPayment({
      tenantId: selectedTenantId,
      tenantName: tenant?.name || 'Tenant',
      propertyId: tenant?.propertyId || targetSpace?.propertyId || 'prop-1',
      propertyName: tenant?.propertyName || 'Commercial Center',
      unitId: targetSpace?.id || 'sp-101',
      unitNumber: tenant?.unitNumber || targetSpace?.unitNumber || '101',
      amountUSD: amt,
      amountZiG: amt * rbzExchangeRate,
      currency: 'USD',
      paymentMethod,
      referenceNumber: refNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split('T')[0],
      recordedBy: activeRole,
      digitalSignature: cashierSignature || undefined,
      notes,
    });

    toast.success(`Payment recorded! Official Receipt #${created.receiptNumber} issued.`);
    setIsRecordModalOpen(false);
    setViewingPayment(created);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Payments' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Overdue Payment Reminders Banner */}
        <OverdueAlertBanner />

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Rent & CAM Payments
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {payments.length} Collections
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono border-primary/50 text-primary">
                RBZ: {rbzExchangeRate} ZiG
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive hotel-style space matrix with daily, weekly, and monthly accumulation gauges and dual-currency receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'matrix' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Space Rack Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'table' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Collections Table</span>
              </button>
            </div>

            {canRecord && (
              <Button size="sm" onClick={() => setIsRecordModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                <span>Record Payment</span>
              </Button>
            )}

            {/* Bulk Delete All Payments */}
            {payments.length > 0 && canRecord && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-serif">Clear All Recorded Payments?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      This action will clear all payment ledger entries while preserving physical property buildings and space occupancy footprints.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        bulkDeletePayments();
                        toast.success('All payment collection records cleared.');
                      }}
                      className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All Payments
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Tab 1: Interactive Space Matrix Embedded in Payments */}
        {activeTab === 'matrix' ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted/40 border border-border rounded-md text-xs text-muted-foreground flex items-center justify-between">
              <span>
                💡 <strong>Interactive Space Rack:</strong> Click any commercial shop, office, or kiosk unit below to automatically populate the payment record form and inspect daily/weekly/monthly accumulation progress.
              </span>
            </div>

            <SpaceRackGrid
              onSelectSpace={handleSelectSpaceFromRack}
              selectedSpaceId={selectedSpace?.id}
            />
          </div>
        ) : (
          /* Tab 2: Payments Table */
          <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card shadow-sm">
            <Table className="[&>div]:max-w-full text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Receipt #</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Tenant & Unit</TableHead>
                  <TableHead className="whitespace-nowrap">Property</TableHead>
                  <TableHead className="whitespace-nowrap">Method & Ref</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Amount (USD)</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Amount (ZiG)</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payment transactions recorded yet. Click on any unit in the Space Rack Matrix to record a payment.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((pay) => (
                    <TableRow key={pay.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setViewingPayment(pay)}>
                      <TableCell className="whitespace-nowrap font-mono font-semibold text-foreground">
                        {pay.receiptNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-[11px]">
                        {pay.paymentDate}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium text-foreground">{pay.tenantName}</div>
                        <div className="text-[10px] text-muted-foreground">Unit {pay.unitNumber}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {pay.propertyName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] h-5 mr-1 font-mono">
                          {pay.paymentMethod}
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">{pay.referenceNumber}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                        ${pay.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-semibold text-foreground">
                        ZiG {pay.amountZiG.toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingPayment(pay);
                          }}
                          className="h-7 text-xs text-primary hover:underline"
                        >
                          Official Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Record Payment Modal with Accumulation Gauges */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif">
              Record Commercial Rent & CAM Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official dual-currency receipting with RBZ interbank mid-rates and digital cashier signature.
            </DialogDescription>
          </DialogHeader>

          {/* Selected Space Accumulation Gauges */}
          {selectedSpace && (
            <div className="p-3 bg-muted/60 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  {selectedSpace.unitPrefix || selectedSpace.type} {selectedSpace.unitNumber} ({selectedSpace.customName})
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Frequency: {selectedSpace.frequency || 'Monthly'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Daily Rate</span>
                  <span className="font-bold font-mono text-xs text-foreground">
                    ${(selectedSpace.baseRentUSD / 30).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Weekly Rate</span>
                  <span className="font-bold font-mono text-xs text-foreground">
                    ${(selectedSpace.baseRentUSD / 4.33).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Unpaid Arrears</span>
                  <span className="font-bold font-mono text-xs text-rose-700">
                    ${selectedSpace.rentalAccumulationUSD.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Select Commercial Tenant *</Label>
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} (Unit {t.unitNumber} - {t.propertyName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Method (Zimbabwe Ecosystem) *</Label>
                <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EcoCash">EcoCash (USD / ZiG)</SelectItem>
                    <SelectItem value="InnBucks">InnBucks Remittance</SelectItem>
                    <SelectItem value="Paynow">Paynow Gateway</SelectItem>
                    <SelectItem value="Nostro">Nostro FCA / RTGS Transfer</SelectItem>
                    <SelectItem value="Cash (USD)">Cash (USD)</SelectItem>
                    <SelectItem value="Cash (ZiG)">Cash (ZiG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Amount (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Equivalent ZiG: {(parseFloat(amountUSD || '0') * rbzExchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2 })} @ RBZ {rbzExchangeRate}
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Transaction Reference / POP #</Label>
                <Input
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="e.g. EC-9041280 or STANBIC-8841"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Payment Notes / Allocation</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. October Base Rent + Generator Fuel CAM Share"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Cashier Digital Signature Pad */}
            <div className="pt-2 border-t border-border">
              <Label className="text-xs font-semibold block mb-1.5 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-primary" />
                <span>Cashier / Estate Manager Digital Signature:</span>
              </Label>
              <div className="p-2 border border-border rounded-md bg-white">
                <SignaturePad
                  onSave={(data) => setCashierSignature(data)}
                  onClear={() => setCashierSignature('')}
                  width={420}
                  height={110}
                  label="Sign with touch or mouse"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRecordModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Generate Official Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Zimbabwe Dual-Currency Receipt Modal */}
      {viewingPayment && (
        <Dialog open={!!viewingPayment} onOpenChange={(open) => !open && setViewingPayment(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center justify-between">
                <span>Official Dual-Currency Payment Receipt</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {viewingPayment.receiptNumber}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="border-2 border-primary/20 rounded-lg p-5 bg-card space-y-4 text-xs font-sans">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <img
                    src={corporateLogo}
                    alt="Logo"
                    className="h-8 w-auto max-w-[140px] object-contain mb-1"
                  />
                  <div className="text-[11px] font-semibold text-foreground">RentFlow Commercial Properties (Pvt) Ltd</div>
                  <div className="text-[10px] text-muted-foreground">CBD & Suburban Commercial Assets</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-primary">{viewingPayment.receiptNumber}</div>
                  <div className="text-[11px] text-muted-foreground">Date: {viewingPayment.paymentDate}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] font-mono">
                    RBZ: 1 USD = {rbzExchangeRate} ZiG
                  </Badge>
                </div>
              </div>

              {/* Tenant & Property Details */}
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Received From:</span>
                  <div className="font-bold text-foreground text-sm">{viewingPayment.tenantName}</div>
                  <div className="text-[11px] text-muted-foreground">Unit {viewingPayment.unitNumber} • {viewingPayment.propertyName}</div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Payment Details:</span>
                  <div className="font-medium text-foreground">{viewingPayment.paymentMethod}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">Ref: {viewingPayment.referenceNumber}</div>
                </div>
              </div>

              {/* Settlement Amounts */}
              <div className="p-3 bg-muted/60 rounded-md border border-border space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Settled Amount</span>
                <div className="text-2xl font-serif font-bold text-emerald-700">
                  ${viewingPayment.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  ZiG {viewingPayment.amountZiG.toLocaleString()} (Zimbabwe Gold)
                </div>
              </div>

              {viewingPayment.notes && (
                <div className="text-[11px] text-muted-foreground italic">
                  Note: {viewingPayment.notes}
                </div>
              )}

              {/* Signatures: Cashier & Payer */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">
                    Cashier / Estate Manager Stamp:
                  </span>
                  {viewingPayment.digitalSignature ? (
                    <div className="p-1.5 border border-border rounded bg-white">
                      <img src={viewingPayment.digitalSignature} alt="Cashier signature" className="h-10 w-auto object-contain mx-auto" />
                    </div>
                  ) : (
                    <div className="h-10 border border-dashed border-border rounded flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                      Verified Electronically
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground block text-center font-mono">
                    Recorded by: {viewingPayment.recordedBy}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">
                    Payer Acknowledgment:
                  </span>
                  {payerSignature ? (
                    <div className="p-1.5 border border-border rounded bg-white">
                      <img src={payerSignature} alt="Payer signature" className="h-10 w-auto object-contain mx-auto" />
                    </div>
                  ) : (
                    <div className="p-1 border border-border rounded bg-white">
                      <SignaturePad
                        onSave={(sig) => setPayerSignature(sig)}
                        width={210}
                        height={70}
                        label="Payer Sign Here"
                      />
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground block text-center font-mono">
                    Tenant Signature Stamp
                  </span>
                </div>
              </div>
              {/* Official Receipt Certification Stamp (Print Only) */}
              <div className="hidden print:block pt-4 border-t-2 border-slate-300">
                <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
                  <div className="space-y-3">
                    <p className="font-semibold uppercase text-[10px] text-slate-500">AUTHORIZED CASHIER / REVENUE CLERK</p>
                    <div className="border-b border-slate-400 h-8 w-4/5" />
                    <p>Signature: __________________________</p>
                    <p className="text-[10px] text-slate-500">Verified under ZIMRA Fiscal Receipts Framework</p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold uppercase text-[10px] text-slate-500">TENANT / COMMERCIAL PAYER</p>
                    <div className="border-b border-slate-400 h-8 w-4/5" />
                    <p>Signature: __________________________</p>
                    <p className="text-[10px] text-slate-500">Date: {viewingPayment.paymentDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setViewingPayment(null)}
                className="h-8 text-xs"
              >
                Close Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};
