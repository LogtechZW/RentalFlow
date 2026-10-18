# System Specification & Master Design Blueprint: RentFlow Property Manager
## "Quiet Couture" Global Visual System Architecture

### 1. Global Visual System Architecture ("Quiet Couture" Aesthetic)
Execute an international enterprise-grade dark corporate aesthetic. The UI must look like an asset management platform, avoiding oversized round containers, bright primary color blocks, or raw unshielded image backgrounds.

#### A. Micro-Glassmorphism & Optical Layering
- **Full Viewport Underlay Canvas**: Deep background hex `#0A1128`.
- **Photographic Background Shielding**: Continuous, unvarying muted overlay of `rgba(10, 17, 40, 0.85)` over all full-viewport imagery (`rentflowdesktop.png` on desktop, `rentflow2.png` on mobile). No text, metrics, or input fields rest directly on unshielded photography.
- **Container Formula**: All system cards, data tables, and modal sheets float using micro-glassmorphism:
  `background: rgba(16, 28, 64, 0.45); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.07);`
- **Structural Geometry**: Strict, sharp card border-radius of exactly 6px across all grids. No round consumer-app pill styles. Uniform structural padding of 32px on desktop and 20px on tablet/mobile views.

#### B. Typography & Restrained Font Hierarchy
- **Primary UI & Data Font**: 'Inter' / SF Pro Display for high-density tables, hotel racks, and input layers. Monospace numeric font-variant properties (`tabular-nums font-mono`) for all financial numbers to ensure flawless columnar alignment.
- **Display & Brand Font**: 'Instrument Serif' or elegant thin-weight serif face for page titles, portfolio statistics, and top-level module headers.
- **Restraint Rule**: Exactly four distinct font steps across the entire application interface:
  - Titles: 28px (Light/Regular 300-400 weight)
  - Section Headers: 16px (Medium 500 weight)
  - Micro-Labels/Metrics: 11px (Semi-Bold 600 weight)
  - Body Text: 13px (Regular 400 weight)

#### C. System Status Accents
Status indicators use highly desaturated, elegant corporate hues:
- Fully Paid: `#10B981` (Muted Emerald)
- Partially Paid: `#F59E0B` (Muted Amber)
- Overdue/Arrears: `#EF4444` (Crimson)
- Pending Confirmation: `#3B82F6` (Muted Blue)
- No Invoice Issued: `#64748B` (Muted Slate)
- Under Maintenance: `#8B5CF6` (Muted Amethyst)

### 2. Global Navigation, Chromes, & Sticky Layout Behaviors
- **Entry Mechanics**: Splash Page desktop splits Logo & "Proceed to Sign In" CTA side-by-side; mobile stacks Logo on top and anchors CTA flush to viewport bottom.
- **Post-Login Navigation**: Successful authentication directs to Apps Page module hub (/apps), replacing persistent sidebars.
- **In-Module Chrome**: Global top navigation layer containing brand logo, "Back to Previous" history button, "Return to Apps Hub" router, and structured breadcrumbs.
- **Sticky Toolbars**: Module header and secondary filter toolbars are explicitly sticky (`sticky top-0 z-30`), while main content matrices, data tables, and tenant grids scroll smoothly beneath.

### 3. High-Density Layout Structures & Functional Modules
- **Apps Page Hub**: 14 system modules as rich thumbnail panels backed by Harare commercial estate photography. AppFlowPro Launcher with month-end billing trigger (last 3 calendar days of the month). Floating Action Dock supporting minimized/expanded states and Batch Invoice PDF export. Minimal top/bottom auto-scroll buttons.
- **Interactive Rack Grids & Ledgers**: Hotel-Style Room Management Grid with floor-by-floor cellular matrix, expandable read-only chronological Invoice Statement dropdown, dual-currency totals settlement widget, and Space Ledger supporting manual PM levy modifications with real-time audit event logging.
- **Tenant Directory & Infrastructure**: Tenant cards with 6 quick actions (WhatsApp with deep wa.me link, Invoice/Receipt compilation, read-only payment ledger, lease escalation, turnover audit, profile edit). Bulk WhatsApp rent reminder engine. Diesel Apportionment Engine outputting pro-rata CAM diesel levies across active tenant spaces relative to exact floor sqm.
