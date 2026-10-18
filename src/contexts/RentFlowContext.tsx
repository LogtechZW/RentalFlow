import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type {
  UserRole,
  PropertyPortfolio,
  Property,
  Space,
  Tenant,
  Lease,
  Invoice,
  Payment,
  SpaceLedgerEntry,
  GeneratorLog,
  SolarLog,
  BoreholeLog,
  UtilityMeterReading,
  TurnoverSalesDeclaration,
  MaintenanceTicket,
  DocumentItem,
  SystemUser,
  CustomWorkflowGrouping,
  WhatsAppReminderRule,
  WhatsAppLog
} from '@/types/rentflow';
import {
  INITIAL_USERS,
  INITIAL_PORTFOLIOS,
  INITIAL_PROPERTIES,
  INITIAL_SPACES,
  INITIAL_TENANTS,
  INITIAL_LEASES,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_SPACE_LEDGERS,
  INITIAL_GENERATOR_LOGS,
  INITIAL_SOLAR_LOGS,
  INITIAL_BOREHOLE_LOGS,
  INITIAL_METER_READINGS,
  INITIAL_TURNOVER_DECLARATIONS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_DOCUMENTS,
  INITIAL_CUSTOM_WORKFLOWS,
  INITIAL_WHATSAPP_RULES,
  INITIAL_WHATSAPP_LOGS,
  DEFAULT_RBZ_RATE,
  RENTFLOW_LOGO_URL,
  SYSTEM_MODULES
} from '@/services/mockData';
import { isDemoMode } from '@/lib/runtime';
import { hasSupabaseConfiguration, supabase } from '@/lib/supabase';

interface RentFlowContextType {
  currentUser: SystemUser | null;
  organizationId: string | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  authLoading: boolean;
  workspaceLoading: boolean;
  rbzExchangeRate: number;
  corporateLogo: string;
  isMonthEndActive: boolean;
  moduleThumbnails: Record<string, string>;

  // Data Collections
  portfolios: PropertyPortfolio[];
  properties: Property[];
  spaces: Space[];
  tenants: Tenant[];
  leases: Lease[];
  invoices: Invoice[];
  payments: Payment[];
  spaceLedgers: Record<string, SpaceLedgerEntry[]>;
  generatorLogs: GeneratorLog[];
  solarLogs: SolarLog[];
  boreholeLogs: BoreholeLog[];
  meterReadings: UtilityMeterReading[];
  turnoverDeclarations: TurnoverSalesDeclaration[];
  maintenanceTickets: MaintenanceTicket[];
  documents: DocumentItem[];
  customWorkflows: CustomWorkflowGrouping[];
  whatsappRules: WhatsAppReminderRule[];
  whatsappLogs: WhatsAppLog[];

  // Actions
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  setRbzExchangeRate: (rate: number) => void;
  setCorporateLogo: (logo: string) => void;
  setMonthEndActive: (active: boolean) => void;

  // Module Thumbnails
  updateModuleThumbnail: (moduleId: string, imageUrl: string) => void;
  resetModuleThumbnail: (moduleId: string) => void;

  // Space Ledger & Recalculation
  addSpacePaymentAdjustment: (spaceId: string, entry: Omit<SpaceLedgerEntry, 'id'>) => void;
  allocateTenantToSpace: (spaceId: string, tenantId: string) => void;
  deallocateTenantFromSpace: (spaceId: string) => void;

  // Entity Mutations
  addPortfolio: (portfolio: Omit<PropertyPortfolio, 'id'>) => void;
  updatePortfolio: (id: string, updates: Partial<PropertyPortfolio>) => void;
  deletePortfolio: (id: string) => void;

  addProperty: (property: Omit<Property, 'id'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  addSpace: (space: Omit<Space, 'id'>) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;

  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  addLease: (lease: Omit<Lease, 'id'>) => void;
  updateLease: (id: string, updates: Partial<Lease>) => void;
  deleteLease: (id: string) => void;
  signLease: (leaseId: string, signature: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  createBulkInvoices: (propertyIds: string[], billingPeriod: string) => number;

  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => Payment;

  addMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => void;
  updateMaintenanceTicket: (id: string, updates: Partial<MaintenanceTicket>) => void;
  deleteMaintenanceTicket: (id: string) => void;

  addGeneratorLog: (log: Omit<GeneratorLog, 'id'>) => void;
  deleteGeneratorLog: (id: string) => void;
  apportionCAMDieselGenerator: (propertyId: string, totalCostUSD: number) => void;

  addSolarLog: (log: Omit<SolarLog, 'id'>) => void;
  addBoreholeLog: (log: Omit<BoreholeLog, 'id'>) => void;
  addMeterReading: (reading: Omit<UtilityMeterReading, 'id'>) => void;
  deleteMeterReading: (id: string) => void;
  apportionMeterToInvoice: (readingId: string, invoiceId?: string) => void;

  addTurnoverDeclaration: (declaration: Omit<TurnoverSalesDeclaration, 'id'>) => void;
  auditTurnoverDeclaration: (id: string, status: 'Audited' | 'Invoiced', notes?: string) => void;

  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;

  addCustomWorkflow: (name: string, moduleIds: string[]) => void;
  deleteCustomWorkflow: (id: string) => void;

  sendWhatsAppNotice: (tenantId: string, message: string, type: WhatsAppLog['type']) => void;

  // Bulk Operations
  bulkDeleteProperties: () => void;
  bulkDeleteSpaces: () => void;
  bulkDeleteTenants: () => void;
  bulkDeleteInvoices: () => void;
  bulkDeletePayments: () => void;
  bulkDeleteLeases: () => void;
  bulkDeleteMaintenanceTickets: () => void;

  cleanSlateReset: () => void;
  resetToZeroData: () => void;
  populateSampleData: () => void;
  autoLinkProperties: () => void;
}

const RentFlowContext = createContext<RentFlowContextType | undefined>(undefined);

// LocalStorage persistence helper
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
  }
  return fallback;
}

function loadWorkspaceData<T>(key: string, fallback: T): T {
  return isDemoMode ? loadStored(key, fallback) : fallback;
}

type WorkspaceSnapshot = Pick<RentFlowContextType,
  'portfolios' | 'properties' | 'spaces' | 'tenants' | 'leases' | 'invoices' |
  'payments' | 'spaceLedgers' | 'generatorLogs' | 'solarLogs' | 'boreholeLogs' |
  'meterReadings' | 'turnoverDeclarations' | 'maintenanceTickets' | 'documents' |
  'customWorkflows' | 'whatsappRules' | 'whatsappLogs' | 'rbzExchangeRate' |
  'corporateLogo' | 'moduleThumbnails'
>;

export const RentFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => isDemoMode ? loadStored<SystemUser | null>('rf_session_user', null) : null);
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => isDemoMode ? loadStored<UserRole>('rf_session_role', 'Property Manager') : 'Property Manager');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isDemoMode && Boolean(loadStored<SystemUser | null>('rf_session_user', null)));
  const [authLoading, setAuthLoading] = useState(() => !isDemoMode && supabase !== null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(() => !isDemoMode && supabase !== null);
  const workspaceHydratedRef = useRef(isDemoMode);
  const workspaceRevisionRef = useRef<number | null>(null);
  const [rbzExchangeRate, setRbzExchangeRateState] = useState<number>(() => loadStored('rf_rbz_rate_v1', DEFAULT_RBZ_RATE));
  const [corporateLogo, setCorporateLogoState] = useState<string>(() => loadStored('rf_logo_v1', RENTFLOW_LOGO_URL));

  // Month-end auto trigger: last 3 days of current calendar month or test toggle
  const [isMonthEndActive, setMonthEndActive] = useState<boolean>(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return today.getDate() >= lastDayOfMonth - 3;
  });

  // Custom module thumbnails map
  const [moduleThumbnails, setModuleThumbnails] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const mod of SYSTEM_MODULES) {
      initial[mod.id] = mod.defaultImage;
    }
    return loadStored('rf_module_thumbnails_v1', initial);
  });

  // Core Collections with Permanent LocalStorage Persistence (un-versioned keys, never overwritten across updates)
  const [portfolios, setPortfolios] = useState<PropertyPortfolio[]>(() => {
    const loaded = loadWorkspaceData<PropertyPortfolio[]>('rf_portfolios_data', INITIAL_PORTFOLIOS);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_PORTFOLIOS;
  });
  const [properties, setProperties] = useState<Property[]>(() => {
    const loaded = loadWorkspaceData<Property[]>('rf_properties_data', INITIAL_PROPERTIES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_PROPERTIES;
  });
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const loaded = loadWorkspaceData<Space[]>('rf_spaces_data', INITIAL_SPACES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_SPACES;
  });
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const loaded = loadWorkspaceData<Tenant[]>('rf_tenants_data', INITIAL_TENANTS);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_TENANTS;
  });
  const [leases, setLeases] = useState<Lease[]>(() => loadWorkspaceData('rf_leases_data', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadWorkspaceData('rf_invoices_data', []));
  const [payments, setPayments] = useState<Payment[]>(() => loadWorkspaceData('rf_payments_data', []));
  const [spaceLedgers, setSpaceLedgers] = useState<Record<string, SpaceLedgerEntry[]>>(() => loadWorkspaceData('rf_space_ledgers_data', {}));
  const [generatorLogs, setGeneratorLogs] = useState<GeneratorLog[]>(() => loadWorkspaceData('rf_gen_logs_data', []));
  const [solarLogs, setSolarLogs] = useState<SolarLog[]>(() => loadWorkspaceData('rf_solar_logs_data', []));
  const [boreholeLogs, setBoreholeLogs] = useState<BoreholeLog[]>(() => loadWorkspaceData('rf_borehole_logs_data', []));
  const [meterReadings, setMeterReadings] = useState<UtilityMeterReading[]>(() => loadWorkspaceData('rf_meter_readings_data', INITIAL_METER_READINGS));
  const [turnoverDeclarations, setTurnoverDeclarations] = useState<TurnoverSalesDeclaration[]>(() => loadWorkspaceData('rf_turnover_data', []));
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => loadWorkspaceData('rf_tickets_data', []));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadWorkspaceData('rf_documents_data', []));
  const [customWorkflows, setCustomWorkflows] = useState<CustomWorkflowGrouping[]>(() => loadWorkspaceData('rf_workflows_data', INITIAL_CUSTOM_WORKFLOWS));
  const [whatsappRules, setWhatsappRules] = useState<WhatsAppReminderRule[]>(() => loadWorkspaceData('rf_whatsapp_rules_data', INITIAL_WHATSAPP_RULES));
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>(() => loadWorkspaceData('rf_whatsapp_logs_data', INITIAL_WHATSAPP_LOGS));

  // Demo data remains device-local. Configured deployments persist the same
  // workspace payload for every organisation member through Supabase + RLS.
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_spaces_data', JSON.stringify(spaces)); }, [spaces]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_properties_data', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_portfolios_data', JSON.stringify(portfolios)); }, [portfolios]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_tenants_data', JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_leases_data', JSON.stringify(leases)); }, [leases]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_invoices_data', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_payments_data', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_space_ledgers_data', JSON.stringify(spaceLedgers)); }, [spaceLedgers]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_gen_logs_data', JSON.stringify(generatorLogs)); }, [generatorLogs]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_solar_logs_data', JSON.stringify(solarLogs)); }, [solarLogs]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_borehole_logs_data', JSON.stringify(boreholeLogs)); }, [boreholeLogs]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_meter_readings_data', JSON.stringify(meterReadings)); }, [meterReadings]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_turnover_data', JSON.stringify(turnoverDeclarations)); }, [turnoverDeclarations]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_tickets_data', JSON.stringify(maintenanceTickets)); }, [maintenanceTickets]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_documents_data', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_workflows_data', JSON.stringify(customWorkflows)); }, [customWorkflows]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_module_thumbnails_data', JSON.stringify(moduleThumbnails)); }, [moduleThumbnails]);
  useEffect(() => { if (isDemoMode) localStorage.setItem('rf_rbz_rate_data', JSON.stringify(rbzExchangeRate)); }, [rbzExchangeRate]);
  useEffect(() => {
    if (isDemoMode && currentUser && isAuthenticated) {
      localStorage.setItem('rf_session_user', JSON.stringify(currentUser));
      localStorage.setItem('rf_session_role', JSON.stringify(activeRole));
    }
  }, [currentUser, activeRole, isAuthenticated]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const applySession = (user: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setWorkspaceLoading(false);
        return;
      }
      const allowedRoles: UserRole[] = ['Property Owner', 'Property Manager', 'Accountant', 'Tenant', 'Administrator'];
      const requestedRole = user.app_metadata?.role;
      const role = typeof requestedRole === 'string' && allowedRoles.includes(requestedRole as UserRole)
        ? requestedRole as UserRole
        : 'Property Manager';
      const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : user.email?.split('@')[0] || 'RentFlow user';
      setCurrentUser({ id: user.id, name, email: user.email || '', role, availableRoles: [role] });
      setActiveRoleState(role);
      setIsAuthenticated(true);
      setWorkspaceLoading(true);
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session?.user ?? null)).finally(() => setAuthLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (isDemoMode || !supabase || !currentUser) {
      setOrganizationId(null);
      setWorkspaceLoading(false);
      return;
    }

    setWorkspaceLoading(true);
    const { error: invitationError } = await supabase.rpc('accept_pending_organization_invitations');
    if (invitationError) {
      toast.error(`Unable to process workspace invitations: ${invitationError.message}`);
    }
    const { data, error } = await supabase
      .from('organization_memberships')
      .select('organization_id, role')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setOrganizationId(null);
      setWorkspaceLoading(false);
      return;
    }

    const roleMap: Record<string, UserRole> = {
      administrator: 'Administrator',
      property_manager: 'Property Manager',
      accountant: 'Accountant',
      property_owner: 'Property Owner',
      tenant: 'Tenant',
    };
    const role = roleMap[data.role] ?? 'Property Manager';
    setCurrentUser(previous => previous ? { ...previous, role, availableRoles: [role] } : previous);
    setActiveRoleState(role);
    workspaceHydratedRef.current = false;
    setOrganizationId(data.organization_id);
  }, [currentUser?.id]);

  useEffect(() => { void refreshWorkspace(); }, [refreshWorkspace]);

  const applyWorkspaceSnapshot = useCallback((snapshot: Partial<WorkspaceSnapshot>) => {
    if (Array.isArray(snapshot.portfolios)) setPortfolios(snapshot.portfolios);
    if (Array.isArray(snapshot.properties)) setProperties(snapshot.properties);
    if (Array.isArray(snapshot.spaces)) setSpaces(snapshot.spaces);
    if (Array.isArray(snapshot.tenants)) setTenants(snapshot.tenants);
    if (Array.isArray(snapshot.leases)) setLeases(snapshot.leases);
    if (Array.isArray(snapshot.invoices)) setInvoices(snapshot.invoices);
    if (Array.isArray(snapshot.payments)) setPayments(snapshot.payments);
    if (snapshot.spaceLedgers && typeof snapshot.spaceLedgers === 'object') setSpaceLedgers(snapshot.spaceLedgers);
    if (Array.isArray(snapshot.generatorLogs)) setGeneratorLogs(snapshot.generatorLogs);
    if (Array.isArray(snapshot.solarLogs)) setSolarLogs(snapshot.solarLogs);
    if (Array.isArray(snapshot.boreholeLogs)) setBoreholeLogs(snapshot.boreholeLogs);
    if (Array.isArray(snapshot.meterReadings)) setMeterReadings(snapshot.meterReadings);
    if (Array.isArray(snapshot.turnoverDeclarations)) setTurnoverDeclarations(snapshot.turnoverDeclarations);
    if (Array.isArray(snapshot.maintenanceTickets)) setMaintenanceTickets(snapshot.maintenanceTickets);
    if (Array.isArray(snapshot.documents)) setDocuments(snapshot.documents);
    if (Array.isArray(snapshot.customWorkflows)) setCustomWorkflows(snapshot.customWorkflows);
    if (Array.isArray(snapshot.whatsappRules)) setWhatsappRules(snapshot.whatsappRules);
    if (Array.isArray(snapshot.whatsappLogs)) setWhatsappLogs(snapshot.whatsappLogs);
    if (typeof snapshot.rbzExchangeRate === 'number') setRbzExchangeRateState(snapshot.rbzExchangeRate);
    if (typeof snapshot.corporateLogo === 'string') setCorporateLogoState(snapshot.corporateLogo);
    if (snapshot.moduleThumbnails && typeof snapshot.moduleThumbnails === 'object') setModuleThumbnails(snapshot.moduleThumbnails);
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase || !organizationId) return;
    let active = true;
    setWorkspaceLoading(true);
    void supabase
      .from('workspace_snapshots')
      .select('content, revision')
      .eq('organization_id', organizationId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error(`Unable to load workspace: ${error.message}`);
          setWorkspaceLoading(false);
          return;
        }
        if (data?.content && typeof data.content === 'object') applyWorkspaceSnapshot(data.content as Partial<WorkspaceSnapshot>);
        workspaceRevisionRef.current = typeof data?.revision === 'number' ? data.revision : null;
        workspaceHydratedRef.current = true;
        setWorkspaceLoading(false);
      });
    return () => { active = false; };
  }, [applyWorkspaceSnapshot, organizationId]);

  useEffect(() => {
    if (isDemoMode || !supabase || !organizationId || !workspaceHydratedRef.current) return;
    const client = supabase;
    const snapshot: WorkspaceSnapshot = {
      portfolios, properties, spaces, tenants, leases, invoices, payments, spaceLedgers,
      generatorLogs, solarLogs, boreholeLogs, meterReadings, turnoverDeclarations,
      maintenanceTickets, documents, customWorkflows, whatsappRules, whatsappLogs,
      rbzExchangeRate, corporateLogo, moduleThumbnails,
    };
    const timeout = window.setTimeout(() => {
      const persistWorkspace = async () => {
        const expectedRevision = workspaceRevisionRef.current;
        if (expectedRevision === null) {
          const { data, error } = await client.from('workspace_snapshots')
            .insert({ organization_id: organizationId, content: snapshot })
            .select('revision')
            .maybeSingle();
          if (error) {
            toast.error('This workspace was created by another session. Refresh before saving your changes.');
            return;
          }
          workspaceRevisionRef.current = data?.revision ?? 0;
          return;
        }

        const { data, error } = await client.from('workspace_snapshots')
          .update({ content: snapshot })
          .eq('organization_id', organizationId)
          .eq('revision', expectedRevision)
          .select('revision')
          .maybeSingle();
        if (error) {
          toast.error(`Unable to save workspace: ${error.message}`);
        } else if (!data) {
          toast.error('Another team member updated this workspace. Refresh before saving your changes.');
        } else {
          workspaceRevisionRef.current = data.revision;
        }
      };
      void persistWorkspace();
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [organizationId, workspaceLoading, portfolios, properties, spaces, tenants, leases, invoices, payments, spaceLedgers, generatorLogs, solarLogs, boreholeLogs, meterReadings, turnoverDeclarations, maintenanceTickets, documents, customWorkflows, whatsappRules, whatsappLogs, rbzExchangeRate, corporateLogo, moduleThumbnails]);

  // Authentication
  const signIn = async (email: string, password?: string) => {
    if (hasSupabaseConfiguration && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    }
    if (!isDemoMode) {
      toast.error('This deployment requires secure Supabase authentication. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return false;
    }
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'Property Manager' as UserRole,
      availableRoles: ['Property Manager', 'Accountant', 'Tenant'] as UserRole[],
    };
    setCurrentUser(found);
    setActiveRoleState(found.role);
    setIsAuthenticated(true);
    return true;
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    if (hasSupabaseConfiguration && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success('Check your email to verify the account, then sign in.');
      return true;
    }
    if (!isDemoMode) {
      toast.error('Self-service registration is unavailable until secure authentication is configured.');
      return false;
    }
    const newUser: SystemUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      availableRoles: [role],
    };
    setCurrentUser(newUser);
    setActiveRoleState(role);
    setIsAuthenticated(true);
    return true;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('rf_session_user');
    localStorage.removeItem('rf_session_role');
  };

  const setActiveRole = (role: UserRole) => {
    if (!currentUser?.availableRoles.includes(role)) {
      toast.error('Your account is not assigned this role.');
      return;
    }
    setActiveRoleState(role);
  };

  const setRbzExchangeRate = (rate: number) => {
    setRbzExchangeRateState(rate);
  };

  const setCorporateLogo = (logo: string) => {
    setCorporateLogoState(logo);
  };

  const updateModuleThumbnail = (moduleId: string, imageUrl: string) => {
    setModuleThumbnails(prev => ({ ...prev, [moduleId]: imageUrl }));
  };

  const resetModuleThumbnail = (moduleId: string) => {
    const def = SYSTEM_MODULES.find(m => m.id === moduleId);
    if (def) {
      setModuleThumbnails(prev => ({ ...prev, [moduleId]: def.defaultImage }));
    }
  };

  // Space Ledger & manual payment adjustment with real-time recalculation
  const addSpacePaymentAdjustment = (spaceId: string, entry: Omit<SpaceLedgerEntry, 'id'>) => {
    const newEntry: SpaceLedgerEntry = {
      ...entry,
      id: `led-${Date.now()}`,
    };

    setSpaceLedgers(prev => {
      const currentList = prev[spaceId] || [];
      return {
        ...prev,
        [spaceId]: [newEntry, ...currentList],
      };
    });

    // Recalculate Space status and rental accumulation
    setSpaces(prev => prev.map(sp => {
      if (sp.id !== spaceId) return sp;
      const netAdjustment = entry.chargeUSD - entry.paymentUSD;
      const newAccumulation = Math.max(0, sp.rentalAccumulationUSD + netAdjustment);
      const newPaid = entry.paymentUSD > 0 ? sp.paidThisMonthUSD + entry.paymentUSD : sp.paidThisMonthUSD;
      let newStatus = sp.status;
      if (sp.status === 'Occupied' || sp.status === 'Overdue') {
        newStatus = newAccumulation > 0 ? 'Overdue' : 'Occupied';
      }
      return {
        ...sp,
        rentalAccumulationUSD: newAccumulation,
        paidThisMonthUSD: newPaid,
        status: newStatus,
        lastPaymentDate: entry.paymentUSD > 0 ? entry.date : sp.lastPaymentDate,
      };
    }));

    // If space has a tenant, adjust tenant balance too
    const targetSpace = spaces.find(s => s.id === spaceId);
    if (targetSpace && targetSpace.currentTenantId) {
      setTenants(prev => prev.map(t => {
        if (t.id !== targetSpace.currentTenantId) return t;
        const newBal = Math.max(0, t.balanceUSD + (entry.chargeUSD - entry.paymentUSD));
        return {
          ...t,
          balanceUSD: newBal,
          balanceZiG: newBal * rbzExchangeRate,
          status: newBal > 0 ? 'Overdue' : 'Active',
        };
      }));
    }
  };

  const allocateTenantToSpace = (spaceId: string, tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    const space = spaces.find(s => s.id === spaceId);
    if (!tenant || !space) return;

    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          status: 'Occupied',
          currentTenantId: tenant.id,
          currentTenantName: tenant.name,
        };
      }
      return s;
    }));

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          unitId: space.id,
          unitNumber: space.unitNumber,
          propertyId: space.propertyId,
          propertyName: properties.find(p => p.id === space.propertyId)?.name || t.propertyName,
          status: 'Active',
        };
      }
      return t;
    }));
  };

  const deallocateTenantFromSpace = (spaceId: string) => {
    const departingTenantId = spaces.find(s => s.id === spaceId)?.currentTenantId;
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          status: 'Vacant',
          currentTenantId: undefined,
          currentTenantName: undefined,
          leaseId: undefined,
          rentalAccumulationUSD: 0,
        };
      }
      return s;
    }));
    if (departingTenantId) {
      setTenants(prev => prev.map(t => t.id === departingTenantId ? { ...t, status: 'Vacated' } : t));
      setLeases(prev => prev.map(l => l.unitId === spaceId && l.status === 'Active' ? { ...l, status: 'Terminated' } : l));
    }
  };

  // Portfolios
  const addPortfolio = (portfolio: Omit<PropertyPortfolio, 'id'>) => {
    const newPort: PropertyPortfolio = {
      ...portfolio,
      id: `port-${Date.now()}`,
    };
    setPortfolios(prev => [newPort, ...prev]);
  };

  const updatePortfolio = (id: string, updates: Partial<PropertyPortfolio>) => {
    setPortfolios(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePortfolio = (id: string) => {
    if (properties.some(property => property.portfolioId === id)) {
      toast.error('Move or delete the linked properties before deleting this portfolio.');
      return;
    }
    setPortfolios(prev => prev.filter(p => p.id !== id));
  };

  // Properties
  const addProperty = (prop: Omit<Property, 'id'>) => {
    const newProp: Property = {
      ...prop,
      id: `prop-${Date.now()}`,
    };
    setProperties(prev => [newProp, ...prev]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProperty = (id: string) => {
    const spaceIds = spaces.filter(space => space.propertyId === id).map(space => space.id);
    const tenantIds = tenants.filter(tenant => tenant.propertyId === id).map(tenant => tenant.id);
    setProperties(prev => prev.filter(p => p.id !== id));
    setSpaces(prev => prev.filter(space => space.propertyId !== id));
    setTenants(prev => prev.filter(tenant => tenant.propertyId !== id));
    setLeases(prev => prev.filter(lease => lease.propertyId !== id));
    setInvoices(prev => prev.filter(invoice => invoice.propertyId !== id));
    setPayments(prev => prev.filter(payment => payment.propertyId !== id));
    setMeterReadings(prev => prev.filter(reading => reading.propertyId !== id));
    setMaintenanceTickets(prev => prev.filter(ticket => ticket.propertyId !== id));
    setGeneratorLogs(prev => prev.filter(log => log.propertyId !== id));
    setSolarLogs(prev => prev.filter(log => log.propertyId !== id));
    setBoreholeLogs(prev => prev.filter(log => log.propertyId !== id));
    setTurnoverDeclarations(prev => prev.filter(declaration => !tenantIds.includes(declaration.tenantId)));
    setSpaceLedgers(prev => Object.fromEntries(Object.entries(prev).filter(([spaceId]) => !spaceIds.includes(spaceId))));
  };

  // Spaces
  const addSpace = (sp: Omit<Space, 'id'>) => {
    const newSpace: Space = {
      ...sp,
      id: `sp-${Date.now()}`,
    };
    setSpaces(prev => [newSpace, ...prev]);
  };

  const updateSpace = (id: string, updates: Partial<Space>) => {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSpace = (id: string) => {
    const hasLiveReferences = tenants.some(tenant => tenant.unitId === id && tenant.status !== 'Vacated') ||
      leases.some(lease => lease.unitId === id && lease.status !== 'Terminated');
    if (hasLiveReferences) {
      toast.error('Deallocate the tenant and terminate the lease before deleting this space.');
      return;
    }
    setSpaces(prev => prev.filter(s => s.id !== id));
    setSpaceLedgers(prev => {
      const remaining = { ...prev };
      delete remaining[id];
      return remaining;
    });
  };

  // Tenants
  const addTenant = (tent: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...tent,
      id: `ten-${Date.now()}`,
      balanceZiG: tent.balanceUSD * rbzExchangeRate,
    };
    setTenants(prev => [newTenant, ...prev]);
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (updates.balanceUSD !== undefined) {
          updated.balanceZiG = updates.balanceUSD * rbzExchangeRate;
        }
        return updated;
      }
      return t;
    }));
  };

  const deleteTenant = (id: string) => {
    const hasFinancialHistory = invoices.some(invoice => invoice.tenantId === id) || payments.some(payment => payment.tenantId === id);
    if (hasFinancialHistory) {
      toast.error('This tenant has financial history and cannot be deleted. Mark the tenant as vacated instead.');
      return;
    }
    setSpaces(prev => prev.map(space => space.currentTenantId === id ? {
      ...space,
      status: 'Vacant',
      currentTenantId: undefined,
      currentTenantName: undefined,
      leaseId: undefined,
    } : space));
    setLeases(prev => prev.filter(lease => lease.tenantId !== id));
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  // Leases
  const addLease = (lease: Omit<Lease, 'id'>) => {
    const newLease: Lease = {
      ...lease,
      id: `lease-${Date.now()}`,
    };
    setLeases(prev => [newLease, ...prev]);
    setSpaces(prev => prev.map(space => space.id === lease.unitId ? {
      ...space,
      leaseId: newLease.id,
      status: lease.status === 'Active' ? 'Occupied' : space.status,
      currentTenantId: lease.tenantId,
      currentTenantName: lease.tenantName,
    } : space));
  };

  const updateLease = (id: string, updates: Partial<Lease>) => {
    setLeases(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const signLease = (leaseId: string, signature: string) => {
    setLeases(prev => prev.map(l => {
      if (l.id === leaseId) {
        return {
          ...l,
          digitalSignature: signature,
          signedDate: new Date().toISOString().split('T')[0],
          status: 'Active',
        };
      }
      return l;
    }));
  };

  // Invoices
  const addInvoice = (inv: Omit<Invoice, 'id'>) => {
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const createBulkInvoices = (propertyIds: string[], billingPeriod: string): number => {
    const eligibleSpaces = spaces.filter(s => 
      s.status === 'Occupied' && 
      s.currentTenantId &&
      !invoices.some(invoice => invoice.unitId === s.id && invoice.billingPeriod === billingPeriod) &&
      (propertyIds.length === 0 || propertyIds.includes(s.propertyId))
    );

    let count = 0;
    const newInvoices: Invoice[] = [];
    const invoicedMeterIds: string[] = [];

    for (const sp of eligibleSpaces) {
      const prop = properties.find(p => p.id === sp.propertyId);
      const invoiceId = `inv-${Date.now()}-${count}`;
      
      // Look up any pending/un-invoiced check sub-meter readings for this space
      const spaceMeters = meterReadings.filter(mr => 
        mr.propertyId === sp.propertyId &&
        mr.unitNumber === sp.unitNumber && 
        mr.invoicedStatus !== 'Invoiced'
      );

      const items: Invoice['items'] = [
        {
          id: `item-${Date.now()}-rent-${count}`,
          description: `Base Commercial Rent (${sp.type} ${sp.unitNumber} - ${sp.sizeSqm} sqm)`,
          amountUSD: sp.baseRentUSD,
          amountZiG: sp.baseRentUSD * rbzExchangeRate,
          type: 'Base Rent',
        },
        {
          id: `item-${Date.now()}-cam-${count}`,
          description: 'CAM Service & Generator Fuel Surcharge',
          amountUSD: sp.camFeeUSD,
          amountZiG: sp.camFeeUSD * rbzExchangeRate,
          type: 'CAM Charge',
        }
      ];

      let submeterTotalUSD = 0;
      for (const meter of spaceMeters) {
        submeterTotalUSD += meter.totalCostUSD;
        invoicedMeterIds.push(meter.id);
        const unitSymbol = meter.meterType === 'Water' ? 'm³' : 'kWh';
        items.push({
          id: `item-${Date.now()}-meter-${meter.id}`,
          description: `${meter.meterType} Check Sub-Meter (${meter.consumption} ${unitSymbol} @ $${meter.ratePerUnitUSD.toFixed(3)}/unit - SN: ${meter.meterSerialNumber || 'SUB-MTR'})`,
          amountUSD: meter.totalCostUSD,
          amountZiG: meter.totalCostUSD * rbzExchangeRate,
          type: 'CAM Charge',
        });
      }

      const totalUSD = sp.baseRentUSD + sp.camFeeUSD + submeterTotalUSD;

      const inv: Invoice = {
        id: invoiceId,
        invoiceNumber: `INV-${new Date().getFullYear()}-${1000 + invoices.length + count + 1}`,
        tenantId: sp.currentTenantId!,
        tenantName: sp.currentTenantName || 'Valued Tenant',
        propertyId: sp.propertyId,
        propertyName: prop?.name || 'Commercial Property',
        unitId: sp.id,
        unitNumber: sp.unitNumber,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        billingPeriod,
        exchangeRate: rbzExchangeRate,
        items,
        totalUSD,
        totalZiG: totalUSD * rbzExchangeRate,
        status: 'Unpaid',
        paidUSD: 0,
        paidZiG: 0,
      };
      newInvoices.push(inv);
      count++;
    }

    if (newInvoices.length > 0) {
      setInvoices(prev => [...newInvoices, ...prev]);
      setSpaces(prev => prev.map(space => {
        const invoice = newInvoices.find(item => item.unitId === space.id);
        return invoice ? { ...space, rentalAccumulationUSD: space.rentalAccumulationUSD + invoice.totalUSD } : space;
      }));
      setTenants(prev => prev.map(tenant => {
        const invoice = newInvoices.find(item => item.tenantId === tenant.id);
        return invoice ? { ...tenant, balanceUSD: tenant.balanceUSD + invoice.totalUSD, balanceZiG: (tenant.balanceUSD + invoice.totalUSD) * rbzExchangeRate } : tenant;
      }));
      setSpaceLedgers(prev => {
        const next = { ...prev };
        newInvoices.forEach(invoice => {
          const entry: SpaceLedgerEntry = {
            id: `ledger-${invoice.id}`,
            spaceId: invoice.unitId,
            date: invoice.issueDate,
            description: `Invoice ${invoice.invoiceNumber} — ${invoice.billingPeriod}`,
            chargeUSD: invoice.totalUSD,
            paymentUSD: 0,
            balanceUSD: invoice.totalUSD,
            reference: invoice.invoiceNumber,
            type: 'Charge',
          };
          next[invoice.unitId] = [entry, ...(next[invoice.unitId] || [])];
        });
        return next;
      });
      // Update meter readings status to Invoiced
      if (invoicedMeterIds.length > 0) {
        setMeterReadings(prev => prev.map(m => invoicedMeterIds.includes(m.id) ? { ...m, invoicedStatus: 'Invoiced' } : m));
      }
    }
    return count;
  };

  // Payments
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>): Payment => {
    const receiptNum = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
    };

    setPayments(prev => [newPayment, ...prev]);
    setTenants(prev => prev.map(tenant => tenant.id === paymentData.tenantId ? {
      ...tenant,
      balanceUSD: Math.max(0, tenant.balanceUSD - paymentData.amountUSD),
      balanceZiG: Math.max(0, tenant.balanceUSD - paymentData.amountUSD) * rbzExchangeRate,
    } : tenant));
    setSpaces(prev => prev.map(space => space.id === paymentData.unitId ? {
      ...space,
      rentalAccumulationUSD: Math.max(0, space.rentalAccumulationUSD - paymentData.amountUSD),
      paidThisMonthUSD: space.paidThisMonthUSD + paymentData.amountUSD,
      lastPaymentDate: paymentData.paymentDate,
    } : space));

    // Update Space Ledger
    const spaceId = paymentData.unitId;
    if (spaceId) {
      addSpacePaymentAdjustment(spaceId, {
        spaceId,
        date: paymentData.paymentDate,
        description: `Payment via ${paymentData.paymentMethod} (${paymentData.referenceNumber})`,
        chargeUSD: 0,
        paymentUSD: paymentData.amountUSD,
        balanceUSD: 0,
        reference: receiptNum,
        type: 'Payment',
      });
    }

    // Update Invoice if linked
    if (paymentData.invoiceId) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === paymentData.invoiceId) {
          const newPaidUSD = inv.paidUSD + paymentData.amountUSD;
          const newStatus = newPaidUSD >= inv.totalUSD ? 'Paid' : 'Partially Paid';
          return {
            ...inv,
            paidUSD: newPaidUSD,
            paidZiG: newPaidUSD * rbzExchangeRate,
            status: newStatus,
          };
        }
        return inv;
      }));
    }

    return newPayment;
  };

  // Maintenance
  const addMaintenanceTicket = (ticket: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => {
    const newTicket: MaintenanceTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketNumber: `MT-${new Date().getFullYear()}-${100 + maintenanceTickets.length + 1}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMaintenanceTickets(prev => [newTicket, ...prev]);
  };

  const updateMaintenanceTicket = (id: string, updates: Partial<MaintenanceTicket>) => {
    setMaintenanceTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Infrastructure & CAM Generator Apportionment
  const addGeneratorLog = (log: Omit<GeneratorLog, 'id'>) => {
    const newLog: GeneratorLog = {
      ...log,
      id: `gen-${Date.now()}`,
    };
    setGeneratorLogs(prev => [newLog, ...prev]);
  };

  const deleteGeneratorLog = (id: string) => {
    setGeneratorLogs(prev => prev.filter(g => g.id !== id));
  };

  const apportionCAMDieselGenerator = (propertyId: string, totalCostUSD: number) => {
    const propSpaces = spaces.filter(s => s.propertyId === propertyId && s.status === 'Occupied');
    const totalOccupiedSqm = propSpaces.reduce((sum, s) => sum + s.sizeSqm, 0);

    if (totalOccupiedSqm === 0) return;

    // Apportion proportional to sqm
    for (const sp of propSpaces) {
      const spaceShareUSD = Number(((sp.sizeSqm / totalOccupiedSqm) * totalCostUSD).toFixed(2));
      addSpacePaymentAdjustment(sp.id, {
        spaceId: sp.id,
        date: new Date().toISOString().split('T')[0],
        description: `CAM Diesel Generator Apportionment (${sp.sizeSqm} sqm / ${totalOccupiedSqm} sqm)`,
        chargeUSD: spaceShareUSD,
        paymentUSD: 0,
        balanceUSD: spaceShareUSD,
        reference: `GEN-CAM-${Date.now()}`,
        type: 'CAM',
      });
    }
  };

  const addSolarLog = (log: Omit<SolarLog, 'id'>) => {
    setSolarLogs(prev => [{ ...log, id: `sol-${Date.now()}` }, ...prev]);
  };

  const addBoreholeLog = (log: Omit<BoreholeLog, 'id'>) => {
    setBoreholeLogs(prev => [{ ...log, id: `bor-${Date.now()}` }, ...prev]);
  };

  const addMeterReading = (reading: Omit<UtilityMeterReading, 'id'>) => {
    setMeterReadings(prev => [{ ...reading, id: `met-${Date.now()}` }, ...prev]);
  };

  const deleteMeterReading = (id: string) => {
    setMeterReadings(prev => prev.filter(m => m.id !== id));
  };

  const apportionMeterToInvoice = (readingId: string, invoiceId?: string) => {
    setMeterReadings(prev => prev.map(m => {
      if (m.id === readingId) {
        return {
          ...m,
          invoicedStatus: 'Invoiced',
          invoiceId: invoiceId || m.invoiceId || `INV-MET-${Date.now().toString().slice(-4)}`
        };
      }
      return m;
    }));
  };

  // Turnover Declarations
  const addTurnoverDeclaration = (decl: Omit<TurnoverSalesDeclaration, 'id'>) => {
    setTurnoverDeclarations(prev => [{ ...decl, id: `to-${Date.now()}` }, ...prev]);
  };

  const auditTurnoverDeclaration = (id: string, status: 'Audited' | 'Invoiced', notes?: string) => {
    setTurnoverDeclarations(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status,
          auditNotes: notes || d.auditNotes,
        };
      }
      return d;
    }));
  };

  // Documents
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => {
    setDocuments(prev => [{
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    }, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Custom Workflows
  const addCustomWorkflow = (name: string, moduleIds: string[]) => {
    const newWorkflow: CustomWorkflowGrouping = {
      id: `cwf-${Date.now()}`,
      name,
      moduleIds,
      userId: currentUser?.id || 'admin',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomWorkflows(prev => [...prev, newWorkflow]);
  };

  const deleteCustomWorkflow = (id: string) => {
    setCustomWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // WhatsApp Notices
  const sendWhatsAppNotice = (tenantId: string, message: string, type: WhatsAppLog['type']) => {
    const tenant = tenants.find(t => t.id === tenantId);
    const newLog: WhatsAppLog = {
      id: `wlog-${Date.now()}`,
      tenantName: tenant?.name || 'Tenant',
      phone: tenant?.phone || '+263 77 000 0000',
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Delivered',
      messagePreview: message,
      type,
    };
    setWhatsappLogs(prev => [newLog, ...prev]);
  };

  // Bulk Delete Implementations
  const deleteLease = (id: string) => {
    setLeases(prev => prev.filter(l => l.id !== id));
  };

  const deleteMaintenanceTicket = (id: string) => {
    setMaintenanceTickets(prev => prev.filter(m => m.id !== id));
  };

  const bulkDeleteProperties = () => setProperties([]);
  const bulkDeleteSpaces = () => setSpaces([]);
  const bulkDeleteTenants = () => setTenants([]);
  const bulkDeleteInvoices = () => setInvoices([]);
  const bulkDeletePayments = () => setPayments([]);
  const bulkDeleteLeases = () => setLeases([]);
  const bulkDeleteMaintenanceTickets = () => setMaintenanceTickets([]);

  // Clean Slate Reset (resets all commercial properties and spaces to zero)
  const cleanSlateReset = () => {
    setSpaces([]);
    setProperties([]);
    setPortfolios([]);
    setTenants([]);
    setLeases([]);
    setInvoices([]);
    setPayments([]);
    setSpaceLedgers({});
    setGeneratorLogs([]);
    setSolarLogs([]);
    setBoreholeLogs([]);
    setMeterReadings([]);
    setTurnoverDeclarations([]);
    setMaintenanceTickets([]);
    setDocuments([]);
    const keysToRemove = [
      'rf_spaces_data', 'rf_properties_data', 'rf_portfolios_data', 'rf_tenants_data',
      'rf_leases_data', 'rf_invoices_data', 'rf_payments_data', 'rf_space_ledgers_data',
      'rf_gen_logs_data', 'rf_solar_logs_data', 'rf_borehole_logs_data', 'rf_meter_readings_data',
      'rf_turnover_data', 'rf_tickets_data', 'rf_documents_data',
      'rf_spaces_v1', 'rf_properties_v1', 'rf_portfolios_v1', 'rf_tenants_v1',
      'rf_leases_v1', 'rf_invoices_v1', 'rf_payments_v1', 'rf_space_ledgers_v1',
      'rf_gen_logs_v1', 'rf_solar_logs_v1', 'rf_borehole_logs_v1', 'rf_meter_readings_v1',
      'rf_turnover_v1', 'rf_tickets_v1', 'rf_documents_v1'
    ];
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
    });
  };

  const resetToZeroData = () => {
    cleanSlateReset();
    toast.success('Commercial real estate system reset to zero data state.');
  };

  const populateSampleData = () => {
    setPortfolios(INITIAL_PORTFOLIOS);
    setProperties(INITIAL_PROPERTIES);
    setSpaces(INITIAL_SPACES);
    setTenants(INITIAL_TENANTS);
    setLeases(INITIAL_LEASES);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setSpaceLedgers(INITIAL_SPACE_LEDGERS);
    setGeneratorLogs(INITIAL_GENERATOR_LOGS);
    setSolarLogs(INITIAL_SOLAR_LOGS);
    setBoreholeLogs(INITIAL_BOREHOLE_LOGS);
    setMeterReadings(INITIAL_METER_READINGS);
    setTurnoverDeclarations(INITIAL_TURNOVER_DECLARATIONS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setDocuments(INITIAL_DOCUMENTS);
    toast.success('Demonstration commercial portfolio data loaded.');
  };

  const autoLinkProperties = () => {
    setProperties(prev => prev.map(p => {
      if (p.portfolioId && portfolios.some(port => port.id === p.portfolioId)) return p;
      if (p.locationZone === 'cbd') {
        const cbdPort = portfolios.find(port => port.id === 'port-1') || portfolios[0];
        return { ...p, portfolioId: cbdPort.id, portfolioName: cbdPort.name };
      } else if (p.type === 'Story Building') {
        const storyPort = portfolios.find(port => port.id === 'port-3') || portfolios[0];
        return { ...p, portfolioId: storyPort.id, portfolioName: storyPort.name };
      } else {
        const subPort = portfolios.find(port => port.id === 'port-2') || portfolios[0];
        return { ...p, portfolioId: subPort.id, portfolioName: subPort.name };
      }
    }));

    setPortfolios(prev => prev.map(port => {
      const matchingPropIds = properties
        .filter(p => p.portfolioId === port.id || (port.propertyIds && port.propertyIds.includes(p.id)))
        .map(p => p.id);
      return {
        ...port,
        propertyIds: Array.from(new Set([...(port.propertyIds || []), ...matchingPropIds])),
        totalProperties: matchingPropIds.length,
      };
    }));
  };

  return (
    <RentFlowContext.Provider
      value={{
        currentUser,
        organizationId,
        activeRole,
        isAuthenticated,
        authLoading,
        workspaceLoading,
        rbzExchangeRate,
        corporateLogo,
        isMonthEndActive,
        moduleThumbnails,

        portfolios,
        properties,
        spaces,
        tenants,
        leases,
        invoices,
        payments,
        spaceLedgers,
        generatorLogs,
        solarLogs,
        boreholeLogs,
        meterReadings,
        turnoverDeclarations,
        maintenanceTickets,
        documents,
        customWorkflows,
        whatsappRules,
        whatsappLogs,

        signIn,
        signUp,
        signOut,
        refreshWorkspace,
        setActiveRole,
        setRbzExchangeRate,
        setCorporateLogo,
        setMonthEndActive,

        updateModuleThumbnail,
        resetModuleThumbnail,

        addSpacePaymentAdjustment,
        allocateTenantToSpace,
        deallocateTenantFromSpace,

        addPortfolio,
        updatePortfolio,
        deletePortfolio,

        addProperty,
        updateProperty,
        deleteProperty,

        addSpace,
        updateSpace,
        deleteSpace,

        addTenant,
        updateTenant,
        deleteTenant,

        addLease,
        updateLease,
        signLease,

        addInvoice,
        updateInvoice,
        deleteInvoice,
        createBulkInvoices,

        recordPayment,

        addMaintenanceTicket,
        updateMaintenanceTicket,

        addGeneratorLog,
        deleteGeneratorLog,
        apportionCAMDieselGenerator,

        addSolarLog,
        addBoreholeLog,
        addMeterReading,
        deleteMeterReading,
        apportionMeterToInvoice,

        addTurnoverDeclaration,
        auditTurnoverDeclaration,

        addDocument,
        deleteDocument,

        addCustomWorkflow,
        deleteCustomWorkflow,

        sendWhatsAppNotice,
        deleteLease,
        deleteMaintenanceTicket,
        bulkDeleteProperties,
        bulkDeleteSpaces,
        bulkDeleteTenants,
        bulkDeleteInvoices,
        bulkDeletePayments,
        bulkDeleteLeases,
        bulkDeleteMaintenanceTickets,
        cleanSlateReset,
        resetToZeroData,
        populateSampleData,
        autoLinkProperties,
      }}
    >
      {children}
    </RentFlowContext.Provider>
  );
};

export const useRentFlow = () => {
  const context = useContext(RentFlowContext);
  if (!context) {
    throw new Error('useRentFlow must be used within a RentFlowProvider');
  }
  return context;
};
