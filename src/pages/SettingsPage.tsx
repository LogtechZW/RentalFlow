import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { UserRole } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Settings,
  Sparkles,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Shield,
  ShieldCheck,
  Building2,
  Layers,
  Users,
  ReceiptText,
  CreditCard,
  FileCheck2,
  Wrench,
  Trash2,
  CheckCircle2,
  Calendar,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { RENTFLOW_LOGO_URL } from '@/services/mockData';

export const SettingsPage: React.FC = () => {
  const {
    corporateLogo,
    setCorporateLogo,
    rbzExchangeRate,
    setRbzExchangeRate,
    activeRole,
    currentUser,
    setActiveRole,
    cleanSlateReset,
    bulkDeleteProperties,
    bulkDeleteSpaces,
    bulkDeleteTenants,
    bulkDeleteInvoices,
    bulkDeletePayments,
    bulkDeleteLeases,
    bulkDeleteMaintenanceTickets,
    properties,
    spaces,
    tenants,
    invoices,
    payments,
    leases,
    maintenanceTickets,
  } = useRentFlow();

  // Branding states
  const [logoInput, setLogoInput] = useState<string>(corporateLogo);
  const [logoPreview, setLogoPreview] = useState<string>(corporateLogo);

  // RBZ & Currency states
  const [exchangeRateInput, setExchangeRateInput] = useState<string>(rbzExchangeRate.toString());
  const [primaryCurrency, setPrimaryCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [secondaryCurrency, setSecondaryCurrency] = useState<'ZiG' | 'USD'>('ZiG');

  // Automated WhatsApp Rent Statement Scheduler states
  const [schedulerEnabled, setSchedulerEnabled] = useState<boolean>(true);
  const [dispatchDay, setDispatchDay] = useState<string>('1');
  const [attachCamBreakdown, setAttachCamBreakdown] = useState<boolean>(true);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(
    'Dear {{tenant_name}},\n\nYour monthly commercial statement for unit {{unit_number}} at {{property_name}} is now ready.\nTarget Rent: ${{target_rent_usd}} (ZiG {{target_rent_zig}})\nOfficial RBZ Exchange Rate: 1 USD = {{rbz_rate}} ZiG\n\nPlease submit payment to avoid late default penalties.\n\nThank you,\nRentFlow Commercial Property Management'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setLogoPreview(base64);
        setLogoInput(base64);
        setCorporateLogo(base64);
        toast.success('Custom corporate logo uploaded and applied across all invoices & reports!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoInput.trim()) return;
    setLogoPreview(logoInput.trim());
    setCorporateLogo(logoInput.trim());
    toast.success('Corporate letterhead logo updated!');
  };

  const handleResetToDefaultLogo = () => {
    setLogoInput(RENTFLOW_LOGO_URL);
    setLogoPreview(RENTFLOW_LOGO_URL);
    setCorporateLogo(RENTFLOW_LOGO_URL);
    toast.info('Reset corporate letterhead logo to default RentFlowPro emblem.');
  };

  const handleSaveExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(exchangeRateInput);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid positive exchange rate.');
      return;
    }
    setRbzExchangeRate(rate);
    toast.success(`RBZ Interbank exchange rate updated to 1 USD = ${rate.toFixed(2)} ZiG across all modules!`);
  };

  const handleSaveScheduler = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Automated WhatsApp Rent Statement Scheduler saved! Dispatch scheduled for Day ${dispatchDay} of each month.`);
  };

  const handleCleanSlate = () => {
    cleanSlateReset();
    toast.success('Clean slate completed: Space accumulation progress zeroed ($0.00), tenant balances reset, and payments cleared. Physical building footprints preserved.');
  };

  const rolesList: { role: UserRole; desc: string }[] = [
    { role: 'Property Owner', desc: 'Executive portfolio overview, asset collection performance, and net yields.' },
    { role: 'Property Manager', desc: 'Commercial space management, tenant leases, infrastructure CAM, and work orders.' },
    { role: 'Accountant', desc: 'Dual-currency tax invoices, payment receipting, CAM reconciliation, and ZIMRA tax ledgers.' },
    { role: 'Administrator', desc: 'Full system privileges, security settings, user roles, and master database wipes.' },
    { role: 'Tenant', desc: 'Tenant portal for space statements, payment receipts, and maintenance tickets.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Settings' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Settings className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
                System Settings & Enterprise Configuration
              </h1>
              <Badge variant="outline" className="text-xs font-mono">
                RentFlowPro v27.0 Enterprise
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Corporate branding, automated WhatsApp scheduler, RBZ exchange rate parameters, and role permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Custom Corporate Logo Uploader */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Custom Corporate Logo Uploader</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Upload your corporate letterhead logo (PNG/JPEG/SVG) with instant live preview. Automatically propagates to all print invoices, receipts, and reports.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Live Preview Box */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border flex flex-col items-center justify-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Live Preview</span>
                <div className="h-14 w-full flex items-center justify-center bg-card rounded p-2 border border-border/60">
                  <img src={logoPreview} alt="Corporate Logo Preview" className="h-full object-contain max-w-[240px]" />
                </div>
              </div>

              {/* Upload Input & URL input */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Upload Image File (PNG, JPG, SVG - Max 2MB)</Label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex-1">
                      <div className="flex items-center justify-center gap-2 h-9 px-3 border border-input rounded-md bg-background hover:bg-muted text-xs text-muted-foreground transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Local Logo File</span>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetToDefaultLogo}
                      className="h-9 text-xs"
                      title="Reset to default RentFlowPro official emblem"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>Reset</span>
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSaveLogoUrl} className="space-y-2 pt-1 border-t border-border/60">
                  <Label className="text-xs font-medium">Or Set Public Logo URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={logoInput}
                      onChange={(e) => setLogoInput(e.target.value)}
                      className="h-9 text-xs font-mono flex-1"
                      placeholder="https://example.com/logo.png"
                    />
                    <Button type="submit" size="sm" className="h-9 text-xs shrink-0">
                      Apply URL
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: RBZ Exchange Rate & Currencies */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>RBZ Exchange Rate & Dual-Currency Configuration</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Update official Reserve Bank of Zimbabwe exchange rate and dual-currency display defaults.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <form onSubmit={handleSaveExchangeRate} className="space-y-4">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold block uppercase">
                      ACTIVE INTERBANK BENCHMARK
                    </span>
                    <span className="text-xl font-bold font-serif text-emerald-800 dark:text-emerald-200">
                      1 USD = {rbzExchangeRate.toFixed(2)} ZiG
                    </span>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs">
                    ZIMRA Compliant
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Official Exchange Rate (1 USD to ZiG)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={exchangeRateInput}
                      onChange={(e) => setExchangeRateInput(e.target.value)}
                      className="h-9 text-xs font-mono flex-1"
                      required
                    />
                    <Button type="submit" size="sm" className="h-9 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
                      Apply Rate
                    </Button>
                  </div>
                </div>

                {/* Quick Presets for Exchange Rate */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-muted-foreground block">Quick RBZ Benchmark Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[25.50, 26.50, 26.85, 27.20, 27.50, 28.00].map((rate) => (
                      <Button
                        key={rate}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExchangeRateInput(rate.toFixed(2));
                          setRbzExchangeRate(rate);
                          toast.success(`RBZ rate set to 1 USD = ${rate.toFixed(2)} ZiG`);
                        }}
                        className={`h-7 text-[11px] font-mono px-2 ${
                          Math.abs(rbzExchangeRate - rate) < 0.01
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 font-bold'
                            : ''
                        }`}
                      >
                        {rate.toFixed(2)} ZiG
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Live Real-Time Conversion Preview */}
                <div className="p-2.5 bg-muted/40 rounded-md border border-border/70 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Sample $1,000 USD Rent:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ZiG {(1000 * (parseFloat(exchangeRateInput) || rbzExchangeRate)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Primary Base Currency</Label>
                    <Select value={primaryCurrency} onValueChange={(v: any) => setPrimaryCurrency(v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($) - Nostro FCA</SelectItem>
                        <SelectItem value="ZiG">ZiG - Zimbabwe Gold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Secondary Dual Currency</Label>
                    <Select value={secondaryCurrency} onValueChange={(v: any) => setSecondaryCurrency(v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZiG">ZiG - Zimbabwe Gold</SelectItem>
                        <SelectItem value="USD">USD ($) - Nostro FCA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Automated Monthly WhatsApp Rent Statement Scheduler */}
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Automated Monthly WhatsApp Rent Statement Scheduler</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{schedulerEnabled ? 'Scheduler Active' : 'Paused'}</span>
                <Switch checked={schedulerEnabled} onCheckedChange={setSchedulerEnabled} />
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Configurable automated dispatch engine allowing choice of dispatch day (1st–28th), customizable template message tokens, and automatic CAM attachment toggles.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <form onSubmit={handleSaveScheduler} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Monthly Dispatch Billing Day</span>
                  </Label>
                  <Select value={dispatchDay} onValueChange={setDispatchDay}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Day {day} of each month {day === 1 ? '(1st of the month - Recommended)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Statements will automatically dispatch to commercial tenants via WhatsApp API on this day.
                  </p>
                </div>

                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold block">Automatic CAM Diesel & Utility Attachment</Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Include generator fuel levy & sub-meter readings in the message
                      </p>
                    </div>
                    <Switch checked={attachCamBreakdown} onCheckedChange={setAttachCamBreakdown} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">WhatsApp Message Template</Label>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <span className="text-primary cursor-pointer hover:underline" onClick={() => setWhatsappTemplate(prev => prev + ' {{tenant_name}}')}>+tenant_name</span> •
                    <span className="text-primary cursor-pointer hover:underline" onClick={() => setWhatsappTemplate(prev => prev + ' {{target_rent_usd}}')}>+target_rent_usd</span> •
                    <span className="text-primary cursor-pointer hover:underline" onClick={() => setWhatsappTemplate(prev => prev + ' {{rbz_rate}}')}>+rbz_rate</span>
                  </div>
                </div>
                <Textarea
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="min-h-[110px] text-xs font-mono"
                  placeholder="Template message with tokens..."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-9 px-4 text-xs flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Scheduler Configuration</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 4: Role-Based Access Control (RBAC) */}
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Role-Based Access Control (RBAC)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select or switch between active operational roles to verify tenant privacy, executive access, and accounting restrictions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rolesList.filter(({ role }) => currentUser?.availableRoles.includes(role)).map(({ role, desc }) => {
                const isActive = activeRole === role;
                return (
                  <div
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      toast.success(`Active role changed to ${role}`);
                    }}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border/70 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          {role}
                        </span>
                        {isActive && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] py-0 px-1.5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                        {desc}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRole(role);
                        toast.success(`Active role changed to ${role}`);
                      }}
                      className="h-7 text-[11px] w-full"
                    >
                      {isActive ? 'Currently Active' : `Switch to ${role}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Data Administration & Clean Slate Reset */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clean Slate Card */}
          <Card className="border border-amber-300 shadow-xs bg-amber-50/15 lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-serif font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Clean Slate (Zero Counters)</span>
                </CardTitle>
                <Badge variant="outline" className="border-amber-300 text-amber-800 text-[10px]">
                  PRESERVES BUILDINGS
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Zeroes all rental accumulation progress ($0.00), resets tenant balances, and clears payments while keeping physical buildings intact.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Use this utility to start a new billing or financial collection cycle. All physical buildings and shop units remain intact, but all financial accumulation counters and arrears are reset to zero.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs border-amber-400 text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 w-full"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Run Clean Slate (Zero Counters)</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-serif">Run Clean Slate Reset?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      This will reset all space rental accumulations to $0.00, clear tenant overdue balances, and wipe payment records. All physical buildings and shop configurations will be preserved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCleanSlate} className="h-8 text-xs bg-amber-600 text-white hover:bg-amber-700">
                      Confirm Clean Slate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Granular Module Wipe Controls */}
          <Card className="border border-border/80 shadow-xs lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif font-bold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Granular Module Wipe Controls (Database Administration)</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Permanently purge data records per individual commercial domain.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Properties */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><Building2 className="w-3 h-3 text-primary" /> Properties</span>
                    <Badge variant="outline" className="text-[10px]">{properties.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Commercial Properties?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This removes all property complexes.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeleteProperties(); toast.success('All properties wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Spaces */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><Layers className="w-3 h-3 text-primary" /> Spaces</span>
                    <Badge variant="outline" className="text-[10px]">{spaces.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Leasable Spaces?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This clears all unit rack configurations.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeleteSpaces(); toast.success('All spaces wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Tenants */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><Users className="w-3 h-3 text-primary" /> Tenants</span>
                    <Badge variant="outline" className="text-[10px]">{tenants.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Tenants?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This removes all tenant profile records.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeleteTenants(); toast.success('All tenants wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Invoices */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><ReceiptText className="w-3 h-3 text-primary" /> Invoices</span>
                    <Badge variant="outline" className="text-[10px]">{invoices.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Tax Invoices?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This removes all billing invoices.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeleteInvoices(); toast.success('All invoices wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Payments */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><CreditCard className="w-3 h-3 text-primary" /> Payments</span>
                    <Badge variant="outline" className="text-[10px]">{payments.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Payments?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This removes all payment receipts.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeletePayments(); toast.success('All payments wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Leases */}
                <div className="p-2.5 bg-card border border-border rounded-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1"><FileCheck2 className="w-3 h-3 text-primary" /> Leases</span>
                    <Badge variant="outline" className="text-[10px]">{leases.length}</Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] text-destructive hover:bg-destructive/10 mt-2 w-full">
                        Wipe All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-serif">Delete All Leases?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">This removes all signed lease agreements.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { bulkDeleteLeases(); toast.success('All leases wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
