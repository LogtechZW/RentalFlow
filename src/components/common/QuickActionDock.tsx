import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap,
  Receipt,
  CreditCard,
  Wrench,
  Fuel,
  ChevronDown,
  ChevronUp,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const QuickActionDock: React.FC = () => {
  const {
    activeRole,
    properties,
    spaces,
    tenants,
    addInvoice,
    recordPayment,
    addMaintenanceTicket,
    addGeneratorLog,
    rbzExchangeRate
  } = useRentFlow();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Modal Dialog states
  const [modalType, setModalType] = useState<'invoice' | 'payment' | 'ticket' | 'generator' | null>(null);

  // Form states - Quick Invoice
  const [invPropertyId, setInvPropertyId] = useState<string>('prop-1');
  const [invSpaceId, setInvSpaceId] = useState<string>('sp-101');
  const [invAmountUSD, setInvAmountUSD] = useState<string>('2400');
  const [invCamUSD, setInvCamUSD] = useState<string>('450');

  // Form states - Quick Payment
  const [payTenantId, setPayTenantId] = useState<string>('ten-1');
  const [payAmountUSD, setPayAmountUSD] = useState<string>('2850');
  const [payMethod, setPayMethod] = useState<'EcoCash' | 'Nostro' | 'Cash (USD)'>('EcoCash');
  const [payRef, setPayRef] = useState<string>('EC-904128');

  // Form states - Quick Ticket
  const [ticketTitle, setTicketTitle] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<'Electrical' | 'Plumbing' | 'HVAC' | 'Elevator' | 'General'>('Electrical');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('High');
  const [ticketPropId, setTicketPropId] = useState<string>('prop-1');

  // Form states - Emergency Generator Log
  const [genPropId, setGenPropId] = useState<string>('prop-1');
  const [genLitres, setGenLitres] = useState<string>('300');
  const [genCostPerLitre, setGenCostPerLitre] = useState<string>('1.62');
  const [genHours, setGenHours] = useState<string>('6');
  const [genNotes, setGenNotes] = useState<string>('Emergency load-shedding backup run');

  // Role permissions
  const canInvoice = ['Property Manager', 'Accountant', 'Administrator'].includes(activeRole);
  const canPayment = ['Accountant', 'Administrator'].includes(activeRole);
  const canTicket = ['Property Manager', 'Tenant', 'Administrator'].includes(activeRole);
  const canGenerator = ['Property Manager', 'Administrator'].includes(activeRole);

  const availableActionsCount = [canInvoice, canPayment, canTicket, canGenerator].filter(Boolean).length;
  if (availableActionsCount === 0) return null;

  // Handlers
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === invPropertyId);
    const space = spaces.find(s => s.id === invSpaceId);
    const tenant = tenants.find(t => t.id === space?.currentTenantId);

    const baseUSD = parseFloat(invAmountUSD) || 0;
    const camUSD = parseFloat(invCamUSD) || 0;
    const totalUSD = baseUSD + camUSD;

    addInvoice({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: tenant?.id || 'ten-unknown',
      tenantName: tenant?.name || space?.currentTenantName || 'Tenant',
      propertyId: invPropertyId,
      propertyName: prop?.name || 'Property',
      unitId: space?.id || 'sp-unknown',
      unitNumber: space?.unitNumber || '101',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      billingPeriod: 'October 2026',
      exchangeRate: rbzExchangeRate,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `Base Commercial Rent (${space?.unitNumber || 'Unit'})`,
          amountUSD: baseUSD,
          amountZiG: baseUSD * rbzExchangeRate,
          type: 'Base Rent',
        },
        {
          id: `item-${Date.now()}-2`,
          description: 'CAM Service & Generator Backup Levy',
          amountUSD: camUSD,
          amountZiG: camUSD * rbzExchangeRate,
          type: 'CAM Charge',
        }
      ],
      totalUSD,
      totalZiG: totalUSD * rbzExchangeRate,
      status: 'Unpaid',
      paidUSD: 0,
      paidZiG: 0,
    });

    toast.success(`Commercial Invoice of $${totalUSD.toFixed(2)} USD created!`);
    setModalType(null);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === payTenantId);
    const amount = parseFloat(payAmountUSD) || 0;

    recordPayment({
      tenantId: tenant?.id || 'ten-1',
      tenantName: tenant?.name || 'Tenant',
      propertyId: tenant?.propertyId || 'prop-1',
      propertyName: tenant?.propertyName || 'Property',
      unitId: tenant?.unitId || 'sp-101',
      unitNumber: tenant?.unitNumber || '101',
      amountUSD: amount,
      amountZiG: amount * rbzExchangeRate,
      currency: 'USD',
      paymentMethod: payMethod,
      referenceNumber: payRef,
      paymentDate: new Date().toISOString().split('T')[0],
      recordedBy: activeRole,
      notes: `Quick Payment Entry recorded via ${payMethod}`,
    });

    toast.success(`Payment of $${amount.toFixed(2)} USD recorded via ${payMethod}!`);
    setModalType(null);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === ticketPropId);
    if (!ticketTitle.trim()) {
      toast.error('Please enter a ticket title.');
      return;
    }

    addMaintenanceTicket({
      title: ticketTitle.trim(),
      description: `Emergency maintenance reported via Quick Dock: ${ticketTitle}`,
      propertyId: ticketPropId,
      propertyName: prop?.name || 'Property',
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      reportedBy: `${activeRole} (Quick Dock)`,
    });

    toast.success(`Maintenance ticket "${ticketTitle}" dispatched!`);
    setTicketTitle('');
    setModalType(null);
  };

  const handleCreateGeneratorLog = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === genPropId);
    const litres = parseFloat(genLitres) || 0;
    const rate = parseFloat(genCostPerLitre) || 1.62;
    const totalCost = litres * rate;

    addGeneratorLog({
      propertyId: genPropId,
      propertyName: prop?.name || 'Property',
      date: new Date().toISOString().split('T')[0],
      eventType: 'Refuelling',
      litresAdded: litres,
      costPerLitreUSD: rate,
      totalCostUSD: totalCost,
      runHours: parseFloat(genHours) || 0,
      dieselCAMApportionedUSD: totalCost,
      notes: genNotes,
    });

    toast.success(`Emergency generator refuelling log recorded ($${totalCost.toFixed(2)} USD)!`);
    setModalType(null);
  };

  return (
    <>
      {/* Floating Bottom Quick Action Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-[92%] sm:w-auto">
        <div className="bg-[#101C40]/90 text-white border border-white/[0.07] backdrop-blur-[24px] rounded-[6px] shadow-2xl p-2 sm:px-4 sm:py-2.5 transition-all duration-300">
          {/* Minimized toggle header on mobile */}
          <div className="flex items-center justify-between sm:hidden px-2 py-1">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Action Dock
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Action Buttons */}
          {isExpanded && (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-0">
              {canInvoice && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setModalType('invoice')}
                  className="h-8 text-xs text-slate-100 hover:text-white hover:bg-[#101C40] border border-white/[0.07] rounded-[6px] flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-sky-400" />
                  <span>Quick Invoice</span>
                </Button>
              )}

              {canPayment && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setModalType('payment')}
                  className="h-8 text-xs text-slate-100 hover:text-white hover:bg-[#101C40] border border-white/[0.07] rounded-[6px] flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quick Payment</span>
                </Button>
              )}

              {canTicket && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setModalType('ticket')}
                  className="h-8 text-xs text-slate-100 hover:text-white hover:bg-[#101C40] border border-white/[0.07] rounded-[6px] flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Ticket</span>
                </Button>
              )}

              {canGenerator && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setModalType('generator')}
                  className="h-8 text-xs text-slate-100 hover:text-white hover:bg-slate-800 border border-slate-700/80 rounded-md flex items-center gap-1.5"
                >
                  <Fuel className="w-3.5 h-3.5 text-rose-400" />
                  <span>Generator Log</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Invoice Modal */}
      <Dialog open={modalType === 'invoice'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleCreateInvoice}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Quick Commercial Invoice Creation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate immediate dual-currency (USD & ZiG) commercial invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Property</Label>
                <Select value={invPropertyId} onValueChange={setInvPropertyId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Space Unit (Occupied)</Label>
                <Select value={invSpaceId} onValueChange={setInvSpaceId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces.filter(s => s.propertyId === invPropertyId && s.currentTenantName).map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        Unit {s.unitNumber} - {s.currentTenantName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Base Rent (USD)</Label>
                  <Input
                    type="number"
                    value={invAmountUSD}
                    onChange={(e) => setInvAmountUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CAM Fee (USD)</Label>
                  <Input
                    type="number"
                    value={invCamUSD}
                    onChange={(e) => setInvCamUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-muted/40 border border-border/60 text-xs flex justify-between items-center">
                <span className="text-muted-foreground">Total Invoiced:</span>
                <span className="font-semibold text-foreground">
                  ${(parseFloat(invAmountUSD || '0') + parseFloat(invCamUSD || '0')).toFixed(2)} USD
                  {' '}<span className="text-[11px] font-normal text-muted-foreground">
                    ({((parseFloat(invAmountUSD || '0') + parseFloat(invCamUSD || '0')) * rbzExchangeRate).toLocaleString()} ZiG)
                  </span>
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Generate Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Payment Modal */}
      <Dialog open={modalType === 'payment'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Quick Payment Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record immediate tenant payment via Zimbabwe local payment channels.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Select Tenant & Space</Label>
                <Select value={payTenantId} onValueChange={setPayTenantId}>
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Payment Method</Label>
                  <Select value={payMethod} onValueChange={(val) => setPayMethod(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EcoCash">EcoCash</SelectItem>
                      <SelectItem value="Nostro">Nostro FCA</SelectItem>
                      <SelectItem value="Cash (USD)">Cash (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Amount (USD)</Label>
                  <Input
                    type="number"
                    value={payAmountUSD}
                    onChange={(e) => setPayAmountUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

                <div className="space-y-1">
                  <Label className="text-xs">Payment Reference / Txn ID</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      placeholder="e.g. EC-9940182 or CBZ-88210"
                      className="h-8 text-xs font-mono"
                      required
                    />
                    {payMethod === 'EcoCash' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const mockRef = `EC-USSD-${Math.floor(100000 + Math.random() * 900000)}`;
                          setPayRef(mockRef);
                          toast.success(`EcoCash USSD Push (*151*2*1#) initiated! Txn ref: ${mockRef}`);
                        }}
                        className="h-8 px-2 text-[11px] font-mono whitespace-nowrap bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50"
                        title="Simulate EcoCash USSD Push to Tenant Phone"
                      >
                        *151*2*1# USSD
                      </Button>
                    )}
                  </div>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Ticket Modal */}
      <Dialog open={modalType === 'ticket'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleCreateTicket}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Dispatch New Maintenance Ticket
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Report an urgent property repair or facility service order.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Ticket Title *</Label>
                <Input
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. Escalator motor humming / Pipe leakage"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Target Commercial Property</Label>
                <Select value={ticketPropId} onValueChange={setTicketPropId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={ticketCategory} onValueChange={(val) => setTicketCategory(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="Elevator">Elevator / Escalator</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Priority Level</Label>
                  <Select value={ticketPriority} onValueChange={(val) => setTicketPriority(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Emergency Generator Log Modal */}
      <Dialog open={modalType === 'generator'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleCreateGeneratorLog}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rose-600" />
                Emergency Generator Fuel Log
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record diesel refuelling and run-hours for CAM levy apportionment.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Commercial Property</Label>
                <Select value={genPropId} onValueChange={setGenPropId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.generatorCapacityKVA} KVA)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Litres Added</Label>
                  <Input
                    type="number"
                    value={genLitres}
                    onChange={(e) => setGenLitres(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rate ($/Litre)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={genCostPerLitre}
                    onChange={(e) => setGenCostPerLitre(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Run Hours</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={genHours}
                    onChange={(e) => setGenHours(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Operational Notes</Label>
                <Input
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="e.g. CBD grid power interruption backup"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Save Log Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
