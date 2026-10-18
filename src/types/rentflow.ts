export type UserRole = 
  | 'Property Owner'
  | 'Property Manager'
  | 'Accountant'
  | 'Tenant'
  | 'Administrator';

export type Currency = 'USD' | 'ZiG';

export type SpaceType = 
  | 'Shop'
  | 'Office'
  | 'Kiosk'
  | 'Stall'
  | 'Bay'
  | 'Food Court Unit'
  | 'Pharmacy Unit'
  | 'Cubicle'
  | 'Table'
  | 'Suite'
  | 'Clinic';

export type SpaceStatus = 'Occupied' | 'Vacant' | 'Under Maintenance' | 'Overdue';

export type LocationZone = 'cbd' | 'suburban';

export type RentalFrequency = 'Daily' | 'Weekly' | 'Monthly';

export type UnitPrefix = 
  | 'Shop' 
  | 'Office' 
  | 'Room' 
  | 'Suite'
  | 'Food Court'
  | 'Pharmacy'
  | 'Kiosk' 
  | 'Bay' 
  | 'Stall'
  | 'Clinic'
  | 'Unit';

export interface Space {
  id: string;
  propertyId: string;
  unitPrefix?: UnitPrefix;
  unitNumber: string; // e.g. "101", "205" (100-500 range)
  customName: string; // e.g. "Corner Gourmet Shop", "Executive Suite B"
  type: SpaceType;
  floor: string; // "Ground Floor", "Level 1 Office Suites", etc.
  zone: string; // "North Wing", "Food Court", "Atrium", "Tower Block"
  locationZone?: LocationZone;
  frequency?: RentalFrequency;
  sizeSqm: number;
  baseRentUSD: number;
  targetRentUSD?: number;
  camFeeUSD: number;
  turnoverRatePercent: number; // e.g. 5%
  status: SpaceStatus;
  currentTenantId?: string;
  currentTenantName?: string;
  tenantPhone?: string;
  tenantWhatsApp?: string;
  leaseId?: string;
  rentalAccumulationUSD: number; // accumulated unpaid rent
  paidThisMonthUSD: number;
  lastPaymentDate?: string;
  // Technical Specifications
  powerRating?: string; // "Three-Phase 100A", "Single-Phase 60A", "Generator Line", "Solar Hybrid"
  hvacType?: string; // "Central HVAC Ducted", "Split Unit AC", "Natural Extraction"
  greaseTrapCompliant?: boolean;
  frontageWidthM?: number;
  ceilingHeightM?: number;
  parkingBays?: number;
}

export interface PropertyPortfolio {
  id: string;
  name: string; // e.g. "Harare CBD Retail Holdings", "Borrowdale Commercial Assets"
  type: 'Shopping Malls' | 'Story Buildings' | 'Commercial Plazas';
  location: string;
  locationZone?: LocationZone;
  ownerId: string;
  ownerName: string;
  profitShareRatio: number; // percentage, e.g. 100 or 60
  description: string;
  image: string;
  propertyIds?: string[];
  totalProperties: number;
  occupancyRate: number;
}

export interface Property {
  id: string;
  portfolioId: string;
  portfolioName: string;
  name: string; // e.g. "Joina City", "Eastgate Centre", "Sam Levy's Village"
  code: string;
  address: string;
  city: string; // "Harare"
  locationZone?: LocationZone;
  type: 'Shopping Mall' | 'Story Building' | 'Commercial Plaza';
  floorsCount: number;
  totalUnits: number;
  generatorCapacityKVA: number;
  boreholeEquipped: boolean;
  solarCapacityKVA: number;
  image: string;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  tradingName: string; // e.g. "Bakers Inn Express", "Econet Wireless Branch"
  contactPerson: string;
  email: string;
  phone: string; // Zimbabwe phone format: +263 77 ...
  whatsappPhone?: string;
  nationalIdOrReg: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  status: 'Active' | 'Pending Lease' | 'Overdue' | 'Vacated';
  balanceUSD: number;
  balanceZiG: number;
  monthlyRentUSD: number;
  rentAmountUSD?: number;
  taxComplianceStatus?: 'Compliant' | 'Non-Compliant';
  itf263Status?: 'Valid' | 'Expired';
  zimraBpNumber?: string;
  turnoverRentRatePercent?: number;
  leaseExpiryDate: string;
  category: 'Retail' | 'Banking & Finance' | 'Food & Beverage' | 'Healthcare' | 'Corporate Office';
}

export interface Lease {
  id: string;
  leaseNumber: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  baseRentUSD: number;
  camFeeUSD: number;
  turnoverPercentage: number;
  depositUSD: number;
  annualEscalationRate: number; // e.g. 10%
  status: 'Active' | 'Pending Signature' | 'Expiring Soon' | 'Terminated';
  digitalSignature?: string; // base64 data url
  signedDate?: string;
  terms: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amountUSD: number;
  amountZiG: number;
  type: 'Base Rent' | 'CAM Charge' | 'Turnover Rent' | 'Generator Levy' | 'Water/Electricity' | 'Penalty';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  issueDate: string;
  dueDate: string;
  billingPeriod: string; // "October 2026"
  exchangeRate: number; // 1 USD to ZiG rate
  items: InvoiceLineItem[];
  totalUSD: number;
  totalZiG: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  paidUSD: number;
  paidZiG: number;
}

export type PaymentMethod = 'EcoCash' | 'InnBucks' | 'Paynow' | 'Nostro' | 'Cash (USD)' | 'Cash (ZiG)';

export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  amountUSD: number;
  amountZiG: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  paymentDate: string;
  recordedBy: string;
  digitalSignature?: string; // base64 signature
  notes?: string;
}

export interface SpaceLedgerEntry {
  id: string;
  spaceId: string;
  date: string;
  description: string;
  chargeUSD: number;
  paymentUSD: number;
  balanceUSD: number;
  reference: string;
  type: 'Charge' | 'Payment' | 'Adjustment' | 'CAM' | 'Turnover';
}

export interface TurnoverSalesDeclaration {
  id: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  month: string; // e.g. "September 2026"
  declaredGrossSalesUSD: number;
  thresholdUSD: number;
  turnoverRatePercent: number;
  calculatedTurnoverRentUSD: number;
  status: 'Submitted' | 'Audited' | 'Invoiced';
  auditNotes?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  unitNumber?: string;
  category: 'Electrical' | 'Plumbing' | 'HVAC' | 'Structural' | 'Elevator' | 'Generator' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
  costUSD?: number;
}

export interface GeneratorLog {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  eventType: 'Refuelling' | 'Run-time Entry' | 'Maintenance / Service' | 'Fault / Outage';
  litresAdded?: number;
  costPerLitreUSD?: number;
  totalCostUSD?: number;
  runHours?: number;
  dieselCAMApportionedUSD?: number;
  notes: string;
}

export interface SolarLog {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  batteryStatusPercent: number;
  solarGenerationKWh: number;
  gridUptimeHours: number;
  notes: string;
}

export interface BoreholeLog {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  waterYieldLiters: number;
  pumpRunHours: number;
  waterQualityCheck: 'Normal' | 'Requires Treatment';
  notes: string;
}

export interface UtilityMeterReading {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  meterType: 'Water' | 'Electricity';
  meterSerialNumber?: string; // e.g. "ZETDC-3P-4892", "CITY-WTR-8812"
  previousReading: number;
  currentReading: number;
  consumption: number;
  ratePerUnitUSD: number;
  multiplier?: number; // e.g. 1.0 or 1.2
  totalCostUSD: number;
  readingDate: string;
  tenantId?: string;
  tenantName?: string;
  invoicedStatus?: 'Pending' | 'Invoiced';
  invoiceId?: string;
  notes?: string;
}

export interface WhatsAppReminderRule {
  id: string;
  name: string;
  triggerDaysBeforeDue: number; // e.g. 5 days
  enabled: boolean;
  template: string;
  recipientGroup: 'All Overdue' | 'Upcoming Rent' | 'Specific Property';
}

export interface WhatsAppLog {
  id: string;
  tenantName: string;
  phone: string;
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  messagePreview: string;
  type: 'Rent Notice' | 'Accumulation Alert' | 'Payment Receipt' | 'Statement';
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Lease Agreement' | 'Title Deed' | 'CAM Audit' | 'Tax Clearance' | 'Compliance';
  propertyName: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
}

export interface CustomWorkflowGrouping {
  id: string;
  name: string;
  moduleIds: string[];
  userId: string;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  availableRoles: UserRole[];
  avatar?: string;
}
