import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Property, Space, SpaceType, UnitPrefix } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SpaceRackGrid } from '@/components/common/SpaceRackGrid';
import { SpaceLedgerModal } from '@/components/common/SpaceLedgerModal';
import { AllocateTenantModal } from '@/components/common/AllocateTenantModal';
import { BulkAllocateModal } from '@/components/common/BulkAllocateModal';
import { LeaseTermsModal } from '@/components/common/LeaseTermsModal';
import { BulkFloorStatementsModal } from '@/components/common/BulkFloorStatementsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Plus,
  MapPin,
  Zap,
  Droplet,
  Sun,
  Users,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Edit,
  Download,
  Receipt,
  FileText,
  FileSignature,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export const EXPANDED_OFFICE_FLOORS = [
  'Ground Floor Retail & Concourse',
  'Mezzanine Commercial Level',
  'Level 1 Office Suites',
  'Level 2 Office Suites',
  'Level 3 Office Suites',
  'Level 4 Office Suites',
  'Level 5 Office Suites',
  'Level 6 Office Suites',
  'Level 7 Office Suites',
  'Level 8 Office Suites',
  'Level 9 Office Suites',
  'Level 10 Office Suites',
  'Level 11 Office Suites',
  'Level 12 Office Suites',
  'Level 13 Office Suites',
  'Level 14 Office Suites',
  'Level 15 Office Suites',
  'Level 16 Office Suites',
  'Level 17 Office Suites',
  'Level 18 Office Suites',
  'Level 19 Office Suites',
  'Level 20 Office Suites',
  'Level 21 Office Suites',
  'Level 22 Office Suites',
  'Level 23 Office Suites',
  'Level 24 Office Suites',
  'Level 25 Office Suites (Penthouse Executive)',
  'Rooftop Terrace & Sky Lounge'
];

export const PropertiesPage: React.FC = () => {
  const {
    properties,
    spaces,
    portfolios,
    tenants,
    leases,
    addProperty,
    deleteProperty,
    deleteSpace,
    bulkDeleteProperties,
    bulkDeleteSpaces,
    addSpace,
    updateSpace,
    allocateTenantToSpace,
    deallocateTenantFromSpace,
    addInvoice,
    updateProperty,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const navigate = useNavigate();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'prop-1');

  // Modals for Spaces & Leases
  const [selectedSpaceForLedger, setSelectedSpaceForLedger] = useState<Space | null>(null);
  const [selectedSpaceForAllocation, setSelectedSpaceForAllocation] = useState<Space | null>(null);
  const [selectedSpaceForLeaseTerms, setSelectedSpaceForLeaseTerms] = useState<Space | null>(null);
  const [spaceToVacate, setSpaceToVacate] = useState<Space | null>(null);
  const [isBulkAllocateOpen, setIsBulkAllocateOpen] = useState<boolean>(false);

  // Property & Space Management Modals
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState<boolean>(false);
  const [isAddSpaceModalOpen, setIsAddSpaceModalOpen] = useState<boolean>(false);
  const [isEditSpaceModalOpen, setIsEditSpaceModalOpen] = useState<boolean>(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // Quick Invoice Generation Modal
  const [invoiceModalSpace, setInvoiceModalSpace] = useState<Space | null>(null);

  // Form states - Property
  const [propName, setPropName] = useState<string>('');
  const [propCode, setPropCode] = useState<string>('');
  const [propPortfolioId, setPropPortfolioId] = useState<string>(portfolios[0]?.id || 'port-1');
  const [propType, setPropType] = useState<'Shopping Mall' | 'Story Building' | 'Commercial Plaza'>('Shopping Mall');
  const [propAddress, setPropAddress] = useState<string>('');
  const [propFloors, setPropFloors] = useState<string>('4');
  const [propGenKVA, setPropGenKVA] = useState<string>('500');
  const [propSolarKVA, setPropSolarKVA] = useState<string>('150');

  // Form states - Space (Rooms 100-500 numbering & technical specs)
  const [spacePrefix, setSpacePrefix] = useState<UnitPrefix>('Office');
  const [spaceUnitNum, setSpaceUnitNum] = useState<string>('109');
  const [spaceCustomName, setSpaceCustomName] = useState<string>('Executive Boardroom');
  const [spaceType, setSpaceType] = useState<SpaceType>('Office');
  const [spaceFloor, setSpaceFloor] = useState<string>('Level 1 Office Suites');
  const [spaceZone, setSpaceZone] = useState<string>('North Wing');
  const [spaceSizeSqm, setSpaceSizeSqm] = useState<string>('85');
  const [spaceBaseRentUSD, setSpaceBaseRentUSD] = useState<string>('1200');
  const [spaceCamUSD, setSpaceCamUSD] = useState<string>('250');
  const [spaceTurnoverRate, setSpaceTurnoverRate] = useState<string>('0');
  const [spaceGfQuickSelect, setSpaceGfQuickSelect] = useState<string>('none');
  const [spacePowerRating, setSpacePowerRating] = useState<string>('Three-Phase 100A');
  const [spaceHvacType, setSpaceHvacType] = useState<string>('Central HVAC Ducted');
  const [spaceGreaseTrap, setSpaceGreaseTrap] = useState<boolean>(false);
  const [spaceFrontageM, setSpaceFrontageM] = useState<string>('6.5');
  const [spaceCeilingM, setSpaceCeilingM] = useState<string>('3.5');
  const [spaceParkingBays, setSpaceParkingBays] = useState<string>('2');

  const handleGfSelect = (val: string) => {
    setSpaceGfQuickSelect(val);
    if (val !== 'none') {
      const shopNum = parseInt(val, 10);
      const unitNum = (100 + shopNum).toString();
      setSpacePrefix('Shop');
      setSpaceUnitNum(unitNum);
      setSpaceFloor('Ground Floor Retail & Concourse');
      setSpaceType('Shop');
      setSpaceCustomName(`Ground Floor Frontage Shop GF-${shopNum < 10 ? '0' + shopNum : shopNum}`);
      setSpaceSizeSqm((60 + shopNum * 5).toString());
      setSpaceBaseRentUSD((1200 + shopNum * 100).toString());
      setSpaceCamUSD((250 + shopNum * 20).toString());
      setSpaceFrontageM((5.5 + shopNum * 0.3).toFixed(1));
      setSpacePowerRating('Three-Phase 100A');
    }
  };

  // Form states - Edit Space
  const [editCustomName, setEditCustomName] = useState<string>('');
  const [editFloor, setEditFloor] = useState<string>('');
  const [editType, setEditType] = useState<SpaceType>('Office');
  const [editSizeSqm, setEditSizeSqm] = useState<string>('');
  const [editBaseRentUSD, setEditBaseRentUSD] = useState<string>('');
  const [editCamUSD, setEditCamUSD] = useState<string>('');

  // Bulk Floor Statements Modal & Edit Landmark States
  const [isBulkFloorStatementsOpen, setIsBulkFloorStatementsOpen] = useState<boolean>(false);
  const [isEditLandmarkOpen, setIsEditLandmarkOpen] = useState<boolean>(false);
  const [editLandmarkName, setEditLandmarkName] = useState<string>('');
  const [editLandmarkCode, setEditLandmarkCode] = useState<string>('');
  const [editLandmarkAddress, setEditLandmarkAddress] = useState<string>('');
  const [editLandmarkFloors, setEditLandmarkFloors] = useState<string>('4');

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const propertySpaces = spaces.filter(s => s.propertyId === activeProperty?.id);

  // Property and Space Deletion & In-Page Navigation States
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

  const currentPropIndex = properties.findIndex(p => p.id === activeProperty?.id);
  const hasPrevProperty = currentPropIndex > 0;
  const hasNextProperty = currentPropIndex >= 0 && currentPropIndex < properties.length - 1;

  const handlePrevProperty = () => {
    if (hasPrevProperty) {
      setSelectedPropertyId(properties[currentPropIndex - 1].id);
    }
  };

  const handleNextProperty = () => {
    if (hasNextProperty) {
      setSelectedPropertyId(properties[currentPropIndex + 1].id);
    }
  };

  const handleConfirmDeleteProperty = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      toast.success(`Commercial property "${propertyToDelete.name}" deleted.`);
      const remaining = properties.filter(p => p.id !== propertyToDelete.id);
      if (remaining.length > 0) {
        setSelectedPropertyId(remaining[0].id);
      }
      setPropertyToDelete(null);
    }
  };

  const handleConfirmDeleteSpace = () => {
    if (spaceToDelete) {
      deleteSpace(spaceToDelete.id);
      toast.success(`Space ${spaceToDelete.unitNumber} deleted.`);
      if (editingSpace?.id === spaceToDelete.id) {
        setIsEditSpaceModalOpen(false);
        setEditingSpace(null);
      }
      setSpaceToDelete(null);
    }
  };

  const handleOpenEditLandmark = () => {
    if (!activeProperty) return;
    setEditLandmarkName(activeProperty.name);
    setEditLandmarkCode(activeProperty.code);
    setEditLandmarkAddress(activeProperty.address);
    setEditLandmarkFloors(activeProperty.floorsCount?.toString() || '4');
    setIsEditLandmarkOpen(true);
  };

  const handleSaveLandmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !editLandmarkName.trim()) return;
    updateProperty(activeProperty.id, {
      name: editLandmarkName.trim(),
      code: editLandmarkCode.trim().toUpperCase() || activeProperty.code,
      address: editLandmarkAddress.trim() || activeProperty.address,
      floorsCount: parseInt(editLandmarkFloors, 10) || activeProperty.floorsCount
    });
    toast.success(`Updated landmark details for ${editLandmarkName}!`);
    setIsEditLandmarkOpen(false);
  };

  // Live Dynamic Space Counters
  const fullyPaidCount = propertySpaces.filter(
    s => s.status === 'Occupied' && (s.paidThisMonthUSD >= (s.targetRentUSD || s.baseRentUSD) || s.rentalAccumulationUSD <= 0)
  ).length;
  const overdueCount = propertySpaces.filter(
    s => s.status === 'Occupied' && s.rentalAccumulationUSD > 0
  ).length;
  const vacantCount = propertySpaces.filter(s => s.status === 'Vacant').length;
  const totalSpacesCount = propertySpaces.length;

  const canManage = ['Property Manager', 'Administrator'].includes(activeRole);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName.trim() || !propCode.trim()) {
      toast.error('Property name and identifier code are required.');
      return;
    }

    const newProp: Omit<Property, 'id'> = {
      name: propName.trim(),
      code: propCode.trim().toUpperCase(),
      portfolioId: propPortfolioId,
      portfolioName: 'Commercial Portfolio Assets',
      type: propType,
      address: propAddress.trim() || 'Commercial District Corridor',
      city: 'Zimbabwe',
      floorsCount: parseInt(propFloors) || 4,
      totalUnits: 20,
      generatorCapacityKVA: parseInt(propGenKVA) || 250,
      solarCapacityKVA: parseInt(propSolarKVA) || 80,
      boreholeEquipped: true,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      description: 'Prime commercial asset portfolio',
    };

    addProperty(newProp);
    toast.success(`Commercial property "${propName}" added!`);
    setIsAddPropertyModalOpen(false);
    setPropName('');
    setPropCode('');
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceUnitNum.trim()) {
      toast.error('Room number is required (Rooms 100-500).');
      return;
    }

    const parsedNum = parseInt(spaceUnitNum.replace(/\D/g, ''), 10);
    if (isNaN(parsedNum) || parsedNum < 100 || parsedNum > 500) {
      toast.error('Please specify a room number between 100 and 500 (e.g. 101, 205, 500).');
      return;
    }

    const rent = parseFloat(spaceBaseRentUSD) || 500;
    const cam = parseFloat(spaceCamUSD) || 100;

    const newSpace: Omit<Space, 'id'> = {
      propertyId: activeProperty.id,
      unitPrefix: spacePrefix,
      unitNumber: spaceUnitNum.trim(),
      customName: spaceCustomName.trim() || `${spacePrefix} ${spaceUnitNum}`,
      type: spaceType,
      floor: spaceFloor,
      zone: spaceZone,
      sizeSqm: parseFloat(spaceSizeSqm) || 50,
      baseRentUSD: rent,
      targetRentUSD: rent,
      camFeeUSD: cam,
      turnoverRatePercent: parseFloat(spaceTurnoverRate) || 0,
      status: 'Vacant',
      frequency: 'Monthly',
      paidThisMonthUSD: 0,
      rentalAccumulationUSD: 0,
      powerRating: spacePowerRating,
      hvacType: spaceHvacType,
      greaseTrapCompliant: spaceGreaseTrap,
      frontageWidthM: parseFloat(spaceFrontageM) || 0,
      ceilingHeightM: parseFloat(spaceCeilingM) || 0,
      parkingBays: parseInt(spaceParkingBays) || 0,
    };

    addSpace(newSpace);
    toast.success(`Commercial space ${spacePrefix} ${spaceUnitNum} created in ${activeProperty.name}!`);
    setIsAddSpaceModalOpen(false);
  };

  const handleOpenEditSpace = (space: Space) => {
    setEditingSpace(space);
    setEditCustomName(space.customName);
    setEditFloor(space.floor);
    setEditType(space.type);
    setEditSizeSqm(space.sizeSqm.toString());
    setEditBaseRentUSD(space.baseRentUSD.toString());
    setEditCamUSD(space.camFeeUSD.toString());
    setIsEditSpaceModalOpen(true);
  };

  const handleUpdateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace) return;

    updateSpace(editingSpace.id, {
      customName: editCustomName.trim() || editingSpace.customName,
      floor: editFloor || editingSpace.floor,
      type: editType,
      sizeSqm: parseFloat(editSizeSqm) || editingSpace.sizeSqm,
      baseRentUSD: parseFloat(editBaseRentUSD) || editingSpace.baseRentUSD,
      targetRentUSD: parseFloat(editBaseRentUSD) || editingSpace.baseRentUSD,
      camFeeUSD: parseFloat(editCamUSD) || editingSpace.camFeeUSD,
    });

    toast.success(`Updated space ${editingSpace.unitPrefix || editingSpace.type} ${editingSpace.unitNumber}!`);
    setIsEditSpaceModalOpen(false);
    setEditingSpace(null);
  };

  const handleConfirmVacate = () => {
    if (!spaceToVacate) return;
    deallocateTenantFromSpace(spaceToVacate.id);
    toast.success(`Space ${spaceToVacate.unitPrefix || spaceToVacate.type} ${spaceToVacate.unitNumber} marked vacant.`);
    setSpaceToVacate(null);
  };

  // Export Comprehensive Commercial Tenancy Roll and Occupancy Report (USD & ZiG)
  const handleExportTenancyRoll = () => {
    const headers = [
      'Property Name',
      'Property Code',
      'Unit Number',
      'Custom Name',
      'Floor Level',
      'Area (SQM)',
      'Occupancy Status',
      'Current Commercial Tenant',
      'Billing Frequency',
      'Base Rent (USD)',
      'Base Rent (ZiG @ RBZ)',
      'Monthly CAM Levy (USD)',
      'Annual Escalation (%)',
      'Paid This Month (USD)',
      'Outstanding Arrears (USD)',
      'Arrears (ZiG)'
    ];

    const rows = propertySpaces.map(sp => {
      const rentZiG = (sp.baseRentUSD * rbzExchangeRate).toFixed(2);
      const arrearsZiG = (sp.rentalAccumulationUSD * rbzExchangeRate).toFixed(2);
      const lease = leases.find(l => (l.unitId === sp.id || l.unitNumber === sp.unitNumber) && l.status !== 'Terminated');
      const escRate = lease?.annualEscalationRate || 8;

      return [
        `"${activeProperty.name}"`,
        `"${activeProperty.code}"`,
        `"${sp.unitPrefix || sp.type} ${sp.unitNumber}"`,
        `"${sp.customName}"`,
        `"${sp.floor}"`,
        sp.sizeSqm,
        `"${sp.status}"`,
        `"${sp.currentTenantName || 'Vacant Leasable'}"`,
        `"${sp.frequency || 'Monthly'}"`,
        sp.baseRentUSD,
        rentZiG,
        sp.camFeeUSD,
        `${escRate}%`,
        sp.paidThisMonthUSD || 0,
        sp.rentalAccumulationUSD,
        arrearsZiG
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Commercial_Tenancy_Roll_${activeProperty.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported commercial tenancy roll for ${activeProperty.name} (USD & ZiG dual-currency standard)!`);
  };

  // Generate dual-currency invoice/receipt
  const handleGenerateInvoice = (space: Space) => {
    if (space.status === 'Vacant') {
      toast.info(`Space ${space.unitNumber} is vacant. Allocate a tenant first.`);
      return;
    }

    const invNum = `INV-${new Date().getFullYear()}-${space.unitNumber}-${Math.floor(100 + Math.random() * 900)}`;
    const targetRent = space.targetRentUSD || space.baseRentUSD;
    const totalUSD = targetRent + space.camFeeUSD;
    const totalZiG = totalUSD * rbzExchangeRate;

    addInvoice({
      invoiceNumber: invNum,
      tenantId: space.currentTenantId || 'ten-gen',
      tenantName: space.currentTenantName || 'Commercial Tenant',
      propertyId: space.propertyId,
      propertyName: activeProperty.name,
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

    toast.success(`Generated pro-forma invoice #${invNum}: $${totalUSD.toLocaleString()} USD (ZiG ${totalZiG.toLocaleString()}) for ${space.currentTenantName}!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Properties' }, { label: activeProperty?.name || 'Spaces' }]} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* TOP HEADER BANNER: Property Selection, Executive Portfolio Metrics & Workflow Actions */}
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Property Selector & Details with Back and Prev/Next Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Back to Portfolios Button */}
              <div className="pt-3 sm:pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/portfolios')}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 -ml-1"
                  title="Return to Commercial Portfolios"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Portfolios</span>
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Select Commercial Property
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {currentPropIndex + 1} of {properties.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger className="w-[200px] sm:w-[240px] h-9 text-xs font-serif font-bold">
                      <SelectValue placeholder="Select Property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.code}) • {p.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* In-Page Building Previous / Next Switchers */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevProperty}
                    onClick={handlePrevProperty}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                    title="Previous Commercial Building"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextProperty}
                    onClick={handleNextProperty}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                    title="Next Commercial Building"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-3 sm:pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
                    {activeProperty?.code}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {activeProperty?.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:inline-flex">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {activeProperty?.address}
                  </span>

                  {/* Quick Edit & Delete Building Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenEditLandmark}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    title="Edit Building Details"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Building</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPropertyToDelete(activeProperty)}
                    className="h-7 px-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1"
                    title="Delete Building"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* LEASE & TENANCY WORKFLOW BAR SECTION */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Lease & Tenancy Workflow
                </span>
                <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline-block">
                  {activeProperty?.name} • Live Operations
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Export Tenancy Roll */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTenancyRoll}
                  className="h-8.5 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted font-medium"
                  title="Export Comprehensive Commercial Tenancy Roll (USD & ZiG)"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Export Tenancy Roll</span>
                </Button>

                {/* 2. WhatsApp Dispatch */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkFloorStatementsOpen(true)}
                  className="h-8.5 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted text-emerald-700 dark:text-emerald-400 border-emerald-500/40 font-medium"
                  title="Dispatch bulk WhatsApp statements, invoices, and payment receipts across floors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp Dispatch</span>
                </Button>

                {/* 3. Add Property */}
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddPropertyModalOpen(true)}
                    className="h-8.5 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted font-medium"
                    title="Register a new commercial landmark or building"
                  >
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>Add Property</span>
                  </Button>
                )}

                {/* 4. Bulk Allocate (X Vacant) */}
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkAllocateOpen(true)}
                    className="h-8.5 text-xs flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5 shadow-xs font-medium"
                    title="Bulk allocate multiple vacant units in this property"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bulk Allocate ({vacantCount} Vacant)</span>
                  </Button>
                )}

                {/* 5. Edit Landmark */}
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEditLandmark}
                    className="h-8.5 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted font-medium"
                    title="Edit landmark name, commercial code, and address"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Landmark</span>
                  </Button>
                )}

                {/* 6. Diesel CAM */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/infrastructure')}
                  className="h-8.5 text-xs flex items-center gap-1.5 bg-background shadow-xs hover:bg-muted text-amber-700 dark:text-amber-400 border-amber-500/40 font-medium"
                  title="Apportion diesel generator backup fuel expenses across occupied suites"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Diesel CAM</span>
                </Button>

                {/* 7. Add Space */}
                {canManage && (
                  <Button
                    size="sm"
                    onClick={() => setIsAddSpaceModalOpen(true)}
                    className="h-8.5 text-xs bg-primary text-primary-foreground flex items-center gap-1.5 shadow-xs font-medium"
                    title="Add new commercial space or unit (Rooms 100-500)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Space</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Executive Portfolio Metrics & Infrastructure Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3 border-t border-border/60">
            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-emerald-700/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                Fully Paid
              </span>
              <div className="text-xl font-bold font-serif text-emerald-300">
                {fullyPaidCount}
              </div>
              <span className="text-[10px] text-emerald-400/80 block">
                Target Cleared
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-rose-700/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                Overdue Arrears
              </span>
              <div className="text-xl font-bold font-serif text-rose-300">
                {overdueCount}
              </div>
              <span className="text-[10px] text-rose-400/80 block">
                Rent Shortfalls
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                Vacant Leasable
              </span>
              <div className="text-xl font-bold font-serif text-slate-200">
                {vacantCount}
              </div>
              <span className="text-[10px] text-slate-400 block">
                Ready for Lease
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-sky-700/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">
                Total Spaces
              </span>
              <div className="text-xl font-bold font-serif text-sky-200">
                {totalSpacesCount}
              </div>
              <span className="text-[10px] text-sky-400/80 block">
                {activeProperty?.floorsCount} Floors
              </span>
            </div>

            {/* Infrastructure Specs */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Zap className="w-3 h-3 text-rose-400 shrink-0" /> Generator Plant
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {activeProperty?.generatorCapacityKVA} KVA
              </div>
              <span className="text-[10px] text-muted-foreground block">Heavy Diesel</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Sun className="w-3 h-3 text-amber-400 shrink-0" /> Solar Microgrid
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {activeProperty?.solarCapacityKVA} KVA
              </div>
              <span className="text-[10px] text-muted-foreground block">Rooftop PV</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Droplet className="w-3 h-3 text-sky-400 shrink-0" /> Water Supply
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {activeProperty?.boreholeEquipped ? 'Borehole & Tanks' : 'Municipal Only'}
              </div>
              <span className="text-[10px] text-muted-foreground block">
                1 USD = {rbzExchangeRate} ZiG
              </span>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH SPACES TABLET THUMBNAIL GRID */}
        <section className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <span>{activeProperty?.name} Commercial Space Directory</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {propertySpaces.length} Units Total
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Expansive full-width tablet thumbnail rack with embedded quick actions: Pro-forma Invoice, WhatsApp Notice, Rent Ledger, and Lease Terms.
              </p>
            </div>

            {canManage && propertySpaces.length > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(spaceId) => {
                    const sp = propertySpaces.find(s => s.id === spaceId);
                    if (sp) handleOpenEditSpace(sp);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-[200px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Edit className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Quick Edit Space..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {propertySpaces.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id} className="text-xs">
                        {sp.unitPrefix || sp.type} {sp.unitNumber} • {sp.customName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Expansive Full-Width Tablet Thumbnail Space Rack Grid */}
          <SpaceRackGrid
            propertyIdFilter={activeProperty?.id}
            onSelectSpace={(sp) => setSelectedSpaceForLedger(sp)}
            onOpenLeaseTerms={(sp) => setSelectedSpaceForLeaseTerms(sp)}
            onAllocate={(sp) => setSelectedSpaceForAllocation(sp)}
            onVacate={(sp) => setSpaceToVacate(sp)}
            onGenerateInvoice={(sp) => handleGenerateInvoice(sp)}
            showFilters={true}
            variant="tablet"
          />
        </section>
      </main>

      {/* Space Ledger Modal with In-Page Unit Switching */}
      {selectedSpaceForLedger && (
        <SpaceLedgerModal
          space={selectedSpaceForLedger}
          isOpen={!!selectedSpaceForLedger}
          onClose={() => setSelectedSpaceForLedger(null)}
          allSpaces={propertySpaces}
          onNavigateSpace={(sp) => setSelectedSpaceForLedger(sp)}
        />
      )}

      {/* Single Space Allocation Modal */}
      {selectedSpaceForAllocation && (
        <AllocateTenantModal
          space={selectedSpaceForAllocation}
          isOpen={!!selectedSpaceForAllocation}
          onClose={() => setSelectedSpaceForAllocation(null)}
        />
      )}

      {/* Bulk Allocation Wizard Modal */}
      {activeProperty && (
        <BulkAllocateModal
          property={activeProperty}
          isOpen={isBulkAllocateOpen}
          onClose={() => setIsBulkAllocateOpen(false)}
        />
      )}

      {/* Lease Terms & Annual Escalation Modal */}
      {selectedSpaceForLeaseTerms && (
        <LeaseTermsModal
          space={selectedSpaceForLeaseTerms}
          isOpen={!!selectedSpaceForLeaseTerms}
          onClose={() => setSelectedSpaceForLeaseTerms(null)}
        />
      )}

      {/* Vacate Confirmation Dialog */}
      <AlertDialog open={!!spaceToVacate} onOpenChange={(open) => !open && setSpaceToVacate(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Vacate {spaceToVacate?.unitPrefix || spaceToVacate?.type} {spaceToVacate?.unitNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will unlink commercial tenant <strong>{spaceToVacate?.currentTenantName}</strong>, mark the unit as vacant leasable, and terminate the active commercial lease.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVacate}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Vacate Space
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Property Modal */}
      <Dialog open={isAddPropertyModalOpen} onOpenChange={setIsAddPropertyModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleCreateProperty}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Add Commercial Property</DialogTitle>
              <DialogDescription className="text-xs">
                Register a new commercial asset with floor counts and backup infrastructure.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Property Name *</Label>
                  <Input
                    placeholder="e.g. Sam Levy's Village"
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Identifier Code *</Label>
                  <Input
                    placeholder="e.g. SLV"
                    value={propCode}
                    onChange={(e) => setPropCode(e.target.value)}
                    className="h-8 text-xs uppercase font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Asset Type</Label>
                  <Select value={propType} onValueChange={(v) => setPropType(v as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shopping Mall">Shopping Mall</SelectItem>
                      <SelectItem value="Story Building">Story Building / High-Rise</SelectItem>
                      <SelectItem value="Commercial Plaza">Commercial Plaza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number of Floors</Label>
                  <Input
                    type="number"
                    value={propFloors}
                    onChange={(e) => setPropFloors(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Physical Address</Label>
                <Input
                  placeholder="e.g. Borrowdale Road, Harare"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Generator (KVA)</Label>
                  <Input
                    type="number"
                    value={propGenKVA}
                    onChange={(e) => setPropGenKVA(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Solar Microgrid (KVA)</Label>
                  <Input
                    type="number"
                    value={propSolarKVA}
                    onChange={(e) => setPropSolarKVA(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPropertyModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Create Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Unit Modal */}
      <Dialog open={isAddSpaceModalOpen} onOpenChange={setIsAddSpaceModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSpace}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Add Commercial Space (Rooms 100-500)</DialogTitle>
              <DialogDescription className="text-xs">
                Configure room prefix, unit number (100–500), technical specifications, and floor assignments up to Level 25.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              {/* Ground Floor Quick Select Dropdown */}
              <div className="p-2.5 rounded-lg border border-sky-500/30 bg-sky-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Ground Floor Shop Quick Select (GF-01 to GF-10)
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">Auto-fill Ground Floor</span>
                </div>
                <Select value={spaceGfQuickSelect} onValueChange={handleGfSelect}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Select Ground Floor Shop (GF-01 to GF-10)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Custom / Non-GF Room --</SelectItem>
                    <SelectItem value="1">GF-01 (Shop 101 - Primary Entrance Frontage)</SelectItem>
                    <SelectItem value="2">GF-02 (Shop 102 - Concourse West Wing)</SelectItem>
                    <SelectItem value="3">GF-03 (Shop 103 - Main Atrium Corner)</SelectItem>
                    <SelectItem value="4">GF-04 (Shop 104 - Concourse Central)</SelectItem>
                    <SelectItem value="5">GF-05 (Shop 105 - Financial Services Arcade)</SelectItem>
                    <SelectItem value="6">GF-06 (Shop 106 - Food Court Walkway)</SelectItem>
                    <SelectItem value="7">GF-07 (Shop 107 - East Promenade)</SelectItem>
                    <SelectItem value="8">GF-08 (Shop 108 - Pharmacy & Wellness Bay)</SelectItem>
                    <SelectItem value="9">GF-09 (Shop 109 - South Corridor)</SelectItem>
                    <SelectItem value="10">GF-10 (Shop 110 - Anchor Secondary Frontage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prefix, Unit Number (Rooms 100-500), Category */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Prefix</Label>
                  <Select value={spacePrefix} onValueChange={(v) => setSpacePrefix(v as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shop">Shop</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                      <SelectItem value="Food Court">Food Court</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Kiosk">Kiosk</SelectItem>
                      <SelectItem value="Bay">Bay</SelectItem>
                      <SelectItem value="Stall">Stall</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rooms 100-500 *</Label>
                  <Input
                    placeholder="e.g. 101, 204"
                    value={spaceUnitNum}
                    onChange={(e) => setSpaceUnitNum(e.target.value)}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={spaceType} onValueChange={(v) => setSpaceType(v as SpaceType)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Food">Food / Food Court</SelectItem>
                      <SelectItem value="Medical">Medical / Pharmacy</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Kiosk">Kiosk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Custom Unit / Space Name</Label>
                <Input
                  placeholder="e.g. Anchor Retail Wing or Corner Suite"
                  value={spaceCustomName}
                  onChange={(e) => setSpaceCustomName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Floor Assignment (Ground Floor to Level 25) & SQM */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Floor Assignment (GF to Level 25)</Label>
                  <Select value={spaceFloor} onValueChange={setSpaceFloor}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {EXPANDED_OFFICE_FLOORS.map((flr) => (
                        <SelectItem key={flr} value={flr}>
                          {flr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Floor Area (SQM)</Label>
                  <Input
                    type="number"
                    value={spaceSizeSqm}
                    onChange={(e) => setSpaceSizeSqm(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Base Rent & CAM */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Base Monthly Rent (USD)</Label>
                  <Input
                    type="number"
                    value={spaceBaseRentUSD}
                    onChange={(e) => setSpaceBaseRentUSD(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CAM Fee (USD)</Label>
                  <Input
                    type="number"
                    value={spaceCamUSD}
                    onChange={(e) => setSpaceCamUSD(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Technical Specifications & Utilities
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Power Rating</Label>
                    <Select value={spacePowerRating} onValueChange={setSpacePowerRating}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Three-Phase 100A">Three-Phase 100A (Commercial)</SelectItem>
                        <SelectItem value="Three-Phase 60A">Three-Phase 60A (Standard)</SelectItem>
                        <SelectItem value="Single-Phase 60A">Single-Phase 60A (Light)</SelectItem>
                        <SelectItem value="Generator Line Dedicated">Generator Line Dedicated</SelectItem>
                        <SelectItem value="Solar Hybrid Ready">Solar Hybrid Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">HVAC / Cooling Type</Label>
                    <Select value={spaceHvacType} onValueChange={setSpaceHvacType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Central HVAC Ducted">Central HVAC Ducted</SelectItem>
                        <SelectItem value="Split AC Installed">Split AC Installed</SelectItem>
                        <SelectItem value="Natural Ventilation Louvres">Natural Ventilation Louvres</SelectItem>
                        <SelectItem value="Dedicated Exhaust Riser">Dedicated Exhaust Riser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Frontage (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={spaceFrontageM}
                      onChange={(e) => setSpaceFrontageM(e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. 6.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ceiling Ht (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={spaceCeilingM}
                      onChange={(e) => setSpaceCeilingM(e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. 3.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Parking Bays</Label>
                    <Input
                      type="number"
                      value={spaceParkingBays}
                      onChange={(e) => setSpaceParkingBays(e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="greaseTrap"
                    checked={spaceGreaseTrap}
                    onChange={(e) => setSpaceGreaseTrap(e.target.checked)}
                    className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor="greaseTrap" className="text-xs font-medium cursor-pointer text-foreground">
                    Grease Trap Compliant (Required for Food Court, Cafe & Pharmacy)
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSpaceModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Create Commercial Space
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Space Modal */}
      <Dialog open={isEditSpaceModalOpen} onOpenChange={setIsEditSpaceModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleUpdateSpace}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">
                Edit {editingSpace?.unitPrefix || editingSpace?.type} {editingSpace?.unitNumber}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Adjust space details, base monthly rent, and CAM fees.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Space Custom Name</Label>
                <Input
                  value={editCustomName}
                  onChange={(e) => setEditCustomName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Floor Level</Label>
                  <Select value={editFloor} onValueChange={setEditFloor}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {EXPANDED_OFFICE_FLOORS.map((flr) => (
                        <SelectItem key={flr} value={flr}>
                          {flr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Floor Area (SQM)</Label>
                  <Input
                    type="number"
                    value={editSizeSqm}
                    onChange={(e) => setEditSizeSqm(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Base Rent (USD)</Label>
                  <Input
                    type="number"
                    value={editBaseRentUSD}
                    onChange={(e) => setEditBaseRentUSD(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CAM Fee (USD)</Label>
                  <Input
                    type="number"
                    value={editCamUSD}
                    onChange={(e) => setEditCamUSD(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editingSpace) {
                    setSpaceToDelete(editingSpace);
                  }
                }}
                className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Space
              </Button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditSpaceModalOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Commercial Property Alert Dialog */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Delete Property "{propertyToDelete?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this commercial landmark ({propertyToDelete?.code})? All associated spaces and historical records will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteProperty}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Space Alert Dialog */}
      <AlertDialog open={!!spaceToDelete} onOpenChange={(open) => !open && setSpaceToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Delete Unit {spaceToDelete?.unitNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete {spaceToDelete?.unitPrefix || spaceToDelete?.type} {spaceToDelete?.unitNumber} ({spaceToDelete?.customName || 'Commercial Space'})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSpace}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete Space
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Landmark Modal */}
      <Dialog open={isEditLandmarkOpen} onOpenChange={setIsEditLandmarkOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleSaveLandmark}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Edit Commercial Landmark Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update building name, identifier code, and street location for {activeProperty?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label className="text-xs">Landmark / Building Name *</Label>
                <Input
                  value={editLandmarkName}
                  onChange={(e) => setEditLandmarkName(e.target.value)}
                  className="h-8 text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Property Code</Label>
                  <Input
                    value={editLandmarkCode}
                    onChange={(e) => setEditLandmarkCode(e.target.value)}
                    className="h-8 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number of Floors</Label>
                  <Input
                    type="number"
                    value={editLandmarkFloors}
                    onChange={(e) => setEditLandmarkFloors(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Physical Address / Corridor</Label>
                <Input
                  value={editLandmarkAddress}
                  onChange={(e) => setEditLandmarkAddress(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditLandmarkOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
                Update Landmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Commercial Floor Statements Modal */}
      <BulkFloorStatementsModal
        isOpen={isBulkFloorStatementsOpen}
        onClose={() => setIsBulkFloorStatementsOpen(false)}
        property={activeProperty}
      />

      <Footer />
    </div>
  );
};
