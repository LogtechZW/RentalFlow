import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { Tenant, Space } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { OverdueAlertBanner } from '@/components/common/OverdueAlertBanner';
import { AllocateTenantModal } from '@/components/common/AllocateTenantModal';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Building,
  DollarSign,
  AlertCircle,
  FileText,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Sparkles,
  Receipt,
  History,
  TrendingUp,
  SlidersHorizontal,
  Edit2,
  Printer,
  Download,
  Send,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export const TenantsPage: React.FC = () => {
  const {
    tenants,
    properties,
    spaces,
    invoices,
    payments,
    spaceLedgers,
    corporateLogo,
    addTenant,
    updateTenant,
    deleteTenant,
    bulkDeleteTenants,
    sendWhatsAppNotice,
    deallocateTenantFromSpace,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allocationFilter, setAllocationFilter] = useState<'all' | 'assigned' | 'unallocated'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [whatsappModalTenant, setWhatsappModalTenant] = useState<Tenant | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string>('');

  // 6 Core Quick Action Modals
  const [invoiceReceiptTenant, setInvoiceReceiptTenant] = useState<Tenant | null>(null);
  const [ledgerTenant, setLedgerTenant] = useState<Tenant | null>(null);
  const [leaseEscalationTenant, setLeaseEscalationTenant] = useState<Tenant | null>(null);
  const [turnoverTenant, setTurnoverTenant] = useState<Tenant | null>(null);
  const [turnoverGrossSales, setTurnoverGrossSales] = useState<string>('32000');
  const [turnoverRatePct, setTurnoverRatePct] = useState<string>('8');
  const [editProfileTenant, setEditProfileTenant] = useState<Tenant | null>(null);
  const [editFormName, setEditFormName] = useState<string>('');
  const [editFormTradingName, setEditFormTradingName] = useState<string>('');
  const [editFormContact, setEditFormContact] = useState<string>('');
  const [editFormPhone, setEditFormPhone] = useState<string>('');
  const [editFormEmail, setEditFormEmail] = useState<string>('');

  // Bulk WhatsApp Rent Reminder Engine
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState<boolean>(false);
  const [bulkTemplate, setBulkTemplate] = useState<string>(
    'Dear {tenantName} ({tradingName}), RentFlow statement for Unit {unitNumber} at {propertyName}: Outstanding arrears ${arrearsUSD} USD (ZiG {arrearsZiG} at RBZ {rbzRate}). Kindly settle via EcoCash Merchant 99420. Thank you.'
  );
  const [isBulkSending, setIsBulkSending] = useState<boolean>(false);

  // Space Allocation for Unallocated Tenant
  const [tenantToAllocate, setTenantToAllocate] = useState<Tenant | null>(null);
  const [spaceForAllocation, setSpaceForAllocation] = useState<Space | null>(null);
  const [tenantToVacate, setTenantToVacate] = useState<Tenant | null>(null);

  // Form states - Add Tenant
  const [name, setName] = useState<string>('');
  const [tradingName, setTradingName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+263 77 ');
  const [category, setCategory] = useState<Tenant['category']>('Retail');
  const [propId, setPropId] = useState<string>(properties[0]?.id || 'prop-1');
  const [monthlyRentUSD, setMonthlyRentUSD] = useState<string>('1500');

  const canManage = ['Property Manager', 'Administrator', 'Accountant'].includes(activeRole);

  // Counts for filter pills
  const totalCount = tenants.length;
  const assignedCount = tenants.filter(t => t.unitId && t.unitId !== 'sp-pending' && t.status !== 'Pending Lease').length;
  const unallocatedCount = tenants.filter(t => !t.unitId || t.unitId === 'sp-pending' || t.status === 'Pending Lease').length;

  const filteredTenants = tenants.filter(t => {
    if (propertyFilter !== 'all' && t.propertyId !== propertyFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    const isAssigned = Boolean(t.unitId && t.unitId !== 'sp-pending' && t.status !== 'Pending Lease');
    if (allocationFilter === 'assigned' && !isAssigned) return false;
    if (allocationFilter === 'unallocated' && isAssigned) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchTrading = t.tradingName.toLowerCase().includes(q);
      const matchUnit = t.unitNumber.toLowerCase().includes(q);
      if (!matchName && !matchTrading && !matchUnit) return false;
    }
    return true;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tenant registered name required.');
      return;
    }
    const prop = properties.find(p => p.id === propId);

    addTenant({
      name: name.trim(),
      tradingName: tradingName.trim() || name.trim(),
      contactPerson: contactPerson.trim() || 'Principal Contact',
      email: email.trim() || 'contact@tenant.co.zw',
      phone: phone.trim() || '+263 77 000 0000',
      nationalIdOrReg: `REG-ZW-${Math.floor(10000 + Math.random() * 90000)}/2026`,
      propertyId: propId,
      propertyName: prop?.name || 'Commercial Center',
      unitId: 'sp-pending',
      unitNumber: 'Pending',
      status: 'Pending Lease',
      balanceUSD: 0,
      balanceZiG: 0,
      monthlyRentUSD: parseFloat(monthlyRentUSD) || 1000,
      leaseExpiryDate: '2028-12-31',
      category,
    });

    toast.success(`Commercial entity "${name}" registered in prospective pool!`);
    setIsAddModalOpen(false);
    setName('');
    setTradingName('');
  };

  const handleStartEditProfile = (t: Tenant) => {
    setEditProfileTenant(t);
    setEditFormName(t.name);
    setEditFormTradingName(t.tradingName);
    setEditFormContact(t.contactPerson);
    setEditFormPhone(t.phone);
    setEditFormEmail(t.email);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileTenant) return;
    updateTenant(editProfileTenant.id, {
      name: editFormName,
      tradingName: editFormTradingName,
      contactPerson: editFormContact,
      phone: editFormPhone,
      email: editFormEmail,
    });
    toast.success(`Profile for "${editFormTradingName}" updated successfully!`);
    setEditProfileTenant(null);
  };

  const handleDispatchBulkWhatsApp = () => {
    setIsBulkSending(true);
    const overdueTenants = tenants.filter(t => t.balanceUSD > 0);
    if (overdueTenants.length === 0) {
      toast.info('No commercial tenants currently have arrears.');
      setIsBulkSending(false);
      return;
    }

    overdueTenants.forEach((t) => {
      const p = properties.find(prop => prop.id === t.propertyId);
      const text = bulkTemplate
        .replace('{tenantName}', t.contactPerson)
        .replace('{tradingName}', t.tradingName)
        .replace('{unitNumber}', t.unitNumber)
        .replace('{propertyName}', p?.name || t.propertyName)
        .replace('{arrearsUSD}', t.balanceUSD.toLocaleString())
        .replace('{arrearsZiG}', (t.balanceUSD * rbzExchangeRate).toLocaleString())
        .replace('{rbzRate}', rbzExchangeRate.toString());

      sendWhatsAppNotice(t.id, text, 'Rent Notice');
    });

    setTimeout(() => {
      setIsBulkSending(false);
      setIsBulkWhatsAppOpen(false);
      toast.success(`Batch WhatsApp notices dispatched to ${overdueTenants.length} tenants in arrears!`);
    }, 600);
  };

  const handleOpenWhatsApp = (t: Tenant) => {
    setWhatsappModalTenant(t);
    const msg = `Dear ${t.contactPerson} (${t.tradingName}), this is an official statement from RentFlow regarding Unit ${t.unitNumber} at ${t.propertyName}. Current balance: $${t.balanceUSD.toLocaleString()} USD (ZiG ${(t.balanceUSD * rbzExchangeRate).toLocaleString()}). EcoCash Merchant: 99420. Thank you.`;
    setWhatsappMessage(msg);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappModalTenant) return;
    sendWhatsAppNotice(whatsappModalTenant.id, whatsappMessage, 'Statement');
    toast.success(`WhatsApp billing notice dispatched to ${whatsappModalTenant.phone}!`);
    setWhatsappModalTenant(null);
  };

  const handleStartAllocate = (tenant: Tenant) => {
    // Find first vacant space in property, or any vacant space
    const vacantSpace = spaces.find(s => (tenant.propertyId ? s.propertyId === tenant.propertyId : true) && s.status === 'Vacant') || spaces.find(s => s.status === 'Vacant');
    if (!vacantSpace) {
      toast.error('No vacant commercial spaces currently available. Add a new unit first.');
      return;
    }
    setTenantToAllocate(tenant);
    setSpaceForAllocation(vacantSpace);
  };

  const handleConfirmVacateTenant = () => {
    if (!tenantToVacate) return;
    // Find space
    const sp = spaces.find(s => s.id === tenantToVacate.unitId || s.currentTenantId === tenantToVacate.id);
    if (sp) {
      deallocateTenantFromSpace(sp.id);
    }
    updateTenant(tenantToVacate.id, {
      unitId: 'sp-pending',
      unitNumber: 'Pending',
      status: 'Pending Lease'
    });
    toast.success(`Tenant ${tenantToVacate.name} deallocated and unit marked vacant.`);
    setTenantToVacate(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Tenants' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Overdue Payment Reminders Banner */}
        <OverdueAlertBanner />

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Commercial Tenant Directory
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {tenants.length} Commercial Entities
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bidirectional property & unit synchronization, allocation filters, and automated WhatsApp billing reminders.
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsBulkWhatsAppOpen(true)}
                className="h-9 text-xs flex items-center gap-1.5 shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white shadow rounded-[6px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Bulk WhatsApp Reminders</span>
                {tenants.filter(t => t.balanceUSD > 0).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-mono">
                    {tenants.filter(t => t.balanceUSD > 0).length}
                  </span>
                )}
              </Button>

              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0 bg-primary text-primary-foreground shadow rounded-[6px]">
                <Plus className="w-4 h-4" />
                <span>Add Tenant</span>
              </Button>

              {tenants.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base font-serif">Delete All Commercial Tenants?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground">
                        This will wipe all active tenant accounts. Associated lease references will be updated.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { bulkDeleteTenants(); toast.success('All tenants removed.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Confirm Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {/* Allocation Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={allocationFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAllocationFilter('all')}
            className="h-8 text-xs"
          >
            All Tenants ({totalCount})
          </Button>
          <Button
            variant={allocationFilter === 'assigned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAllocationFilter('assigned')}
            className={`h-8 text-xs ${allocationFilter === 'assigned' ? 'bg-emerald-700 text-white' : ''}`}
          >
            ✅ Assigned to Space ({assignedCount})
          </Button>
          <Button
            variant={allocationFilter === 'unallocated' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAllocationFilter('unallocated')}
            className={`h-8 text-xs ${allocationFilter === 'unallocated' ? 'bg-amber-600 text-white' : ''}`}
          >
            ⭐ Unallocated / Prospective ({unallocatedCount})
          </Button>
        </div>

        {/* Search & Property Filters Toolbar - Sticky Top Chrome */}
        <div className="sticky top-16 z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-[#101C40]/90 border border-white/[0.07] backdrop-blur-[24px] rounded-[6px] shadow-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by tenant name, trading brand, or unit number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs font-sans rounded-[6px] bg-slate-900/60 border-white/[0.07]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs rounded-[6px] bg-slate-900/60 border-white/[0.07]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-[6px] bg-slate-900/60 border-white/[0.07]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Prospective">Prospective</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tablet-Optimized Tenant Directory Thumbnail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTenants.map((tenant) => {
            const isOverdue = tenant.balanceUSD > 0;
            const isAssigned = Boolean(tenant.unitId && tenant.unitId !== 'sp-pending' && tenant.status !== 'Pending Lease');
            const linkedSpace = spaces.find(s => s.id === tenant.unitId);

            return (
              <Card
                key={tenant.id}
                className={`border transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between rounded-[6px] overflow-hidden bg-[#101C40]/55 border-white/[0.07] backdrop-blur-[24px] ${
                  isOverdue ? 'border-rose-500/60 hover:border-rose-400' : 'border-white/[0.07] hover:border-sky-500/70'
                }`}
                onClick={() => setSelectedTenantForDetails(tenant)}
              >
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                          {tenant.category}
                        </span>
                        <h3 className="text-sm font-bold font-serif text-foreground truncate">
                          {tenant.tradingName}
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tenant.name}
                        </p>
                      </div>

                      <Badge
                        variant={isOverdue ? 'destructive' : isAssigned ? 'outline' : 'secondary'}
                        className={`text-[10px] h-5 px-1.5 shrink-0 rounded-[4px] ${
                          !isAssigned ? 'bg-amber-950/70 text-amber-300 border-amber-700' : ''
                        }`}
                      >
                        {isAssigned ? tenant.status : '⭐ Prospective'}
                      </Badge>
                    </div>

                    {/* Property & Unit Specification Strip */}
                    <div className="p-2.5 rounded-[4px] bg-slate-900/50 border border-white/[0.07] text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="truncate">{tenant.propertyName}</span>
                        {isAssigned ? (
                          <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary border-primary/40 shrink-0 rounded-[4px]">
                            Unit {tenant.unitNumber}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-mono text-amber-500 bg-amber-950/30 border-amber-600/40 shrink-0 rounded-[4px]">
                            Unallocated
                          </Badge>
                        )}
                      </div>

                      {linkedSpace && (
                        <div className="text-[10px] text-muted-foreground">
                          {linkedSpace.floor} • {linkedSpace.sizeSqm} m²
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07]">
                        <span className="text-muted-foreground text-[11px]">Target Rent:</span>
                        <span className="font-medium text-foreground font-mono tabular-nums">${tenant.monthlyRentUSD.toLocaleString()} USD</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Current Balance:</span>
                        <span className={`font-semibold font-mono tabular-nums ${isOverdue ? 'text-destructive' : 'text-emerald-500'}`}>
                          {isOverdue ? `$${tenant.balanceUSD.toLocaleString()} USD` : 'Settled ($0)'}
                        </span>
                      </div>
                      {isOverdue && (
                        <div className="text-[10px] font-mono text-muted-foreground text-right tabular-nums">
                          (ZiG {(tenant.balanceUSD * rbzExchangeRate).toLocaleString()})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6 Core Quick Actions Grid matching Blueprint */}
                  <div className="pt-2 border-t border-white/[0.07] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-3 gap-1">
                      {/* Action 1: Direct WhatsApp notice with deep link */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenWhatsApp(tenant)}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/30 rounded-[4px]"
                        title="Direct WhatsApp Billing Notice"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>WhatsApp</span>
                      </Button>

                      {/* Action 2: Invoice / Receipt compilation */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoiceReceiptTenant(tenant)}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-sky-400 bg-sky-950/40 hover:bg-sky-900/60 border-sky-500/30 rounded-[4px]"
                        title="Invoice & Receipt Compilation"
                      >
                        <Receipt className="w-2.5 h-2.5" />
                        <span>Invoice/Tax</span>
                      </Button>

                      {/* Action 3: Read-only structural payment ledger */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLedgerTenant(tenant)}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/30 rounded-[4px]"
                        title="Read-only Payment Ledger"
                      >
                        <History className="w-2.5 h-2.5" />
                        <span>Ledger</span>
                      </Button>

                      {/* Action 4: Lease escalation review */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLeaseEscalationTenant(tenant)}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-purple-400 bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/30 rounded-[4px]"
                        title="Lease Escalation Review"
                      >
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>Escalation</span>
                      </Button>

                      {/* Action 5: Turnover auditing panel */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTurnoverTenant(tenant);
                          setTurnoverGrossSales(String(tenant.monthlyRentUSD * 8));
                        }}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/30 rounded-[4px]"
                        title="Turnover Auditing Panel"
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5" />
                        <span>Turnover</span>
                      </Button>

                      {/* Action 6: Profile editing */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEditProfile(tenant)}
                        className="h-6 px-1.5 text-[9px] font-medium flex items-center justify-center gap-1 text-slate-300 bg-slate-800/60 hover:bg-slate-700/80 border-white/[0.07] rounded-[4px]"
                        title="Edit Commercial Entity Profile"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </Button>
                    </div>

                    {/* Secondary Space Allocation / Vacate Strip */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                      {isAssigned ? (
                        <button
                          type="button"
                          onClick={() => setTenantToVacate(tenant)}
                          className="text-[10px] text-destructive hover:underline flex items-center gap-1"
                        >
                          <UserX className="w-2.5 h-2.5" /> Vacate Space
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartAllocate(tenant)}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <UserCheck className="w-2.5 h-2.5" /> Allocate Space
                        </button>
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground">ID: {tenant.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Allocate Space Modal for Unallocated Tenant */}
      {spaceForAllocation && (
        <AllocateTenantModal
          space={spaceForAllocation}
          isOpen={!!spaceForAllocation}
          onClose={() => {
            setSpaceForAllocation(null);
            setTenantToAllocate(null);
          }}
        />
      )}

      {/* Vacate Confirmation Dialog */}
      <AlertDialog open={!!tenantToVacate} onOpenChange={(open) => !open && setTenantToVacate(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Vacate Tenant {tenantToVacate?.tradingName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will unbind {tenantToVacate?.name} from Unit {tenantToVacate?.unitNumber}, mark the commercial unit as vacant, and return this tenant to the unallocated pool.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVacateTenant}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Vacate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tenant Details Dialog with In-Page Switching and Universal Edit/Delete */}
      <Dialog open={!!selectedTenantForDetails} onOpenChange={(open) => !open && setSelectedTenantForDetails(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md text-xs space-y-3">
          {/* In-Page Prev / Next Tenant Switcher Bar */}
          {selectedTenantForDetails && (() => {
            const tenantIndex = filteredTenants.findIndex(t => t.id === selectedTenantForDetails.id);
            const hasPrev = tenantIndex > 0;
            const hasNext = tenantIndex >= 0 && tenantIndex < filteredTenants.length - 1;

            return (
              <div className="flex items-center justify-between bg-muted/60 p-2 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setSelectedTenantForDetails(filteredTenants[tenantIndex - 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Tenant</span>
                </Button>

                <span className="text-[11px] font-mono text-muted-foreground">
                  Tenant {tenantIndex >= 0 ? tenantIndex + 1 : 1} of {filteredTenants.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setSelectedTenantForDetails(filteredTenants[tenantIndex + 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <span>Next Tenant</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })()}

          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle className="font-serif text-lg">{selectedTenantForDetails?.tradingName}</DialogTitle>
                <DialogDescription className="text-xs">{selectedTenantForDetails?.name}</DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {selectedTenantForDetails?.status}
              </Badge>
            </div>
          </DialogHeader>

          {selectedTenantForDetails && (
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-muted/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Contact Person</span>
                  <span className="font-semibold text-foreground">{selectedTenantForDetails.contactPerson}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Registration / ID</span>
                  <span className="font-mono text-foreground">{selectedTenantForDetails.nationalIdOrReg}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                  <span className="font-mono text-foreground">{selectedTenantForDetails.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Email</span>
                  <span className="truncate block text-foreground">{selectedTenantForDetails.email}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Property:</span>
                  <span className="font-semibold">{selectedTenantForDetails.propertyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Unit:</span>
                  <span className="font-semibold font-mono">Unit {selectedTenantForDetails.unitNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Rent (USD):</span>
                  <span className="font-mono font-bold">${selectedTenantForDetails.monthlyRentUSD.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exchange Equivalent:</span>
                  <span className="font-mono">ZiG {(selectedTenantForDetails.monthlyRentUSD * rbzExchangeRate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/60 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedTenantForDetails) {
                  setTenantToDelete(selectedTenantForDetails);
                }
              }}
              className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Tenant
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedTenantForDetails) {
                    handleStartEditProfile(selectedTenantForDetails);
                    setSelectedTenantForDetails(null);
                  }
                }}
                className="h-8 text-xs"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit Profile
              </Button>
              <Button size="sm" onClick={() => setSelectedTenantForDetails(null)} className="h-8 text-xs">
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Confirmation Alert Dialog */}
      <AlertDialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Permanently Delete Tenant "{tenantToDelete?.tradingName}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will remove {tenantToDelete?.name} from the tenant directory. If currently assigned to Unit {tenantToDelete?.unitNumber}, the unit will become vacant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (tenantToDelete) {
                  deleteTenant(tenantToDelete.id);
                  toast.success(`Tenant ${tenantToDelete.tradingName} deleted.`);
                  if (selectedTenantForDetails?.id === tenantToDelete.id) {
                    setSelectedTenantForDetails(null);
                  }
                  setTenantToDelete(null);
                }
              }}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WhatsApp Modal */}
      <Dialog open={!!whatsappModalTenant} onOpenChange={(open) => !open && setWhatsappModalTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleSendWhatsApp}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp Notice Dispatch</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                To: {whatsappModalTenant?.contactPerson} ({whatsappModalTenant?.phone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Message Text</Label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded border border-border bg-background p-2 text-xs font-sans leading-relaxed resize-none"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setWhatsappModalTenant(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white">
                Dispatch WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Tenant Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleCreateTenant}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Add Commercial Tenant</DialogTitle>
              <DialogDescription className="text-xs">
                Register a new corporate or retail tenant in the commercial tenancy register.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Registered Business Name *</Label>
                  <Input
                    placeholder="e.g. Bakers Inn Commercial"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trading Name (Brand)</Label>
                  <Input
                    placeholder="e.g. Bakers Inn"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Contact Person</Label>
                  <Input
                    placeholder="e.g. Tatenda Nkomo"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Business Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="accounts@business.co.zw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone (+263)</Label>
                  <Input
                    placeholder="+263 77..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Designated Property</Label>
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
                <div className="space-y-1">
                  <Label className="text-xs">Monthly Rent (USD)</Label>
                  <Input
                    type="number"
                    value={monthlyRentUSD}
                    onChange={(e) => setMonthlyRentUSD(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Register Entity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 1: INVOICE & RECEIPT COMPILATION */}
      <Dialog open={Boolean(invoiceReceiptTenant)} onOpenChange={(open) => !open && setInvoiceReceiptTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          {invoiceReceiptTenant && (() => {
            const prop = properties.find(p => p.id === invoiceReceiptTenant.propertyId);
            const targetUSD = invoiceReceiptTenant.monthlyRentUSD;
            const targetZiG = (targetUSD * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const vatUSD = targetUSD * 0.15;
            const subtotalUSD = targetUSD - vatUSD;

            return (
              <div className="space-y-4 py-2">
                <DialogHeader className="border-b border-white/[0.07] pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                        Official Dual-Currency Tax Document
                      </span>
                      <DialogTitle className="font-serif text-lg text-foreground">
                        Tax Invoice & Official Rent Receipt
                      </DialogTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                      ZIMRA Fiscal Compliant
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="p-3 rounded-[6px] bg-[#101C40]/55 border border-white/[0.07] text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Tenant Commercial Entity</span>
                      <span className="font-semibold text-foreground text-sm">{invoiceReceiptTenant.tradingName}</span>
                      <span className="text-muted-foreground block text-[11px]">{invoiceReceiptTenant.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[10px] block">Allocated Asset / Unit</span>
                      <span className="font-semibold text-foreground">{prop?.name || 'Commercial Asset'}</span>
                      <span className="text-muted-foreground block text-[11px]">Unit {invoiceReceiptTenant.unitNumber}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.07] grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-[4px] bg-slate-900/40 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Net Subtotal</span>
                      <span className="font-mono font-bold text-foreground tabular-nums">${subtotalUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="p-2 rounded-[4px] bg-slate-900/40 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">VAT (15%)</span>
                      <span className="font-mono font-bold text-foreground tabular-nums">${vatUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="p-2 rounded-[4px] bg-slate-900/40 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Total Monthly Levy</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">${targetUSD.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-[4px] bg-slate-900/60 border border-white/[0.05] flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Dual-Currency Equivalent (RBZ Rate {rbzExchangeRate}):</span>
                    <span className="font-mono font-bold text-sky-400 tabular-nums">ZiG {targetZiG}</span>
                  </div>

                  <div className="p-2 rounded-[4px] bg-slate-950/40 text-[10px] text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Remittance Channels:</p>
                    <p>• EcoCash Corporate Biller / Merchant Code: <span className="font-mono text-emerald-400 font-bold">99420</span> (Reference: {invoiceReceiptTenant.unitNumber})</p>
                    <p>• CBZ Bank Zimbabwe Corporate USD Account: 01123456780010 (Harare Main Branch)</p>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="h-8 text-xs flex items-center gap-1.5 rounded-[6px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Tax Invoice / Receipt</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setInvoiceReceiptTenant(null)}
                    className="h-8 text-xs rounded-[6px] bg-primary text-primary-foreground"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: READ-ONLY STRUCTURAL PAYMENT LEDGER DRAWER */}
      <Dialog open={Boolean(ledgerTenant)} onOpenChange={(open) => !open && setLedgerTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          {ledgerTenant && (() => {
            const tenantLedger = (ledgerTenant.unitId && spaceLedgers[ledgerTenant.unitId]) || [];

            return (
              <div className="space-y-4 py-2">
                <DialogHeader className="border-b border-white/[0.07] pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                        Immutable Accounting Records
                      </span>
                      <DialogTitle className="font-serif text-lg text-foreground">
                        Structural Payment Ledger: {ledgerTenant.tradingName}
                      </DialogTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30">
                      Unit {ledgerTenant.unitNumber}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="p-3 rounded-[6px] bg-[#101C40]/55 border border-white/[0.07] text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Arrears Balance:</span>
                    <div className="text-right">
                      <span className={`font-mono font-bold tabular-nums text-sm ${ledgerTenant.balanceUSD > 0 ? 'text-destructive' : 'text-emerald-400'}`}>
                        ${ledgerTenant.balanceUSD.toLocaleString()} USD
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground block tabular-nums">
                        (ZiG {(ledgerTenant.balanceUSD * rbzExchangeRate).toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div className="border border-white/[0.07] rounded-[4px] overflow-hidden">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-900/80 text-muted-foreground font-mono uppercase text-[9px] border-b border-white/[0.07]">
                          <tr>
                            <th className="p-2 whitespace-nowrap">Date</th>
                            <th className="p-2 whitespace-nowrap">Transaction Detail</th>
                            <th className="p-2 whitespace-nowrap">Reference</th>
                            <th className="p-2 text-right whitespace-nowrap">Charge (USD)</th>
                            <th className="p-2 text-right whitespace-nowrap">Paid (USD)</th>
                            <th className="p-2 text-right whitespace-nowrap">Balance (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {tenantLedger.length > 0 ? (
                            tenantLedger.map((entry, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="p-2 font-mono whitespace-nowrap">{entry.date}</td>
                                <td className="p-2 text-foreground truncate max-w-[200px]">{entry.description}</td>
                                <td className="p-2 font-mono text-muted-foreground whitespace-nowrap">{entry.reference}</td>
                                <td className="p-2 text-right font-mono tabular-nums">{entry.chargeUSD > 0 ? `$${entry.chargeUSD.toFixed(2)}` : '-'}</td>
                                <td className="p-2 text-right font-mono tabular-nums text-emerald-400">{entry.paymentUSD > 0 ? `$${entry.paymentUSD.toFixed(2)}` : '-'}</td>
                                <td className="p-2 text-right font-mono tabular-nums font-semibold">${entry.balanceUSD.toFixed(2)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                No historical ledger entries logged yet for this space.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-end border-t border-white/[0.07] pt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLedgerTenant(null)}
                    className="h-8 text-xs rounded-[6px] bg-primary text-primary-foreground"
                  >
                    Close Statement
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: LEASE ESCALATION REVIEW */}
      <Dialog open={Boolean(leaseEscalationTenant)} onOpenChange={(open) => !open && setLeaseEscalationTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          {leaseEscalationTenant && (() => {
            const baseRent = leaseEscalationTenant.monthlyRentUSD;
            const annualRate = 10;
            const projectedRent = Math.round(baseRent * (1 + annualRate / 100));
            const securityDeposit = baseRent * 2;

            return (
              <div className="space-y-4 py-2">
                <DialogHeader className="border-b border-white/[0.07] pb-3">
                  <DialogTitle className="font-serif text-lg text-foreground">
                    Lease Escalation & Term Review
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Periodic commercial lease indexing for {leaseEscalationTenant.tradingName} (Unit {leaseEscalationTenant.unitNumber}).
                  </DialogDescription>
                </DialogHeader>

                <div className="p-3 rounded-[6px] bg-[#101C40]/55 border border-white/[0.07] text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-[4px] bg-slate-900/60 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Current Monthly Base Rent</span>
                      <span className="font-mono font-bold text-foreground text-sm tabular-nums">${baseRent.toLocaleString()} USD</span>
                      <span className="text-[10px] text-muted-foreground block tabular-nums">ZiG {(baseRent * rbzExchangeRate).toLocaleString()}</span>
                    </div>

                    <div className="p-2.5 rounded-[4px] bg-slate-900/60 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Escalation Benchmark</span>
                      <span className="font-mono font-bold text-purple-400 text-sm">{annualRate}% / Annum</span>
                      <span className="text-[10px] text-muted-foreground block">CPI & RBZ Index Adjusted</span>
                    </div>

                    <div className="p-2.5 rounded-[4px] bg-slate-900/60 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Projected Year 2 Rent</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">${projectedRent.toLocaleString()} USD</span>
                      <span className="text-[10px] text-muted-foreground block tabular-nums">+$ {projectedRent - baseRent} increment</span>
                    </div>

                    <div className="p-2.5 rounded-[4px] bg-slate-900/60 border border-white/[0.05]">
                      <span className="text-[10px] text-muted-foreground block">Security Deposit Held</span>
                      <span className="font-mono font-bold text-sky-400 text-sm tabular-nums">${securityDeposit.toLocaleString()} USD</span>
                      <span className="text-[10px] text-muted-foreground block">2 Months Base Rent</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[4px] bg-slate-950/40 text-[11px] text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Escalation Milestone Schedule:</p>
                    <p>• Next Mandatory Review Date: <span className="font-mono text-purple-300">2027-01-01</span></p>
                    <p>• Written Notice Period: 60 Calendar Days prior to anniversary</p>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success(`Lease escalation notice prepared for ${leaseEscalationTenant.tradingName}.`);
                      setLeaseEscalationTenant(null);
                    }}
                    className="h-8 text-xs rounded-[6px]"
                  >
                    Confirm Review & Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLeaseEscalationTenant(null)}
                    className="h-8 text-xs rounded-[6px] bg-primary text-primary-foreground"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: TURNOVER AUDITING PANEL */}
      <Dialog open={Boolean(turnoverTenant)} onOpenChange={(open) => !open && setTurnoverTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          {turnoverTenant && (() => {
            const baseRent = turnoverTenant.monthlyRentUSD;
            const grossSales = parseFloat(turnoverGrossSales) || 0;
            const rate = parseFloat(turnoverRatePct) || 8;
            const calculatedPercentageRent = (grossSales * rate) / 100;
            const additionalTurnoverLevy = Math.max(0, calculatedPercentageRent - baseRent);
            const additionalTurnoverZiG = (additionalTurnoverLevy * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return (
              <div className="space-y-4 py-2">
                <DialogHeader className="border-b border-white/[0.07] pb-3">
                  <DialogTitle className="font-serif text-lg text-foreground">
                    Turnover Rent Auditing Panel
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Monthly turnover declaration audit for retail tenant {turnoverTenant.tradingName}.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-3 rounded-[6px] bg-[#101C40]/55 border border-white/[0.07] text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Declared Gross Sales (USD)</Label>
                      <Input
                        type="number"
                        value={turnoverGrossSales}
                        onChange={(e) => setTurnoverGrossSales(e.target.value)}
                        className="h-8 text-xs font-mono tabular-nums rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Turnover Rate (%)</Label>
                      <Input
                        type="number"
                        value={turnoverRatePct}
                        onChange={(e) => setTurnoverRatePct(e.target.value)}
                        className="h-8 text-xs font-mono tabular-nums rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-[4px] bg-slate-900/60 border border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Base Minimum Rent:</span>
                      <span className="font-mono text-foreground tabular-nums">${baseRent.toLocaleString()} USD</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Gross Percentage Threshold ({rate}% of ${grossSales.toLocaleString()}):</span>
                      <span className="font-mono text-foreground tabular-nums">${calculatedPercentageRent.toFixed(2)} USD</span>
                    </div>
                    <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between">
                      <span className="font-semibold text-foreground">Payable Turnover Surcharge:</span>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-sm tabular-nums ${additionalTurnoverLevy > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ${additionalTurnoverLevy.toFixed(2)} USD
                        </span>
                        {additionalTurnoverLevy > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground block tabular-nums">
                            (ZiG {additionalTurnoverZiG})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success(`Turnover audit signed off for ${turnoverTenant.tradingName}. Surcharge: $${additionalTurnoverLevy.toFixed(2)} USD.`);
                      setTurnoverTenant(null);
                    }}
                    className="h-8 text-xs rounded-[6px]"
                  >
                    Sign Off Audit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setTurnoverTenant(null)}
                    className="h-8 text-xs rounded-[6px] bg-primary text-primary-foreground"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 5: COMMERCIAL ENTITY PROFILE EDITING */}
      <Dialog open={Boolean(editProfileTenant)} onOpenChange={(open) => !open && setEditProfileTenant(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader className="border-b border-white/[0.07] pb-3">
              <DialogTitle className="font-serif text-lg text-foreground">
                Edit Commercial Entity Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update corporate registration details and primary contact channels.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Registered Name</Label>
                  <Input
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                    className="h-8 text-xs rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trading Brand Name</Label>
                  <Input
                    value={editFormTradingName}
                    onChange={(e) => setEditFormTradingName(e.target.value)}
                    className="h-8 text-xs rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Contact Person</Label>
                  <Input
                    value={editFormContact}
                    onChange={(e) => setEditFormContact(e.target.value)}
                    className="h-8 text-xs rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone (+263)</Label>
                  <Input
                    value={editFormPhone}
                    onChange={(e) => setEditFormPhone(e.target.value)}
                    className="h-8 text-xs font-mono rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={editFormEmail}
                  onChange={(e) => setEditFormEmail(e.target.value)}
                  className="h-8 text-xs rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-white/[0.07] pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditProfileTenant(null)} className="h-8 text-xs rounded-[6px]">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs rounded-[6px] bg-primary text-primary-foreground">
                Save Profile Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: BULK WHATSAPP RENT REMINDER ENGINE */}
      <Dialog open={isBulkWhatsAppOpen} onOpenChange={setIsBulkWhatsAppOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#0A1128]/95 border-white/[0.07] backdrop-blur-[24px] rounded-[6px] text-foreground">
          {(() => {
            const overdueTenants = tenants.filter(t => t.balanceUSD > 0);
            const totalArrearsUSD = overdueTenants.reduce((acc, t) => acc + t.balanceUSD, 0);
            const totalArrearsZiG = (totalArrearsUSD * rbzExchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return (
              <div className="space-y-4 py-2">
                <DialogHeader className="border-b border-white/[0.07] pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                        Batch Billing Communications Engine
                      </span>
                      <DialogTitle className="font-serif text-lg text-foreground">
                        Bulk WhatsApp Rent Reminder Engine
                      </DialogTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-rose-400 border-rose-500/30">
                      {overdueTenants.length} Overdue Accounts
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-[4px] bg-[#101C40]/55 border border-white/[0.07] text-center">
                    <span className="text-[10px] text-muted-foreground block">Recipients in Arrears</span>
                    <span className="font-mono font-bold text-foreground text-sm">{overdueTenants.length} Tenants</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-[#101C40]/55 border border-white/[0.07] text-center">
                    <span className="text-[10px] text-muted-foreground block">Total Arrears (USD)</span>
                    <span className="font-mono font-bold text-rose-400 text-sm tabular-nums">${totalArrearsUSD.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-[#101C40]/55 border border-white/[0.07] text-center">
                    <span className="text-[10px] text-muted-foreground block">Equivalent in ZiG (RBZ)</span>
                    <span className="font-mono font-bold text-sky-400 text-sm tabular-nums">ZiG {totalArrearsZiG}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Dynamic Message Template</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Variables: {"{tenantName}, {tradingName}, {unitNumber}, {propertyName}, {arrearsUSD}, {arrearsZiG}, {rbzRate}"}</span>
                  </div>
                  <Textarea
                    rows={3}
                    value={bulkTemplate}
                    onChange={(e) => setBulkTemplate(e.target.value)}
                    className="text-xs font-mono rounded-[4px] bg-slate-900/60 border-white/[0.07]"
                  />
                </div>

                {/* Overdue Queue Table */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Recipient Dispatch Queue
                  </span>
                  <div className="border border-white/[0.07] rounded-[4px] overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-900/80 text-muted-foreground font-mono uppercase text-[9px] border-b border-white/[0.07] sticky top-0">
                        <tr>
                          <th className="p-2 whitespace-nowrap">Tenant Entity</th>
                          <th className="p-2 whitespace-nowrap">Unit</th>
                          <th className="p-2 whitespace-nowrap">Phone Number</th>
                          <th className="p-2 text-right whitespace-nowrap">Arrears USD</th>
                          <th className="p-2 text-right whitespace-nowrap">Arrears ZiG</th>
                          <th className="p-2 text-center whitespace-nowrap">Direct Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {overdueTenants.map((t) => {
                          const cleanPhone = t.phone.replace(/[^0-9]/g, '');
                          const sampleMsg = bulkTemplate
                            .replace('{tenantName}', t.contactPerson)
                            .replace('{tradingName}', t.tradingName)
                            .replace('{unitNumber}', t.unitNumber)
                            .replace('{propertyName}', t.propertyName)
                            .replace('{arrearsUSD}', t.balanceUSD.toLocaleString())
                            .replace('{arrearsZiG}', (t.balanceUSD * rbzExchangeRate).toLocaleString())
                            .replace('{rbzRate}', rbzExchangeRate.toString());
                          const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleMsg)}`;

                          return (
                            <tr key={t.id} className="hover:bg-white/[0.02]">
                              <td className="p-2 font-medium text-foreground">{t.tradingName}</td>
                              <td className="p-2 font-mono text-muted-foreground">{t.unitNumber}</td>
                              <td className="p-2 font-mono text-muted-foreground">{t.phone}</td>
                              <td className="p-2 text-right font-mono text-rose-400 tabular-nums">${t.balanceUSD.toLocaleString()}</td>
                              <td className="p-2 text-right font-mono text-muted-foreground tabular-nums">{(t.balanceUSD * rbzExchangeRate).toLocaleString()}</td>
                              <td className="p-2 text-center">
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                                >
                                  wa.me <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkWhatsAppOpen(false)}
                    className="h-8 text-xs rounded-[6px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isBulkSending || overdueTenants.length === 0}
                    onClick={handleDispatchBulkWhatsApp}
                    className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-[6px] flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBulkSending ? 'Dispatching Notices...' : `Dispatch Batch (${overdueTenants.length})`}</span>
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
