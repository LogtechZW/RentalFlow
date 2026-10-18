import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { UtilityMeterReading } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Gauge,
  Zap,
  Droplets,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export const MeterReadingsPage: React.FC = () => {
  const {
    meterReadings,
    addMeterReading,
    deleteMeterReading,
    apportionMeterToInvoice,
    properties,
    spaces,
    tenants,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Electricity' | 'Water'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'Pending' | 'Invoiced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formPropertyId, setFormPropertyId] = useState<string>(properties[0]?.id || '');
  const [formUnitNumber, setFormUnitNumber] = useState<string>('101');
  const [formMeterType, setFormMeterType] = useState<'Electricity' | 'Water'>('Electricity');
  const [formSerialNumber, setFormSerialNumber] = useState<string>('ZETDC-3P-4892');
  const [formPrevReading, setFormPrevReading] = useState<string>('14200');
  const [formCurrReading, setFormCurrReading] = useState<string>('15450');
  const [formMultiplier, setFormMultiplier] = useState<string>('1.0');
  const [formRatePerUnit, setFormRatePerUnit] = useState<string>('0.18');
  const [formReadingDate, setFormReadingDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const canEdit = ['Property Owner', 'Property Manager', 'Administrator', 'Accountant'].includes(activeRole);

  // Live calculations for form
  const prevVal = parseFloat(formPrevReading) || 0;
  const currVal = parseFloat(formCurrReading) || 0;
  const multVal = parseFloat(formMultiplier) || 1.0;
  const rateVal = parseFloat(formRatePerUnit) || 0.18;
  const rawConsumption = Math.max(0, currVal - prevVal);
  const calcConsumption = Math.round(rawConsumption * multVal * 100) / 100;
  const calcTotalUSD = Math.round(calcConsumption * rateVal * 100) / 100;
  const calcTotalZiG = Math.round(calcTotalUSD * rbzExchangeRate * 100) / 100;

  // Filtered readings
  const filteredReadings = meterReadings.filter(m => {
    if (selectedPropertyId !== 'all' && m.propertyId !== selectedPropertyId) return false;
    if (selectedTypeFilter !== 'all' && m.meterType !== selectedTypeFilter) return false;
    if (selectedStatusFilter !== 'all') {
      const status = m.invoicedStatus || 'Pending';
      if (status !== selectedStatusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const unit = m.unitNumber.toLowerCase();
      const tenant = (m.tenantName || '').toLowerCase();
      const serial = (m.meterSerialNumber || '').toLowerCase();
      const prop = m.propertyName.toLowerCase();
      if (!unit.includes(q) && !tenant.includes(q) && !serial.includes(q) && !prop.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Aggregate metrics
  const totalCostUSD = meterReadings.reduce((sum, m) => sum + (m.totalCostUSD || 0), 0);
  const totalCostZiG = totalCostUSD * rbzExchangeRate;
  const electricityReadings = meterReadings.filter(m => m.meterType === 'Electricity');
  const waterReadings = meterReadings.filter(m => m.meterType === 'Water');
  const totalKWh = electricityReadings.reduce((sum, m) => sum + (m.consumption || 0), 0);
  const totalM3 = waterReadings.reduce((sum, m) => sum + (m.consumption || 0), 0);
  const invoicedCount = meterReadings.filter(m => m.invoicedStatus === 'Invoiced').length;
  const apportionmentRate = meterReadings.length > 0 ? Math.round((invoicedCount / meterReadings.length) * 100) : 0;

  const handleOpenAddModal = () => {
    const prop = properties[0];
    setFormPropertyId(prop?.id || '');
    const sp = spaces.find(s => s.propertyId === prop?.id);
    setFormUnitNumber(sp?.unitNumber || '101');
    setFormMeterType('Electricity');
    setFormSerialNumber(`ZETDC-3P-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPrevReading('14200');
    setFormCurrReading('15450');
    setFormMultiplier('1.0');
    setFormRatePerUnit('0.18');
    setFormReadingDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleOpenAddElectricityModal = () => {
    const prop = properties[0];
    setFormPropertyId(prop?.id || '');
    const sp = spaces.find(s => s.propertyId === prop?.id);
    setFormUnitNumber(sp?.unitNumber || '101');
    setFormMeterType('Electricity');
    setFormSerialNumber(`ZETDC-3P-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPrevReading('14200');
    setFormCurrReading('15450');
    setFormMultiplier('1.0');
    setFormRatePerUnit('0.18');
    setFormReadingDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleOpenAddWaterModal = () => {
    const prop = properties[0];
    setFormPropertyId(prop?.id || '');
    const sp = spaces.find(s => s.propertyId === prop?.id);
    setFormUnitNumber(sp?.unitNumber || '101');
    setFormMeterType('Water');
    setFormSerialNumber(`CITY-WTR-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPrevReading('420');
    setFormCurrReading('485');
    setFormMultiplier('1.0');
    setFormRatePerUnit('1.50');
    setFormReadingDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleMeterTypeChange = (type: 'Electricity' | 'Water') => {
    setFormMeterType(type);
    if (type === 'Electricity') {
      setFormRatePerUnit('0.18');
      setFormSerialNumber(`ZETDC-3P-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormPrevReading('14200');
      setFormCurrReading('15450');
    } else {
      setFormRatePerUnit('1.50');
      setFormSerialNumber(`CITY-WTR-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormPrevReading('420');
      setFormCurrReading('485');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currVal < prevVal) {
      toast.error('Current reading cannot be lower than previous reading!');
      return;
    }

    const prop = properties.find(p => p.id === formPropertyId);
    const sp = spaces.find(s => s.propertyId === formPropertyId && s.unitNumber === formUnitNumber);
    const tenant = tenants.find(t => t.id === sp?.currentTenantId);

    addMeterReading({
      propertyId: formPropertyId,
      propertyName: prop?.name || 'Joina City',
      unitNumber: formUnitNumber,
      meterType: formMeterType,
      meterSerialNumber: formSerialNumber,
      previousReading: prevVal,
      currentReading: currVal,
      consumption: calcConsumption,
      multiplier: multVal,
      ratePerUnitUSD: rateVal,
      totalCostUSD: calcTotalUSD,
      readingDate: formReadingDate,
      tenantId: tenant?.id,
      tenantName: tenant?.tradingName || sp?.currentTenantName || 'Tenant',
      invoicedStatus: 'Pending',
    });

    toast.success(`${formMeterType} reading for Unit ${formUnitNumber} recorded successfully!`);
    setIsAddModalOpen(false);
  };

  const handleApportionAllPending = () => {
    const pendingList = meterReadings.filter(m => (m.invoicedStatus || 'Pending') === 'Pending');
    if (pendingList.length === 0) {
      toast.info('All meter readings are already invoiced.');
      return;
    }

    pendingList.forEach(m => {
      apportionMeterToInvoice(m.id, `INV-MET-${Date.now().toString().slice(-4)}`);
    });

    toast.success(`Successfully apportioned ${pendingList.length} meter utility charges to tenant monthly tax invoices!`);
  };

  const handleExportCSV = () => {
    if (filteredReadings.length === 0) {
      toast.error('No meter readings to export.');
      return;
    }

    const headers = [
      'Date',
      'Property',
      'Unit Number',
      'Tenant',
      'Meter Type',
      'Serial Number',
      'Previous Reading',
      'Current Reading',
      'Consumption Units',
      'Rate USD',
      'Total Cost USD',
      'Total Cost ZiG',
      'Status'
    ];

    const rows = filteredReadings.map(m => [
      m.readingDate,
      `"${m.propertyName}"`,
      m.unitNumber,
      `"${m.tenantName || 'Unassigned'}"`,
      m.meterType,
      m.meterSerialNumber || 'N/A',
      m.previousReading,
      m.currentReading,
      m.consumption,
      m.ratePerUnitUSD,
      m.totalCostUSD.toFixed(2),
      (m.totalCostUSD * rbzExchangeRate).toFixed(2),
      m.invoicedStatus || 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RentFlowPro_SubMeter_Readings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Meter readings schedule exported to CSV!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Sub-Meter Readings & Utilities' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Gauge className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
                Sub-Meter Readings & Utilities
              </h1>
              <Badge
                variant="outline"
                className="text-xs font-mono bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900 rounded-md py-0.5 px-2 font-medium"
              >
                1 USD = {rbzExchangeRate.toFixed(2)} ZiG
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ZETDC 3-phase electricity check meters and commercial water sub-metering with direct dual-currency tax invoice apportionment.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-3 text-xs border-slate-300 dark:border-slate-700 bg-background hover:bg-muted font-normal flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Schedule</span>
            </Button>

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApportionAllPending}
                  className="h-9 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40 font-normal flex items-center gap-1.5 shadow-2xs"
                  title="Apportion all pending unbilled readings to tenant tax invoices"
                >
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <span>Apportion to Invoices</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddWaterModal}
                  className="h-9 px-3 text-xs border-cyan-300 text-cyan-800 dark:text-cyan-300 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span>Record Water</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenAddElectricityModal}
                  className="h-9 px-3.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <Zap className="w-4 h-4" />
                  <span>Record Electricity</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Metered Utility Charges */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">METERED CHARGES (USD)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-foreground">
                ${totalCostUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Equivalent: ZiG {totalCostZiG.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Card 2: Electricity Check Meters */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">ELECTRICITY CONSUMPTION</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-amber-600">
                {totalKWh.toLocaleString()} kWh
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {electricityReadings.length} active 3-phase check meters
              </p>
            </div>
          </div>

          {/* Card 3: Water Sub-Meters */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">WATER CONSUMPTION</span>
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-blue-600">
                {totalM3.toLocaleString()} m³
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {waterReadings.length} commercial sub-meters logged
              </p>
            </div>
          </div>

          {/* Card 4: Apportionment Rate */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">INVOICE APPORTIONMENT</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-serif text-foreground">
                {apportionmentRate}%
              </div>
              <div className="w-full bg-blue-100 dark:bg-blue-950/60 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, apportionmentRate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tariff Reference Strip */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100/60 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300">
              Approved Commercial Tariffs
            </Badge>
            <span className="text-muted-foreground">
              Official commercial utility billing multipliers applied across all tenant spaces.
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>ZETDC 3-Phase Check: <strong>$0.18/kWh</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Commercial Water: <strong>$1.50/m³</strong></span>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by unit number, tenant, serial..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs">
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-[170px] h-9 text-xs">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTypeFilter} onValueChange={(v: any) => setSelectedTypeFilter(v)}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Meter Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Utilities</SelectItem>
                  <SelectItem value="Electricity">⚡ Electricity</SelectItem>
                  <SelectItem value="Water">💧 Water</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatusFilter} onValueChange={(v: any) => setSelectedStatusFilter(v)}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending Invoicing</SelectItem>
                  <SelectItem value="Invoiced">Invoiced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Readings Table / List */}
        <div className="bg-card border border-border/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Sub-Meter Readings Register</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredReadings.length} of {meterReadings.length} readings
            </span>
          </div>

          <div className="w-full overflow-x-auto bg-card">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Reading Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Property / Suite</th>
                  <th className="px-4 py-3 whitespace-nowrap">Meter Type & Serial</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Previous Reading</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Current Reading</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Consumption</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Tariff Rate</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Total USD (ZiG)</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">Invoice Status</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredReadings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                      No utility sub-meter readings found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReadings.map((reading) => {
                    const isInvoiced = reading.invoicedStatus === 'Invoiced';
                    const isElec = reading.meterType === 'Electricity';
                    const unitLabel = isElec ? 'kWh' : 'm³';

                    return (
                      <tr key={reading.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-muted-foreground">
                          {reading.readingDate}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-foreground">Unit {reading.unitNumber}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {reading.tenantName || reading.propertyName}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isElec ? (
                              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="font-medium text-foreground">{reading.meterType}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {reading.meterSerialNumber || 'Standard'}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-muted-foreground">
                          {reading.previousReading.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-medium text-foreground">
                          {reading.currentReading.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-foreground">
                          {reading.consumption.toLocaleString()} {unitLabel}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-muted-foreground">
                          ${reading.ratePerUnitUSD.toFixed(2)}/{unitLabel}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="font-bold font-mono text-emerald-600">
                            ${reading.totalCostUSD.toFixed(2)}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            ZiG {(reading.totalCostUSD * rbzExchangeRate).toFixed(2)}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {isInvoiced ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px] font-normal px-2 py-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              <span>Invoiced</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-300 text-[10px] font-normal px-2 py-0">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Pending</span>
                            </Badge>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isInvoiced && canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  apportionMeterToInvoice(reading.id);
                                  toast.success(`Apportioned reading for Unit ${reading.unitNumber} to monthly invoice!`);
                                }}
                                className="h-7 px-2 text-[11px] border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                title="Apportion directly to tenant invoice"
                              >
                                Apportion
                              </Button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Delete this utility meter reading?')) {
                                    deleteMeterReading(reading.id);
                                    toast.success('Reading removed.');
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete reading"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Record Meter Reading Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-serif font-bold flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Record Utility Sub-Meter Reading</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Input tenant suite readings for automated consumption calculation and tax invoice apportionment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Commercial Property</Label>
                <Select value={formPropertyId} onValueChange={setFormPropertyId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Unit Number / Suite</Label>
                <Select value={formUnitNumber} onValueChange={setFormUnitNumber}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces
                      .filter(s => s.propertyId === formPropertyId)
                      .map(s => (
                        <SelectItem key={s.id} value={s.unitNumber}>
                          Unit {s.unitNumber} {s.customName ? `(${s.customName})` : ''}
                        </SelectItem>
                      ))}
                    {spaces.filter(s => s.propertyId === formPropertyId).length === 0 && (
                      <SelectItem value="101">Unit 101</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Utility Type</Label>
                <Select value={formMeterType} onValueChange={(v: any) => handleMeterTypeChange(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Utility Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electricity">⚡ Electricity (ZETDC 3-Phase)</SelectItem>
                    <SelectItem value="Water">💧 Commercial Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Meter Serial Number</Label>
                <Input
                  type="text"
                  value={formSerialNumber}
                  onChange={e => setFormSerialNumber(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="e.g. ZETDC-3P-4892"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Previous Reading</Label>
                <Input
                  type="number"
                  step="any"
                  value={formPrevReading}
                  onChange={e => setFormPrevReading(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Current Reading</Label>
                <Input
                  type="number"
                  step="any"
                  value={formCurrReading}
                  onChange={e => setFormCurrReading(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">CT / VT Multiplier</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formMultiplier}
                  onChange={e => setFormMultiplier(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="1.0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tariff Rate (USD per Unit)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formRatePerUnit}
                  onChange={e => setFormRatePerUnit(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Reading Date</Label>
              <Input
                type="date"
                value={formReadingDate}
                onChange={e => setFormReadingDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1.5 text-xs">
              <span className="font-semibold text-foreground block">Automated Calculation Preview:</span>
              <div className="flex justify-between text-muted-foreground">
                <span>Net Consumption:</span>
                <span className="font-mono font-bold text-foreground">
                  {calcConsumption.toLocaleString()} {formMeterType === 'Electricity' ? 'kWh' : 'm³'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Calculated Total (USD):</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${calcTotalUSD.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Local Currency Equivalent:</span>
                <span className="font-mono font-bold text-blue-600">
                  ZiG {calcTotalZiG.toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save & Record Reading
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
