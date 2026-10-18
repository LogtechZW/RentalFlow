import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap,
  Droplet,
  Sun,
  Gauge,
  Calculator,
  Flame,
  CheckCircle2,
  TrendingDown,
  Building2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const InfrastructurePage: React.FC = () => {
  const {
    properties,
    spaces,
    generatorLogs,
    solarLogs,
    meterReadings,
    apportionCAMDieselGenerator,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'prop-1');
  const [dieselPricePerLiter, setDieselPricePerLiter] = useState<number>(1.65);
  const [customRunHours, setCustomRunHours] = useState<number>(140);
  const [fuelBurnRateLph, setFuelBurnRateLph] = useState<number>(55); // Liters per hour for 500KVA
  const [apportionmentMethod, setApportionmentMethod] = useState<'sqm' | 'equal'>('sqm');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Office' | 'Shop'>('all');

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const allOccupiedSpaces = spaces.filter(s => s.propertyId === activeProperty.id && s.status === 'Occupied');
  const propertySpaces = allOccupiedSpaces.filter(s => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'Office') return s.type === 'Office';
    if (typeFilter === 'Shop') return s.type === 'Shop' || s.type === 'Food Court Unit' || s.type === 'Pharmacy Unit' || s.type === 'Kiosk';
    return true;
  });

  const totalOccupiedSqm = propertySpaces.reduce((sum, s) => sum + s.sizeSqm, 0);

  // Apportionment Calculations
  const calculatedFuelLiters = customRunHours * fuelBurnRateLph;
  const totalFuelCostUSD = calculatedFuelLiters * dieselPricePerLiter;
  const maintenanceOverhaulUSD = 450; // Filter & lube oil allocation
  const totalGeneratorOperatingCostUSD = totalFuelCostUSD + maintenanceOverhaulUSD;

  // Rate per sqm vs equal rate per suite
  const levyPerSqmUSD = totalOccupiedSqm > 0 ? totalGeneratorOperatingCostUSD / totalOccupiedSqm : 0;
  const levyPerSqmZiG = levyPerSqmUSD * rbzExchangeRate;
  const levyPerSuiteUSD = propertySpaces.length > 0 ? totalGeneratorOperatingCostUSD / propertySpaces.length : 0;
  const levyPerSuiteZiG = levyPerSuiteUSD * rbzExchangeRate;

  // Filter logs for this property
  const propGenLogs = generatorLogs.filter(g => g.propertyId === activeProperty.id);
  const propSolarLogs = solarLogs.filter(s => s.propertyId === activeProperty.id);
  const propMeterReadings = meterReadings.filter(m => m.propertyId === activeProperty.id);

  const handleApplyApportionment = () => {
    if (propertySpaces.length === 0) {
      toast.error('No occupied suites found to apportion costs.');
      return;
    }
    apportionCAMDieselGenerator(activeProperty.id, totalGeneratorOperatingCostUSD);
    toast.success(
      `CAM Diesel Generator Apportionment of $${totalGeneratorOperatingCostUSD.toFixed(2)} USD (ZiG ${(totalGeneratorOperatingCostUSD * rbzExchangeRate).toFixed(2)}) applied across ${propertySpaces.length} occupied units at ${activeProperty.name}!`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Infrastructure & CAM Engine' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header & Property Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                CAM Infrastructure & Utilities Engine
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono text-primary border-primary/40">
                Load Shedding Resilience
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generator fuel burn apportionment, rooftop solar microgrids, borehole yield, and sub-meter billing.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[200px] h-9 text-xs">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic CAM Diesel Generator Levy Apportionment Engine */}
        <Card className="border border-white/[0.07] shadow-md bg-[#101C40]/55 backdrop-blur-[24px] rounded-[6px]">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>CAM Diesel Generator Cost Apportionment Engine</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Proportionally calculates fuel run expenses across {activeProperty.name}'s occupied commercial floor space.
                </CardDescription>
              </div>

              <Badge variant="secondary" className="font-mono text-xs">
                Plant: {activeProperty.generatorCapacityKVA} KVA Cummins/Perkins
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Control Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-md border border-border/60 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Monthly Generator Run-Hours</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={customRunHours}
                    onChange={(e) => setCustomRunHours(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-mono">hrs</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Commercial Diesel Benchmark (USD/L)</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={dieselPricePerLiter}
                    onChange={(e) => setDieselPricePerLiter(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-mono">$/L</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Average Burn Rate (L/Hour)</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={fuelBurnRateLph}
                    onChange={(e) => setFuelBurnRateLph(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-mono">L/hr</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Occupied Lettable Area</Label>
                <div className="h-8 flex items-center px-2 bg-muted rounded border border-border text-xs font-mono font-semibold">
                  {totalOccupiedSqm.toLocaleString()} m² ({propertySpaces.length} units)
                </div>
              </div>
            </div>

            {/* Calculated Output Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Fuel Burned</span>
                <div className="text-xl font-bold font-serif text-foreground">
                  {calculatedFuelLiters.toLocaleString()} Liters
                </div>
                <div className="text-[10px] text-muted-foreground">
                  @ {fuelBurnRateLph} L/hour consumption
                </div>
              </div>

              <div className="p-3 rounded bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Fuel Cost</span>
                <div className="text-xl font-bold font-serif text-rose-700">
                  ${totalFuelCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-muted-foreground">
                  @ ${dieselPricePerLiter.toFixed(2)}/L pump price
                </div>
              </div>

              <div className="p-3 rounded bg-card border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Plant OpEx</span>
                <div className="text-xl font-bold font-serif text-foreground">
                  ${totalGeneratorOperatingCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Fuel + ${maintenanceOverhaulUSD} lube/filter service
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-50 border border-emerald-300 space-y-1 text-emerald-950">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-800">
                  {apportionmentMethod === 'sqm' ? 'Levy Per Floor Area' : 'Equal Levy Per Suite'}
                </span>
                <div className="text-xl font-bold font-serif text-emerald-800">
                  {apportionmentMethod === 'sqm'
                    ? `$${levyPerSqmUSD.toFixed(3)} / m²`
                    : `$${levyPerSuiteUSD.toFixed(2)} / suite`}
                </div>
                <div className="text-[10px] font-mono text-emerald-700">
                  {apportionmentMethod === 'sqm'
                    ? `ZiG ${levyPerSqmZiG.toFixed(2)} / m²`
                    : `ZiG ${levyPerSuiteZiG.toFixed(2)} / suite`} (RBZ @ {rbzExchangeRate})
                </div>
              </div>
            </div>

            {/* Apportionment Methodology & Space Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/20 rounded-md border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Apportionment Basis:</span>
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-md border border-border">
                  <Button
                    type="button"
                    variant={apportionmentMethod === 'sqm' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setApportionmentMethod('sqm')}
                    className="h-6 text-[11px] px-2.5"
                  >
                    Pro-Rata by Area (m²)
                  </Button>
                  <Button
                    type="button"
                    variant={apportionmentMethod === 'equal' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setApportionmentMethod('equal')}
                    className="h-6 text-[11px] px-2.5"
                  >
                    Equal per Suite / Unit
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Space Scope:</span>
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-md border border-border">
                  <Button
                    type="button"
                    variant={typeFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter('all')}
                    className="h-6 text-[11px] px-2"
                  >
                    All Units ({allOccupiedSpaces.length})
                  </Button>
                  <Button
                    type="button"
                    variant={typeFilter === 'Office' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter('Office')}
                    className="h-6 text-[11px] px-2"
                  >
                    Office Suites Only
                  </Button>
                  <Button
                    type="button"
                    variant={typeFilter === 'Shop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter('Shop')}
                    className="h-6 text-[11px] px-2"
                  >
                    Retail & Shops Only
                  </Button>
                </div>
              </div>
            </div>

            {/* Tenant Space Apportionment Schedule Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Individual Space Apportionment Schedule ({propertySpaces.length} Occupied Units)
                </h4>

                <Button
                  size="sm"
                  onClick={handleApplyApportionment}
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Apportion & Apply to Space Ledgers</span>
                </Button>
              </div>

              <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card">
                <Table className="[&>div]:max-w-full text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Unit #</TableHead>
                      <TableHead className="whitespace-nowrap">Tenant Name</TableHead>
                      <TableHead className="whitespace-nowrap">Space Type & Zone</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Floor Area (m²)</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Calculated Share (%)</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Apportioned Levy (USD)</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Apportioned Levy (ZiG)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertySpaces.map((sp) => {
                      const sharePercent = apportionmentMethod === 'sqm'
                        ? (totalOccupiedSqm > 0 ? (sp.sizeSqm / totalOccupiedSqm) * 100 : 0)
                        : (propertySpaces.length > 0 ? (1 / propertySpaces.length) * 100 : 0);
                      const unitLevyUSD = apportionmentMethod === 'sqm'
                        ? sp.sizeSqm * levyPerSqmUSD
                        : levyPerSuiteUSD;
                      const unitLevyZiG = unitLevyUSD * rbzExchangeRate;

                      return (
                        <TableRow key={sp.id} className="hover:bg-muted/50">
                          <TableCell className="whitespace-nowrap font-mono font-bold text-foreground">
                            {sp.unitPrefix || 'Unit'} {sp.unitNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-foreground">
                            {sp.currentTenantName || 'Occupied Tenant'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {sp.type} • {sp.zone}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono font-semibold">
                            {sp.sizeSqm} m²
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-muted-foreground">
                            {sharePercent.toFixed(1)}%
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono font-bold text-rose-700">
                            ${unitLevyUSD.toFixed(2)} USD
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-emerald-800">
                            ZiG {unitLevyZiG.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solar Microgrid, Borehole & Sub-Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Solar Microgrid */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Rooftop Solar Microgrid</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Clean energy offset during peak daytime tariff
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/40 rounded border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity Installed:</span>
                  <span className="font-semibold text-foreground">{activeProperty.solarCapacityKVA} KVA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Daily Yield:</span>
                  <span className="font-mono text-emerald-700 font-semibold">820 kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery Storage:</span>
                  <span className="font-mono text-foreground font-semibold">94% State of Charge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Monthly Savings:</span>
                  <span className="font-mono text-emerald-700 font-bold">$1,240 USD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borehole & Water Infrastructure */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif font-bold flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-500" />
                <span>Borehole Water & Reservoir</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Self-contained water supply & filtration system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/40 rounded border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borehole Status:</span>
                  <span className="font-semibold text-emerald-700">Operational & Tested</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reservoir Capacity:</span>
                  <span className="font-mono text-foreground font-semibold">45,000 Liters (88%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pumping Yield:</span>
                  <span className="font-mono text-foreground font-semibold">4,200 L/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Rating:</span>
                  <span className="font-semibold text-sky-700">Potable (UV Filtered)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sub-Meter Audit */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif font-bold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                <span>Sub-Meter Telemetry</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Individual electricity & water check meters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/40 rounded border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meters Installed:</span>
                  <span className="font-semibold text-foreground">18 Digital Check Meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Electricity Tariff:</span>
                  <span className="font-mono text-foreground font-semibold">$0.18 / kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Water Tariff:</span>
                  <span className="font-mono text-foreground font-semibold">$1.40 / m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telemetry Health:</span>
                  <span className="font-semibold text-emerald-700">100% Online</span>
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
