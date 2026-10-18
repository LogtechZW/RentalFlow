import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { OverdueAlertBanner } from '@/components/common/OverdueAlertBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  MessageSquare,
  Send,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Clock,
  Landmark,
  Phone,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

type MessageTone = 'Urgent' | 'Final Notice' | 'Formal' | 'Polite' | 'Accumulation Progress';

export const WhatsAppDispatcherPage: React.FC = () => {
  const {
    tenants,
    spaces,
    properties,
    rbzExchangeRate,
    sendWhatsAppNotice,
    activeRole
  } = useRentFlow();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [messageTone, setMessageTone] = useState<MessageTone>('Urgent');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'active'>('overdue');

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];
  const linkedSpace = spaces.find(s => s.id === selectedTenant?.unitId || s.unitNumber === selectedTenant?.unitNumber);
  const linkedProperty = properties.find(p => p.id === selectedTenant?.propertyId);

  // Arrears & Accumulation calculations
  const arrearsUSD = selectedTenant?.balanceUSD || linkedSpace?.rentalAccumulationUSD || 0;
  const arrearsZiG = arrearsUSD * rbzExchangeRate;
  const baseRentUSD = selectedTenant?.monthlyRentUSD || linkedSpace?.baseRentUSD || 0;
  const targetRentUSD = linkedSpace?.targetRentUSD || baseRentUSD;
  const paidThisMonthUSD = linkedSpace?.paidThisMonthUSD || 0;
  const progressPercent = targetRentUSD > 0 ? Math.min(100, Math.round((paidThisMonthUSD / targetRentUSD) * 100)) : 0;

  // Zimbabwe Settlement Details
  const ecocashMerchant = '9041280 (RentFlow Commercial Properties)';
  const stanbicAccount = 'Stanbic Bank Belgravia Branch, Account #91400038812 (USD / ZiG FCA)';

  // Build message generator
  const generateMessage = (tone: MessageTone) => {
    if (!selectedTenant) return '';
    const name = selectedTenant.tradingName || selectedTenant.name;
    const unit = `${linkedSpace?.unitPrefix || 'Unit'} ${selectedTenant.unitNumber}`;
    const prop = linkedProperty?.name || 'Commercial Center';

    switch (tone) {
      case 'Urgent':
        return `🚨 *URGENT RENT ARREARS NOTICE*\n\nDear ${name},\n\nThis is an urgent notice from RentFlow Property Management regarding your commercial tenancy at *${prop} (${unit})*.\n\n• Overdue Arrears: *$${arrearsUSD.toFixed(2)} USD*\n• Equivalent ZiG: *ZiG ${arrearsZiG.toFixed(2)}* (Official RBZ Mid-Rate: ${rbzExchangeRate})\n• Accumulation Status: ${progressPercent}% of target settled\n\n*Official Settlement Channels:*\n1. EcoCash USD / ZiG: Merchant Code *${ecocashMerchant}*\n2. Bank Transfer: *${stanbicAccount}*\n\nPlease remit payment today and forward your Proof of Payment (POP) to this number to avoid commercial space lock-out.`;

      case 'Final Notice':
        return `⚠️ *FINAL STATUTORY DEMAND FOR RENT (ZIMBABWE COMMERCIAL LEASES ACT)*\n\nAttention: *${name}* (${unit}, ${prop})\n\nDespite previous reminders, the outstanding sum of *$${arrearsUSD.toFixed(2)} USD* (ZiG ${arrearsZiG.toFixed(2)}) remains unpaid. In accordance with your Commercial Lease Agreement, you are hereby given *48 hours* to clear this accumulation.\n\nFailure to settle will result in immediate lease cancellation, repossession of the premises, and handover to legal counsel for recovery.\n\nRemit to: Stanbic Bank FCA or EcoCash Merchant 9041280.\n\nEstate Management Division.`;

      case 'Formal':
        return `*FORMAL STATEMENT OF ACCOUNT*\n\nTo: *${name}*\nPremises: ${unit}, ${prop}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\nDear Tenant,\n\nPlease find your current commercial lease account status:\n• Base Monthly Rent: $${baseRentUSD.toLocaleString()} USD\n• Current Outstanding Balance: *$${arrearsUSD.toLocaleString()} USD* (ZiG ${arrearsZiG.toLocaleString()})\n• RBZ Interbank Rate: 1 USD = ${rbzExchangeRate} ZiG\n\nKindly allocate payment to RentFlow Commercial Properties (Pvt) Ltd via Stanbic Nostro or EcoCash Merchant 9041280. Your prompt cooperation is appreciated.`;

      case 'Polite':
        return `Dear ${name} team,\n\nGreetings from RentFlow Property Management at ${prop}! 😊\n\nThis is a friendly reminder that your commercial rent balance for ${unit} shows an unpaid accumulation of *$${arrearsUSD.toFixed(2)} USD* (ZiG ${arrearsZiG.toFixed(2)}).\n\nIf you have already processed payment, kindly reply with your EcoCash reference or bank POP so our accounts team can allocate your digital receipt. Thank you for your continued business!`;

      case 'Accumulation Progress':
        return `📊 *RENT ACCUMULATION & PROGRESS SUMMARY*\n\nTenant: *${name}*\nSpace: ${unit} (${prop})\nFrequency: ${linkedSpace?.frequency || 'Monthly'}\n\n• Target Rent: $${targetRentUSD.toLocaleString()} USD\n• Amount Settled: $${paidThisMonthUSD.toLocaleString()} USD (${progressPercent}%)\n• Remaining Shortfall: *$${arrearsUSD.toLocaleString()} USD* (ZiG ${arrearsZiG.toLocaleString()})\n\nOfficial RBZ Rate: ${rbzExchangeRate} ZiG per USD. Pay via EcoCash Merchant 9041280 or Stanbic FCA.`;
    }
  };

  const currentMessage = generateMessage(messageTone);

  const cleanPhone = (selectedTenant?.phone || '+263772000000').replace(/\D/g, '');
  const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;

  const handleSendSingle = () => {
    if (!selectedTenant) return;
    sendWhatsAppNotice(selectedTenant.id, currentMessage, 'Accumulation Alert');
    window.open(directWhatsAppUrl, '_blank');
    toast.success(`WhatsApp reminder opened for ${selectedTenant.name}!`);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    toast.success('WhatsApp reminder text copied to clipboard!');
  };

  const handleBatchDispatch = () => {
    const overdueList = tenants.filter(t => t.balanceUSD > 0 || t.status === 'Overdue');
    overdueList.forEach(t => {
      const sp = spaces.find(s => s.id === t.unitId || s.unitNumber === t.unitNumber);
      const bal = t.balanceUSD || sp?.rentalAccumulationUSD || 0;
      const text = `🚨 URGENT NOTICE: Dear ${t.tradingName || t.name}, your commercial lease account has an overdue accumulation of $${bal.toFixed(2)} USD (ZiG ${(bal * rbzExchangeRate).toFixed(2)} @ RBZ ${rbzExchangeRate}). Please remit immediately via EcoCash (Merchant 9041280) or Stanbic Bank transfer. RentFlow Management.`;
      sendWhatsAppNotice(t.id, text, 'Accumulation Alert');
    });

    toast.success(`Batch dispatched ${overdueList.length} WhatsApp overdue demands!`);
  };

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    if (statusFilter === 'overdue' && t.balanceUSD <= 0 && t.status !== 'Overdue') return false;
    if (statusFilter === 'active' && t.status === 'Overdue') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchTrading = t.tradingName.toLowerCase().includes(q);
      const matchUnit = t.unitNumber.toLowerCase().includes(q);
      if (!matchName && !matchTrading && !matchUnit) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'WhatsApp Reminders' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Overdue Payment Reminders Banner */}
        <OverdueAlertBanner />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                <span>WhatsApp Rent Accumulation Reminders</span>
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/40 text-emerald-700 bg-emerald-50">
                Official RBZ: {rbzExchangeRate} ZiG
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dual-currency reminder generator, accumulation tracking, Zimbabwe settlement details, and batch wa.me dispatcher.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBatchDispatch}
              className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Batch Dispatch Overdue Tenants</span>
            </Button>
          </div>
        </div>

        {/* Main 2-Column Generator & CRM Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tenant Selector & Accumulation Meters (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-serif font-bold">
                    Select Commercial Space / Tenant
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {filteredTenants.length} Units
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Pick a retail tenant to generate customized dual-currency settlement reminders.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {/* Search & Status Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search unit or trading brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      <SelectItem value="overdue">Overdue Only</SelectItem>
                      <SelectItem value="active">In Good Standing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tenant List */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-border/60 rounded-md p-1.5 bg-muted/20">
                  {filteredTenants.map((t) => {
                    const isSelected = t.id === selectedTenant?.id;
                    const sp = spaces.find(s => s.id === t.unitId || s.unitNumber === t.unitNumber);
                    const bal = t.balanceUSD || sp?.rentalAccumulationUSD || 0;
                    const isOver = bal > 0 || t.status === 'Overdue';

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTenantId(t.id)}
                        className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : isOver
                            ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                            : 'bg-card border-border hover:bg-muted/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">{t.tradingName}</span>
                          <span className={`font-mono font-bold text-xs ${isOver ? 'text-rose-700' : 'text-emerald-700'}`}>
                            ${bal.toLocaleString()} USD
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                          <span>Unit {t.unitNumber} • {t.propertyName}</span>
                          <span className="font-mono">ZiG {(bal * rbzExchangeRate).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Accumulation & Shortfall Gauges for Selected Space */}
                {selectedTenant && (
                  <div className="p-3 bg-muted/60 border border-border rounded-lg space-y-2.5 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {selectedTenant.tradingName} ({linkedProperty?.name})
                      </span>
                      <Badge variant={arrearsUSD > 0 ? 'destructive' : 'outline'} className="text-[10px]">
                        {arrearsUSD > 0 ? 'Arrears Pending' : 'Current'}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Accumulation Progress vs Target:</span>
                        <span className="font-semibold text-foreground font-mono">
                          ${paidThisMonthUSD.toLocaleString()} / ${targetRentUSD.toLocaleString()} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden border border-border/60">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressPercent >= 100 ? 'bg-emerald-500' : progressPercent > 0 ? 'bg-sky-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="p-2 rounded bg-card border border-border">
                        <span className="text-[10px] text-muted-foreground block">Shortfall (USD)</span>
                        <span className="font-bold font-mono text-sm text-rose-700">
                          ${arrearsUSD.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-card border border-border">
                        <span className="text-[10px] text-muted-foreground block">Shortfall (ZiG)</span>
                        <span className="font-bold font-mono text-sm text-foreground">
                          ZiG {arrearsZiG.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: WhatsApp Generator, Tones & wa.me Dispatch (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Notice Template Generator</span>
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{selectedTenant?.phone}</span>
                  </div>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Select compliant messaging tone and send with pre-filled RBZ rates and Zimbabwe settlement channels.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Tone Selector Buttons */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Messaging Tone & Legal Posture:</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['Urgent', 'Final Notice', 'Formal', 'Polite', 'Accumulation Progress'] as MessageTone[]).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setMessageTone(tone)}
                        className={`p-2 rounded border text-left transition-all ${
                          messageTone === tone
                            ? 'bg-emerald-700 text-white border-emerald-800 font-semibold shadow-xs'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <div className="text-xs font-medium">{tone}</div>
                        <div className="text-[10px] opacity-80">
                          {tone === 'Urgent' ? 'Overdue alert' :
                           tone === 'Final Notice' ? '48hr lockout' :
                           tone === 'Formal' ? 'Statement' :
                           tone === 'Polite' ? 'Friendly' : 'Progress check'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Chat Preview Bubble */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Live Message Preview (WhatsApp Markdown):</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {currentMessage.length} chars
                    </Badge>
                  </Label>

                  <div className="p-4 rounded-lg bg-[#EFEAE2] dark:bg-slate-900 border border-emerald-300/40 text-foreground font-sans text-xs space-y-2 whitespace-pre-wrap leading-relaxed shadow-inner">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-xs border border-border/60">
                      {currentMessage}
                    </div>
                  </div>
                </div>

                {/* Zimbabwe Settlement Metadata Box */}
                <div className="p-3 bg-muted/60 rounded-md border border-border space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                    <Landmark className="w-3.5 h-3.5 text-primary" />
                    <span>Configured Zimbabwe Settlement Accounts:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground block">EcoCash Merchant (USD & ZiG):</span>
                      <span>Code: 9041280 • Name: RentFlow Commercial</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">Stanbic FCA / RTGS Transfer:</span>
                      <span>Belgravia Branch • A/C #91400038812</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMessage}
                    className="h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp Web</span>
                    </a>

                    <Button
                      size="sm"
                      onClick={handleSendSingle}
                      className="h-9 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send & Log Dispatch</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
