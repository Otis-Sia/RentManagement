# Frontend Line-by-Line Guide (Simple English)

This file explains **what each frontend source file does** and gives a practical **line map** of where important logic lives.

---

## How to read line maps

Most frontend files follow this shape:
- **Top lines**: imports
- **Middle lines**: state/hooks/functions
- **Bottom lines**: JSX return/export

For CSS files:
- **Top**: variables/base
- **Middle**: layout/components
- **Bottom**: responsive media rules

---

## Entry and shell files

### `frontend/src/main.jsx`
- **Top**: React imports + CSS + `App`
- **Middle**: `createRoot(...).render(...)`
- **Bottom**: PWA/offline init calls

### `frontend/src/App.jsx`
- **Top**: route/page component imports
- **Middle**: router definition
- **Bottom**: exported app component
- Each `<Route ...>` line maps one URL to one page component

### `frontend/src/Layout.jsx`
- **Top**: navigation imports/icons/hooks
- **Middle**: sidebar/mobile-menu state and handlers
- **Bottom**: wrapper JSX (`sidebar + content outlet`)

### `frontend/src/App.css`
- App-level style overrides and component-specific styling

### `frontend/src/index.css`
- Global variables (`:root`) and theme tokens
- base typography/body styles
- layout classes (`sidebar`, `content`, `card`, `table`, `button`)
- responsive/mobile media queries

---

## Utility files

### `frontend/src/utils/api.js`
- API helper functions
- central fetch wrappers, endpoint constants, and shared request logic
- used by components so API code is not repeated everywhere

### `frontend/src/utils/format.js`
- formatting helpers
- currency/date/display utility functions reused across pages

### `frontend/src/pwa-utils.js`
- service worker registration
- offline cache initialization and sync helpers
- network status listeners and cache message posting

---

## Components folder (`frontend/src/components/`)

## Dashboard and summaries

### `Dashboard.jsx`
- fetches dashboard data
- computes/loading/error state
- renders KPI cards + chart/table subcomponents

### `DashboardCharts.jsx`
- chart components for income/cost trends and statuses
- transforms API data into chart-friendly arrays/series

### `DashboardTables.jsx`
- summary tables (recent payments, maintenance items, balances)

---

## Houses

### `HouseList.jsx`
- loads property list
- search/filter/sort logic
- renders property cards/table
- opens create/edit modal when needed

### `HouseDetail.jsx`
- fetches one property by URL id
- renders property details, current tenant, payment history, maintenance, tenant history

### `HouseModal.jsx`
- add/edit property form
- field validation and submit handlers
- create/update API call

---

## Tenants

### `TenantList.jsx`
- loads tenants
- search/filter state
- list cards/rows with navigation links
- opens tenant add/edit modal

### `TenantDetail.jsx`
- loads one tenant with nested payments/maintenance/lease docs
- shows tenant profile and history sections

### `AddTenantModal.jsx`
- modal form for new/edit tenant
- property selection and rent/deposit inputs
- submit to create/update tenant record

### `SearchableSelect.jsx`
- reusable searchable dropdown
- filter text handling + option selection callbacks

---

## Payments and maintenance

### `PaymentList.jsx`
- loads payment records
- tab/filter behavior (all/late/etc.)
- status badges and due/paid date display
- reminder actions (e.g., WhatsApp message helper)

### `AddPaymentModal.jsx`
- add payment form
- validation and create API request

### `MaintenanceList.jsx`
- loads maintenance requests
- filters by status/priority
- shows request cards with tenant/property links

### `AddMaintenanceModal.jsx`
- create maintenance ticket form
- priority/status/cost fields
- submit request and refresh list callback

---

## Reports and finance

### `Reports.jsx`
- displays high-level report blocks from backend report APIs

### `FinancialReports.jsx`
- finance-specific report views/charts/tables

### `TransactionList.jsx`
- transaction list/filtering/summary totals

### `AddTransactionModal.jsx`
- create/edit finance transaction dialog

### `InvoiceList.jsx`
- invoice table/list with status filters and navigation

### `InvoiceDetail.jsx`
- invoice header, line items, totals, and status actions

### `AddInvoiceModal.jsx`
- invoice creation form with invoice item rows

---

## Payroll

### `EmployeeList.jsx`
- employee directory listing and filtering

### `AddEmployeeModal.jsx`
- create/edit employee form

### `PayrollRunList.jsx`
- payroll run history, status, and action controls

---

## Quick “element meaning” reference (frontend)

- **`useState(...)` line** = local screen state variable
- **`useEffect(...)` line** = run side-effect (usually data fetch)
- **`fetch(...)` / API helper call** = backend request
- **`return ( ... )` block** = UI markup to render
- **Prop in component signature** = input passed from parent component
- **CSS class selector** = styling rule for matching elements
- **`@media` block** = responsive behavior by screen size

---

## Full source file checklist covered

Entry/style/utils:
- `src/main.jsx`
- `src/App.jsx`
- `src/Layout.jsx`
- `src/index.css`
- `src/App.css`
- `src/pwa-utils.js`
- `src/utils/api.js`
- `src/utils/format.js`

Components:
- `src/components/Dashboard.jsx`
- `src/components/DashboardCharts.jsx`
- `src/components/DashboardTables.jsx`
- `src/components/HouseList.jsx`
- `src/components/HouseDetail.jsx`
- `src/components/HouseModal.jsx`
- `src/components/TenantList.jsx`
- `src/components/TenantDetail.jsx`
- `src/components/AddTenantModal.jsx`
- `src/components/SearchableSelect.jsx`
- `src/components/PaymentList.jsx`
- `src/components/AddPaymentModal.jsx`
- `src/components/MaintenanceList.jsx`
- `src/components/AddMaintenanceModal.jsx`
- `src/components/Reports.jsx`
- `src/components/FinancialReports.jsx`
- `src/components/TransactionList.jsx`
- `src/components/AddTransactionModal.jsx`
- `src/components/InvoiceList.jsx`
- `src/components/InvoiceDetail.jsx`
- `src/components/AddInvoiceModal.jsx`
- `src/components/EmployeeList.jsx`
- `src/components/AddEmployeeModal.jsx`
- `src/components/PayrollRunList.jsx`
