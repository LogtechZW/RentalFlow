import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { PropertyPortfolio, Space } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SpaceLedgerModal } from '@/components/common/SpaceLedgerModal';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Store,
  Layers,
  Link2,
  SquarePen,
  CreditCard,
  MapPin,
  User,
  Building2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { INITIAL_PORTFOLIOS } from '@/services/mockData';

export const PortfoliosPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    portfolios,
    properties,
    spaces,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    autoLinkProperties,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [activeZone, setActiveZone] = useState<'all' | 'cbd' | 'suburban'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PropertyPortfolio | null>(null);
  const [portfolioToDelete, setPortfolioToDelete] = useState<PropertyPortfolio | null>(null);
  const [inspectingPortfolio, setInspectingPortfolio] = useState<PropertyPortfolio | null>(null);

  // Space Ledger & Payment modal states
  const [selectedSpaceForLedger, setSelectedSpaceForLedger] = useState<Space | null>(null);
  const [portfolioForPayment, setPortfolioForPayment] = useState<PropertyPortfolio | null>(null);
  const [isSpaceSelectorOpen, setIsSpaceSelectorOpen] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'Shopping Malls' | 'Story Buildings' | 'Commercial Plazas'>('Story Buildings');
  const [location, setLocation] = useState<string>('Central Business District');
  const [ownerName, setOwnerName] = useState<string>('Tinashe Chikwanha');
  const [profitShareRatio, setProfitShareRatio] = useState<string>('100');
  const [description, setDescription] = useState<string>('Commercial real estate portfolio in Metropolitan Commercial Center.');
  const [image, setImage] = useState<string>('https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1200&q=80');

  const canEdit = ['Property Owner', 'Property Manager', 'Administrator'].includes(activeRole);

  // Filter portfolios by zone safely (avoid string missing bugs and handle all location types)
  const filteredPortfolios = portfolios.filter(p => {
    if (!p) return false;
    const loc = (p.location || '').toLowerCase();
    const zone = (p.locationZone || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    if (activeZone === 'cbd') {
      return loc.includes('cbd') || loc.includes('central') || zone === 'cbd' || pName.includes('cbd');
    }
    if (activeZone === 'suburban') {
      return loc.includes('suburban') || loc.includes('eastlea') || loc.includes('borrowdale') || zone === 'suburban';
    }
    return true;
  });

  const cbdCount = portfolios.filter(p => {
    if (!p) return false;
    const loc = (p.location || '').toLowerCase();
    const zone = (p.locationZone || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    return loc.includes('cbd') || loc.includes('central') || zone === 'cbd' || pName.includes('cbd');
  }).length;

  const suburbanCount = portfolios.filter(p => {
    if (!p) return false;
    const loc = (p.location || '').toLowerCase();
    const zone = (p.locationZone || '').toLowerCase();
    return loc.includes('suburban') || loc.includes('eastlea') || loc.includes('borrowdale') || zone === 'suburban';
  }).length;

  // Global KPIs calculation matching commercialpropertypotfolios.png
  const totalTargetRentUSD = spaces.reduce((acc, s) => acc + (s.targetRentUSD || s.baseRentUSD || 0), 0);
  const totalPaidToDateUSD = spaces.reduce((acc, s) => acc + (s.paidThisMonthUSD || 0), 0);
  const totalArrearsUSD = spaces.reduce((acc, s) => acc + (s.rentalAccumulationUSD || 0), 0);
  const overallCollectionRate = totalTargetRentUSD > 0 ? Math.min(100, Math.round((totalPaidToDateUSD / totalTargetRentUSD) * 100)) : 0;
  const totalBuildingsCount = properties.length;
  const overdueSpacesCount = spaces.filter(s => (s.rentalAccumulationUSD || 0) > 0).length;

  const handleOpenAdd = () => {
    setEditingPortfolio(null);
    setName('');
    setType('Story Buildings');
    setLocation('Central Business District');
    setOwnerName('Tinashe Chikwanha');
    setProfitShareRatio('100');
    setDescription('Commercial real estate portfolio in Metropolitan Commercial Center.');
    setImage('https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1200&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PropertyPortfolio) => {
    setEditingPortfolio(p);
    setName(p.name);
    setType(p.type);
    setLocation(p.location);
    setOwnerName(p.ownerName);
    setProfitShareRatio(p.profitShareRatio.toString());
    setDescription(p.description);
    setImage(p.image);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a portfolio name.');
      return;
    }

    const ratio = parseFloat(profitShareRatio) || 100;

    if (editingPortfolio) {
      updatePortfolio(editingPortfolio.id, {
        name,
        type,
        location,
        ownerName,
        profitShareRatio: ratio,
        description,
        image,
      });
      toast.success(`Portfolio "${name}" updated!`);
    } else {
      addPortfolio({
        name,
        type,
        location,
        ownerId: 'owner-default',
        ownerName,
        profitShareRatio: ratio,
        description,
        image,
        totalProperties: 1,
        occupancyRate: 90,
      });
      toast.success(`New Portfolio "${name}" created!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (portfolio: PropertyPortfolio) => {
    setPortfolioToDelete(portfolio);
  };

  const handleConfirmDelete = () => {
    if (portfolioToDelete) {
      deletePortfolio(portfolioToDelete.id);
      toast.success(`Portfolio "${portfolioToDelete.name}" deleted successfully.`);
      if (inspectingPortfolio?.id === portfolioToDelete.id) {
        setInspectingPortfolio(null);
      }
      setPortfolioToDelete(null);
    }
  };

  const handleDeleteAll = () => {
    if (portfolios.length === 0) {
      toast.info('No portfolios to delete.');
      return;
    }
    if (window.confirm('Are you sure you want to delete all portfolios? This will remove portfolio groupings.')) {
      portfolios.forEach(p => deletePortfolio(p.id));
      setInspectingPortfolio(null);
      toast.success('All portfolios have been removed.');
    }
  };

  // In-page inspection switching logic
  const inspectingIndex = inspectingPortfolio ? portfolios.findIndex(p => p.id === inspectingPortfolio.id) : -1;
  const hasPrevInspecting = inspectingIndex > 0;
  const hasNextInspecting = inspectingIndex >= 0 && inspectingIndex < portfolios.length - 1;

  const handlePrevInspecting = () => {
    if (hasPrevInspecting) {
      setInspectingPortfolio(portfolios[inspectingIndex - 1]);
    }
  };

  const handleNextInspecting = () => {
    if (hasNextInspecting) {
      setInspectingPortfolio(portfolios[inspectingIndex + 1]);
    }
  };

  const handleRecordPaymentForPortfolio = (portfolio: PropertyPortfolio) => {
    const propsInPort = properties.filter(
      p => p.portfolioId === portfolio.id || (portfolio.propertyIds && portfolio.propertyIds.includes(p.id))
    );
    const propIds = propsInPort.map(p => p.id);
    const spacesInPort = spaces.filter(s => propIds.includes(s.propertyId));

    if (spacesInPort.length === 0) {
      toast.error(`No spaces found in ${portfolio.name}. Please link properties first.`);
      return;
    }

    if (spacesInPort.length === 1) {
      setSelectedSpaceForLedger(spacesInPort[0]);
    } else {
      setPortfolioForPayment(portfolio);
      setIsSpaceSelectorOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Portfolios' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Section matching commercialpropertypotfolios.png with Return / Move Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/apps')}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 -ml-2"
                title="Return to Apps & Modules Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Apps Hub</span>
              </Button>
              <div className="h-4 w-px bg-border/60" />
              <Layers className="w-5 h-5 text-blue-500" />
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
                Commercial Property Portfolios
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Group, organize, and monitor Shopping malls, multi-storey corporate towers, and commercial plazas.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                autoLinkProperties();
                toast.success('Commercial buildings successfully auto-linked to portfolios!');
              }}
              className="h-8.5 px-3 text-xs flex items-center gap-1.5 border-slate-300 dark:border-slate-700 bg-background hover:bg-muted font-normal shadow-2xs"
              title="Automatically link all unassigned properties into portfolios"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Auto-Link Buildings</span>
            </Button>

            {portfolios.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                className="h-8.5 px-3 text-xs flex items-center gap-1.5 border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-background font-normal shadow-2xs"
                title="Delete all portfolios"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete All</span>
              </Button>
            )}

            {canEdit && (
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="h-8.5 px-3.5 text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Portfolio</span>
              </Button>
            )}
          </div>
        </div>

        {/* 4 Summary KPI Cards matching commercialpropertypotfolios.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Portfolios Target Rent */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">PORTFOLIOS TARGET RENT</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-foreground">
                ${totalTargetRentUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Across {totalBuildingsCount} commercial buildings
              </p>
            </div>
          </div>

          {/* Card 2: Total Paid to Date */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">TOTAL PAID TO DATE</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-emerald-600">
                ${totalPaidToDateUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rate: {overallCollectionRate}% Collected
              </p>
            </div>
          </div>

          {/* Card 3: Portfolio Arrears */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">PORTFOLIO ARREARS</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-rose-600">
                ${totalArrearsUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {overdueSpacesCount} overdue spaces
              </p>
            </div>
          </div>

          {/* Card 4: Collection Efficiency */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">COLLECTION EFFICIENCY</span>
              <Store className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-foreground">
                {overallCollectionRate}%
              </div>
              <div className="w-full bg-blue-100 dark:bg-blue-950/60 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, overallCollectionRate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Region / Zone Filter Bar matching commercialpropertypotfolios.png */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-medium mr-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Region / Zone:</span>
            </span>

            <Button
              type="button"
              size="sm"
              onClick={() => setActiveZone('all')}
              className={`h-7 px-3 text-xs rounded-lg font-medium transition-colors ${
                activeZone === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-background hover:bg-muted text-foreground border border-border/80'
              }`}
            >
              All Portfolios <span className="ml-1 px-1.5 py-0.2 rounded bg-black/10 text-[10px]">{portfolios.length}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setActiveZone('cbd')}
              className={`h-7 px-3 text-xs rounded-lg font-medium transition-colors ${
                activeZone === 'cbd'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-background hover:bg-muted text-foreground border border-border/80'
              }`}
            >
              🏙️ Central Business District <span className="ml-1 px-1.5 py-0.2 rounded bg-black/10 text-[10px]">{cbdCount}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setActiveZone('suburban')}
              className={`h-7 px-3 text-xs rounded-lg font-medium transition-colors ${
                activeZone === 'suburban'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-background hover:bg-muted text-foreground border border-border/80'
              }`}
            >
              🏡 Suburban Centres <span className="ml-1 px-1.5 py-0.2 rounded bg-black/10 text-[10px]">{suburbanCount}</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Showing {filteredPortfolios.length} of {portfolios.length} portfolios
          </div>
        </div>

        {/* Portfolios Cards Grid with Quiet Couture styling and robust fallbacks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPortfolios.length === 0 ? (
            <div className="col-span-full p-8 rounded-xl bg-card border border-border/80 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              {portfolios.length > 0 ? (
                <>
                  <h3 className="text-base font-serif font-bold text-foreground">
                    No Portfolios Matching Zone "{activeZone.toUpperCase()}"
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    You have {portfolios.length} commercial portfolio(s) configured in your workspace, but none match the current zone filter.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveZone('all')}
                    className="h-8.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Reset Filter (Show All {portfolios.length} Portfolios)
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-base font-serif font-bold text-foreground">
                    No Commercial Portfolios Configured
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Group commercial shopping malls, story centers, and plazas into managed portfolios with dual-currency performance reporting.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        INITIAL_PORTFOLIOS.forEach(p => addPortfolio(p));
                        toast.success('Loaded demonstration commercial portfolios!');
                      }}
                      className="h-8.5 px-3.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Load 3 Demo Portfolios
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAdd}
                      className="h-8.5 px-3 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Create Custom Portfolio
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            filteredPortfolios.map((portfolio) => {
              const propsInPort = properties.filter(
                p => p.portfolioId === portfolio.id || (portfolio.propertyIds && portfolio.propertyIds.includes(p.id))
              );
              const propIds = propsInPort.map(p => p.id);
              const spacesInPort = spaces.filter(s => propIds.includes(s.propertyId));

              const totalSpaces = spacesInPort.length;
              const occupiedSpaces = spacesInPort.filter(s => s.status === 'Occupied' || s.status === 'Overdue').length;
              const occupancyPercent = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;
              const monthlyTargetUSD = spacesInPort.reduce((acc, s) => acc + (s.targetRentUSD || s.baseRentUSD || 0), 0);
              const accumulatedPaidUSD = spacesInPort.reduce((acc, s) => acc + (s.paidThisMonthUSD || 0), 0);
              const collectionRate = monthlyTargetUSD > 0 ? Math.min(100, Math.round((accumulatedPaidUSD / monthlyTargetUSD) * 100)) : 0;
              const outstandingArrearsUSD = spacesInPort.reduce((acc, s) => acc + (s.rentalAccumulationUSD || 0), 0);

              return (
                <div
                  key={portfolio.id}
                  className="bg-[#101C40]/55 border border-white/[0.08] backdrop-blur-[24px] rounded-[6px] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  {/* Top Tags & Action Icons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal text-slate-200 bg-slate-900/90 border-slate-700 rounded-md px-2.5 py-0.5"
                        >
                          {portfolio.type || 'Story Building'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal text-amber-300 bg-amber-950/70 border-amber-800 rounded-md px-2.5 py-0.5"
                        >
                          🏙️ {portfolio.location || 'Central Business District'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectingPortfolio(portfolio)}
                          className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted transition-colors"
                          title="Inspect Portfolio with Next/Prev Switcher"
                        >
                          <Eye className="w-4 h-4 text-sky-400" />
                        </button>

                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(portfolio)}
                              className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit Portfolio"
                            >
                              <SquarePen className="w-4 h-4 text-emerald-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(portfolio)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Portfolio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-foreground tracking-tight">
                        {portfolio.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {portfolio.description || 'Commercial real estate portfolio in Metropolitan Commercial Center.'}
                      </p>
                    </div>
                  </div>

                  {/* Inner Metrics Container */}
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-lg p-3.5 space-y-2.5 text-xs">
                    {/* Row 1: Properties & Occupancy */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-mono block uppercase">PROPERTIES</span>
                        <span className="font-bold text-xs text-foreground font-serif">{propsInPort.length} Buildings</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-mono block uppercase">OCCUPANCY</span>
                        <span className="font-bold text-xs text-emerald-600">
                          {occupancyPercent}% ({occupiedSpaces}/{totalSpaces})
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Monthly Target & Accumulated Paid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-mono block uppercase">MONTHLY TARGET</span>
                        <span className="font-bold text-xs text-foreground font-mono">
                          ${monthlyTargetUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-mono block uppercase">ACCUMULATED PAID</span>
                        <span className="font-bold text-xs text-blue-600 font-mono">
                          ${accumulatedPaidUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Collection Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Portfolio Collection Rate:</span>
                        <span className="font-semibold text-foreground">{collectionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, collectionRate)}%` }}
                        />
                      </div>
                    </div>

                    {/* Row 4: Outstanding Arrears */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                      <span className="text-muted-foreground">Outstanding Arrears:</span>
                      <span className="font-bold text-rose-600 font-mono">
                        ${outstandingArrearsUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Commercial Assets Pill Tags */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Assigned Commercial Assets:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {propsInPort.length > 0 ? (
                        propsInPort.map(prop => (
                          <span
                            key={prop.id}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-2.5 py-0.5 text-xs font-mono border border-slate-200 dark:border-slate-700"
                          >
                            {prop.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None assigned (click Auto-Link)</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer matching commercialpropertypotfolios.png */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{portfolio.ownerName || 'Tinashe Chikwanha'}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRecordPaymentForPortfolio(portfolio)}
                        className="h-8 px-2.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium flex items-center gap-1 shadow-2xs"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        <span>Record Payment</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/properties?portfolioId=${portfolio.id}`)}
                        className="h-8 px-2.5 text-xs border-slate-300 dark:border-slate-700 hover:bg-muted font-normal flex items-center gap-1.5 shadow-2xs"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Space Rack</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* IN-PAGE PORTFOLIO INSPECTION MODAL WITH NEXT / PREV SWITCHING */}
        {inspectingPortfolio && (
          <Dialog open={!!inspectingPortfolio} onOpenChange={(open) => !open && setInspectingPortfolio(null)}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[88vh] overflow-y-auto">
              <DialogHeader className="space-y-2 border-b border-border/60 pb-3">
                {/* In-page Previous / Next Entity Switcher Bar */}
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasPrevInspecting}
                    onClick={handlePrevInspecting}
                    className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Portfolio</span>
                  </Button>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    Portfolio {inspectingIndex + 1} of {portfolios.length}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasNextInspecting}
                    onClick={handleNextInspecting}
                    className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <span>Next Portfolio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-sky-500" />
                      <span>{inspectingPortfolio.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {inspectingPortfolio.type} • {inspectingPortfolio.location} • Owner: {inspectingPortfolio.ownerName}
                    </DialogDescription>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleOpenEdit(inspectingPortfolio);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <SquarePen className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleDelete(inspectingPortfolio);
                        }}
                        className="h-7 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* Inspection Body */}
              <div className="space-y-4 py-2 text-xs">
                <p className="text-muted-foreground">
                  {inspectingPortfolio.description || 'No description provided.'}
                </p>

                {/* Linked Properties */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary" />
                      Assigned Commercial Assets
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/properties?portfolioId=${inspectingPortfolio.id}`)}
                      className="h-7 text-xs text-primary"
                    >
                      Open in Space Rack &rarr;
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {properties
                      .filter(p => p.portfolioId === inspectingPortfolio.id || (inspectingPortfolio.propertyIds && inspectingPortfolio.propertyIds.includes(p.id)))
                      .map(prop => (
                        <div key={prop.id} className="p-2.5 rounded-lg border border-border bg-card/60 space-y-1">
                          <div className="font-bold text-foreground text-xs">{prop.name} ({prop.code})</div>
                          <div className="text-[11px] text-muted-foreground">{prop.type} • {prop.address}</div>
                          <div className="text-[10px] text-sky-400 font-mono">
                            {spaces.filter(s => s.propertyId === prop.id).length} Commercial Units
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectingPortfolio(null)}
                  className="h-8 text-xs"
                >
                  Close Inspection
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRecordPaymentForPortfolio(inspectingPortfolio)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Record Portfolio Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* DELETE CONFIRMATION ALERT DIALOG */}
        <AlertDialog open={!!portfolioToDelete} onOpenChange={(open) => !open && setPortfolioToDelete(null)}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-serif">
                Delete Portfolio "{portfolioToDelete?.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                This will delete the commercial portfolio grouping. Underlying buildings and tenant leases will remain intact and can be reassigned to other portfolios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Space Selector Dialog for Recording Portfolio Payments */}
        <Dialog open={isSpaceSelectorOpen} onOpenChange={setIsSpaceSelectorOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-serif font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Select Commercial Space to Record Payment</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select a shop, office, or kiosk within {portfolioForPayment?.name} to open the interactive Space Payment Ledger.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {portfolioForPayment && (() => {
                const propsInPort = properties.filter(
                  p => p.portfolioId === portfolioForPayment.id || (portfolioForPayment.propertyIds && portfolioForPayment.propertyIds.includes(p.id))
                );
                const propIds = propsInPort.map(p => p.id);
                const spacesInPort = spaces.filter(s => propIds.includes(s.propertyId));

                return (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {spacesInPort.map(space => {
                      const prop = properties.find(p => p.id === space.propertyId);
                      const isOverdue = space.rentalAccumulationUSD > 0 || space.status === 'Overdue';

                      return (
                        <div
                          key={space.id}
                          onClick={() => {
                            setSelectedSpaceForLedger(space);
                            setIsSpaceSelectorOpen(false);
                          }}
                          className="p-3 rounded-lg border border-border bg-card hover:bg-muted/70 cursor-pointer flex items-center justify-between transition-colors shadow-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground">
                                {space.unitPrefix || 'Unit'} {space.unitNumber} - {space.customName}
                              </span>
                              <Badge variant={isOverdue ? 'destructive' : space.status === 'Occupied' ? 'default' : 'secondary'} className="text-[10px]">
                                {space.status}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {prop?.name} • Tenant: {space.currentTenantName || 'Unassigned'} • Floor: {space.floor}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-xs block text-foreground">
                              ${space.baseRentUSD.toLocaleString()} USD
                            </span>
                            {space.rentalAccumulationUSD > 0 ? (
                              <span className="text-[10px] text-rose-600 font-mono block">
                                Arrears: ${space.rentalAccumulationUSD.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 block">Current</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsSpaceSelectorOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Space Payment Ledger Modal */}
        <SpaceLedgerModal
          space={selectedSpaceForLedger}
          isOpen={!!selectedSpaceForLedger}
          onClose={() => setSelectedSpaceForLedger(null)}
        />
      </main>

      {/* Add / Edit Portfolio Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">
                {editingPortfolio ? 'Edit Portfolio' : 'Add Commercial Portfolio'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define commercial property holding group, location, and owner profit-sharing ratio.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Portfolio Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harare CBD Retail Holdings"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Holding Category</Label>
                  <Select value={type} onValueChange={(val) => setType(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shopping Malls">Shopping Malls</SelectItem>
                      <SelectItem value="Story Buildings">Story Buildings</SelectItem>
                      <SelectItem value="Commercial Plazas">Commercial Plazas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Profit Share Ratio (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={profitShareRatio}
                    onChange={(e) => setProfitShareRatio(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Location Corridor</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Harare CBD / Borrowdale"
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Beneficial Owner</Label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                  placeholder="Portfolio summary and commercial strategy..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                {editingPortfolio ? 'Update Portfolio' : 'Create Portfolio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
