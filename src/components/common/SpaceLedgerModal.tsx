import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space, RentalFrequency, UnitPrefix } from '@/types/rentflow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  History,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  PenTool,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface SpaceLedgerModalProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  allSpaces?: Space[];
  onNavigateSpace?: (space: Space) => void;
}

export const SpaceLedgerModal: React.FC<SpaceLedgerModalProps> = ({
  space,
  isOpen,
  onClose,
  allSpaces,
  onNavigateSpace
}) => {
  const {
    spaceLedgers,
    addSpacePaymentAdjustment,
    updateSpace,
    updateTenant,
    properties,
    tenants,
    rbzExchangeRate
  } = useRentFlow();

  // Internal tracked space for browsing
  const [currentSpace, setCurrentSpace] = useState<Space | null>(space);

  // Tab State: 'addPayment' | 'overrides' | 'history'
  const [activeTab, setActiveTab] = useState<'addPayment' | 'overrides' | 'history'>('addPayment');

  // Quick Payment Preset selection
  const [activePreset, setActivePreset] = useState<'daily' | 'weekly' | 'full' | 'partial'>('daily');

  // Add Payment Form States matching spaceledger1.png & spaceledger2.png
  const [paymentAmountUSD, setPaymentAmountUSD] = useState<string>('24');
  const [paymentMethod, setPaymentMethod] = useState<string>('EcoCash USD (Mobile Money)');
  const [transactionRef, setTransactionRef] = useState<string>('ECO-982144');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptNote, setReceiptNote] = useState<string>('Daily kiosk contribution or Week 2 office partial payment');
  const [isReceiptSigned, setIsReceiptSigned] = useState<boolean>(false);

  // Manual Contact & Frequency Edit states in Overrides tab
  const [editTenantName, setEditTenantName] = useState<string>(space?.currentTenantName || '');
  const [editTenantPhone, setEditTenantPhone] = useState<string>(space?.tenantPhone || '+263 77 123 4567');
  const [editTenantWhatsApp, setEditTenantWhatsApp] = useState<string>(space?.tenantWhatsApp || '+263771234567');
  const [editFrequency, setEditFrequency] = useState<RentalFrequency>(space?.frequency || 'Monthly');
  const [editUnitPrefix, setEditUnitPrefix] = useState<UnitPrefix>(space?.unitPrefix || 'Shop');
  const [editBaseRent, setEditBaseRent] = useState<string>(space ? String(space.baseRentUSD) : '730');
  const [editCamLevy, setEditCamLevy] = useState<string>('150');
  const [editDieselLevy, setEditDieselLevy] = useState<string>('85');
  const [editParkingLevy, setEditParkingLevy] = useState<string>('50');
  const [editWaterLevy, setEditWaterLevy] = useState<string>('45');
  const [editAccumulation, setEditAccumulation] = useState<string>(space ? String(space.rentalAccumulationUSD) : '730');

  // Synchronize when space changes
  React.useEffect(() => {
    if (space) {
      setCurrentSpace(space);
      // Pre-calculate daily preset based on base rent
      const target = space.targetRentUSD || space.baseRentUSD || 730;
      const daily = Math.round(target / 30);
      setPaymentAmountUSD(daily.toString());
      setActivePreset('daily');
    }
  }, [space]);

  React.useEffect(() => {
    if (currentSpace) {
      setEditTenantName(currentSpace.currentTenantName || '');
      setEditTenantPhone(currentSpace.tenantPhone || '+263 77 123 4567');
      setEditTenantWhatsApp(currentSpace.tenantWhatsApp || '+263771234567');
      setEditFrequency(currentSpace.frequency || 'Monthly');
      setEditUnitPrefix(currentSpace.unitPrefix || (currentSpace.type as UnitPrefix) || 'Shop');
      setEditBaseRent(String(currentSpace.baseRentUSD));
      setEditAccumulation(String(currentSpace.rentalAccumulationUSD));
    }
  }, [currentSpace]);

  if (!currentSpace) return null;

  const property = properties.find(p => p.id === currentSpace.propertyId);
  const ledgerEntries = spaceLedgers[currentSpace.id] || [];

  // Financial calculations
  const targetRentUSD = currentSpace.targetRentUSD || currentSpace.baseRentUSD || 730;
  const currentAccumulatedPaid = Math.max(0, targetRentUSD - currentSpace.rentalAccumulationUSD);
  const collectionPercent = targetRentUSD > 0 ? Math.min(100, Math.round((currentAccumulatedPaid / targetRentUSD) * 100)) : 0;
  const arrearsUSD = currentSpace.rentalAccumulationUSD;
  const arrearsZiG = (arrearsUSD * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Quick Preset Values
  const dailyRentVal = Math.max(1, Math.round(targetRentUSD / 30));
  const weeklyRentVal = Math.max(1, Math.round(targetRentUSD / 4));
  const fullMonthRentVal = Math.round(targetRentUSD);
  const partialRentVal = Math.max(1, Math.round(targetRentUSD / 2));

  // Current payment amount & dynamic conversions
  const currentPayAmtNum = parseFloat(paymentAmountUSD) || 0;
  const currentPayAmtZiG = (currentPayAmtNum * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Post-payment projections
  const projectedPaid = currentAccumulatedPaid + currentPayAmtNum;
  const projectedPercent = targetRentUSD > 0 ? Math.min(100, Math.round((projectedPaid / targetRentUSD) * 100)) : 0;
  const projectedRemainingArrears = Math.max(0, arrearsUSD - currentPayAmtNum);
  const projectedRemainingZiG = (projectedRemainingArrears * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Handle Preset Click
  const handleSelectPreset = (preset: 'daily' | 'weekly' | 'full' | 'partial') => {
    setActivePreset(preset);
    if (preset === 'daily') setPaymentAmountUSD(dailyRentVal.toString());
    else if (preset === 'weekly') setPaymentAmountUSD(weeklyRentVal.toString());
    else if (preset === 'full') setPaymentAmountUSD(fullMonthRentVal.toString());
    else if (preset === 'partial') setPaymentAmountUSD(partialRentVal.toString());
  };

  // Submit Payment Logging
  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPayAmtNum <= 0) {
      toast.error('Please enter a valid payment amount greater than zero.');
      return;
    }

    addSpacePaymentAdjustment(currentSpace.id, {
      spaceId: currentSpace.id,
      date: paymentDate,
      description: receiptNote.trim() || `Space Payment via ${paymentMethod}`,
      chargeUSD: 0,
      paymentUSD: currentPayAmtNum,
      balanceUSD: projectedRemainingArrears,
      reference: transactionRef.trim() || `ECO-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Payment',
    });

    toast.success(`Logged $${currentPayAmtNum.toFixed(2)} USD payment for ${currentSpace.unitPrefix || currentSpace.type} ${currentSpace.unitNumber}!`);
    onClose();
  };

  // Save manual overrides
  const handleSaveSpaceDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const newRent = parseFloat(editBaseRent) || currentSpace.baseRentUSD;
    const newAccum = parseFloat(editAccumulation) || 0;

    const newCam = parseFloat(editCamLevy) || 0;
    const newDiesel = parseFloat(editDieselLevy) || 0;
    const newParking = parseFloat(editParkingLevy) || 0;
    const newWater = parseFloat(editWaterLevy) || 0;
    const totalLevies = newRent + newCam + newDiesel + newParking + newWater;

    let calculatedTarget = totalLevies;
    if (editFrequency === 'Daily') calculatedTarget = totalLevies * 30;
    else if (editFrequency === 'Weekly') calculatedTarget = Math.round(totalLevies * 4.33);

    updateSpace(currentSpace.id, {
      currentTenantName: editTenantName,
      tenantPhone: editTenantPhone,
      tenantWhatsApp: editTenantWhatsApp,
      frequency: editFrequency,
      unitPrefix: editUnitPrefix,
      baseRentUSD: newRent,
      targetRentUSD: calculatedTarget,
      rentalAccumulationUSD: newAccum,
      status: newAccum > 0 ? 'Overdue' : editTenantName ? 'Occupied' : 'Vacant'
    });

    // Record Real-Time Audit Event in Space Ledger
    addSpacePaymentAdjustment(currentSpace.id, {
      spaceId: currentSpace.id,
      date: new Date().toISOString().split('T')[0],
      description: `Audit Event: Levies modified by Property Manager (Base: $${newRent}, CAM: $${newCam}, Diesel: $${newDiesel}, Parking: $${newParking}, Water: $${newWater})`,
      reference: `AUDIT-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Adjustment',
      chargeUSD: 0,
      paymentUSD: 0,
      balanceUSD: newAccum
    });

    if (currentSpace.currentTenantId) {
      updateTenant(currentSpace.currentTenantId, {
        tradingName: editTenantName,
        phone: editTenantPhone,
        whatsappPhone: editTenantWhatsApp,
        balanceUSD: newAccum,
      });
    }

    toast.success(`Space levies & audit event recorded! Total monthly target: $${calculatedTarget.toFixed(2)} USD`);
  };

  // 1-Click Export to Excel (.csv)
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Transaction Description',
      'Reference / Receipt',
      'Charge (USD)',
      'Charge (ZiG)',
      'Payment (USD)',
      'Payment (ZiG)',
      'Balance (USD)',
      'Balance (ZiG)'
    ];

    const rows = ledgerEntries.map(entry => [
      `"${entry.date}"`,
      `"${entry.description.replace(/"/g, '""')}"`,
      `"${entry.reference}"`,
      entry.chargeUSD.toFixed(2),
      (entry.chargeUSD * rbzExchangeRate).toFixed(2),
      entry.paymentUSD.toFixed(2),
      (entry.paymentUSD * rbzExchangeRate).toFixed(2),
      entry.balanceUSD.toFixed(2),
      (entry.balanceUSD * rbzExchangeRate).toFixed(2)
    ]);

    const csvContent = [
      `"RENTFLOW COMMERCIAL PROPERTY MANAGEMENT - OFFICIAL SPACE STATEMENT OF ACCOUNT"`,
      `"Property:","${property?.name || 'Commercial Asset'}"`,
      `"Commercial Space:","${currentSpace.unitPrefix || currentSpace.type} ${currentSpace.unitNumber} (${currentSpace.customName || ''})"`,
      `"Current Tenant:","${currentSpace.currentTenantName || 'Vacant'}"`,
      `"ZIMRA Tax Clearance:","ITF263 Compliant (BP 200034182, VAT Reg 10048291)"`,
      `"RBZ Dual-Currency Official Rate:","1 USD = ${rbzExchangeRate} ZiG"`,
      `"Date of Generation:","${new Date().toISOString().split('T')[0]}"`,
      `""`,
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${property?.code || 'COMM'}_Unit_${currentSpace.unitNumber}_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported Statement for ${currentSpace.unitPrefix || currentSpace.type} ${currentSpace.unitNumber} to CSV!`);
  };

  const unitTitle = `${currentSpace.unitPrefix || currentSpace.type} ${currentSpace.unitNumber}`;
  const locationSubtitle = `${property?.name || 'Dublin House'} (${property?.address || 'Central Business District'}) • ${
    currentSpace.status === 'Vacant' ? 'Vacant Commercial Space' : (currentSpace.currentTenantName ? `${currentSpace.currentTenantName} (Commercial Space)` : 'Occupied Commercial Space')
  }`;

  // In-Page Space Navigation Switcher Logic
  const spaceList = allSpaces && allSpaces.length > 0 ? allSpaces : [];
  const currentIndex = spaceList.findIndex(s => s.id === currentSpace?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < spaceList.length - 1;

  const handlePrevSpace = () => {
    if (hasPrev) {
      const prev = spaceList[currentIndex - 1];
      setCurrentSpace(prev);
      if (onNavigateSpace) onNavigateSpace(prev);
    }
  };

  const handleNextSpace = () => {
    if (hasNext) {
      const next = spaceList[currentIndex + 1];
      setCurrentSpace(next);
      if (onNavigateSpace) onNavigateSpace(next);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 space-y-3">
        {/* IN-PAGE SPACE ENTITY SWITCHER & BACK BAR */}
        <div className="flex items-center justify-between bg-muted/60 dark:bg-muted/30 border border-border/80 px-3 py-1.5 rounded-lg text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 -ml-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Space Rack</span>
          </Button>

          {spaceList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={handlePrevSpace}
                className="h-7 px-2 text-xs flex items-center gap-1"
                title="Navigate to Previous Space"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev Space</span>
              </Button>

              <span className="text-[11px] font-mono text-muted-foreground px-1">
                {currentIndex >= 0 ? `${currentIndex + 1} of ${spaceList.length}` : `${spaceList.length} Units`}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={handleNextSpace}
                className="h-7 px-2 text-xs flex items-center gap-1"
                title="Navigate to Next Space"
              >
                <span className="hidden sm:inline">Next Space</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* MODAL HEADER matching spaceledger1.png */}
        <DialogHeader className="space-y-1 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mt-0.5 border border-blue-200 dark:border-blue-900">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif font-bold text-foreground">
                  {unitTitle} • Space Payment Ledger & Manager Controls
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {locationSubtitle}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 font-mono shrink-0 ${
                collectionPercent === 100
                  ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-rose-300 text-rose-600 bg-rose-50/50 dark:bg-rose-950/30 font-semibold'
              }`}
            >
              {collectionPercent}% Collected
            </Badge>
          </div>
        </DialogHeader>

        {/* RENTAL & LEVIES COLLECTION PROGRESS BAR matching spaceledger1.png */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Rental & Levies Collection Progress:</span>
            </span>
            <span className="font-mono">
              ${currentAccumulatedPaid.toFixed(2)} / ${targetRentUSD.toFixed(2)}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                collectionPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${collectionPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-muted-foreground">Outstanding Arrears / Shortfall:</span>
            <span className="font-mono font-semibold text-rose-400">
              ${arrearsUSD.toFixed(2)} (≈ ZiG {arrearsZiG})
            </span>
          </div>
        </div>

        {/* THREE TABS matching spaceledger1.png */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('addPayment')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all ${
                activeTab === 'addPayment'
                  ? 'bg-slate-800 text-foreground border border-slate-700/60 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-sky-400" />
              <span>$ Add Payment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overrides')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all ${
                activeTab === 'overrides'
                  ? 'bg-slate-800 text-foreground border border-slate-700/60 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Levies & Overrides</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-foreground border border-slate-700/60 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Space History ({ledgerEntries.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ADD PAYMENT matching spaceledger1.png & spaceledger2.png */}
        {activeTab === 'addPayment' && (
          <form onSubmit={handleLogPayment} className="space-y-4 pt-1">
            {/* Quick Payment Preset Buttons matching spaceledger1.png */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quick Payment Preset
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('daily')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    activePreset === 'daily'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">Daily Rent</div>
                  <div className="text-sm font-bold font-mono mt-0.5">${dailyRentVal}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('weekly')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    activePreset === 'weekly'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">Weekly Rent</div>
                  <div className="text-sm font-bold font-mono mt-0.5">${weeklyRentVal}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('full')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    activePreset === 'full'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">Full Month</div>
                  <div className="text-sm font-bold font-mono mt-0.5">${fullMonthRentVal}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('partial')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    activePreset === 'partial'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">Partial Installment</div>
                  <div className="text-sm font-bold font-mono mt-0.5">${partialRentVal}</div>
                </button>
              </div>
            </div>

            {/* Row 1: Payment Amount & Zimbabwe Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Payment Amount (USD $)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmountUSD}
                    onChange={(e) => {
                      setPaymentAmountUSD(e.target.value);
                      setActivePreset('daily');
                    }}
                    className="pl-6 h-9 text-xs font-mono"
                    required
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  ≈ {currentPayAmtZiG} ZiG @ RBZ {rbzExchangeRate.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Zimbabwe Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EcoCash USD (Mobile Money)">EcoCash USD (Mobile Money)</SelectItem>
                    <SelectItem value="Stanbic Bank Nostro (USD)">Stanbic Bank Nostro (USD)</SelectItem>
                    <SelectItem value="Cash USD (Office Handover)">Cash USD (Office Handover)</SelectItem>
                    <SelectItem value="InnBucks Teller Cash">InnBucks Teller Cash</SelectItem>
                    <SelectItem value="Zimswitch ZIPIT / RTGS (ZiG)">Zimswitch ZIPIT / RTGS (ZiG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Transaction Reference Number & Payment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Transaction Reference Number</Label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. ECO-982144 or NOSTRO-8812"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Payment Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Row 3: Receipt Note / Description */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Receipt Note / Description</Label>
              <Input
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="e.g. Daily kiosk contribution or Week 2 office partial payment"
                className="h-9 text-xs"
              />
            </div>

            {/* Row 4: Digital Signature on Receipt matching spaceledger2.png */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-slate-800 text-sky-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Digital Signature on Receipt</div>
                  <div className="text-[11px] text-muted-foreground">Optional digital sign-off from tenant or manager</div>
                </div>
              </div>
              <Button
                type="button"
                variant={isReceiptSigned ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsReceiptSigned(!isReceiptSigned);
                  toast.success(isReceiptSigned ? 'Digital signature cleared.' : 'Signed by Commercial Property Manager.');
                }}
                className={`h-8 px-3 text-xs ${isReceiptSigned ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              >
                {isReceiptSigned ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed
                  </span>
                ) : (
                  'Sign Receipt'
                )}
              </Button>
            </div>

            {/* Row 5: Post-Payment Projected Collection Box matching spaceledger2.png */}
            <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-200">
                <span>Post-Payment Projected Collection:</span>
                <span className="font-mono text-sm">{projectedPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-300 font-mono">
                <span>Total Accumulated Paid:</span>
                <span>${projectedPaid.toFixed(2)} / ${targetRentUSD.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                <span>Remaining Arrears / Shortfall:</span>
                <span>${projectedRemainingArrears.toFixed(2)} (ZiG {projectedRemainingZiG})</span>
              </div>
            </div>

            {/* Modal Footer matching spaceledger2.png */}
            <div className="flex items-center justify-between pt-3 border-t border-border/70">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span>Log ${paymentAmountUSD || '0'} Payment</span>
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: LEVIES & OVERRIDES */}
        {activeTab === 'overrides' && (
          <form onSubmit={handleSaveSpaceDetails} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Current Tenant / Occupant</Label>
                <Input
                  value={editTenantName}
                  onChange={(e) => setEditTenantName(e.target.value)}
                  placeholder="e.g. Bakers Inn Commercial"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Rental Frequency</Label>
                <Select value={editFrequency} onValueChange={(v) => setEditFrequency(v as RentalFrequency)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily Turnover</SelectItem>
                    <SelectItem value="Weekly">Weekly Cycle</SelectItem>
                    <SelectItem value="Monthly">Monthly Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Phone (+263)</Label>
                <Input
                  value={editTenantPhone}
                  onChange={(e) => setEditTenantPhone(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">WhatsApp Direct</Label>
                <Input
                  value={editTenantWhatsApp}
                  onChange={(e) => setEditTenantWhatsApp(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Base Rent (USD)</Label>
                <Input
                  type="number"
                  value={editBaseRent}
                  onChange={(e) => setEditBaseRent(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">CAM Levy (USD)</Label>
                <Input
                  type="number"
                  value={editCamLevy}
                  onChange={(e) => setEditCamLevy(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Generator Diesel Levy (USD)</Label>
                <Input
                  type="number"
                  value={editDieselLevy}
                  onChange={(e) => setEditDieselLevy(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Parking Bay Levy (USD)</Label>
                <Input
                  type="number"
                  value={editParkingLevy}
                  onChange={(e) => setEditParkingLevy(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Water & Utilities Levy (USD)</Label>
                <Input
                  type="number"
                  value={editWaterLevy}
                  onChange={(e) => setEditWaterLevy(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Arrears Balance (USD)</Label>
                <Input
                  type="number"
                  value={editAccumulation}
                  onChange={(e) => setEditAccumulation(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
              <Button type="submit" size="sm" className="h-9 text-xs bg-primary text-primary-foreground font-semibold">
                Save Space & Levies Changes
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: SPACE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Historical Ledger Records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </Button>
              </div>
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                No past transactions recorded yet for this unit.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table className="[&>div]:max-w-full text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Description</TableHead>
                      <TableHead className="whitespace-nowrap">Reference</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Payment (USD)</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((e, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap font-mono">{e.date}</TableCell>
                        <TableCell className="whitespace-nowrap">{e.description}</TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-muted-foreground">{e.reference}</TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-right text-emerald-600 font-semibold">
                          ${e.paymentUSD.toFixed(2)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-right">
                          ${e.balanceUSD.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
