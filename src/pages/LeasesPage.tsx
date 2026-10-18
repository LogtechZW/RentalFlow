import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Lease } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SignaturePad } from '@/components/common/SignaturePad';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { FileSignature, Plus, Calendar, Percent, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const LeasesPage: React.FC = () => {
  const {
    leases,
    properties,
    spaces,
    tenants,
    addLease,
    deleteLease,
    bulkDeleteLeases,
    signLease,
    activeRole
  } = useRentFlow();

  const [isNewLeaseModalOpen, setIsNewLeaseModalOpen] = useState<boolean>(false);
  const [signingLease, setSigningLease] = useState<Lease | null>(null);
  const [digitalSignatureData, setDigitalSignatureData] = useState<string>('');

  // Form states - Create Lease
  const [tenantId, setTenantId] = useState<string>(tenants[0]?.id || 'ten-1');
  const [propId, setPropId] = useState<string>(properties[0]?.id || 'prop-1');
  const [unitNum, setUnitNum] = useState<string>('101');
  const [startDate, setStartDate] = useState<string>('2026-11-01');
  const [endDate, setEndDate] = useState<string>('2029-10-31');
  const [baseRent, setBaseRent] = useState<string>('2000');
  const [camFee, setCamFee] = useState<string>('350');
  const [deposit, setDeposit] = useState<string>('4000');
  const [turnoverPercent, setTurnoverPercent] = useState<string>('5.0');
  const [escalationRate, setEscalationRate] = useState<string>('8.0');

  const canManage = ['Property Manager', 'Administrator'].includes(activeRole);

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === tenantId);
    const prop = properties.find(p => p.id === propId);

    const newLeaseNumber = `LS-${prop?.code || 'HRE'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    addLease({
      leaseNumber: newLeaseNumber,
      tenantId,
      tenantName: tenant?.name || 'Commercial Tenant',
      propertyId: propId,
      propertyName: prop?.name || 'Property',
      unitId: `sp-${unitNum}`,
      unitNumber: unitNum,
      startDate,
      endDate,
      baseRentUSD: parseFloat(baseRent) || 1000,
      camFeeUSD: parseFloat(camFee) || 200,
      depositUSD: parseFloat(deposit) || 2000,
      turnoverPercentage: parseFloat(turnoverPercent) || 0,
      annualEscalationRate: parseFloat(escalationRate) || 8,
      status: 'Pending Signature',
      terms: 'Harare commercial lease agreement with CAM diesel generator levy apportionment, annual inflation escalation, and RBZ dual currency provisions.'
    });

    toast.success(`Lease ${newLeaseNumber} generated and ready for digital signature!`);
    setIsNewLeaseModalOpen(false);
  };

  const handleConfirmSignature = () => {
    if (!signingLease || !digitalSignatureData) {
      toast.error('Please sign on the canvas pad before confirming.');
      return;
    }

    signLease(signingLease.id, digitalSignatureData);
    toast.success(`Lease agreement ${signingLease.leaseNumber} legally signed and activated!`);
    setSigningLease(null);
    setDigitalSignatureData('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Leases' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Commercial Lease Agreements
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {leases.length} Agreements
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Annual escalation reviews, turnover rent covenants, and interactive digital signature pad execution.
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsNewLeaseModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                <span>Draft New Lease</span>
              </Button>

              {leases.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base font-serif">Delete All Commercial Leases?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground">
                        This will remove all lease agreements and signature stamps.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { bulkDeleteLeases(); toast.success('All leases wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Confirm Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {/* Leases Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leases.map((lease) => {
            const isSigned = !!lease.digitalSignature;
            const isExpiringSoon = lease.status === 'Expiring Soon';

            return (
              <Card key={lease.id} className="border border-border/80 shadow-sm flex flex-col justify-between">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {lease.leaseNumber}
                      </span>
                      <h3 className="text-sm font-bold font-serif text-foreground truncate">
                        {lease.tenantName}
                      </h3>
                      <div className="text-[11px] text-muted-foreground">
                        {lease.propertyName} • Unit {lease.unitNumber}
                      </div>
                    </div>

                    <Badge
                      variant={isExpiringSoon ? 'destructive' : isSigned ? 'default' : 'secondary'}
                      className="text-[10px] h-5 px-1.5 shrink-0"
                    >
                      {lease.status}
                    </Badge>
                  </div>

                  {/* Financial & Escalation Terms */}
                  <div className="p-2.5 rounded bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Base Monthly Rent:</span>
                      <span className="font-semibold text-foreground">${lease.baseRentUSD.toLocaleString()} USD</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">CAM Service Charge:</span>
                      <span className="font-semibold text-foreground">${lease.camFeeUSD.toLocaleString()} USD</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Annual Escalation:</span>
                      <span className="font-semibold text-primary">{lease.annualEscalationRate}% p.a.</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Turnover Rent Covenants:</span>
                      <span className="font-medium text-foreground">{lease.turnoverPercentage}% over threshold</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">Term:</span>
                      <span className="font-mono text-foreground">{lease.startDate} &rarr; {lease.endDate}</span>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                    {isSigned ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-semibold text-foreground">Digitally Executed</div>
                          <div className="text-[10px] text-muted-foreground">Signed on {lease.signedDate}</div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSigningLease(lease)}
                        className="w-full h-8 text-xs flex items-center justify-center gap-1.5"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>Sign with Digital Pad</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Digital Signature Pad Modal */}
      {signingLease && (
        <Dialog open={!!signingLease} onOpenChange={() => setSigningLease(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-primary" />
                Sign Commercial Lease Agreement
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {signingLease.leaseNumber} • {signingLease.tenantName} (Unit {signingLease.unitNumber})
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3">
              <div className="p-3 bg-muted/40 rounded border border-border/60 text-xs space-y-1">
                <p className="font-semibold text-foreground">Commercial Agreement Highlights:</p>
                <p className="text-muted-foreground text-[11px]">{signingLease.terms}</p>
                <div className="pt-1 text-[11px] flex justify-between font-mono">
                  <span>Base Rent: ${signingLease.baseRentUSD} USD</span>
                  <span>Escalation: {signingLease.annualEscalationRate}%</span>
                </div>
              </div>

              {/* Interactive HTML5 Canvas Digital Signature Pad */}
              <SignaturePad
                onSave={(sigUrl) => setDigitalSignatureData(sigUrl)}
                label="Authorized Signatory Execution"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSigningLease(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSignature}
                disabled={!digitalSignatureData}
                className="h-8 text-xs"
              >
                Legally Execute Agreement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Draft New Lease Modal */}
      <Dialog open={isNewLeaseModalOpen} onOpenChange={setIsNewLeaseModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleCreateLease}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Draft Commercial Lease</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set base rent, CAM fees, turnover covenants, and annual escalation.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Tenant</Label>
                  <Select value={tenantId} onValueChange={setTenantId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.tradingName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Property</Label>
                  <Select value={propId} onValueChange={setPropId}>
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
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Unit Number</Label>
                  <Input
                    value={unitNum}
                    onChange={(e) => setUnitNum(e.target.value)}
                    placeholder="e.g. 101"
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Base Rent (USD)</Label>
                  <Input
                    type="number"
                    value={baseRent}
                    onChange={(e) => setBaseRent(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CAM Fee (USD)</Label>
                  <Input
                    type="number"
                    value={camFee}
                    onChange={(e) => setCamFee(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Deposit (USD)</Label>
                  <Input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Annual Escalation (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={escalationRate}
                    onChange={(e) => setEscalationRate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Turnover Rent Covenants (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={turnoverPercent}
                    onChange={(e) => setTurnoverPercent(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewLeaseModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Generate Draft Lease
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
