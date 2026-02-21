# RentManagement System - Simple Full Walkthrough

This project is a **rent/property management system** with:
- a **Django backend** (`backend/`) for APIs and database logic
- a **React frontend** (`frontend/`) for the user interface
- **NGINX** (`nginx.conf`) to serve frontend files and proxy API calls
- a startup helper script (`start_system.sh`) to run everything together

---

## 1) Top-level files

## `start_system.sh`
Main run script. It:
1. Detects your browser
2. Sets cleanup handlers for shutdown
3. Runs Django migrations
4. Builds frontend (`npm run build`)
5. Applies and restarts NGINX config
6. Starts Django server
7. Opens app URL in browser

## `nginx.conf`
Defines web routing:
- `/api/` and `/admin/` -> Django backend
- everything else -> React build files (`frontend/dist`)
- SPA fallback to `index.html`

## `.gitignore`
Tells Git which files/folders not to track (cache, venv, build outputs, etc.).

---

## 2) Documentation folder (`docs/`)

## `docs/QUICKSTART.md`
Fast setup and run guide.

## `docs/NGINX_PWA_SETUP.md`
How NGINX + PWA are configured.

## `docs/OFFLINE_SYNC.md`
Explains offline cache and resync behavior.

## `docs/repository-information.md`
Repository metadata and notes.

---

## 3) Backend (`backend/`) — Django API

## `backend/manage.py`
Django command entry point (`runserver`, `migrate`, etc.).

## `backend/requirements.txt`
Python dependency list.

## `backend/setup_db.sh`
Database setup helper script.

## `backend/generate_sample_data.py`
Creates realistic sample houses, tenants, payments, and maintenance records.

### `backend/config/` (Django project config)

## `backend/config/settings.py`
Core settings:
- installed apps
- middleware
- DB/static settings
- DRF setup
- env loading (`.env`)

## `backend/config/urls.py`
Main URL router:
- `/admin/`
- `/api/houses/`
- `/api/tenants/`
- `/api/payments/`
- `/api/maintenance/`
- `/api/reports/`
- `/api/finance/`
- `/api/payroll/`

## `backend/config/asgi.py` and `backend/config/wsgi.py`
Deployment entry points.

---

## 4) Backend apps (what each one does)

## `backend/houses/`
Manages properties (house/unit records).
- `models.py`: property fields (house number, address, rent, occupancy)
- `serializers.py`: convert model data <-> JSON
- `views.py`: API endpoints (CRUD)
- `urls.py`: route registration
- `migrations/`: DB schema changes over time
- `tests.py`: app tests

## `backend/tenants/`
Manages tenant records and lease docs.
- `models.py`: tenant data + lease document model
- `serializers.py`: list/detail serializers
- `views.py`: tenant CRUD + lease document APIs
- `urls.py`: route registration
- `migrations/`: DB table definitions/updates

## `backend/payments/`
Tracks rent and other payment records with full status lifecycle.
- `models.py`: Payment model — amount, original_amount, amount_paid, balance (property), due/paid dates, status (PENDING → LATE → FAILED → SEVERE → DEFAULTED → PAID), payment_type, payment_method (MPESA/CASH/BANK/CHEQUE/OTHER), transaction_id (unique constraint), notes, invoice FK. Uses `PROTECT` on tenant FK and `MinValueValidator` on amount.
- `status.py`: **shared status computation module** — single source of truth for status logic used by both the serializer and the management command. Implements escalation ladder (LATE after 5 days, FAILED after 35 days, DEFAULTED after 90 days) and tenant-history escalation (LATE→FAILED if another LATE exists, FAILED→SEVERE if ≥2 FAILED rent payments exist).
- `serializers.py`: payment JSON mapping with arrears-clearing logic (single and all-inclusive), amount_paid tracking (never mutates original amount), auto-computed status via `status.py`, validation guards (reject future date_paid, reject inactive tenant payments).
- `views.py`: payment CRUD with filtering (`DjangoFilterBackend`), search, ordering; reconciliation on create (finds existing PENDING to update); next-month auto-generation; update guard (immutable fields on PAID); delete guard (cannot delete PAID); receipt endpoint (`/payments/{id}/receipt/`).
- `urls.py`: payment routes (includes receipt action)
- `management/commands/update_payment_statuses.py`: batch status updater using shared `status.py` module, logs individual transitions, handles inactive tenant → DEFAULTED.
- `migrations/`: payment schema versions including field additions (0004) and data backfill (0005)

## `backend/maintenance/`
Tracks repair tickets.
- `models.py`: title, description, priority, status, cost, dates
- `serializers.py`: API mapping
- `views.py`: maintenance endpoints
- `urls.py`: route registration
- `migrations/`: schema

## `backend/reports/`
Computes dashboard/report data from other apps.
- `views.py`: monthly income, outstanding balance, costs, recent data
- `urls.py`: report endpoints

## `backend/finance/`
Advanced finance (bank accounts, transactions, invoices).
- `models.py`: finance entities
- `serializers.py`: finance API payloads
- `views.py`: finance endpoints
- `urls.py`: finance routes
- `admin.py`: custom admin screens (list display, filters, invoice item inline)

## `backend/payroll/`
Employee and payroll operations.
- models/views/serializers/urls follow same pattern as other apps.

## `backend/core/`
Shared app for common/base pieces.

---

## 5) Frontend (`frontend/`) — React app

## `frontend/package.json`
JS dependencies + scripts (`dev`, `build`, `preview`).

## `frontend/vite.config.js`
Vite config:
- React plugin
- build output
- dev server host/port
- API proxy to Django during development

## `frontend/index.html`
Single HTML shell where React mounts (`<div id="root"></div>`).

## `frontend/src/main.jsx`
Frontend entry point. Renders `App` and initializes PWA utilities.

## `frontend/src/App.jsx`
Route map for all pages (dashboard, houses, tenants, payments, etc.).

## `frontend/src/Layout.jsx`
Shared page frame (sidebar, mobile header, navigation shell).

## `frontend/src/index.css`
Global styles, variables, responsive layout, card/table/button styles, dark mode support.

## `frontend/src/App.css`
Extra app-level styling (minimal compared with `index.css`).

### `frontend/src/components/`
Page and UI components, for example:
- `Dashboard.jsx`: KPI cards + charts/tables
- `HouseList.jsx` / `HouseDetail.jsx`
- `TenantList.jsx` / `TenantDetail.jsx`
- `PaymentList.jsx`
- `MaintenanceList.jsx`
- `Reports.jsx`
- `AddTenantModal.jsx`, `AddMaintenanceModal.jsx`
- finance/payroll components (`TransactionList`, `InvoiceList`, `EmployeeList`, etc.)

### `frontend/src/utils/`
Helper functions (e.g., currency/date formatting).

### PWA files
- `frontend/public/manifest.json`: install metadata
- `frontend/public/service-worker.js`: caching/offline behavior
- `frontend/public/icons/`: app icons

---

## 6) Common file patterns in each Django app

Most backend apps have the same structure:
- `models.py`: database table structure
- `serializers.py`: JSON conversion for API
- `views.py`: request handling/business logic
- `urls.py`: endpoint paths
- `admin.py`: Django admin registration/customization
- `tests.py`: test cases
- `apps.py`: app registration config
- `migrations/*.py`: database schema history

---

## 7) Request flow (end-to-end)

1. User opens app URL
2. NGINX serves React app
3. React page calls backend API (`/api/...`)
4. NGINX proxies API to Django
5. Django URL router selects app view
6. View reads/writes DB through models
7. Serializer returns JSON response
8. React renders it in cards/tables/forms
9. Service worker caches data for offline use

---

## 8) About “line by line” explanation

A true line-by-line explanation for this whole repository would be very long (thousands of lines). This file gives the complete **system map in simple English** so you can understand what every folder and file type is responsible for.

If you want, next I can generate:
- `docs/backend-line-by-line.md` (backend files with key line ranges)
- `docs/frontend-line-by-line.md` (frontend files with key line ranges)
- and then a final “all lines covered” index.