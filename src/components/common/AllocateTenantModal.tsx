import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space } from '@/types/rentflow';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  User,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface AllocateTenantModalProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  onAllocated?: () => void;
}

export const AllocateTenantModal: React.FC<AllocateTenantModalProps> = ({
  space,
  isOpen,
  onClose,
  onAllocated
}) => {
  const {
    tenants,
    properties,
    allocateTenantToSpace,
    addTenant,
    addLease,
    addInvoice,
    recordPayment,
    rbzExchangeRate
  } = useRentFlow();

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // New Tenant Form matching registernewtenant1.png
  const [newPrimaryName, setNewPrimaryName] = useState<string>('');
  const [newTradingName, setNewTradingName] = useState<string>('');
  const [newEntityType, setNewEntityType] = useState<string>('Corporate / Registered Business');
  const [newPhone, setNewPhone] = useState<string>('+263 77');
  const [newWhatsApp, setNewWhatsApp] = useState<string>('+263 71 987 6543');
  const [newEmail, setNewEmail] = useState<string>('accounts@business.co.zw');
  const [newNationalIdTin, setNewNationalIdTin] = useState<string>('');

  // Lease Terms
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const [endDate, setEndDate] = useState<string>(defaultExpiry.toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState<string>('Monthly Invoicing');
  const [baseRentUSD, setBaseRentUSD] = useState<string>(space?.baseRentUSD ? space.baseRentUSD.toString() : '750');
  const [camFeeUSD, setCamFeeUSD] = useState<string>(space?.camFeeUSD ? space.camFeeUSD.toString() : '50');
  const [depositUSD, setDepositUSD] = useState<string>(space?.baseRentUSD ? (space.baseRentUSD * 2).toString() : '1500');
  const [annualEscalation, setAnnualEscalation] = useState<string>('8');
  const [enableTurnoverRent, setEnableTurnoverRent] = useState<boolean>(false);
  const [turnoverPercent, setTurnoverPercent] = useState<string>('5');

  // Mandatory Payment Clearance & Handover Enforcement
  const [amountPaidUSD, setAmountPaidUSD] = useState<string>(
    space ? (space.baseRentUSD * 3 + (space.camFeeUSD || 50)).toString() : '2300'
  );
  const [paymentGateway, setPaymentGateway] = useState<string>('EcoCash USD (USSD Push)');
  const [paymentReference, setPaymentReference] = useState<string>('ECO-550614');
  const [paymentMemo, setPaymentMemo] = useState<string>('Initial rent and security deposit verified and received.');
  const [paymentVerified, setPaymentVerified] = useState<boolean>(true);
  const [allocationBlockedAlert, setAllocationBlockedAlert] = useState<string | null>(null);

  if (!space) return null;

  const prop = properties.find(p => p.id === space.propertyId);
  const unallocatedTenants = tenants.filter(t => !t.unitId || t.unitId === 'sp-pending' || t.status === 'Pending Lease');
  
  const targetRentNum = parseFloat(baseRentUSD) || space.baseRentUSD || 750;
  const targetRentZiG = (targetRentNum * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const depositNum = parseFloat(depositUSD) || 0;
  const camNum = parseFloat(camFeeUSD) || 0;
  const requiredMoveInTotalUSD = targetRentNum + depositNum + camNum;
  const requiredMoveInTotalZiG = (requiredMoveInTotalUSD * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paidUSDNum = parseFloat(amountPaidUSD) || 0;
  const paidZiGFormatted = (paidUSDNum * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const spaceDisplayCode = (space as unknown as { code?: string }).code || `GF-0${space.unitNumber}`;
  const spaceUnitName = `${space.unitPrefix || space.type} ${space.unitNumber}`;
  const propertyCodeStr = (prop?.code || 'DBLIN').toUpperCase();

  const handlePreFillFullPayment = () => {
    setAmountPaidUSD(requiredMoveInTotalUSD.toString());
    setPaymentReference(`ECO-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentVerified(true);
    setAllocationBlockedAlert(null);
    toast.success('Pre-filled cleared move-in payment and verified reference.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT PAYMENT RESTRICTION ENFORCEMENT
    if (!paymentVerified) {
      setAllocationBlockedAlert(
        'Handover Blocked: RentFlow policy requires proof of cleared payment (Security Deposit + 1st Month Rent) before space handover. Allocation will be refused without verified clearance.'
      );
      toast.error('Allocation Refused: You must confirm that the move-in payment has been verified and cleared.');
      return;
    }

    if (paidUSDNum < depositNum) {
      setAllocationBlockedAlert(
        `Allocation Blocked: Amount paid ($${paidUSDNum.toLocaleString()}) does not meet the mandatory Security Deposit ($${depositNum.toLocaleString()}). Handover cannot proceed.`
      );
      toast.error(`Allocation Refused: Minimum security deposit of $${depositNum.toLocaleString()} USD required.`);
      return;
    }

    if (!paymentReference.trim()) {
      setAllocationBlockedAlert(
        'Allocation Blocked: A verified Payment Reference or Approval Code (e.g. ECO-550614, Bank POP) is mandatory.'
      );
      toast.error('Payment Reference / Approval Code is required.');
      return;
    }

    setAllocationBlockedAlert(null);

    let targetTenantId = selectedTenantId;
    let tenantEntityName = '';

    if (mode === 'new') {
      if (!newPrimaryName.trim()) {
        toast.error('Tenant Primary Name / Director is required.');
        return;
      }
      const newTenantId = `ten-${Date.now()}`;
      targetTenantId = newTenantId;
      tenantEntityName = newTradingName.trim() || newPrimaryName.trim();

      addTenant({
        name: newPrimaryName.trim(),
        tradingName: newTradingName.trim() || newPrimaryName.trim(),
        contactPerson: newPrimaryName.trim(),
        email: newEmail.trim() || 'accounts@business.co.zw',
        phone: newPhone.trim() || '+263 77 000 0000',
        whatsappPhone: newWhatsApp.trim(),
        nationalIdOrReg: newNationalIdTin.trim() || `REG-ZW-${Math.floor(10000 + Math.random() * 90000)}/2026`,
        propertyId: space.propertyId,
        propertyName: prop?.name || 'Commercial Center',
        unitId: space.id,
        unitNumber: space.unitNumber,
        status: 'Active',
        balanceUSD: Math.max(0, requiredMoveInTotalUSD - paidUSDNum),
        balanceZiG: Math.max(0, (requiredMoveInTotalUSD - paidUSDNum) * rbzExchangeRate),
        monthlyRentUSD: targetRentNum,
        leaseExpiryDate: endDate,
        category: 'Retail',
      });
    } else {
      if (!targetTenantId) {
        toast.error('Please select a registered commercial tenant from the directory.');
        return;
      }
      const existing = tenants.find(t => t.id === targetTenantId);
      tenantEntityName = existing?.name || 'Commercial Tenant';
    }

    // Allocate tenant to space
    allocateTenantToSpace(space.id, targetTenantId);

    // Create linked commercial lease
    const newLeaseNumber = `LS-${prop?.code || 'COMM'}-${new Date().getFullYear()}-${space.unitNumber}`;
    addLease({
      leaseNumber: newLeaseNumber,
      tenantId: targetTenantId,
      tenantName: tenantEntityName,
      propertyId: space.propertyId,
      propertyName: prop?.name || 'Commercial Property',
      unitId: space.id,
      unitNumber: space.unitNumber,
      startDate,
      endDate,
      baseRentUSD: targetRentNum,
      camFeeUSD: camNum,
      depositUSD: depositNum,
      turnoverPercentage: enableTurnoverRent ? parseFloat(turnoverPercent) || 0 : 0,
      annualEscalationRate: parseFloat(annualEscalation) || 8,
      status: 'Active',
      terms: `Commercial lease agreement for ${spaceUnitName} at ${prop?.name || 'Commercial Asset'}. Verified Handover Reference: ${paymentReference.trim()}. Memo: ${paymentMemo}`
    });

    // Generate initial invoice
    const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    addInvoice({
      invoiceNumber: invNum,
      tenantId: targetTenantId,
      tenantName: tenantEntityName,
      propertyId: space.propertyId,
      propertyName: prop?.name || 'Commercial Property',
      unitId: space.id,
      unitNumber: space.unitNumber,
      billingPeriod: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      exchangeRate: rbzExchangeRate,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `Base Commercial Rent (${spaceUnitName})`,
          amountUSD: targetRentNum,
          amountZiG: targetRentNum * rbzExchangeRate,
          type: 'Base Rent'
        },
        {
          id: `item-${Date.now()}-2`,
          description: 'CAM Service Charge',
          amountUSD: camNum,
          amountZiG: camNum * rbzExchangeRate,
          type: 'CAM Charge'
        },
        {
          id: `item-${Date.now()}-3`,
          description: 'Refundable Security Deposit',
          amountUSD: depositNum,
          amountZiG: depositNum * rbzExchangeRate,
          type: 'Base Rent'
        }
      ],
      totalUSD: requiredMoveInTotalUSD,
      totalZiG: requiredMoveInTotalUSD * rbzExchangeRate,
      paidUSD: paidUSDNum,
      paidZiG: paidUSDNum * rbzExchangeRate,
      status: paidUSDNum >= requiredMoveInTotalUSD ? 'Paid' : (paidUSDNum > 0 ? 'Partially Paid' : 'Unpaid')
    });

    // Record verified move-in payment receipt
    if (paidUSDNum > 0) {
      let mappedMethod: import('@/types/rentflow').PaymentMethod = 'EcoCash';
      if (paymentGateway.includes('Nostro')) mappedMethod = 'Nostro';
      else if (paymentGateway.includes('Cash')) mappedMethod = 'Cash (USD)';
      else if (paymentGateway.includes('InnBucks')) mappedMethod = 'InnBucks';
      else if (paymentGateway.includes('RTGS') || paymentGateway.includes('ZiG')) mappedMethod = 'Cash (ZiG)';

      recordPayment({
        tenantId: targetTenantId,
        tenantName: tenantEntityName,
        propertyId: space.propertyId,
        propertyName: prop?.name || 'Commercial Property',
        unitId: space.id,
        unitNumber: space.unitNumber,
        amountUSD: paidUSDNum,
        amountZiG: paidUSDNum * rbzExchangeRate,
        currency: 'USD',
        paymentMethod: mappedMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: paymentReference.trim(),
        recordedBy: 'Commercial Property Desk',
        notes: `${paymentMemo} Gateway: ${paymentGateway}`
      });
    }

    toast.success(`Space ${spaceUnitName} successfully allocated to ${tenantEntityName}! Move-in payment and lease active.`);
    onClose();
    if (onAllocated) onAllocated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="space-y-2 pb-1">
          {/* Top Pill Badges matching allocatetenant1.png & registernewtenant1.png */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-400/60 shadow-2xs">
              Space Allocation
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              {propertyCodeStr} -HARARE - {space.unitPrefix || space.type} {space.unitNumber}
            </span>
          </div>

          <DialogTitle className="text-xl font-serif font-bold text-foreground">
            Allocate Tenant to {space.floor} {spaceUnitName} ({spaceDisplayCode})
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Assign a business or individual tenant to this vacant space at {prop?.name || 'Dublin House'}, generate a commercial lease, and update the tenancy register.
          </DialogDescription>
        </DialogHeader>

        {/* 4-Column Space Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 text-xs">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              PROPERTY
            </div>
            <div className="font-semibold text-foreground truncate mt-0.5">
              {prop?.name || 'Dublin House'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              FLOOR / TYPE
            </div>
            <div className="font-semibold text-foreground truncate mt-0.5">
              {space.floor} • {space.type}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              FLOOR AREA
            </div>
            <div className="font-semibold text-foreground font-mono mt-0.5">
              {space.sizeSqm || 50} sqm
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              DEFAULT BASE RENT
            </div>
            <div className="font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              ${targetRentNum.toFixed(2)} / monthly
            </div>
          </div>
        </div>

        {/* Blocking Validation Error Alert */}
        {allocationBlockedAlert && (
          <Alert variant="destructive" className="border-rose-500/50 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 text-xs">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <AlertTitle className="font-bold font-serif">Handover Refused & Blocked</AlertTitle>
            <AlertDescription className="mt-1 leading-relaxed">
              {allocationBlockedAlert}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* SECTION 1: TENANT SELECTION & DIRECTORY LINK */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-sans">
                1. TENANT SELECTION & DIRECTORY LINK
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Bidirectional Sync Active
              </Badge>
            </div>

            {/* Switcher Pills matching registernewtenant1.png */}
            <div className="inline-flex w-full rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-slate-100/70 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  mode === 'existing'
                    ? 'bg-slate-800 text-foreground border border-slate-700/60 shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Select Existing Tenant ({unallocatedTenants.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  mode === 'new'
                    ? 'bg-slate-800 text-foreground border border-slate-700/60 shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Tenant</span>
              </button>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-medium">Select Tenant from Directory *</Label>
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger className="h-10 text-xs bg-background">
                    <SelectValue placeholder="Search or choose a registered tenant..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {unallocatedTenants.length > 0 && (
                      <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        ⭐ Unallocated / Prospective Tenants
                      </div>
                    )}
                    {unallocatedTenants.map(t => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        ⭐ {t.name} ({t.tradingName}) • {t.category}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      All Registered Tenants
                    </div>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.name} ({t.tradingName}) {t.unitNumber !== 'Pending' ? `• Currently in ${t.unitNumber}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Fields matching registernewtenant1.png EXACTLY */
              <div className="space-y-3 pt-1">
                {/* Row 1: Primary Name / Director & Business Trading Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tenant Primary Name / Director *</Label>
                    <Input
                      placeholder="e.g. Tendai Mukamuri"
                      value={newPrimaryName}
                      onChange={(e) => setNewPrimaryName(e.target.value)}
                      className="h-9 text-xs"
                      required={mode === 'new'}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Business / Trading Name</Label>
                    <Input
                      placeholder="e.g. Mukamuri Pharmacy Pvt Ltd"
                      value={newTradingName}
                      onChange={(e) => setNewTradingName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Row 2: Entity Type, Mobile Phone, WhatsApp/Alt Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Entity Type</Label>
                    <Select value={newEntityType} onValueChange={setNewEntityType}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporate / Registered Business">Corporate / Registered Business</SelectItem>
                        <SelectItem value="Individual / Sole Proprietor">Individual / Sole Proprietor</SelectItem>
                        <SelectItem value="Partnership / Joint Venture">Partnership / Joint Venture</SelectItem>
                        <SelectItem value="NGO / Trust">NGO / Trust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Mobile Phone (EcoNet / NetOne) *</Label>
                    <Input
                      placeholder="+263 77..."
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required={mode === 'new'}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">WhatsApp / Alt Contact</Label>
                    <Input
                      placeholder="+263 71 987 6543"
                      value={newWhatsApp}
                      onChange={(e) => setNewWhatsApp(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Row 3: Email Address & National ID / ZIMRA BP / TIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="accounts@business.co.zw"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">National ID or ZIMRA BP / TIN</Label>
                    <Input
                      placeholder="e.g. 63-109234D42 or BP 20038512"
                      value={newNationalIdTin}
                      onChange={(e) => setNewNationalIdTin(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: COMMERCIAL LEASE AGREEMENT TERMS */}
          <div className="space-y-3 pt-2 border-t border-border/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-sans">
              2. COMMERCIAL LEASE AGREEMENT TERMS
            </h3>

            {/* Row 1: Commencement & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Lease Commencement Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Lease Expiry Date (1 Year Default)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Row 2: Agreed Rent, Rental Frequency, Security Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Agreed Rent Amount (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    value={baseRentUSD}
                    onChange={(e) => setBaseRentUSD(e.target.value)}
                    className="pl-6 h-9 text-xs font-mono"
                    required
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  = ZiG {targetRentZiG} (RBZ @ {rbzExchangeRate})
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Rental Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Invoicing">Monthly Invoicing</SelectItem>
                    <SelectItem value="Quarterly Invoicing">Quarterly Invoicing</SelectItem>
                    <SelectItem value="Annual Invoicing">Annual Invoicing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Security Deposit (USD)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    value={depositUSD}
                    onChange={(e) => setDepositUSD(e.target.value)}
                    className="pl-6 h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: CAM Levy, Escalation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">CAM Levy (USD/month)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    value={camFeeUSD}
                    onChange={(e) => setCamFeeUSD(e.target.value)}
                    className="pl-6 h-9 text-xs font-mono"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Generator, Borehole, Solar & Security share
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Annual Rent Escalation (%)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">%</span>
                  <Input
                    type="number"
                    step="0.5"
                    value={annualEscalation}
                    onChange={(e) => setAnnualEscalation(e.target.value)}
                    className="pl-6 h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Turnover Rent Checkbox */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="turnoverCheck"
                  checked={enableTurnoverRent}
                  onChange={(e) => setEnableTurnoverRent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                />
                <Label htmlFor="turnoverCheck" className="text-xs font-medium cursor-pointer text-foreground">
                  Enable Retail Turnover Rent (% of Monthly Sales)
                </Label>
              </div>

              {enableTurnoverRent && (
                <div className="pl-6 pt-1 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Turnover %:</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={turnoverPercent}
                    onChange={(e) => setTurnoverPercent(e.target.value)}
                    className="w-24 h-7 text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground">applied over natural base rent breakpoint</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: MANDATORY PAYMENT CLEARANCE & HANDOVER ENFORCEMENT */}
          <div className="space-y-3 pt-2 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 font-sans">
                  3. MANDATORY PAYMENT CLEARANCE & HANDOVER ENFORCEMENT
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/50 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40">
                Strict Compliance
              </Badge>
            </div>

            {/* Amber Warning Card */}
            <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
              RentFlow policy requires proof of cleared payment (Security Deposit + 1st Month Rent) before space handover. Allocation will be <span className="text-rose-600 dark:text-rose-400 font-bold">refused</span> without valid payment reference and verified clearance.
            </div>

            {/* Payment Fields matching registernewtenant3.png */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Cleared Payment (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    value={amountPaidUSD}
                    onChange={(e) => {
                      setAmountPaidUSD(e.target.value);
                      if (parseFloat(e.target.value) >= depositNum) {
                        setAllocationBlockedAlert(null);
                      }
                    }}
                    placeholder={requiredMoveInTotalUSD.toString()}
                    className="pl-6 h-9 text-xs font-mono"
                    required
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  = ZiG {paidZiGFormatted} (RBZ Rate)
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Payment Gateway / Method *</Label>
                <Select value={paymentGateway} onValueChange={setPaymentGateway}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EcoCash USD (USSD Push)">EcoCash USD (USSD Push)</SelectItem>
                    <SelectItem value="Stanbic Bank Nostro (USD)">Stanbic Bank Nostro (USD)</SelectItem>
                    <SelectItem value="Cash USD (Office Handover)">Cash USD (Office Handover)</SelectItem>
                    <SelectItem value="InnBucks Teller Cash">InnBucks Teller Cash</SelectItem>
                    <SelectItem value="Zimswitch ZIPIT / RTGS (ZiG)">Zimswitch ZIPIT / RTGS (ZiG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Payment Ref / Approval Code *</Label>
                <Input
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value);
                    if (e.target.value.trim()) setAllocationBlockedAlert(null);
                  }}
                  placeholder="ECO-550614"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Payment Verification Memo */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Payment Verification Memo</Label>
              <Input
                value={paymentMemo}
                onChange={(e) => setPaymentMemo(e.target.value)}
                placeholder="Initial rent and security deposit verified and received."
                className="h-9 text-xs"
              />
            </div>

            {/* Verification Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="verifyPaymentCheckbox"
                checked={paymentVerified}
                onChange={(e) => {
                  setPaymentVerified(e.target.checked);
                  if (e.target.checked) setAllocationBlockedAlert(null);
                }}
                className="h-4 w-4 rounded border-primary text-primary focus:ring-primary mt-0.5"
              />
              <Label htmlFor="verifyPaymentCheckbox" className="text-xs font-medium cursor-pointer text-foreground">
                I verify that this payment has been verified, banked, and cleared before allocating space.
              </Label>
            </div>
          </div>

          {/* INITIAL TENANCY MOVE-IN REQUIREMENT SUMMARY BOX matching registernewtenant3.png */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 dark:text-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Initial Tenancy Move-In Requirement</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-blue-700 dark:text-blue-300">
                RBZ Rate: 1 USD = {rbzExchangeRate.toFixed(2)} ZiG
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  1ST PERIOD RENT
                </div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  ${targetRentNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  SECURITY DEPOSIT
                </div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  ${depositNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  MONTHLY CAM
                </div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  ${camNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  TOTAL MOVE-IN
                </div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${requiredMoveInTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  (ZiG {requiredMoveInTotalZiG})
                </div>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePreFillFullPayment}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                title="Auto-fill cleared deposit & first month payment"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pre-fill</span>
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Payment & Allocate Space</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
