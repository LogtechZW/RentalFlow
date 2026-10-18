import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space } from '@/types/rentflow';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileSignature, Save } from 'lucide-react';
import { toast } from 'sonner';

interface LeaseTermsModalProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const LeaseTermsModal: React.FC<LeaseTermsModalProps> = ({
  space,
  isOpen,
  onClose,
  onUpdated
}) => {
  const {
    leases,
    updateLease,
    updateSpace,
    rbzExchangeRate
  } = useRentFlow();

  // Find linked active lease
  const linkedLease = space
    ? leases.find(
        l => (l.unitId === space.id || l.unitNumber === space.unitNumber) && l.status !== 'Terminated'
      )
    : undefined;

  const [baseRent, setBaseRent] = useState<string>((linkedLease?.baseRentUSD || space?.baseRentUSD || 1000).toString());
  const [camFee, setCamFee] = useState<string>((linkedLease?.camFeeUSD || space?.camFeeUSD || 200).toString());
  const [deposit, setDeposit] = useState<string>((linkedLease?.depositUSD || (space?.baseRentUSD ? space.baseRentUSD * 2 : 2000)).toString());
  const [escalationRate, setEscalationRate] = useState<string>((linkedLease?.annualEscalationRate || 8).toString());
  const [turnoverPercent] = useState<string>((linkedLease?.turnoverPercentage || 0).toString());
  const [startDate, setStartDate] = useState<string>(linkedLease?.startDate || '2026-01-01');
  const [endDate, setEndDate] = useState<string>(linkedLease?.endDate || '2028-12-31');
  const [termsText, setTermsText] = useState<string>(
    linkedLease?.terms || `Harare commercial lease agreement with CAM diesel generator levy apportionment, annual inflation escalation (${escalationRate}%), and RBZ dual currency provisions.`
  );

  if (!space) return null;

  const rentUSD = parseFloat(baseRent) || 0;
  const rentZiG = (rentUSD * rbzExchangeRate).toLocaleString();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const rentNum = parseFloat(baseRent) || space.baseRentUSD;
    const camNum = parseFloat(camFee) || space.camFeeUSD;
    const escNum = parseFloat(escalationRate) || 8;

    // Update lease if found
    if (linkedLease) {
      updateLease(linkedLease.id, {
        baseRentUSD: rentNum,
        camFeeUSD: camNum,
        depositUSD: parseFloat(deposit) || 0,
        annualEscalationRate: escNum,
        turnoverPercentage: parseFloat(turnoverPercent) || 0,
        startDate,
        endDate,
        terms: termsText
      });
    }

    // Also update space base rent & CAM
    updateSpace(space.id, {
      baseRentUSD: rentNum,
      targetRentUSD: rentNum,
      camFeeUSD: camNum
    });

    toast.success(`Lease terms & escalation rate updated for Unit ${space.unitNumber}!`);
    onClose();
    if (onUpdated) onUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary">
              Unit {space.unitNumber}
            </Badge>
            <span className="text-xs text-muted-foreground">{space.currentTenantName || 'Occupied Space'}</span>
          </div>
          <DialogTitle className="font-serif text-lg text-foreground flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            Review & Modify Commercial Lease Terms
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust active contractual escalation percentages, base rent, CAM apportionments, and RBZ dual-currency parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Dual Currency Indicator */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">RBZ Dual Currency Benchmark:</span>
            <span className="font-mono font-bold text-primary">
              1 USD = {rbzExchangeRate} ZiG • Current: ${rentUSD.toLocaleString()} USD (≈ {rentZiG} ZiG)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Base Monthly Rent (USD)</Label>
              <Input
                type="number"
                value={baseRent}
                onChange={(e) => setBaseRent(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Annual Escalation Rate (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={escalationRate}
                onChange={(e) => setEscalationRate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground">
                Compounded annually against Harare inflation index
              </span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Monthly CAM Levy (USD)</Label>
              <Input
                type="number"
                value={camFee}
                onChange={(e) => setCamFee(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Security Deposit Held (USD)</Label>
              <Input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Lease Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Lease Expiry Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Contractual Lease Clauses & Terms</Label>
            <Textarea
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              rows={3}
              className="text-xs font-sans leading-relaxed resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs bg-primary text-primary-foreground flex items-center gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Terms</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
