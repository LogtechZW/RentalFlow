import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space, Property } from '@/types/rentflow';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building, Layers, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface BulkAllocateModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onAllocated?: () => void;
}

interface SpaceAllocationDraft {
  spaceId: string;
  tenantId: string;
  baseRentUSD: number;
  camFeeUSD: number;
  depositUSD: number;
}

export const BulkAllocateModal: React.FC<BulkAllocateModalProps> = ({
  property,
  isOpen,
  onClose,
  onAllocated
}) => {
  const {
    spaces,
    tenants,
    allocateTenantToSpace,
    addLease,
    rbzExchangeRate
  } = useRentFlow();

  const vacantSpaces = spaces.filter(s => s.propertyId === property.id && s.status === 'Vacant');
  const availableTenants = tenants.filter(t => !t.unitId || t.unitId === 'sp-pending' || t.status === 'Pending Lease');

  const [drafts, setDrafts] = useState<Record<string, SpaceAllocationDraft>>(() => {
    const initial: Record<string, SpaceAllocationDraft> = {};
    vacantSpaces.forEach(sp => {
      initial[sp.id] = {
        spaceId: sp.id,
        tenantId: '',
        baseRentUSD: sp.baseRentUSD,
        camFeeUSD: sp.camFeeUSD,
        depositUSD: sp.baseRentUSD * 2
      };
    });
    return initial;
  });

  const handleTenantChange = (spaceId: string, tenantId: string) => {
    setDrafts(prev => ({
      ...prev,
      [spaceId]: {
        ...prev[spaceId],
        tenantId
      }
    }));
  };

  const handleRentChange = (spaceId: string, rent: number) => {
    setDrafts(prev => ({
      ...prev,
      [spaceId]: {
        ...prev[spaceId],
        baseRentUSD: rent,
        depositUSD: rent * 2
      }
    }));
  };

  // Count planned allocations
  const activeDrafts = Object.values(drafts).filter(d => Boolean(d.tenantId));
  const totalPlannedRentUSD = activeDrafts.reduce((sum, d) => sum + d.baseRentUSD, 0);
  const totalPlannedRentZiG = (totalPlannedRentUSD * rbzExchangeRate).toLocaleString();

  const handleCommitBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDrafts.length === 0) {
      toast.error('Select at least one tenant to allocate.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const threeYearsLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0];

    let allocatedCount = 0;
    activeDrafts.forEach(draft => {
      const sp = vacantSpaces.find(s => s.id === draft.spaceId);
      const ten = tenants.find(t => t.id === draft.tenantId);
      if (!sp || !ten) return;

      allocateTenantToSpace(sp.id, ten.id);

      addLease({
        leaseNumber: `LS-${property.code}-${new Date().getFullYear()}-${sp.unitNumber}`,
        tenantId: ten.id,
        tenantName: ten.name,
        propertyId: property.id,
        propertyName: property.name,
        unitId: sp.id,
        unitNumber: sp.unitNumber,
        startDate: today,
        endDate: threeYearsLater,
        baseRentUSD: draft.baseRentUSD,
        camFeeUSD: draft.camFeeUSD,
        depositUSD: draft.depositUSD,
        turnoverPercentage: 0,
        annualEscalationRate: 8,
        status: 'Active',
        terms: `Harare commercial tenancy lease at ${property.name} (${sp.unitPrefix || sp.type} ${sp.unitNumber}). Dual-currency RBZ baseline rate: 1 USD = ${rbzExchangeRate} ZiG.`
      });
      allocatedCount++;
    });

    toast.success(`Successfully allocated ${allocatedCount} vacant units in ${property.name}!`);
    onClose();
    if (onAllocated) onAllocated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary">
              {property.name}
            </Badge>
            <span className="text-xs text-muted-foreground">{vacantSpaces.length} Vacant Units Available</span>
          </div>
          <DialogTitle className="font-serif text-lg text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Bulk Vacant Unit Allocation Wizard
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Simultaneously allocate multiple commercial spaces across {property.name}, establish dual-currency lease agreements, and activate occupancy.
          </DialogDescription>
        </DialogHeader>

        {vacantSpaces.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold">100% Occupancy Achieved</h4>
            <p className="text-xs text-muted-foreground">
              There are currently no vacant commercial units in {property.name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCommitBulk} className="space-y-4 pt-2">
            {/* Financial Summary Strip */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Units Ready for Allocation:</span>
                <span className="font-bold text-foreground ml-1.5">{activeDrafts.length} of {vacantSpaces.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-muted-foreground">New Aggregate Monthly Rent:</span>
                  <span className="font-bold font-mono text-primary ml-1.5">${totalPlannedRentUSD.toLocaleString()} USD</span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  (≈ {totalPlannedRentZiG} ZiG)
                </div>
              </div>
            </div>

            {/* Space Rows Table */}
            <div className="overflow-x-auto border border-border/80 rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-semibold sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="p-2.5">Unit / Space</th>
                    <th className="p-2.5">Floor / Area</th>
                    <th className="p-2.5 min-w-[200px]">Assign Commercial Tenant</th>
                    <th className="p-2.5">Monthly Rent (USD)</th>
                    <th className="p-2.5">CAM Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {vacantSpaces.map(sp => {
                    const currentDraft = drafts[sp.id] || {
                      spaceId: sp.id,
                      tenantId: '',
                      baseRentUSD: sp.baseRentUSD,
                      camFeeUSD: sp.camFeeUSD,
                      depositUSD: sp.baseRentUSD * 2
                    };

                    return (
                      <tr key={sp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-bold font-serif whitespace-nowrap">
                          {sp.unitPrefix || sp.type} {sp.unitNumber}
                          <span className="block text-[10px] font-sans font-normal text-muted-foreground">
                            {sp.customName}
                          </span>
                        </td>
                        <td className="p-2.5 text-muted-foreground whitespace-nowrap">
                          {sp.floor}
                          <span className="block text-[10px]">{sp.sizeSqm} m²</span>
                        </td>
                        <td className="p-2.5">
                          <Select
                            value={currentDraft.tenantId}
                            onValueChange={(val) => handleTenantChange(sp.id, val)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="-- Select Tenant --" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                              <SelectItem value="none">-- Leave Vacant --</SelectItem>
                              {availableTenants.map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                  ⭐ {t.name} ({t.tradingName})
                                </SelectItem>
                              ))}
                              {tenants.map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                  {t.name} ({t.tradingName})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            value={currentDraft.baseRentUSD}
                            onChange={(e) => handleRentChange(sp.id, parseFloat(e.target.value) || 0)}
                            className="h-8 w-24 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2.5 font-mono text-muted-foreground">
                          ${currentDraft.camFeeUSD}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={activeDrafts.length === 0}
                className="h-8 text-xs bg-primary text-primary-foreground flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Commit Bulk Allocation ({activeDrafts.length})</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
