import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Space, LocationZone, RentalFrequency } from '@/types/rentflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Building,
  Layers,
  MapPin,
  Clock,
  FileText,
  Receipt,
  UserCheck,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  Printer,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SpaceLedgerModal } from './SpaceLedgerModal';
import { AllocateTenantModal } from './AllocateTenantModal';
import { LeaseTermsModal } from './LeaseTermsModal';
import { toast } from 'sonner';

interface SpaceRackGridProps {
  propertyIdFilter?: string;
  onSelectSpace?: (space: Space) => void;
  showFilters?: boolean;
  selectedSpaceId?: string;
  onOpenLeaseTerms?: (space: Space) => void;
  onAllocate?: (space: Space) => void;
  onVacate?: (space: Space) => void;
  onGenerateInvoice?: (space: Space) => void;
  onSendWhatsApp?: (space: Space) => void;
  variant?: 'compact' | 'tablet';
}

export const SpaceRackGrid: React.FC<SpaceRackGridProps> = ({
  propertyIdFilter,
  onSelectSpace,
  showFilters = true,
  selectedSpaceId,
  onOpenLeaseTerms,
  onAllocate,
  onVacate,
  onGenerateInvoice,
  onSendWhatsApp
}) => {
  const {
    spaces,
    properties,
    rbzExchangeRate,
    spaceLedgers,
    sendWhatsAppNotice,
    addInvoice,
    deallocateTenantFromSpace
  } = useRentFlow();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyIdFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<'all' | LocationZone>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | RentalFrequency>('all');
  const [groupByFloor, setGroupByFloor] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals inside Grid if not intercepted
  const [activeSpaceForLedger, setActiveSpaceForLedger] = useState<Space | null>(null);
  const [activeSpaceForLeaseTerms, setActiveSpaceForLeaseTerms] = useState<Space | null>(null);
  const [activeSpaceForAllocate, setActiveSpaceForAllocate] = useState<Space | null>(null);
  const [statementPreviewSpace, setStatementPreviewSpace] = useState<Space | null>(null);
  const [receiptPreviewSpace, setReceiptPreviewSpace] = useState<Space | null>(null);

  // Sync if filter prop changes
  React.useEffect(() => {
    if (propertyIdFilter) {
      setSelectedPropertyId(propertyIdFilter);
    }
  }, [propertyIdFilter]);

  // Filter spaces
  const filteredSpaces = spaces.filter((sp) => {
    if (selectedPropertyId !== 'all' && sp.propertyId !== selectedPropertyId) {
      return false;
    }
    if (statusFilter !== 'all' && sp.status !== statusFilter) {
      return false;
    }

    const prop = properties.find(p => p.id === sp.propertyId);
    const effectiveZone = sp.locationZone || prop?.locationZone || 'cbd';
    if (zoneFilter !== 'all' && effectiveZone !== zoneFilter) {
      return false;
    }

    const effectiveFreq = sp.frequency || 'Monthly';
    if (frequencyFilter !== 'all' && effectiveFreq !== frequencyFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = sp.unitNumber.toLowerCase().includes(q);
      const matchName = sp.customName.toLowerCase().includes(q);
      const matchTenant = sp.currentTenantName?.toLowerCase().includes(q) || false;
      const matchPrefix = (sp.unitPrefix || sp.type).toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchTenant && !matchPrefix) {
        return false;
      }
    }

    return true;
  });

  // Unique floors
  const uniqueFloors = Array.from(new Set(filteredSpaces.map(s => s.floor || 'Ground Floor'))).sort();

  // Status counters
  const totalCount = filteredSpaces.length;
  const occupiedCount = filteredSpaces.filter(s => s.status === 'Occupied').length;
  const overdueCount = filteredSpaces.filter(s => s.status === 'Overdue' || s.rentalAccumulationUSD > 0).length;
  const vacantCount = filteredSpaces.filter(s => s.status === 'Vacant').length;
  const maintenanceCount = filteredSpaces.filter(s => s.status === 'Under Maintenance').length;

  const handleCardClick = (space: Space) => {
    if (onSelectSpace) {
      onSelectSpace(space);
    } else {
      setActiveSpaceForLedger(space);
    }
  };

  const handleQuickInvoice = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    if (onGenerateInvoice) {
      onGenerateInvoice(space);
      return;
    }

    if (space.status === 'Vacant') {
      toast.info(`Unit ${space.unitNumber} is vacant. Allocate a tenant first to generate an invoice.`);
      return;
    }

    const prop = properties.find(p => p.id === space.propertyId);
    const invNumber = `INV-${new Date().getFullYear()}-${space.unitNumber}-${Math.floor(100 + Math.random() * 900)}`;
    const targetRent = space.targetRentUSD || space.baseRentUSD;
    const totalUSD = targetRent + space.camFeeUSD;
    const totalZiG = totalUSD * rbzExchangeRate;

    addInvoice({
      invoiceNumber: invNumber,
      tenantId: space.currentTenantId || 'ten-gen',
      tenantName: space.currentTenantName || 'Commercial Tenant',
      propertyId: space.propertyId,
      propertyName: prop?.name || 'Commercial Center',
      unitId: space.id,
      unitNumber: space.unitNumber,
      billingPeriod: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      exchangeRate: rbzExchangeRate,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `Base Commercial Rent (${space.unitNumber})`,
          amountUSD: targetRent,
          amountZiG: targetRent * rbzExchangeRate,
          type: 'Base Rent'
        },
        {
          id: `item-${Date.now()}-2`,
          description: 'CAM Service Charge',
          amountUSD: space.camFeeUSD,
          amountZiG: space.camFeeUSD * rbzExchangeRate,
          type: 'CAM Charge'
        }
      ],
      totalUSD,
      totalZiG,
      paidUSD: 0,
      paidZiG: 0,
      status: 'Unpaid'
    });

    toast.success(`Generated pro-forma invoice #${invNumber}: $${totalUSD.toLocaleString()} USD (ZiG ${totalZiG.toLocaleString()})!`);
  };

  const handleQuickWhatsApp = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    if (onSendWhatsApp) {
      onSendWhatsApp(space);
      return;
    }

    if (space.status === 'Vacant') {
      toast.info(`Unit ${space.unitNumber} is vacant. No active tenant phone number.`);
      return;
    }

    const prop = properties.find(p => p.id === space.propertyId);
    const targetRent = space.targetRentUSD || space.baseRentUSD;
    const arrearsUSD = space.rentalAccumulationUSD;
    const arrearsZiG = (arrearsUSD * rbzExchangeRate).toLocaleString();
    const msg = `*RENTFLOW COMMERCIAL NOTICE*\n\nDear ${space.currentTenantName},\nThis is a statement regarding ${space.unitPrefix || space.type} ${space.unitNumber} at ${prop?.name || 'Commercial Center'}.\n• Monthly Target Rent: $${targetRent.toLocaleString()} USD\n• Current Arrears Balance: *$${arrearsUSD.toLocaleString()} USD* (ZiG ${arrearsZiG})\n• Official RBZ Rate: 1 USD = ${rbzExchangeRate} ZiG\n• EcoCash Merchant: 99420\n\nKindly allocate payment promptly. Thank you.`;

    if (space.currentTenantId) {
      sendWhatsAppNotice(space.currentTenantId, msg, 'Statement');
    }
    toast.success(`WhatsApp reminder dispatched for ${space.unitPrefix || space.type} ${space.unitNumber}!`);
  };

  const handleQuickLease = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    if (onOpenLeaseTerms) {
      onOpenLeaseTerms(space);
    } else {
      setActiveSpaceForLeaseTerms(space);
    }
  };

  const handleOpenTaxInvoice = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    handleQuickInvoice(e, space);
  };

  const handleOpenRentReceipt = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    setReceiptPreviewSpace(space);
  };

  const handleOpenStatementPreview = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    setStatementPreviewSpace(space);
  };

  const handlePrintSpaceStatement = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    setStatementPreviewSpace(space);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleQuickAllocate = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    if (onAllocate) {
      onAllocate(space);
    } else {
      setActiveSpaceForAllocate(space);
    }
  };

  const handleQuickVacate = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    if (onVacate) {
      onVacate(space);
      return;
    }

    if (confirm(`Vacate ${space.unitPrefix || space.type} ${space.unitNumber} (${space.currentTenantName})? Active tenancy will be terminated.`)) {
      deallocateTenantFromSpace(space.id);
      toast.success(`Space ${space.unitPrefix || space.type} ${space.unitNumber} marked vacant.`);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Zone & Frequency Filter Header Pills */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" /> Zone:
            </span>
            <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setZoneFilter('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  zoneFilter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Zones
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter('cbd')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  zoneFilter === 'cbd' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                CBD Core High-Density
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter('suburban')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  zoneFilter === 'suburban' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Suburban Business Parks
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> Cycle:
            </span>
            <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setFrequencyFilter('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  frequencyFilter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('Monthly')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  frequencyFilter === 'Monthly' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('Weekly')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  frequencyFilter === 'Weekly' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('Daily')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  frequencyFilter === 'Daily' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Daily
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel-Rack Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-card-foreground border-border hover:bg-muted'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80">All Spaces</div>
          <div className="text-xl font-bold font-serif">{totalCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Occupied')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'Occupied'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              : 'bg-slate-900/80 text-emerald-400 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">Occupied</div>
          <div className="text-xl font-bold font-serif">{occupiedCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Overdue')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'Overdue'
              ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
              : 'bg-slate-900/80 text-rose-400 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-rose-400">Overdue Arrears</div>
          <div className="text-xl font-bold font-serif">{overdueCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Vacant')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'Vacant'
              ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Vacant Leasable</div>
          <div className="text-xl font-bold font-serif">{vacantCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Under Maintenance')}
          className={`p-3 rounded-lg border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'Under Maintenance'
              ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
              : 'bg-slate-900/80 text-amber-400 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">Maintenance</div>
          <div className="text-xl font-bold font-serif">{maintenanceCount}</div>
        </button>
      </div>

      {/* Filter Toolbar */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-card border border-border rounded-lg shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by unit number (Shop 1-500), space name, or tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupByFloor(!groupByFloor)}
              className={`h-9 text-xs flex items-center gap-1.5 ${groupByFloor ? 'bg-primary/10 border-primary text-primary' : ''}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{groupByFloor ? 'Flat View' : 'Group by Floor'}</span>
            </Button>

            {(statusFilter !== 'all' || zoneFilter !== 'all' || frequencyFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setZoneFilter('all');
                  setFrequencyFilter('all');
                }}
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Rack Grid Visualization (Full-Width Tablet Thumbnail Grid) */}
      {groupByFloor ? (
        <div className="space-y-6 w-full">
          {uniqueFloors.map((flr) => {
            const floorSpaces = filteredSpaces.filter(s => (s.floor || 'Ground Floor') === flr);
            if (floorSpaces.length === 0) return null;
            return (
              <div key={flr} className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-border">
                  <span className="text-xs font-bold font-serif text-foreground uppercase tracking-wider">{flr}</span>
                  <Badge variant="outline" className="text-[10px]">{floorSpaces.length} Units</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {floorSpaces.map((space) => {
                    const globalIdx = filteredSpaces.findIndex(s => s.id === space.id);
                    return renderSpaceCard(space, globalIdx !== -1 ? globalIdx : 0, filteredSpaces.length);
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
          {filteredSpaces.map((space, idx) => renderSpaceCard(space, idx, filteredSpaces.length))}
        </div>
      )}

      {/* Modal for Space Ledger */}
      {activeSpaceForLedger && (
        <SpaceLedgerModal
          space={activeSpaceForLedger}
          allSpaces={filteredSpaces}
          onNavigateSpace={(sp) => setActiveSpaceForLedger(sp)}
          isOpen={!!activeSpaceForLedger}
          onClose={() => setActiveSpaceForLedger(null)}
        />
      )}

      {/* Modal for Lease Terms & Escalation */}
      {activeSpaceForLeaseTerms && (
        <LeaseTermsModal
          space={activeSpaceForLeaseTerms}
          isOpen={!!activeSpaceForLeaseTerms}
          onClose={() => setActiveSpaceForLeaseTerms(null)}
        />
      )}

      {/* Modal for Space Allocation */}
      {activeSpaceForAllocate && (
        <AllocateTenantModal
          space={activeSpaceForAllocate}
          isOpen={!!activeSpaceForAllocate}
          onClose={() => setActiveSpaceForAllocate(null)}
        />
      )}

      {/* Modal for Statement of All Payments Preview */}
      {statementPreviewSpace && (
        <Dialog open={!!statementPreviewSpace} onOpenChange={(open) => !open && setStatementPreviewSpace(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/40 font-mono text-[11px]">
                  Statement of Account
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  RBZ Rate: 1 USD = {rbzExchangeRate.toFixed(2)} ZiG
                </span>
              </div>
              <DialogTitle className="text-xl font-serif font-bold text-foreground">
                Statement of All Payments Preview
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {statementPreviewSpace.unitPrefix || statementPreviewSpace.type} {statementPreviewSpace.unitNumber} ({statementPreviewSpace.customName || 'Commercial Unit'}) • {properties.find(p => p.id === statementPreviewSpace.propertyId)?.name || 'Commercial Asset'}
              </DialogDescription>
            </DialogHeader>

            {/* Official Letterhead Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-serif font-bold text-slate-950 dark:text-slate-100">
                <span className="uppercase tracking-wider">RENTFLOW COMMERCIAL PROPERTY MANAGEMENT</span>
                <span className="font-mono text-[11px] text-muted-foreground">ZIMRA ITF263 COMPLIANT</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                <div>Tenant: <span className="font-semibold text-foreground">{statementPreviewSpace.currentTenantName || 'Vacant Commercial Space'}</span></div>
                <div>Status: <span className="font-semibold text-foreground">{statementPreviewSpace.status}</span></div>
                <div>Billing Frequency: <span className="font-semibold text-foreground">{statementPreviewSpace.frequency || 'Monthly'}</span></div>
              </div>
            </div>

            {/* Balances & Arrears Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Target Rent</div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  ${(statementPreviewSpace.targetRentUSD || statementPreviewSpace.baseRentUSD).toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Paid</div>
                <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
                  ${Math.max(0, (statementPreviewSpace.targetRentUSD || statementPreviewSpace.baseRentUSD) - statementPreviewSpace.rentalAccumulationUSD).toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Current Arrears</div>
                <div className="text-sm font-bold font-mono text-rose-600 mt-0.5">
                  ${statementPreviewSpace.rentalAccumulationUSD.toFixed(2)}
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                  (ZiG {(statementPreviewSpace.rentalAccumulationUSD * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </div>
              </div>
            </div>

            {/* Historical Transactions Table */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Transaction History
              </div>
              {spaceLedgers[statementPreviewSpace.id]?.length ? (
                <div className="overflow-x-auto rounded-lg border border-border max-h-56">
                  <Table className="[&>div]:max-w-full text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Description</TableHead>
                        <TableHead className="whitespace-nowrap">Ref / Code</TableHead>
                        <TableHead className="whitespace-nowrap text-right">Payment (USD)</TableHead>
                        <TableHead className="whitespace-nowrap text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spaceLedgers[statementPreviewSpace.id].map((item, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap font-mono">{item.date}</TableCell>
                          <TableCell className="whitespace-nowrap">{item.description}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-muted-foreground">{item.reference}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-right text-emerald-600 font-semibold">
                            ${item.paymentUSD.toFixed(2)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-right">
                            ${item.balanceUSD.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                  No historical ledger payments recorded for this unit yet.
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatementPreviewSpace(null)}
                className="h-8 text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Statement</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal for Official Rent Receipt */}
      {receiptPreviewSpace && (
        <Dialog open={!!receiptPreviewSpace} onOpenChange={(open) => !open && setReceiptPreviewSpace(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[92dvh] overflow-y-auto p-5 sm:p-6">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 font-mono text-[11px]">
                  Official Tax Receipt
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Receipt #{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
              <DialogTitle className="text-xl font-serif font-bold text-foreground">
                Official Commercial Rent Receipt
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Issued for {receiptPreviewSpace.unitPrefix || receiptPreviewSpace.type} {receiptPreviewSpace.unitNumber} • {properties.find(p => p.id === receiptPreviewSpace.propertyId)?.name || 'Commercial Asset'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 text-xs">
              <div className="flex items-center justify-between font-serif font-bold text-emerald-950 dark:text-emerald-200">
                <span>RENTFLOW COMMERCIAL MANAGEMENT</span>
                <span className="font-mono text-[11px]">VAT REG: 10048291</span>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received From:</span>
                  <span className="font-semibold text-foreground">{receiptPreviewSpace.currentTenantName || 'Tenant'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Allocation:</span>
                  <span className="font-semibold text-foreground">Commercial Rent & CAM Levy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency Settlement:</span>
                  <span className="font-semibold font-mono text-foreground">
                    ${(receiptPreviewSpace.targetRentUSD || receiptPreviewSpace.baseRentUSD).toFixed(2)} USD (ZiG {((receiptPreviewSpace.targetRentUSD || receiptPreviewSpace.baseRentUSD) * rbzExchangeRate).toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clearance Method:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">EcoCash USD USSD Push / Nostro</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReceiptPreviewSpace(null)}
                className="h-8 text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  function renderSpaceCard(space: Space, index: number, total: number) {
    const prop = properties.find(p => p.id === space.propertyId);
    const isOverdue = space.status === 'Overdue' || space.rentalAccumulationUSD > 0;
    const isVacant = space.status === 'Vacant';
    const isMaint = space.status === 'Under Maintenance';
    const isSelected = selectedSpaceId === space.id;

    // Monthly Target & Progress Calculation
    let targetRent = space.targetRentUSD || space.baseRentUSD;
    if (!space.targetRentUSD) {
      if (space.frequency === 'Daily') targetRent = space.baseRentUSD * 30;
      else if (space.frequency === 'Weekly') targetRent = Math.round(space.baseRentUSD * 4.33);
    }
    const targetRentZiG = (targetRent * rbzExchangeRate).toLocaleString();
    const paidAmount = space.paidThisMonthUSD || 0;
    const progressPercent = targetRent > 0 ? Math.min(100, Math.round((paidAmount / targetRent) * 100)) : 0;
    const isPaidInFull = progressPercent >= 100;

    return (
      <div
        key={space.id}
        onClick={() => handleCardClick(space)}
        className={`p-4 rounded-[6px] border text-left cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden group flex flex-col justify-between bg-[#101C40]/55 border-white/[0.07] backdrop-blur-[24px] ${
          isSelected
            ? 'ring-2 ring-primary border-primary shadow-lg'
            : isOverdue
            ? 'border-rose-500/60 hover:border-rose-400'
            : isVacant
            ? 'border-white/10 hover:border-white/20'
            : isMaint
            ? 'border-amber-500/60 hover:border-amber-400'
            : isPaidInFull
            ? 'border-emerald-500/60 hover:border-emerald-400'
            : 'border-white/[0.07] hover:border-sky-500/70'
        }`}
      >
        {/* Top Accent Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isOverdue ? 'bg-rose-600' :
            isVacant ? 'bg-slate-400' :
            isMaint ? 'bg-amber-500' :
            isPaidInFull ? 'bg-emerald-600' : 'bg-primary'
          }`}
        />

        {/* Quick Navigation (< / >) & Real-time Space Position Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pb-2 border-b border-border/50">
          <div className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded border border-border/60">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (total <= 1) return;
                const prevIdx = index <= 0 ? total - 1 : index - 1;
                handleCardClick(filteredSpaces[prevIdx]);
              }}
              className="p-0.5 rounded hover:bg-background hover:text-primary transition-colors"
              title="Previous Space (<)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-foreground text-[10px]">
              Space {index + 1} of {total}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (total <= 1) return;
                const nextIdx = (index + 1) % total;
                handleCardClick(filteredSpaces[nextIdx]);
              }}
              className="p-0.5 rounded hover:bg-background hover:text-primary transition-colors"
              title="Next Space (>)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground truncate max-w-[120px] font-sans">
            {space.floor || 'Ground'}
          </span>
        </div>

        {/* Card Header: Unit Identity & Status */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-start justify-between gap-1">
            <div>
              <div className="text-lg font-bold font-serif text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{space.unitPrefix || space.type} {space.unitNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-sans font-medium text-muted-foreground border border-border/60">
                  {space.frequency || 'Monthly'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1 font-medium">
                {space.customName || `Commercial Unit ${space.unitNumber}`}
              </div>
            </div>

            {isVacant ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2 font-mono border-slate-700 text-slate-300 bg-slate-800/80"
                >
                  Space Ready for Tenancy
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleQuickAllocate(e, space)}
                  className="h-6 px-2 text-[10px] font-semibold border-primary/50 text-primary hover:bg-primary/20 flex items-center gap-1"
                  title="Allocate Tenant to Space"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Allocate Tenant</span>
                </Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className={`text-[10px] h-5 px-2 font-mono shrink-0 ${
                  isOverdue ? 'border-rose-700 text-rose-300 bg-rose-950/70 font-bold' :
                  isMaint ? 'border-amber-700 text-amber-300 bg-amber-950/70' :
                  isPaidInFull ? 'border-emerald-700 text-emerald-300 bg-emerald-950/70' :
                  'border-sky-700 text-sky-300 bg-sky-950/70'
                }`}
              >
                {isOverdue ? 'Overdue Arrears' : isMaint ? 'Maintenance' : isPaidInFull ? 'Paid in Full' : 'Partially Paid'}
              </Badge>
            )}
          </div>

          {/* Location & Specifications */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{prop?.name || 'Harare Commercial'}</span>
            <span>•</span>
            <span className="shrink-0">{space.floor}</span>
            <span>•</span>
            <span className="shrink-0 font-mono">{space.sizeSqm} m²</span>
          </div>
        </div>

        {/* Occupant & Financial Overview Block */}
        <div className="my-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Current Occupant
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              CAM: ${space.camFeeUSD}/mo
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-foreground text-sm truncate block">
                {space.currentTenantName || (
                  <span className="text-slate-500 font-normal italic">⭐ Vacant / Ready for Lease</span>
                )}
              </span>
            </div>
          </div>
          {/* Specialized Dual-Currency Totals Settlement Widget */}
          <div className="pt-2 border-t border-white/[0.07] grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-[4px] bg-slate-900/60 border border-white/[0.06]">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate">Target</div>
              <div className="text-[12px] font-bold font-mono text-slate-100 tabular-nums">${targetRent.toLocaleString()}</div>
              <div className="text-[9px] font-mono text-slate-400 truncate tabular-nums">ZiG {targetRentZiG}</div>
            </div>

            <div className="p-1.5 rounded-[4px] bg-emerald-950/30 border border-emerald-500/20">
              <div className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold truncate">Settled</div>
              <div className="text-[12px] font-bold font-mono text-emerald-300 tabular-nums">${paidAmount.toLocaleString()}</div>
              <div className="text-[9px] font-mono text-emerald-400/80 truncate tabular-nums">ZiG {(paidAmount * rbzExchangeRate).toLocaleString()}</div>
            </div>

            <div className={`p-1.5 rounded-[4px] ${isOverdue ? 'bg-rose-950/40 border border-rose-500/30' : 'bg-slate-900/60 border border-white/[0.06]'}`}>
              <div className={`text-[9px] uppercase tracking-wider font-semibold truncate ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>Margin</div>
              <div className={`text-[12px] font-bold font-mono tabular-nums ${isOverdue ? 'text-rose-300 font-bold' : 'text-slate-300'}`}>
                ${space.rentalAccumulationUSD.toLocaleString()}
              </div>
              <div className={`text-[9px] font-mono truncate tabular-nums ${isOverdue ? 'text-rose-400/80' : 'text-slate-400'}`}>
                ZiG {(space.rentalAccumulationUSD * rbzExchangeRate).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Collection Progress Bar */}
          {!isVacant && (
            <div className="space-y-1 pt-1.5 border-t border-white/[0.07]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Collection Progress:</span>
                <span className="font-semibold text-slate-200 font-mono tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isPaidInFull ? 'bg-[#10B981]' : progressPercent > 0 ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar matching invoicedropdown.png */}
        <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-xs">
          {/* 1. Invoicing Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-7 px-2 text-xs flex items-center gap-1 bg-background hover:bg-muted font-normal border-slate-200 dark:border-slate-800 shadow-2xs"
                title="Billing & Invoicing Options"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Invoic...</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-1.5 text-xs shadow-lg bg-popover border border-border z-50">
              <DropdownMenuLabel className="text-xs font-semibold px-2.5 py-1">
                Billing & Invoicing
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => handleOpenTaxInvoice(e, space)}
                className="text-xs px-2.5 py-2 flex items-center gap-2.5 cursor-pointer rounded-md hover:bg-muted"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Tax Invoice (USD/ZiG)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleOpenRentReceipt(e, space)}
                className="text-xs px-2.5 py-2 flex items-center gap-2.5 cursor-pointer rounded-md hover:bg-muted"
              >
                <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official Rent Receipt</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleOpenStatementPreview(e, space)}
                className="text-xs px-2.5 py-2 flex items-center gap-2.5 cursor-pointer rounded-md bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium hover:bg-blue-100/80"
              >
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Statement of All Payments Preview</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handlePrintSpaceStatement(e, space)}
                className="text-xs px-2.5 py-2 flex items-center gap-2.5 cursor-pointer rounded-md hover:bg-muted"
              >
                <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Print Space Statement</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Assign Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleQuickAllocate(e, space)}
            className="h-7 px-2.5 text-xs flex items-center gap-1.5 bg-background hover:bg-muted font-normal border-slate-200 dark:border-slate-800 shadow-2xs"
            title="Allocate / Assign Tenant to Space"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Assign</span>
          </Button>

          {/* 3. Pay/Ledger Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSpaceForLedger(space);
            }}
            className="h-7 px-2.5 text-xs flex items-center gap-1.5 bg-background hover:bg-muted font-normal border-slate-200 dark:border-slate-800 shadow-2xs"
            title="Space Payment Ledger & Manager Controls"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pay/Ledger</span>
          </Button>

          {/* 4. Lease Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleQuickLease(e, space)}
            className="h-7 px-2.5 text-xs flex items-center gap-1.5 bg-background hover:bg-muted font-normal border-slate-200 dark:border-slate-800 shadow-2xs"
            title="Commercial Lease Agreement & Escalation Terms"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lease</span>
          </Button>
        </div>
      </div>
    );
  }
};

// Export RoomRackGrid alias for full compatibility
export const RoomRackGrid = SpaceRackGrid;
