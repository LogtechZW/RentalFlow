# Requirements Document

## 1. Application Overview
- **Application Name**: RentFlow Property Manager
- **Application Description**: A commercial property management web application for dual-currency (USD and ZiG) real estate portfolios in Zimbabwe. Built with the Quiet Couture visual system, the system provides high-density portfolio management, hotel-style room rack matrices with expandable space ledgers, automated dual-currency billing and receipts, infrastructure and diesel CAM cost apportionment, bulk WhatsApp communications, maintenance tracking, WorkView viewport scaling, in-page entity navigation, full CRUD management, and audit-grade financial reporting.

## 2. Target Users & Core Scenarios
- **Target Users**:
  - **Estate Manager**: Oversees physical assets, tenant allocations, hotel-style room racks, infrastructure logs (generators, boreholes, solar), and maintenance tickets.
  - **Accountant**: Manages dual-currency ledgers, tax invoices, USSD/bank receipting, CAM utility apportionment, sub-meter billing, and ZIMRA compliance reporting.
  - **Property Owner / Executive**: Reviews executive financial summaries, occupancy rates, debt aging, and portfolio yield metrics.
- **Core Scenarios**:
  - Navigating the system via the centralized Apps Hub, persistent top navigation chrome, and in-page Next/Previous entity switchers.
  - Adjusting viewport scaling and density via the WorkView Scale HUD (75% to 125% zoom, compact/spacious layouts).
  - Managing and modifying commercial properties, spaces, tenants, and financial records with full edit and delete controls.
  - Managing commercial spaces using the interactive hotel-style room grid with real-time occupancy status, unit specs, and inline chronological invoice statements.
  - Logging diesel generator runs and automatically apportioning fuel CAM recovery charges pro-rata across occupied space square meterage.
  - Batch-generating monthly ZIMRA-compliant dual-currency tax invoices and recording multi-channel payments.

## 3. Page Structure & Functional Specifications

```
RentFlow Property Manager
├── Global Navigation & Shell
│   └── WorkView Scale HUD
├── Apps Hub (/apps)
├── Commercial Portfolio Overview / Dashboard (/dashboard)
├── Commercial Portfolios (/portfolios)
├── Properties & Spaces (/properties)
│   └── Hotel-Style Room Management Grid
├── Commercial Tenants Directory (/tenants)
├── Dual-Currency Invoices & Levies (/invoices)
├── Payments & Receipts Register (/payments)
├── Leases & Escalations (/leases)
├── Infrastructure, Utilities & CAM Recovery (/infrastructure)
├── Commercial Maintenance Tickets (/maintenance)
├── Sub-Meter Readings & Utilities (/meter-readings)
├── Reports & Financial Analytics (/reports)
├── Document Vault (/documents)
└── System Settings & RBAC (/settings)
```

### 3.1 Global Visual Shell, Navigation Chrome & WorkView Scale HUD
- **Quiet Couture Visual Canvas**:
  - Deep background canvas `#0A1128` overlaid with photographic background shielding (`rgba(10, 17, 40, 0.85)` over viewport imagery `rentflowdesktop.png` and `rentflow2.png`).
  - Micro-glassmorphism container styling (`background: rgba(16, 28, 64, 0.45)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255, 255, 255, 0.07)`).
  - Strict 6px border-radius across cards, tables, inputs, and modal dialogs.
  - Monospace tabular numbers for financial figures.
- **In-Module Navigation Chrome & In-Page Switching**:
  - Sticky top header featuring corporate logo, active route breadcrumb, Return to Apps Hub shortcut, and Back navigation control.
  - In-Page Entity Switcher: Next/Previous item browsing buttons and quick back-to-parent controls on detail views for properties, spaces, tenants, leases, and maintenance tickets.
  - Secondary filter and search toolbar for rapid list scanning.
- **WorkView Scale HUD**:
  - Persistent floating / header HUD control to manage browser scaling and layout density.
  - Zoom Presets: Direct selection for 75%, 85%, 90%, 100%, 110%, and 125% zoom levels.
  - Density Modes: Toggle between Compact (high data density, tighter padding) and Spacious (standard spacing).
  - Responsive Width Tester: Quick viewport preset simulation controls (Desktop Standard, Wide, Compact Laptop).

### 3.2 Global CRUD & Item Management Operations
- **Universal Edit & Delete Capabilities**:
  - Properties & Portfolios: Edit portfolio/property metadata, address, specs, or delete asset records with confirmation guardrails.
  - Spaces & Units: Edit unit dimensions, code, floor assignment, target rent, or remove unallocated space units.
  - Tenants: Edit contact information, trade names, billing emails, or archive/delete inactive tenant records.
  - Transactions & Records: Edit invoice line notes, adjust pending levy items, and void/delete erroneous unposted draft records or maintenance entries.

### 3.3 Apps Hub (/apps)
- **Module Grid**: Interactive hub rendering 14 standardized module thumbnail panels with live metric badges and category tags.
- **AppFlowPro Launcher**: Quick-start billing widget with month-end billing trigger active during the last 3 calendar days of each month.
- **Floating Action Dock**: Persistent bottom-docked quick actions for Quick Invoice, Quick Payment (USSD mock), New Maintenance Ticket, Generator Fuel Log, and PDF Summary Export.
- **Viewport Auto-Scroll**: Dedicated top and bottom viewport scroll controls for rapid vertical navigation.

### 3.4 Commercial Portfolio Overview / Dashboard (/dashboard)
- **Financial & Occupancy Metric Cards**: Dual-currency revenue targets (USD and ZiG), collection efficiency percentage, gross portfolio arrears, and overall occupancy rate.
- **RBZ Rate Banner**: Real-time USD-to-ZiG exchange rate display with timestamp of last rate update.
- **Overdue Tenancy Feed**: Delinquent accounts feed with quick WhatsApp payment nudge trigger.
- **Facility Operations Status**: Operational health indicators for backup diesel generators, solar hybrid inverters, and borehole systems.

### 3.5 Commercial Portfolios (/portfolios)
- **Portfolio Registry & Card Grid**:
  - Reliable rendering of all registered portfolio items from data state with fallback empty and loading indicators.
  - Displays portfolio clusters (CBD High-Rises, Suburban Retail, Industrial Parks) with total leasable area, asset counts, target rent, collected funds, arrears, and collection yield.
  - Action buttons on each portfolio card: View Properties, Edit Portfolio details, and Delete Portfolio (with cascade check for active leases).
- **Regional Zone Filters**: Quick-filtering by designated municipal and commercial zones.

### 3.6 Properties & Hotel-Style Room Management Grid (/properties)
- **Property Header & Spec Overview**: Asset records detailing leasable floor area, backup generator capacity, borehole status, and occupancy counts, with direct Edit Property and Delete Property actions.
- **Hotel-Style Room Management Grid**:
  - Visual floor-by-floor space matrix displaying space identifier, leasable square meterage, tenant trade name, and occupancy status (Occupied, Vacant, Maintenance, Reserved).
  - Micro-actions per space tile: Direct inspection, Edit Unit Specs, Delete Unit, and Open Space Ledger.
  - In-Page Unit Switcher: Step to Next/Previous unit without leaving the inspection context.
- **Expandable Space Ledger & Statement View**:
  - Inline expandable dropdown presenting a read-only chronological ledger of invoices, receipts, and running balance.
  - Dual-currency settlement widget displaying current totals in USD and ZiG.
  - Manual levy adjustment modal to record authorized ad-hoc debits or credits with mandatory audit remarks.

### 3.7 Commercial Tenants Directory (/tenants)
- **Tenant Cards Register**: Directory cards showing business trade name, director contact, unit assignment, dual-currency outstanding balance, with Edit and Delete/Archive tenant controls.
- **Tenant Quick Actions**:
  - View Statement, Create Invoice, Record Payment, Log Maintenance Ticket, Send WhatsApp Reminder, View Lease Agreement.
- **Bulk WhatsApp Rent Reminder Engine**: Multi-select tenant batching engine with customizable reminder message templates and variable tags.

### 3.8 Dual-Currency Invoices & Levies (/invoices)
- **Invoice Register**: Filterable repository of issued, settled, and overdue invoices with dual-currency line-item breakdowns, edit draft capability, and void/delete actions for unposted records.
- **Batch Monthly Invoice Engine**: Auto-compiles Base Commercial Rent, square-meter pro-rata CAM levies, diesel fuel recovery surcharges, and sub-meter utility readings, calculating statutory 15% VAT.
- **ZIMRA Audit Invoice View**: Clean print and export layout rendering corporate tax registration details, itemized totals, and dual-currency exchange rate reference.

### 3.9 Payments & Receipts Register (/payments)
- **Multi-Channel Payment Form**: Supports Stanbic Nostro USD, EcoCash USD, RTGS / ZiG Bank Transfer, Cash, and Point of Sale (POS).
- **USSD Mock Entry Mode**: Quick-entry interface simulating mobile money transaction verification.
- **Dual-Currency Official Receipts**: Generates serialized receipts with transaction timestamps, allocated invoice references, and dual-currency figures.

### 3.10 Leases & Escalations (/leases)
- **Lease Agreements Registry**: Repository of active, pending, and expired commercial leases with Edit Lease Terms and Terminate/Delete Lease options.
- **Annual Escalation Engine**: Automated adjustment tracking for annual rent escalations (5% to 15%) with effective-date tracking.
- **Security Deposit Ledger**: USD security deposit holding records with deduction logging and refund processing.

### 3.11 Infrastructure, Utilities & CAM Recovery (/infrastructure)
- **Diesel Generator CAM Apportionment Engine**: Logs generator run hours, diesel fuel liters added, and fuel cost per liter; apportions pro-rata CAM fuel levies strictly across occupied units relative to floor area (sqm).
- **Borehole & Water Storage Register**: Logs daily pumping hours, municipal outages, and storage reservoir levels.
- **Solar Hybrid Inverter Tracking**: Tracks PV generation kWh, battery state of charge (SOC), and municipal grid offset.

### 3.12 Commercial Maintenance Tickets (/maintenance)
- **Kanban & List Management**: Ticket boards categorized across HVAC, Electrical, Plumbing, Structural, and Fire Safety, with inline ticket edit and deletion.
- **Severity Matrix & Detail Navigation**: Priority tiers (Critical, High, Medium, Low) with Next/Previous ticket traversal on inspection views.

### 3.13 Sub-Meter Readings & Utilities (/meter-readings)
- **Sub-Meter Register**: Manages electricity check meters and water sub-meters linked to individual units with edit/delete meter endpoints.
- **Fast Meter Entry Interface**: Instant calculation of consumption (`Current Reading - Previous Reading`) and real-time tariff preview (USD and ZiG cost).
- **Billing Batch Flagging**: Queues verified meter costs for ingestion into the upcoming monthly batch invoice generator.

### 3.14 Reports & Financial Analytics (/reports)
- **Executive Performance Reports**: Revenue yields, debt aging buckets (30/60/90+ days), and CAM cost recovery efficiency.
- **ZIMRA Tax Summaries**: Dual-currency tax schedules with output VAT breakdowns.
- **Tenancy Roll Export**: Structured tenant schedule detailing leasable areas, expiry dates, and rent per square meter.

### 3.15 Document Vault (/documents)
- **Categorized Document Archive**: Storage records for Title Deeds, Municipal Operating Permits, Tax Clearance Certificates (ITF263), Leases, and CR14 Incorporation Documents with document edit/delete controls.
- **Expiry Tracker**: Highlights upcoming certificate and permit expiry dates with warning badges.

### 3.16 System Settings & RBAC (/settings)
- **RBZ Central Exchange Rate Manager**: Central interface for updating the USD-to-ZiG exchange rate with immediate global propagation.
- **Corporate Branding Uploader**: Custom corporate logo management with instant preview and reset-to-default control.
- **WhatsApp Template Configurator**: Default message templates with variable tokens for rent notices and payment receipts.
- **Role-Based Access Control (RBAC) Matrix**: Granular module permissions for Estate Manager, Accountant, and Property Owner roles.

## 4. Business Rules & Core Logic
1. **Quiet Couture Visual Enforcement**: All module screens, modals, dialogs, and navigation chromes adhere to `#0A1128` background with muted photographic shielding (`rgba(10, 17, 40, 0.85)`), micro-glassmorphic styling, strict 6px border radii, and monospace tabular financial figures.
2. **WorkView HUD Scaling**: Zoom level adjustments (75%, 85%, 90%, 100%, 110%, 125%) and density toggles (Compact/Spacious) dynamically apply root-level scale and spacing classes without breaking table structures or modal alignments.
3. **Portfolio Rendering Guarantee**: Portfolio registry components must listen to the active portfolio data store; if total count > 0, cards must unconditionally render in the UI grid without blank layout dropouts.
4. **Entity Deletion Safety**: Deleting a property or unit requires validation that no active, non-terminated lease agreements are attached. Deleting a tenant archives historical invoices and ledgers.
5. **Dynamic Dual-Currency Conversion**: Updating the RBZ rate (`1 USD = [rate] ZiG`) in System Settings instantly recalculates all displayed and generated ZiG amounts across all active views, ledgers, and invoice engines.
6. **Pro-Rata CAM Diesel Fuel Apportionment**: Generator diesel recovery expenses are apportioned strictly to occupied units based on their individual leasable area divided by total occupied leasable area (`Unit CAM Share = (Unit Area / Total Occupied Area) * Total Fuel Cost`). Vacant units are excluded from tenant billing.
7. **Month-End Billing Window**: AppFlowPro automated batch billing is triggered within the last 3 calendar days of each month, consolidating base rent, square-meter CAM, sub-meter utilities, and 15% VAT.
8. **In-Page Entity Traversal**: When viewing space, property, tenant, or ticket details, clicking Next/Previous cycles sequentially through the filtered list of the parent directory without reloading the page.
9. **Sub-Meter Input Validation**: A meter reading submission requires `Current Reading >= Previous Reading`. Cost preview is calculated as `(Current Reading - Previous Reading) * Active Tariff Rate`.
10. **Role-Based Access Permissions**:
   - **Estate Manager**: Read/Write/Edit/Delete access to Properties, Spaces, Infrastructure, Maintenance, and Sub-Meters; Read-only access to Invoices and Reports.
   - **Accountant**: Read/Write/Edit access to Invoices, Payments, Leases, Sub-Meters, Reports, and System Exchange Rate; Read-only access to Physical Infrastructure logs.
   - **Property Owner**: Read-only access across Executive Dashboards, Reports, and Portfolio Roll.

## 5. Exceptions & Edge Cases

| Scenario | Condition | System Action |
| :--- | :--- | :--- |
| Portfolio Exists But Not Visible | Data store has portfolio count >= 1 but grid rendering is unmounted | Force grid container re-evaluation and render portfolio card with full metrics. |
| Deletion of Entity with Active Dependencies | User attempts to delete property or space with active lease | Block deletion, display error alert detailing active lease dependencies, and suggest lease termination first. |
| Negative Sub-Meter Consumption | Entered current reading is lower than previous logged reading | Block submission, highlight invalid field in Crimson (`#EF4444`), and prompt for meter rollover or correction. |
| Zero Occupancy During Diesel Run | Generator logged when total property occupancy is 0% | Record fuel operational expense but assign zero CAM recovery levy to billing queue. |
| WorkView Zoom on Small Viewport | User applies 125% zoom on a narrow display | Automatically engage horizontal scroll containment on high-density data tables without clipping action docks. |
| WhatsApp Dispatch Missing Contact | Tenant record lacks a valid phone number | Disable WhatsApp action trigger on tenant card and flag profile warning. |
| Rate Change During Active Session | RBZ exchange rate updated by administrator | Push instant notification update and recalculate all active on-screen ZiG totals without requiring full page refresh. |

## 6. Acceptance Criteria
1. The WorkView Scale HUD allows users to select zoom presets (75%, 85%, 90%, 100%, 110%, 125%) and toggle between Compact and Spacious density modes with immediate UI adjustments.
2. The In-Page Entity Switcher provides functional Next, Previous, and Back navigation across space inspections, property details, tenant records, and maintenance tickets.
3. Users with appropriate permissions can successfully Edit and Delete records across Portfolios, Properties, Spaces, Tenants, Invoices, Leases, Maintenance Tickets, and Documents.
4. The Portfolio module accurately renders all portfolio items when count >= 1, resolving prior rendering dropouts.
5. All application views and modal dialogs render over the `#0A1128` canvas with the `rgba(10, 17, 40, 0.85)` photographic background overlay, micro-glassmorphic styling, and 6px border-radius containers.
6. The top sticky navigation chrome maintains the corporate logo, breadcrumbs, Back control, and Return to Apps Hub shortcut across all module pages.
7. The Apps Hub displays 14 standardized module cards, AppFlowPro launcher, persistent floating action dock, and viewport top/bottom auto-scroll buttons.
8. The Hotel-Style Room Management Grid displays floor-by-floor unit tiles with real-time status indicators, space dimensions, expandable chronological space ledgers, and unit editing controls.
9. The Infrastructure module accurately calculates and apportions generator diesel fuel costs pro-rata across occupied space square meterage.
10. Updating the central RBZ exchange rate propagates recalculations across all dashboard KPIs, space ledgers, and invoice engines.

## 7. Out of Scope
1. Automated direct bank debit-order clearing and third-party bank core integration.
2. Real-time IoT hardware telemetry for automated sub-meter reads.
3. Residential tenancy dispute and legal court tracking modules.