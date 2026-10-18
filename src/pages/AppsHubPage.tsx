import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { SYSTEM_MODULES, type SystemModuleConfig } from '@/services/mockData';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AppFlowProLauncher } from '@/components/common/AppFlowProLauncher';
import { QuickActionDock } from '@/components/common/QuickActionDock';
import { BatchInvoiceModal } from '@/components/common/BatchInvoiceModal';
import { ThumbnailUploadModal } from '@/components/common/ThumbnailUploadModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Camera,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Rocket,
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  FileSignature,
  ReceiptText,
  CreditCard,
  TrendingUp,
  Wrench,
  Zap,
  BarChart3,
  Network,
  FolderArchive,
  Info,
  Settings,
  MessageSquare,
  Layers,
  Search,
  X,
  Tag,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  FileSignature,
  ReceiptText,
  CreditCard,
  TrendingUp,
  Wrench,
  Zap,
  BarChart3,
  Network,
  FolderArchive,
  Info,
  Settings,
  MessageSquare,
  Gauge
};

export const AppsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    activeRole,
    moduleThumbnails,
    properties,
    spaces,
    tenants,
    invoices,
    payments,
    maintenanceTickets,
    documents,
    meterReadings,
    rbzExchangeRate
  } = useRentFlow();

  const [isBatchInvoiceOpen, setIsBatchInvoiceOpen] = useState<boolean>(false);
  const [selectedModuleForThumbnail, setSelectedModuleForThumbnail] = useState<SystemModuleConfig | null>(null);
  const [isLauncherDialogOpen, setIsLauncherDialogOpen] = useState<boolean>(false);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);

  // Check query parameters:
  // 1. launcher=open to automatically trigger AppFlowPro Dialog Overlay
  // 2. reorder=true to automatically toggle Reorder Mode
  useEffect(() => {
    if (searchParams.get('launcher') === 'open') {
      setIsLauncherDialogOpen(true);
    }
    if (searchParams.get('reorder') === 'true') {
      setIsReorderMode(true);
    }
  }, [searchParams]);

  // Role permissions: Manager and Administrator can customize thumbnails & layout
  const canCustomizeThumbnails = ['Property Manager', 'Administrator'].includes(activeRole);

  // Filter modules visible to active role
  const visibleModules = SYSTEM_MODULES.filter(mod => mod.allowedRoles.includes(activeRole));

  // Deep Sub-Feature Keyword Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default Sequence based on standard commercial property management workflow:
  // Executive Cockpit → Commercial Properties & Spaces → Tenant Directory & Ledger → Leases & Escalations
  // → Dual-Currency Invoicing → Payment Allocator → Infrastructure & CAM → Maintenance Tickets
  // → Sub-Meter Readings & Turnover Rent → Property Portfolios → Reports & Audits → Document Vault
  // → Gateways & Fiscalization → WhatsApp Reminders → System Settings → About
  const DEFAULT_COMMERCIAL_MODULE_ORDER = [
    'dashboard',
    'properties',
    'tenants',
    'leases',
    'invoices',
    'payments',
    'infrastructure',
    'meter-readings',
    'maintenance',
    'turnover-rent',
    'portfolios',
    'reports',
    'documents',
    'integrations',
    'whatsapp',
    'settings',
    'about'
  ];

  // Module Ordering State with Permanent Storage Key (rf_module_order)
  const [orderedModuleIds, setOrderedModuleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rf_module_order') || localStorage.getItem('rf_module_order_v1');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load module order:', e);
    }
    return DEFAULT_COMMERCIAL_MODULE_ORDER.filter(id => visibleModules.some(m => m.id === id));
  });

  // Sort visible modules based on orderedModuleIds
  const orderedModules = [...visibleModules].sort((a, b) => {
    const idxA = orderedModuleIds.indexOf(a.id);
    const idxB = orderedModuleIds.indexOf(b.id);
    const posA = idxA !== -1 ? idxA : 999;
    const posB = idxB !== -1 ? idxB : 999;
    return posA - posB;
  });

  // Sub-feature keyword registry for deep sub-feature queries
  const MODULE_SUB_FEATURES: Record<string, string[]> = {
    dashboard: ['executive cockpit', 'kpi', 'occupancy rate', 'collection efficiency', 'rack grid', 'hotel rack', 'portfolio summary', 'quick stats'],
    properties: ['spaces', 'commercial space', 'shop', 'office', 'rooms 100-500', 'food court', 'pharmacy', 'groundfloor shop 1-10', 'levels 1-25', 'rack grid', 'hvac', 'grease trap', 'square meters', 'sqm', 'retail bays'],
    tenants: ['tenant directory', 'trading brand', 'tenant ledger', 'statement', 'contact', 'arrears', 'occupant', 'kyc'],
    leases: ['escalation', 'lease agreement', 'annual escalation', 'break-clause', 'deposit', 'tenancy contract', 'notice period', 'rbz index'],
    invoices: ['tax invoice', 'receipt', 'zimra', 'fiscal', 'zig', 'usd', 'dual-currency', 'qr', 'billing', 'rent charge', 'cam fee', 'rbz rate'],
    payments: ['ecocash', 'nostro', 'fca', 'rtgs', 'cash', 'pop', 'proof of payment', 'receipt', 'payment allocator', 'bank transfer', 'usd cash'],
    infrastructure: ['diesel', 'generator', 'borehole', 'solar', 'cam', 'genset', 'fuel apportionment', 'backup power', 'load-shedding', 'submeter', 'meters'],
    'meter-readings': ['submeter', 'zetdc', '3-phase', 'kwh', 'water meter', 'cubic meters', 'tariff multiplier', 'utility reading', 'electricity check meter'],
    maintenance: ['ticket', 'workorder', 'hvac repair', 'electrical', 'plumbing', 'elevator', 'escalator', 'technician', 'emergency dispatch'],
    'turnover-rent': ['turnover', 'sales declaration', 'turnover rent', 'tenant audit', 'percentage lease', 'submeter', 'utility reading', 'water meter', 'power meter'],
    portfolios: ['portfolio', 'shopping mall', 'story building', 'plaza', 'asset allocation', 'owner', 'profit share'],
    reports: ['audit', 'financial statements', 'rent roll', 'cam reconciliation', 'turnover audit', 'arrears aging', 'consolidated report'],
    documents: ['vault', 'lease pdf', 'title deed', 'compliance certificate', 'fire inspection', 'insurance', 'kyc files'],
    integrations: ['gateways', 'rbz exchange rate', 'api', 'accounting export', 'sage', 'quickbooks', 'xero', 'mid-rate'],
    whatsapp: ['whatsapp', 'sms', 'notice', 'rent reminder', 'arrears dispatch', 'automated notifications', 'late fee notice'],
    settings: ['settings', 'corporate logo', 'roles', 'currency config', 'customization', 'branding'],
    about: ['version', 'release notes', 'architecture', 'system specifications']
  };

  // Filter modules based on search query (matching name, code, description, category, or sub-features)
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const displayedModules = orderedModules.filter(module => {
    if (!normalizedQuery) return true;
    const nameMatch = module.name.toLowerCase().includes(normalizedQuery);
    const codeMatch = module.code.toLowerCase().includes(normalizedQuery);
    const descMatch = module.description.toLowerCase().includes(normalizedQuery);
    const subFeatures = MODULE_SUB_FEATURES[module.id] || [];
    const subMatch = subFeatures.some(sf => sf.toLowerCase().includes(normalizedQuery));
    return nameMatch || codeMatch || descMatch || subMatch;
  });

  // Is custom ordering applied?
  const isCustomOrder = Boolean(localStorage.getItem('rf_module_order'));

  // Move card in sequence
  const moveCard = (index: number, direction: 'left' | 'right' | 'up' | 'down') => {
    let targetIndex = index;
    if (direction === 'left') targetIndex = index - 1;
    else if (direction === 'right') targetIndex = index + 1;
    else if (direction === 'up') targetIndex = index - 4; // Shift up 1 row in 4-col desktop grid
    else if (direction === 'down') targetIndex = index + 4; // Shift down 1 row in 4-col desktop grid

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= orderedModules.length) targetIndex = orderedModules.length - 1;
    if (targetIndex === index) return;

    const newModules = [...orderedModules];
    const [moved] = newModules.splice(index, 1);
    newModules.splice(targetIndex, 0, moved);

    const newIds = newModules.map(m => m.id);
    setOrderedModuleIds(newIds);
    localStorage.setItem('rf_module_order', JSON.stringify(newIds));
    toast.success(`Moved ${moved.name} ${direction}`);
  };

  // Reset ordering to default layout
  const resetOrder = () => {
    localStorage.removeItem('rf_module_order');
    localStorage.removeItem('rf_module_order_v1');
    const defaultIds = DEFAULT_COMMERCIAL_MODULE_ORDER.filter(id => visibleModules.some(m => m.id === id));
    setOrderedModuleIds(defaultIds);
    toast.info('Layout reset to commercial workflow default order');
  };

  // Quick stats
  const totalOccupied = spaces.filter(s => s.status === 'Occupied').length;
  const totalOverdue = spaces.filter(s => s.status === 'Overdue').length;

  // Auto-scroll handlers
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Navigation Header */}
      <Header isAppsHub={true} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24">
        {/* Hub Welcome Banner */}
        <div className="relative rounded-lg overflow-hidden border border-border/80 bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white text-[11px] font-mono border-white/20">
                  COMMERCIAL PORTFOLIO OPERATIONS HUB
                </Badge>
                <span className="text-xs text-white/80 font-mono">
                  1 USD = {rbzExchangeRate} ZiG
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                RentFlow Operations Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-200">
                Coordinated commercial retail, office suites, and multi-tenant property management across {properties.length} commercial assets.
              </p>
            </div>

            {/* Quick Metrics & Batch Invoice CTA */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-md p-3 text-left">
                <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">Occupied Units</div>
                <div className="text-xl font-bold font-serif text-white">{totalOccupied} / {spaces.length}</div>
              </div>

              {totalOverdue > 0 && (
                <div className="bg-rose-950/60 backdrop-blur-sm border border-rose-500/40 rounded-md p-3 text-left">
                  <div className="text-[11px] text-rose-300 uppercase tracking-wider font-semibold">Arrears Alert</div>
                  <div className="text-xl font-bold font-serif text-rose-200">{totalOverdue} Delinquent</div>
                </div>
              )}

              <Button
                size="sm"
                onClick={() => setIsBatchInvoiceOpen(true)}
                className="h-12 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold uppercase tracking-wider shadow-md flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>Batch Invoice PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Deep Sub-Feature Keyword Search Bar & Quick Topic Chips */}
        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search modules & specific sub-features (e.g. diesel, ecocash, whatsapp, turnover, generator, borehole, escalation, qr, receipt, tax invoice, hvac, solar, submeter, pop, nostro, zimra)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 text-xs bg-background/80 border-border/80 focus-visible:ring-primary font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-2 font-mono">
              <span className="font-semibold text-foreground">{displayedModules.length}</span> of {orderedModules.length} Modules
              {searchQuery && (
                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Filtered
                </span>
              )}
            </div>
          </div>

          {/* Quick Sub-Feature Topic Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" /> Quick Sub-Features:
            </span>
            {[
              'diesel',
              'ecocash',
              'zimra',
              'turnover',
              'generator',
              'borehole',
              'escalation',
              'submeter',
              'nostro',
              'hvac',
              'whatsapp',
              'pop',
              'qr'
            ].map((keyword) => {
              const isActive = searchQuery.toLowerCase() === keyword.toLowerCase();
              return (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setSearchQuery(isActive ? '' : keyword)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  #{keyword}
                </button>
              );
            })}
          </div>
        </div>

        {/* AppFlowPro™ Batch Workflow Dialog Box Overlay Trigger Banner - Positioned directly above Commercial Modules & Applications heading */}
        <div className="p-4 sm:p-5 rounded-lg border border-primary/40 bg-gradient-to-r from-card via-primary/5 to-card shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-foreground">
                  AppFlowPro™ Batch Workflow Launcher
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono py-0 text-primary border-primary/40">
                  Overlay Dialog
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simultaneously coordinate interconnected operational workflows (Dual-currency billing, EcoCash payment batches, CAM Diesel apportionment, Utility readings).
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsLauncherDialogOpen(true)}
            size="sm"
            className="shrink-0 h-9 px-4 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Launch AppFlowPro™ Dialog</span>
          </Button>
        </div>

        {/* Commercial Modules & Applications Heading & Reorder Toolbar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">
                Commercial Modules & Applications ({displayedModules.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Enterprise modules configured in standard commercial property management workflow order
              </p>
            </div>

            {/* Layout Controls: Reorder Apps & Reset Order */}
            <div className="flex items-center gap-2">
              {isCustomOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetOrder}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                  title="Reset to default card layout"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Order</span>
                </Button>
              )}

              <Button
                variant={isReorderMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsReorderMode(!isReorderMode)}
                className="h-8 px-3 text-xs flex items-center gap-1.5"
                title="Toggle card directional movement controls"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isReorderMode ? 'Done Reordering' : 'Reorder Apps'}</span>
              </Button>
            </div>
          </div>

          {/* System Modules Grid with Subtle Quiet Couture Category Accent Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedModules.map((module, idx) => {
              const IconComp = ICON_MAP[module.iconName] || LayoutDashboard;

              // Category classification & subtle Quiet Couture visual accent tints
              const getModuleMeta = (id: string) => {
                switch (id) {
                  case 'properties':
                  case 'portfolios':
                    return {
                      category: 'Spaces & Properties',
                      borderClass: 'border-sky-500/25 hover:border-sky-400/60 shadow-[0_1px_3px_rgba(56,189,248,0.06)]',
                      badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
                      iconClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25 group-hover:bg-sky-600 group-hover:text-white shadow-[0_0_12px_rgba(56,189,248,0.2)]',
                      accentBar: 'bg-sky-500',
                    };
                  case 'invoices':
                  case 'payments':
                  case 'turnover-rent':
                  case 'leases':
                    return {
                      category: 'Finance & Revenue',
                      borderClass: 'border-emerald-500/25 hover:border-emerald-400/60 shadow-[0_1px_3px_rgba(52,211,153,0.06)]',
                      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
                      iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 group-hover:bg-emerald-600 group-hover:text-white shadow-[0_0_12px_rgba(52,211,153,0.2)]',
                      accentBar: 'bg-emerald-500',
                    };
                  case 'infrastructure':
                  case 'meter-readings':
                  case 'maintenance':
                  case 'whatsapp':
                    return {
                      category: 'Operations & Facilities',
                      borderClass: 'border-amber-500/25 hover:border-amber-400/60 shadow-[0_1px_3px_rgba(245,158,11,0.06)]',
                      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
                      iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 group-hover:bg-amber-600 group-hover:text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]',
                      accentBar: 'bg-amber-500',
                    };
                  case 'reports':
                    return {
                      category: 'Reports & Audits',
                      borderClass: 'border-purple-500/25 hover:border-purple-400/60 shadow-[0_1px_3px_rgba(168,85,247,0.06)]',
                      badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
                      iconClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25 group-hover:bg-purple-600 group-hover:text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]',
                      accentBar: 'bg-purple-500',
                    };
                  default:
                    return {
                      category: 'Core Platform',
                      borderClass: 'border-slate-500/25 hover:border-slate-400/60 shadow-[0_1px_3px_rgba(148,163,184,0.06)]',
                      badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25',
                      iconClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25 group-hover:bg-slate-800 group-hover:text-white shadow-[0_0_12px_rgba(148,163,184,0.2)]',
                      accentBar: 'bg-slate-500',
                    };
                }
              };

              const meta = getModuleMeta(module.id);
              const subFeatures = MODULE_SUB_FEATURES[module.id] || [];
              const matchingSubFeatures = normalizedQuery
                ? subFeatures.filter(sf => sf.toLowerCase().includes(normalizedQuery))
                : [];

              // Dynamic Live KPI Badges
              const getLiveKPI = (id: string) => {
                switch (id) {
                  case 'invoices': {
                    const unpaid = invoices.filter(i => i.status !== 'Paid').length;
                    return `${unpaid} Invoices Due`;
                  }
                  case 'payments':
                    return `${payments.length} Receipts Processed`;
                  case 'tenants': {
                    const overdue = tenants.filter(t => t.balanceUSD > 0).length;
                    return overdue > 0 ? `${overdue} Tenants Overdue` : `${tenants.length} Active Tenants`;
                  }
                  case 'properties':
                    return `${spaces.length} Commercial Spaces`;
                  case 'portfolios':
                    return `${properties.length} Commercial Assets`;
                  case 'dashboard': {
                    const occ = spaces.filter(s => s.status === 'Occupied').length;
                    return `${occ}/${spaces.length} Spaces Occupied`;
                  }
                  case 'maintenance': {
                    const openTickets = maintenanceTickets.filter(m => m.status === 'Open' || m.status === 'In Progress').length;
                    return `${openTickets} Open Workorders`;
                  }
                  case 'infrastructure':
                    return 'Diesel & Borehole Active';
                  case 'meter-readings':
                    return `${meterReadings.length} Sub-Meters Logged`;
                  case 'turnover-rent':
                    return 'Audit Computation Ready';
                  case 'whatsapp':
                    return 'T-3 Billing Notices Ready';
                  case 'integrations':
                    return `1 USD = ${rbzExchangeRate} ZiG`;
                  case 'documents':
                    return `${documents.length} Secure Deeds & Vault`;
                  case 'leases':
                    return 'Active Leases & Escalation';
                  case 'reports':
                    return '12+ Analytical Statements';
                  default:
                    return 'Enterprise Ready';
                }
              };

              const liveKPI = getLiveKPI(module.id);

              return (
                <div
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className={`group relative rounded-xl border bg-card text-card-foreground p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-0.5 ${
                    isReorderMode
                      ? 'border-primary shadow-md ring-2 ring-primary/20'
                      : `${meta.borderClass}`
                  }`}
                >
                  {/* Subtle Category Accent Top Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 opacity-70 ${meta.accentBar}`} />

                  <div className="space-y-3.5 pt-1">
                    {/* Top Row: Refined Geometric Icon Container, Category Badge & Directional Controls */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 group-hover:scale-105 ${meta.iconClass}`}
                        >
                          <IconComp className="w-5 h-5 transition-transform duration-300 group-hover:rotate-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {module.code}
                          </span>
                          <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${meta.badgeClass}`}>
                            {meta.category}
                          </span>
                        </div>
                      </div>

                      {/* Directional Movement Controls in Reorder Mode */}
                      <div className="flex items-center gap-1">
                        {isReorderMode && (
                          <Badge variant="outline" className="bg-primary/10 text-primary font-mono text-[10px] px-1.5 py-0 border-primary/30 mr-1">
                            #{idx + 1}
                          </Badge>
                        )}

                        <div className={`flex items-center gap-0.5 transition-opacity duration-200 ${
                          isReorderMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(idx, 'left');
                            }}
                            disabled={idx === 0}
                            className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border/60 disabled:opacity-30"
                            title="Move Left (←)"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(idx, 'right');
                            }}
                            disabled={idx === displayedModules.length - 1}
                            className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border/60 disabled:opacity-30"
                            title="Move Right (→)"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(idx, 'up');
                            }}
                            disabled={idx < 4}
                            className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border/60 disabled:opacity-30"
                            title="Move Up (↑)"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(idx, 'down');
                            }}
                            disabled={idx + 4 >= displayedModules.length}
                            className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border/60 disabled:opacity-30"
                            title="Move Down (↓)"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Typography & Hierarchy: High-legibility serif heading */}
                    <div className="space-y-1.5 pt-1">
                      <h3 className="text-base font-serif font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    {/* Matching Sub-Features Chips (Active Query Highlight) */}
                    {matchingSubFeatures.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] font-semibold text-primary">Matched:</span>
                        {matchingSubFeatures.slice(0, 3).map(sf => (
                          <span key={sf} className="px-1.5 py-0.2 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-mono">
                            #{sf}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dynamic Live KPI Badge */}
                    <div className="pt-0.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted/70 text-foreground/80 border border-border/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="truncate max-w-[200px]">{liveKPI}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Footer with Micro-Transition */}
                  <div className="pt-4 mt-2 border-t border-border/50">
                    <Button
                      onClick={() => navigate(module.path)}
                      variant="secondary"
                      size="sm"
                      className="w-full h-8 text-xs font-semibold rounded-lg flex items-center justify-between px-3 group/btn bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      <span>Open {module.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Floating Auto-Scroll Buttons */}
      <div className="fixed right-4 bottom-20 z-30 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleScrollToTop}
          className="h-8 w-8 p-0 rounded-full shadow-lg bg-card/90 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground transition-all"
          title="Auto Scroll to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScrollToBottom}
          className="h-8 w-8 p-0 rounded-full shadow-lg bg-card/90 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground transition-all"
          title="Auto Scroll to Bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Action Floating Dock */}
      <QuickActionDock />

      {/* Batch Invoice PDF Modal */}
      <BatchInvoiceModal
        isOpen={isBatchInvoiceOpen}
        onClose={() => setIsBatchInvoiceOpen(false)}
      />

      {/* Custom Thumbnail Upload Modal */}
      <ThumbnailUploadModal
        module={selectedModuleForThumbnail}
        isOpen={!!selectedModuleForThumbnail}
        onClose={() => setSelectedModuleForThumbnail(null)}
      />

      {/* AppFlowPro™ Batch Workflow Dialog Box Overlay */}
      <Dialog open={isLauncherDialogOpen} onOpenChange={setIsLauncherDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              AppFlowPro™ Batch Workflow Engine
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Coordinate and trigger interrelated commercial property workflows in unified batches.
            </DialogDescription>
          </DialogHeader>
          <AppFlowProLauncher />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
