import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface BatchInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchInvoiceModal: React.FC<BatchInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    properties,
    invoices,
    corporateLogo,
    rbzExchangeRate
  } = useRentFlow();

  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const matchingInvoices = invoices.filter((inv) => {
    if (propertyFilter !== 'all' && inv.propertyId !== propertyFilter) return false;
    if (startDate && inv.issueDate < startDate) return false;
    if (endDate && inv.issueDate > endDate) return false;
    return true;
  });

  const handlePrintBatch = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      toast.success(`Batch export generated for ${matchingInvoices.length} invoices!`);
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <DialogTitle className="text-base font-serif">Batch Invoice PDF Generator</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Export consolidated dual-currency (USD & ZiG) invoices for commercial spaces.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/30 border border-border/70 rounded-md">
          <div className="space-y-1">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Property Filter</Label>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="flex items-center justify-between text-xs p-2 bg-card border border-border/60 rounded">
          <span className="text-muted-foreground">
            Matching Invoices: <strong className="text-foreground">{matchingInvoices.length}</strong>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Stamping Rate: 1 USD = {rbzExchangeRate} ZiG
          </span>
        </div>

        {/* Printable Preview Container */}
        <div className="space-y-4 max-h-72 overflow-y-auto border border-border rounded-md p-3 bg-white text-slate-900 print:max-h-none print:border-none">
          {matchingInvoices.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No commercial invoices found within this date range and property filter.
            </div>
          ) : (
            matchingInvoices.map((inv) => (
              <div key={inv.id} className="p-4 border-b border-slate-200 last:border-b-0 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <img src={corporateLogo} alt="Logo" className="h-8 object-contain mb-1" />
                    <div className="text-sm font-bold font-serif">{inv.propertyName}</div>
                    <div className="text-[11px] text-slate-600">Unit {inv.unitNumber} • {inv.tenantName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-800">{inv.invoiceNumber}</div>
                    <div className="text-[10px] text-slate-500">Issue Date: {inv.issueDate}</div>
                    <div className="text-[10px] text-slate-500">Due Date: {inv.dueDate}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded text-[11px]">
                  <div className="grid grid-cols-3 bg-slate-100 p-1.5 font-semibold">
                    <span>Description</span>
                    <span className="text-right">USD ($)</span>
                    <span className="text-right">ZiG (ZWG)</span>
                  </div>
                  {inv.items.map(item => (
                    <div key={item.id} className="grid grid-cols-3 p-1.5 border-t border-slate-100">
                      <span>{item.description}</span>
                      <span className="text-right font-mono">${item.amountUSD.toFixed(2)}</span>
                      <span className="text-right font-mono font-semibold">ZiG {item.amountZiG.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 p-2 bg-slate-50 border-t border-slate-200 font-bold">
                    <span>Total Amount</span>
                    <span className="text-right font-mono">${inv.totalUSD.toFixed(2)} USD</span>
                    <span className="text-right font-mono text-emerald-800">ZiG {inv.totalZiG.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handlePrintBatch}
              disabled={matchingInvoices.length === 0 || isExporting}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
