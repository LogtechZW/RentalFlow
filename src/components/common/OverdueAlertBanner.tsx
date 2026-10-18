import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { AlertCircle, MessageSquare, Send, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export const OverdueAlertBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { spaces, tenants, properties, rbzExchangeRate, sendWhatsAppNotice } = useRentFlow();
  const [isDispatcherOpen, setIsDispatcherOpen] = useState<boolean>(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [messageTone, setMessageTone] = useState<'Formal' | 'Urgent' | 'Polite' | 'Final Notice'>('Urgent');

  // Find overdue spaces and tenants
  const overdueSpaces = spaces.filter(s => s.rentalAccumulationUSD > 0 || s.status === 'Overdue');
  const overdueTenants = tenants.filter(t => t.balanceUSD > 0 || t.status === 'Overdue');
  const totalArrearsUSD = overdueSpaces.reduce((sum, s) => sum + s.rentalAccumulationUSD, 0);

  if (overdueSpaces.length === 0 && overdueTenants.length === 0) {
    return null;
  }

  const handleDispatchWhatsApp = (tenantId: string, phone: string, name: string, balanceUSD: number) => {
    const balanceZiG = balanceUSD * rbzExchangeRate;
    let text = '';

    if (messageTone === 'Urgent') {
      text = `🚨 URGENT NOTICE: Dear ${name}, your commercial lease account has an overdue rental accumulation of $${balanceUSD.toFixed(2)} USD (ZiG ${balanceZiG.toFixed(2)} at official RBZ rate ${rbzExchangeRate}). Please remit payment immediately via EcoCash (Merchant 9041280) or bank transfer to avoid lease cancellation. RentFlow Management.`;
    } else if (messageTone === 'Final Notice') {
      text = `⚠️ FINAL DEMAND: Dear ${name}, outstanding rent of $${balanceUSD.toFixed(2)} USD remains unpaid. You are given 48 hours to furnish proof of payment. Failure will result in commercial space lock-out and legal handover under Zimbabwe Commercial Leases Act.`;
    } else if (messageTone === 'Polite') {
      text = `Dear ${name}, this is a gentle reminder that your monthly commercial rent of $${balanceUSD.toFixed(2)} USD (ZiG ${balanceZiG.toFixed(2)}) is overdue. Kindly settle via EcoCash or bank transfer at your earliest convenience. RentFlow Management.`;
    } else {
      text = `FORMAL DEMAND FOR ARREARS: Attention ${name}. In accordance with your Commercial Lease Covenant, the sum of $${balanceUSD.toFixed(2)} USD / ZiG ${balanceZiG.toFixed(2)} is overdue. Contact RentFlow accounts department.`;
    }

    sendWhatsAppNotice(tenantId, text, 'Accumulation Alert');

    const cleanPhone = (phone || '+263772000000').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    toast.success(`WhatsApp reminder opened for ${name}!`);
  };

  const handleBatchDispatchAll = () => {
    overdueTenants.forEach(t => {
      handleDispatchWhatsApp(t.id, t.phone, t.name, t.balanceUSD);
    });
    toast.success(`Batch dispatched ${overdueTenants.length} WhatsApp overdue demands!`);
    setIsDispatcherOpen(false);
  };

  return (
    <>
      <div className="w-full bg-rose-500/10 border-2 border-rose-500/40 rounded-lg p-3.5 sm:p-4 text-foreground shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-md bg-rose-500 text-white shrink-0 mt-0.5 sm:mt-0 shadow-xs animate-pulse">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-rose-800">
                  CRITICAL: {overdueSpaces.length} Commercial Spaces in Arrears
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-mono px-1.5 py-0">
                  Overdue Alert
                </Badge>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Total outstanding balance: <strong className="font-mono text-rose-900">${totalArrearsUSD.toLocaleString()} USD</strong> (ZiG {(totalArrearsUSD * rbzExchangeRate).toLocaleString()} @ RBZ {rbzExchangeRate}). Automated WhatsApp demand notices ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDispatcherOpen(true)}
              className="h-8 text-xs font-semibold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dispatch WhatsApp Reminders</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Batch Dispatcher Modal */}
      <Dialog open={isDispatcherOpen} onOpenChange={setIsDispatcherOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif flex items-center gap-2 text-rose-700">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Automated WhatsApp Overdue Rent Dispatcher
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select messaging tone and send dual-currency (USD & ZiG) rent demands directly to Zimbabwe WhatsApp numbers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Tone Selector */}
            <div className="p-3 bg-muted/60 rounded-md border border-border">
              <span className="text-xs font-semibold block text-foreground mb-1.5">
                Notice Tone & Compliance Template:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {(['Urgent', 'Final Notice', 'Formal', 'Polite'] as const).map(tone => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setMessageTone(tone)}
                    className={`py-1.5 px-2 rounded border text-center transition-all ${
                      messageTone === tone
                        ? 'bg-rose-600 text-white border-rose-700 font-bold'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Overdue Tenants List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground">
                Tenants with Overdue Accumulations ({overdueTenants.length}):
              </span>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {overdueTenants.map(tenant => {
                  const sp = spaces.find(s => s.id === tenant.unitId || s.unitNumber === tenant.unitNumber);
                  const bal = tenant.balanceUSD || sp?.rentalAccumulationUSD || 0;
                  return (
                    <div
                      key={tenant.id}
                      className="p-2.5 rounded-md border border-border bg-card flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground">{tenant.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {tenant.propertyName} • Unit {tenant.unitNumber} • {tenant.phone}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-bold font-mono text-rose-700 block">
                            ${bal.toLocaleString()} USD
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            ZiG {(bal * rbzExchangeRate).toLocaleString()}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDispatchWhatsApp(tenant.id, tenant.phone, tenant.name, bal)}
                          className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDispatcherOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleBatchDispatchAll}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Dispatch All Overdue WhatsApp Demands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
