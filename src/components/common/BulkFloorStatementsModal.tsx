import React, { useState, useMemo } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Property } from '@/types/rentflow';
import { EXPANDED_OFFICE_FLOORS } from '@/pages/PropertiesPage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  FileSpreadsheet, 
  Printer, 
  MessageSquare, 
  Download, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkFloorStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

export const BulkFloorStatementsModal: React.FC<BulkFloorStatementsModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const { spaces, tenants, payments, rbzExchangeRate, sendWhatsAppNotice } = useRentFlow();
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor Retail & Concourse');
  const [isDispatchingWhatsApp, setIsDispatchingWhatsApp] = useState<boolean>(false);

  // Filter occupied spaces on selected floor in active property
  const floorSpaces = useMemo(() => {
    if (!property) return [];
    return spaces.filter(s => s.propertyId === property.id && s.floor === selectedFloor);
  }, [spaces, property, selectedFloor]);

  const occupiedFloorSpaces = useMemo(() => {
    return floorSpaces.filter(s => s.status === 'Occupied' && s.currentTenantId);
  }, [floorSpaces]);

  // Calculations for occupied spaces
  const floorTotals = useMemo(() => {
    let totalTargetRentUSD = 0;
    let totalPaidUSD = 0;
    let totalArrearsUSD = 0;

    occupiedFloorSpaces.forEach(space => {
      const target = space.targetRentUSD || space.baseRentUSD;
      const arrears = space.rentalAccumulationUSD || 0;
      
      // Calculate total payments settled for this space
      const spacePayments = payments.filter(p => p.unitId === space.id);
      const paid = spacePayments.reduce((acc, curr) => acc + (curr.amountUSD || 0), 0);

      totalTargetRentUSD += target;
      totalPaidUSD += paid;
      totalArrearsUSD += arrears;
    });

    return {
      targetRentUSD: totalTargetRentUSD,
      targetRentZiG: totalTargetRentUSD * rbzExchangeRate,
      paidUSD: totalPaidUSD,
      paidZiG: totalPaidUSD * rbzExchangeRate,
      arrearsUSD: totalArrearsUSD,
      arrearsZiG: totalArrearsUSD * rbzExchangeRate
    };
  }, [occupiedFloorSpaces, payments, rbzExchangeRate]);

  // Export CSV
  const handleExportCSV = () => {
    if (occupiedFloorSpaces.length === 0) {
      toast.error('No occupied commercial spaces on this floor to export.');
      return;
    }

    const headers = [
      'Unit Number',
      'Space Name',
      'Floor Level',
      'Tenant Entity',
      'Category',
      'Base Rent (USD)',
      'Base Rent (ZiG)',
      'Payments Settled (USD)',
      'Payments Settled (ZiG)',
      'Arrears / Balance (USD)',
      'Arrears / Balance (ZiG)',
      'Status'
    ];

    const rows = occupiedFloorSpaces.map(sp => {
      const spacePayments = payments.filter(p => p.unitId === sp.id);
      const paidUSD = spacePayments.reduce((acc, curr) => acc + curr.amountUSD, 0);
      const targetUSD = sp.targetRentUSD || sp.baseRentUSD;
      const arrearsUSD = sp.rentalAccumulationUSD || 0;

      return [
        `"${sp.unitPrefix || sp.type} ${sp.unitNumber}"`,
        `"${sp.customName || ''}"`,
        `"${sp.floor}"`,
        `"${sp.currentTenantName || 'Occupied'}"`,
        `"${sp.type}"`,
        targetUSD.toFixed(2),
        (targetUSD * rbzExchangeRate).toFixed(2),
        paidUSD.toFixed(2),
        (paidUSD * rbzExchangeRate).toFixed(2),
        arrearsUSD.toFixed(2),
        (arrearsUSD * rbzExchangeRate).toFixed(2),
        `"${arrearsUSD <= 0 ? 'Settled' : 'Arrears Outstanding'}"`
      ].join(',');
    });

    // Summary totals row
    const totalsRow = [
      '"TOTALS"',
      '""',
      `"${selectedFloor}"`,
      `"${occupiedFloorSpaces.length} Occupied Units"`,
      '""',
      floorTotals.targetRentUSD.toFixed(2),
      floorTotals.targetRentZiG.toFixed(2),
      floorTotals.paidUSD.toFixed(2),
      floorTotals.paidZiG.toFixed(2),
      floorTotals.arrearsUSD.toFixed(2),
      floorTotals.arrearsZiG.toFixed(2),
      '""'
    ].join(',');

    const csvContent = [headers.join(','), ...rows, totalsRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${property?.code || 'COMM'}_${selectedFloor.replace(/[^a-zA-Z0-9]/g, '_')}_Payment_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedFloor} Commercial Payment Statement (${occupiedFloorSpaces.length} units)!`);
  };

  // Print Floor Statement
  const handlePrint = () => {
    window.print();
  };

  // Batch WhatsApp Dispatch for All Occupants on Floor
  const handleBatchWhatsApp = () => {
    if (occupiedFloorSpaces.length === 0) {
      toast.error('No occupied commercial tenants on this floor to dispatch notices to.');
      return;
    }

    setIsDispatchingWhatsApp(true);
    let dispatched = 0;

    occupiedFloorSpaces.forEach(sp => {
      if (!sp.currentTenantId) return;
      const targetUSD = sp.targetRentUSD || sp.baseRentUSD;
      const arrearsUSD = sp.rentalAccumulationUSD || 0;
      const arrearsZiG = (arrearsUSD * rbzExchangeRate).toLocaleString();

      const message = `*COMMERCIAL STATEMENT - ${property?.name || 'Property'}*\n` +
        `Floor: ${selectedFloor}\n` +
        `Unit: ${sp.unitPrefix || sp.type} ${sp.unitNumber}\n` +
        `Tenant: ${sp.currentTenantName}\n\n` +
        `• Monthly Base Rent: $${targetUSD.toLocaleString()} USD (ZiG ${(targetUSD * rbzExchangeRate).toLocaleString()})\n` +
        `• Current Outstanding Balance: *$${arrearsUSD.toLocaleString()} USD* (ZiG ${arrearsZiG})\n` +
        `• Official RBZ Mid-Rate: 1 USD = ${rbzExchangeRate} ZiG\n` +
        `• Bank Nostro: Stanbic 91400034928\n` +
        `• EcoCash Merchant: 99420\n\n` +
        `Please confirm payment allocation to ensure zero CAM and power interruption. Thank you.`;

      sendWhatsAppNotice(sp.currentTenantId, message, 'Statement');
      dispatched++;
    });

    setIsDispatchingWhatsApp(false);
    toast.success(`Dispatched automated WhatsApp statements to all ${dispatched} occupied tenants on ${selectedFloor}!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
        {/* OFFICIAL CORPORATE LETTERHEAD (Clean, Visible on Print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-950 uppercase tracking-wider">
                RENTFLOW COMMERCIAL PROPERTY MANAGEMENT
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {property?.name} • Floor Statement of Payments & Arrears Schedule
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-600 space-y-0.5">
              <p>ZIMRA Tax Clearance: <strong>ITF263 COMPLIANT</strong></p>
              <p>Business Partner (BP): <strong>200034182</strong> | VAT: <strong>10048291</strong></p>
              <p>RBZ Official Rate: <strong>1 USD = {rbzExchangeRate} ZiG</strong></p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-800 border-t border-slate-200">
            <span>OFFICIAL COMMERCIAL FLOOR SCHEDULE: {selectedFloor.toUpperCase()}</span>
            <span>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <DialogHeader className="print:hidden">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary">
              {property?.code || 'COMM'}
            </Badge>
            <span className="text-xs text-muted-foreground">{property?.name} • Multi-Level Floor Auditing</span>
          </div>
          <DialogTitle className="font-serif text-lg text-foreground flex items-center justify-between">
            <span>Bulk Floor Payment Statements Generator</span>
            <Badge variant="secondary" className="font-mono text-xs">
              1 USD = {rbzExchangeRate} ZiG
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Audit, export, and dispatch dual-currency payment balances and CAM contributions across any commercial floor from Ground Floor to Level 25.
          </DialogDescription>
        </DialogHeader>

        {/* Floor Level Selector & Action Header */}
        <div className="p-3.5 bg-muted/40 rounded-lg border border-border/70 space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1 max-w-sm">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Select Commercial Floor Level
              </label>
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Choose floor..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {EXPANDED_OFFICE_FLOORS.map(flr => (
                    <SelectItem key={flr} value={flr} className="text-xs">
                      {flr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted"
                disabled={occupiedFloorSpaces.length === 0}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Floor CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted"
                disabled={occupiedFloorSpaces.length === 0}
              >
                <Printer className="w-3.5 h-3.5 text-sky-600" />
                <span>Print Statement (A4)</span>
              </Button>

              <Button
                size="sm"
                onClick={handleBatchWhatsApp}
                disabled={occupiedFloorSpaces.length === 0 || isDispatchingWhatsApp}
                className="h-8 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Batch WhatsApp ({occupiedFloorSpaces.length})</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip for Selected Floor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
            <div className="p-2.5 rounded bg-background border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Occupied / Total Units
              </span>
              <span className="text-base font-serif font-bold text-foreground font-mono">
                {occupiedFloorSpaces.length} / {floorSpaces.length}
              </span>
            </div>

            <div className="p-2.5 rounded bg-background border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Floor Target Rent
              </span>
              <span className="text-base font-serif font-bold text-foreground font-mono">
                ${floorTotals.targetRentUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                ≈ {floorTotals.targetRentZiG.toLocaleString()} ZiG
              </span>
            </div>

            <div className="p-2.5 rounded bg-background border border-border/60">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider block">
                Settled Collections
              </span>
              <span className="text-base font-serif font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ${floorTotals.paidUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                ≈ {floorTotals.paidZiG.toLocaleString()} ZiG
              </span>
            </div>

            <div className="p-2.5 rounded bg-background border border-border/60">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold tracking-wider block">
                Outstanding Arrears
              </span>
              <span className="text-base font-serif font-bold text-rose-600 dark:text-rose-400 font-mono">
                ${floorTotals.arrearsUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                ≈ {floorTotals.arrearsZiG.toLocaleString()} ZiG
              </span>
            </div>
          </div>
        </div>

        {/* Units Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-serif font-bold text-foreground">
            Floor Tenancies & Payment Audit Ledger ({occupiedFloorSpaces.length} Occupied Units)
          </h4>

          {occupiedFloorSpaces.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-border/80 bg-muted/20">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No occupied commercial spaces on {selectedFloor}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                All units on this floor are currently vacant or not yet recorded. Select a different floor level above to generate payment statements.
              </p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-full overflow-x-auto bg-card rounded-lg border border-border/80 [&>div]:max-w-full">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Unit / Space</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Tenant Entity</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Target Rent (USD)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Target Rent (ZiG)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Settled Paid (USD)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Net Balance (USD)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                  {occupiedFloorSpaces.map(sp => {
                    const spacePayments = payments.filter(p => p.unitId === sp.id);
                    const paidUSD = spacePayments.reduce((acc, curr) => acc + curr.amountUSD, 0);
                    const targetUSD = sp.targetRentUSD || sp.baseRentUSD;
                    const arrearsUSD = sp.rentalAccumulationUSD || 0;

                    return (
                      <tr key={sp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-medium text-foreground">
                          {sp.unitPrefix || sp.type} {sp.unitNumber}
                          {sp.customName && (
                            <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                              {sp.customName}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-foreground block">
                            {sp.currentTenantName || 'Commercial Tenant'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {sp.type} • {sp.sizeSqm} sqm
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-medium">
                          ${targetUSD.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono text-muted-foreground">
                          {(targetUSD * rbzExchangeRate).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          ${paidUSD.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold">
                          {arrearsUSD > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              ${arrearsUSD.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              $0.00
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {arrearsUSD > 0 ? (
                            <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20">
                              Arrears
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">
                              Settled
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/40 font-mono font-bold border-t-2 border-border text-foreground">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 whitespace-nowrap">
                      FLOOR TOTALS ({occupiedFloorSpaces.length} Units)
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      ${floorTotals.targetRentUSD.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right text-muted-foreground">
                      {floorTotals.targetRentZiG.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right text-emerald-600 dark:text-emerald-400">
                      ${floorTotals.paidUSD.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right text-rose-600 dark:text-rose-400">
                      ${floorTotals.arrearsUSD.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* OFFICIAL AUTHORIZED SIGNATURE & CERTIFICATION BLOCK (PRINT ONLY) */}
            <div className="hidden print:block pt-8 mt-6 border-t-2 border-slate-300">
              <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
                <div className="space-y-4">
                  <p className="font-semibold uppercase text-[10px] text-slate-500">AUTHORIZED ESTATE MANAGER / BURSAR</p>
                  <div className="border-b border-slate-400 h-10 w-4/5" />
                  <p>Signature: __________________________</p>
                  <p>Date: _____ / _____ / 2026</p>
                  <p className="text-[10px] text-slate-500 font-mono">RentFlow Floor Audit Officer</p>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold uppercase text-[10px] text-slate-500">PROPERTY SUPERVISOR & COMPLIANCE</p>
                  <div className="border-b border-slate-400 h-10 w-4/5" />
                  <p>Signature: __________________________</p>
                  <p>Date: _____ / _____ / 2026</p>
                  <p className="text-[10px] text-slate-500 font-mono">ZIMRA & RBZ Certified Assessor</p>
                </div>
              </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  This floor schedule serves as an official accounting statement under Zimbabwe RBZ dual-currency financial framework and the Commercial Premises Act.
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
          <div className="text-[11px] text-muted-foreground font-mono">
            PAAB & RBZ Statutory Dual-Currency Compliance Standard
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
