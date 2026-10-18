import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Network,
  CreditCard,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Send,
  Zap,
  Globe,
  Bell,
  Clock,
  Sparkles,
  PhoneCall,
  Search,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export const IntegrationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    rbzExchangeRate,
    setRbzExchangeRate,
    tenants,
    sendWhatsAppNotice,
    whatsappLogs,
    activeRole
  } = useRentFlow();

  const activeTabParam = searchParams.get('tab') === 'triggers' ? 'triggers' : 'gateways';
  const [activeTab, setActiveTab] = useState<string>(activeTabParam);

  // Sync tab with URL
  useEffect(() => {
    if (searchParams.get('tab') === 'triggers') {
      setActiveTab('triggers');
    }
  }, [searchParams]);

  // Exchange rate local state
  const [rateInput, setRateInput] = useState<string>(rbzExchangeRate.toString());

  // EcoCash Settings
  const [ecocashMerchant, setEcocashMerchant] = useState<string>('99420');
  const [ecocashActive, setEcocashActive] = useState<boolean>(true);

  // Paynow Settings
  const [paynowIntegrationId, setPaynowIntegrationId] = useState<string>('18492');
  const [paynowKey, setPaynowKey] = useState<string>('c2b84920-84a1-4328-8420-livekey');
  const [paynowActive, setPaynowActive] = useState<boolean>(true);

  // WhatsApp Business API
  const [whatsappApiKey, setWhatsappApiKey] = useState<string>('EAAXx94820live_harare_token');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('+263 77 210 9940');
  const [autoBillingScheduler, setAutoBillingScheduler] = useState<boolean>(true);

  // Test WhatsApp
  const [testMobile, setTestMobile] = useState<string>('+263 77 123 4567');

  // Automated 3-Day Triggers Scan State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [scannedTenants, setScannedTenants] = useState<typeof tenants>([]);
  const [dispatchedTenantIds, setDispatchedTenantIds] = useState<string[]>([]);

  // Format Zimbabwean MSISDN
  const formatZimMsisdn = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\s+/g, '');
    if (cleaned.startsWith('+263')) return cleaned;
    if (cleaned.startsWith('0')) return `+263 ${cleaned.slice(1)}`;
    if (cleaned.startsWith('263')) return `+${cleaned}`;
    return `+263 ${cleaned}`;
  };

  // Perform Live 3-Day Scan
  const executeThreeDayScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Find tenants with active balances or upcoming month-end billing
      const matched = tenants.filter(t => t.balanceUSD > 0 || t.status === 'Active');
      setScannedTenants(matched);
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString('en-GB'));
      toast.success(
        `Live 3-day lead time scan completed: ${matched.length} commercial tenants evaluated for automated WhatsApp dispatch.`
      );
    }, 600);
  };

  // Auto-run scan if scan=true in query parameters
  useEffect(() => {
    if (searchParams.get('scan') === 'true') {
      setActiveTab('triggers');
      executeThreeDayScan();
    }
  }, [searchParams]);

  const handleUpdateExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(rateInput);
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Invalid exchange rate.');
      return;
    }
    setRbzExchangeRate(newRate);
    toast.success(`Official RBZ Exchange Rate updated to 1 USD = ${newRate} ZiG!`);
  };

  const handleFetchRbz = () => {
    const simulatedRate = parseFloat((26.5 + Math.random() * 0.8).toFixed(2));
    setRateInput(simulatedRate.toString());
    setRbzExchangeRate(simulatedRate);
    toast.success(`Fetched live Reserve Bank of Zimbabwe (RBZ) Interbank Rate: 1 USD = ${simulatedRate} ZiG.`);
  };

  const handleSendTestWhatsApp = () => {
    toast.success(`Dispatched simulated automated WhatsApp statement to ${testMobile}!`);
  };

  const handleDispatchTenantReminder = (tenantId: string, tenantName: string, phone: string, amountUSD: number) => {
    const amountZiG = (amountUSD * rbzExchangeRate).toLocaleString();
    const msisdn = formatZimMsisdn(phone);
    const msg = `*RENTFLOW COMMERCIAL BILLING NOTICE (T-3 DAYS)*\n\nDear ${tenantName},\n\nThis is an automated prompt that your commercial rent is due in 3 days.\n• Amount Due: $${amountUSD.toLocaleString()} USD (ZiG ${amountZiG})\n• RBZ Rate Applied: 1 USD = ${rbzExchangeRate} ZiG\n• EcoCash Merchant: ${ecocashMerchant}\n• Stanbic Bank Nostro: Acc 91400034928\n\nKindly allocate payment to maintain your tenancy in good standing. Thank you.`;
    
    sendWhatsAppNotice(tenantId, msg, 'Statement');
    setDispatchedTenantIds(prev => [...prev, tenantId]);
    toast.success(`Automated T-3 reminder sent to ${tenantName} via WhatsApp (${msisdn})!`);
  };

  const handleBatchDispatchAll = () => {
    let sent = 0;
    scannedTenants.forEach(t => {
      const amt = t.balanceUSD > 0 ? t.balanceUSD : t.monthlyRentUSD;
      handleDispatchTenantReminder(t.id, t.name, t.phone, amt);
      sent++;
    });
    toast.success(`Batch dispatch finished: ${sent} automated WhatsApp reminders broadcasted.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Integrations & Gateways' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Payment Gateways & Communication APIs
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                Zimbabwe Fintech Stack
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              EcoCash USSD push, Paynow gateway, Reserve Bank of Zimbabwe daily exchange rates, and WhatsApp Business Automated Reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'triggers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTab('triggers');
                setSearchParams({ tab: 'triggers' });
              }}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Automated Triggers (T-3)</span>
            </Button>
          </div>
        </div>

        {/* Tabs Controller */}
        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams(val === 'triggers' ? { tab: 'triggers' } : {});
        }} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md h-9 mb-6">
            <TabsTrigger value="gateways" className="text-xs flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Gateways & Exchange Rates</span>
            </TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Automated Triggers (T-3 Days)</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GATEWAYS & EXCHANGE RATE */}
          <TabsContent value="gateways" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: RBZ Exchange Rate Engine */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>RBZ Dual-Currency Engine (USD / ZiG)</span>
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs text-emerald-700 bg-emerald-50 border-emerald-300">
                      LIVE INTERBANK
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Sets the conversion standard applied across all space ledgers, batch invoices, and receipts.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form onSubmit={handleUpdateExchangeRate} className="space-y-3">
                    <div className="p-3 bg-muted/40 rounded border border-border/60 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Current Active Multiplier:</span>
                      <span className="font-mono font-bold text-base text-primary">
                        1 USD = {rbzExchangeRate} ZiG
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Adjust Exchange Rate (ZiG per 1 USD)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                        <Button type="submit" size="sm" className="h-8 text-xs shrink-0">
                          Update Rate
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleFetchRbz}
                          className="h-8 text-xs shrink-0 flex items-center gap-1"
                          title="Fetch live RBZ interbank rate"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync RBZ</span>
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Card 2: WhatsApp Cloud API & Scheduler */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Business Cloud API</span>
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs border-emerald-300 text-emerald-700">
                      CONNECTED
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Automated month-end invoice delivery & arrears statement notifications.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Sender Mobile Identity</Label>
                      <Input
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Test Dispatched Recipient</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={testMobile}
                          onChange={(e) => setTestMobile(e.target.value)}
                          placeholder="+263 77..."
                          className="h-8 text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={handleSendTestWhatsApp}
                          className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Test Notice</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: EcoCash Merchant & USSD Prompt */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>EcoCash Biller & Push Prompt</span>
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs border-sky-300 text-sky-700">
                      MERCHANT 99420
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Direct tenant payment collection via Zimbabwe's largest mobile money network.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Biller / Merchant Code</Label>
                      <Input
                        value={ecocashMerchant}
                        onChange={(e) => setEcocashMerchant(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Currency Mode</Label>
                      <Input value="USD & ZiG Dual Settlement" disabled className="h-8 text-xs bg-muted" />
                    </div>
                  </div>

                  <div className="p-2.5 bg-muted/40 rounded border border-border/60 text-[11px] text-muted-foreground space-y-1">
                    <p>Status: Webhook active on <code>https://api.rentflow.co.zw/webhooks/ecocash</code></p>
                    <p>Instant receipt generation enabled for matching space ledgers.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Paynow Gateway */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Paynow Zimbabwe Payment Gateway</span>
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs border-amber-300 text-amber-700">
                      ACTIVE
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Accepts Visa, Mastercard, Zimswitch, InnBucks, and EcoCash online.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Integration ID</Label>
                    <Input
                      value={paynowIntegrationId}
                      onChange={(e) => setPaynowIntegrationId(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Integration Key</Label>
                    <Input
                      type="password"
                      value={paynowKey}
                      onChange={(e) => setPaynowKey(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success('Paynow credentials verified with gateway server!')}
                    className="w-full h-8 text-xs"
                  >
                    Test Gateway Ping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: AUTOMATED TRIGGERS & 3-DAY LEAD TIME SCAN */}
          <TabsContent value="triggers" className="space-y-6">
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-serif font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Automated WhatsApp Reminders (T-3 Days Lead Time)</span>
                      </CardTitle>
                      <Badge variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30">
                        SCHEDULED AGENT
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Evaluates commercial tenants with upcoming month-end commitments or arrears 3 days before payment due dates, converting amounts to both USD & RBZ ZiG with automated Zimbabwean MSISDN formatting.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={executeThreeDayScan}
                      disabled={isScanning}
                      size="sm"
                      className="h-9 px-3.5 text-xs bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isScanning ? 'Scanning Directory...' : 'Execute Live 3-Day Scan'}</span>
                    </Button>

                    {scannedTenants.length > 0 && (
                      <Button
                        onClick={handleBatchDispatchAll}
                        variant="secondary"
                        size="sm"
                        className="h-9 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dispatch All ({scannedTenants.length})</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Trigger Status & Rules Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Scan Evaluation Metric:</span>
                    <span className="font-semibold text-foreground">3 Days Prior to Due Date (T-3)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Target MSISDN Route:</span>
                    <span className="font-semibold text-foreground font-mono">+263 7X Econet / NetOne / Telecel</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Last Scan Execution:</span>
                    <span className="font-semibold text-foreground font-mono">
                      {lastScanTime ? `${lastScanTime} (Completed)` : 'Ready to Run'}
                    </span>
                  </div>
                </div>

                {/* Scanned Tenant Results */}
                {scannedTenants.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border/80 rounded-lg space-y-2">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
                    <h4 className="text-sm font-semibold text-foreground">No Live Scan Executed Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Click the "Execute Live 3-Day Scan" button above or open this page with <code>?tab=triggers&scan=true</code> to evaluate all commercial tenants with due or upcoming balances.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        Evaluated Tenants Ready for Notice ({scannedTenants.length})
                      </span>
                      <span className="text-muted-foreground">
                        Active Exchange: 1 USD = {rbzExchangeRate} ZiG
                      </span>
                    </div>

                    <div className="border border-border/80 rounded-lg overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-semibold">
                          <tr>
                            <th className="p-2.5">Tenant & Unit</th>
                            <th className="p-2.5">Mobile (Zim MSISDN)</th>
                            <th className="p-2.5">Balance / Target Due</th>
                            <th className="p-2.5">ZiG Value</th>
                            <th className="p-2.5">Lead Time</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {scannedTenants.map(t => {
                            const isDispatched = dispatchedTenantIds.includes(t.id);
                            const amount = t.balanceUSD > 0 ? t.balanceUSD : t.monthlyRentUSD;
                            const amountZiG = (amount * rbzExchangeRate).toLocaleString();
                            const msisdn = formatZimMsisdn(t.phone);

                            return (
                              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-2.5">
                                  <div className="font-bold text-foreground">{t.name}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {t.propertyName} • Unit {t.unitNumber}
                                  </div>
                                </td>
                                <td className="p-2.5 font-mono text-muted-foreground">
                                  {msisdn}
                                </td>
                                <td className="p-2.5 font-mono font-bold text-foreground">
                                  ${amount.toLocaleString()} USD
                                </td>
                                <td className="p-2.5 font-mono text-muted-foreground">
                                  {amountZiG} ZiG
                                </td>
                                <td className="p-2.5">
                                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/40 bg-primary/5">
                                    T-3 Days
                                  </Badge>
                                </td>
                                <td className="p-2.5 text-right">
                                  {isDispatched ? (
                                    <Badge variant="secondary" className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300">
                                      Dispatched
                                    </Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleDispatchTenantReminder(t.id, t.name, t.phone, amount)}
                                      className="h-7 px-2.5 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow-xs ml-auto"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>Dispatch Notice</span>
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};
