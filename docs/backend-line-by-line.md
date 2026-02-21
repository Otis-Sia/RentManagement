# Backend Line-by-Line Guide (Simple English)

This file explains **what each backend file does** and gives a practical **line map** for how to read each file.

> Note: many files are generated/boilerplate (`migrations`, empty `tests.py`, `__init__.py`).
> For those, the line map is short because their purpose is narrow.

---

## How to read line maps

For most Python files, lines follow this pattern:
- **Top lines**: imports
- **Middle lines**: classes/functions
- **Bottom lines**: options, metadata, return values

When exact numbers change over time, use this as the stable interpretation of each block.

---

## Project bootstrap/config files

### `backend/manage.py`
- **Lines 1-2**: shebang/docstring
- **Lines 4-6**: import `os`, `sys`
- **Lines 8-12**: set `DJANGO_SETTINGS_MODULE`, guard import error
- **Bottom lines**: call `execute_from_command_line(sys.argv)`

### `backend/config/settings.py`
- **Top block**: env loading, base path, security/debug flags
- **Installed apps block**: Django built-ins + DRF + your apps
- **Middleware block**: request/response pipeline
- **Templates/WSGI block**: template engine + app server entry
- **Database block**: DB connection setup
- **Auth validators block**: password policy
- **i18n/timezone block**: language and timezone
- **Static/media block**: static files and uploads
- **DRF/CORS/custom constants block** (if present): API behavior

### `backend/config/urls.py`
- **Top lines**: import `path`, `include`, and `admin`
- **`urlpatterns` lines**: register `/admin/` and `/api/...` app routes
- Each `path()` line is one route mapping

### `backend/config/asgi.py` and `backend/config/wsgi.py`
- Minimal startup files
- Set settings module and expose `application`

### `backend/get-pip.py`
- Installer utility script for `pip`
- Not part of runtime API logic

### `backend/generate_sample_data.py`
- **Top**: Django setup/imports/constants
- **Middle**: helper generators (properties, tenants, payments, maintenance)
- **Bottom**: summary + `main()` execution
- Every function block creates one part of the demo dataset

---

## Core app (`backend/core/`)

### `core/models.py`
- Shared/common models (currently minimal)

### `core/views.py`
- Shared/common endpoints (currently minimal)

### `core/admin.py`
- Admin registrations for core models (if any)

### `core/apps.py`
- App metadata: app name and default config

### `core/tests.py`
- Placeholder or small unit tests

### `core/migrations/__init__.py`, `core/__init__.py`
- Package/migration markers only

---

## Houses app (`backend/houses/`)

### `houses/models.py`
- **Imports**: Django model base and related models
- **`Property` class**: house/unit table columns
- **Model methods**: convenience access to tenant/payment/maintenance history
- **`Meta` class**: ordering/plural name/constraints
- **`__str__`**: human-readable display name

### `houses/serializers.py`
- **Top**: DRF serializer imports
- **Basic serializers**: compact nested output objects
- **Main serializers**: list/detail payload for property endpoints
- Serializer fields map model fields to JSON keys

### `houses/views.py`
- **Top**: DRF viewset imports
- **ViewSet class**: CRUD endpoints
- **`get_queryset` / `get_serializer_class` / custom actions** (if present)
- Handles API behavior for list/detail/create/update/delete

### `houses/urls.py`
- Router registration for property viewset

### `houses/admin.py`
- Admin list fields, filters, search settings

### `houses/tests.py`
- API and model tests for house features

### `houses/migrations/*.py`
- `0001_initial.py`: first property table schema
- later migration files: field/constraint changes

---

## Tenants app (`backend/tenants/`)

### `tenants/models.py`
- **`Tenant` model**: identity, lease period, rent values, active status
- **`LeaseDocument` model**: file upload linked to tenant
- Validators/choices appear near field declarations

### `tenants/serializers.py`
- `LeaseDocumentSerializer`
- `TenantSerializer` (list/basic)
- nested serializers for payments/maintenance
- `TenantDetailSerializer` (full profile)

### `tenants/views.py`
- `TenantViewSet`: tenant CRUD
- `LeaseDocumentViewSet`: lease file CRUD
- detail endpoint usually switches to richer serializer

### `tenants/urls.py`
- router paths for tenants and lease documents

### `tenants/admin.py`, `tenants/apps.py`, `tenants/tests.py`
- admin registration, app config, tests

### `tenants/migrations/*.py`
- initial tenant tables
- follow-up schema updates (`house_number` -> relation, due-day additions, etc.)

---

## Payments app (`backend/payments/`)

### `payments/models.py`
- **Status/type/method choices**: `PAYMENT_STATUS_CHOICES` (PENDING, LATE, FAILED, SEVERE, DEFAULTED, PAID), `PAYMENT_TYPE_CHOICES` (RENT, DEPOSIT, FEE, OTHER), `PAYMENT_METHOD_CHOICES` (MPESA, CASH, BANK, CHEQUE, OTHER)
- **`Payment` model fields**:
  - `tenant` — FK to Tenant, `on_delete=PROTECT` (prevents accidental deletion)
  - `amount` — DecimalField with `MinValueValidator(0.01)`
  - `original_amount` — DecimalField, set once on creation (never modified after)
  - `amount_paid` — DecimalField, tracks how much has been paid (for partial payments)
  - `date_due`, `date_paid` — DateFields
  - `transaction_id` — CharField with `UniqueConstraint` (only enforced if non-empty)
  - `status` — CharField with choices, default PENDING
  - `payment_type` — CharField with choices
  - `payment_method` — CharField (MPESA, CASH, BANK, CHEQUE, OTHER)
  - `invoice` — optional FK to `finance.Invoice`
  - `notes` — TextField (optional)
  - `created_at`, `updated_at` — timestamps
- **`balance` property**: returns `amount - amount_paid`
- **`save()` override**: sets `original_amount = amount` on first creation only
- **`Meta`**: ordering by `-date_due, -created_at`; unique constraint on non-empty `transaction_id`

### `payments/status.py` *(new — shared status engine)*
- **Constants**: `LATE_AFTER_DAYS=5`, `FAILED_AFTER_DAYS=35`, `DEFAULTED_AFTER_DAYS=90`, `MAX_RENT_FAILED_BEFORE_SEVERE=2`
- **`compute_base_status(date_due, date_paid)`**: pure date-based status (PAID, PENDING, LATE, FAILED, DEFAULTED)
- **`compute_status_for_tenant(...)`**: adds tenant-history escalation:
  - LATE → FAILED if tenant already has another LATE payment
  - FAILED → SEVERE if tenant has ≥ 2 other FAILED rent payments
- Used by both the serializer (real-time) and the management command (batch)

### `payments/serializers.py`
- **Write-only control fields**: `clear_arrears_payment_id`, `clear_failed_payment_id`, `all_inclusive`
- **Read-only convenience fields**: `tenant_name`, `tenant_phone`, `house_number`, `house_id`, `balance`
- **`_apply_payment_to_single_arrears()`**: applies payment to a specific arrears record via `amount_paid` tracking (never mutates `amount`)
- **`_apply_payment_to_all_arrears()`**: iterates oldest-first through all overdue payments, incrementing `amount_paid` until the payment amount is exhausted; returns leftover for credit
- **`validate()`**: auto-computes status via `compute_status_for_tenant()`, rejects future `date_paid`, rejects payments for inactive tenants, validates arrears selection
- **`create()` / `update()`**: sets `amount_paid` when status becomes PAID; triggers arrears clearing or all-inclusive sweeping; credits overpayment to tenant if `credit_balance` field exists
- **`read_only_fields`**: `['status', 'original_amount', 'balance']`

### `payments/views.py`
- **`PaymentViewSet`**:
  - `filter_backends`: `DjangoFilterBackend`, `SearchFilter`, `OrderingFilter`
  - `filterset_fields`: status, payment_type, payment_method, tenant, date_due
  - `search_fields`: tenant name, transaction_id, notes
  - `ordering_fields`: date_due, date_paid, amount, created_at, updated_at
  - `queryset`: uses `select_related('tenant', 'tenant__property')`
- **`create()`**: reconciliation (finds existing PENDING for same tenant/date to update); next-month auto-generation on PAID rent
- **`update()`**: guards immutable fields (amount, date_due, tenant, payment_type) on PAID payments; allows notes/method edits
- **`destroy()`**: blocks deletion of PAID payments ("void it instead")
- **`receipt()` action** (`GET /payments/{id}/receipt/`): returns structured receipt JSON with tenant, property, payment details, and balance

### `payments/urls.py`
- Router registration for `PaymentViewSet` (includes receipt action route)

### `payments/admin.py`
- Admin registration (pending — currently placeholder)

### `payments/tests.py`
- Payment behavior tests (serializer-level; API tests planned)

### `payments/management/commands/update_payment_statuses.py`
- Batch management command using shared `compute_status_for_tenant()` from `payments.status`
- Iterates all unpaid payments, recomputes status, saves individually (not bulk update)
- Logs each transition (e.g., `PENDING → LATE`, `LATE → FAILED`)
- Handles inactive tenants separately → marks all their unpaid payments as DEFAULTED
- Outputs transition summary counts

### `payments/migrations/*.py`
- `0001_initial.py` → `0003`: original schema + status option changes
- `0004_add_payment_fields.py`: adds amount_paid, original_amount, payment_method, notes, updated_at, invoice FK, PROTECT, constraints
- `0005_backfill_payment_amounts.py`: data migration backfilling original_amount and amount_paid for existing records

---

## Maintenance app (`backend/maintenance/`)

### `maintenance/models.py`
- `MaintenanceRequest` model
- priority/status choices at top
- fields: tenant, title, description, priority, status, cost, timestamps

### `maintenance/serializers.py`
- JSON field mapping for maintenance requests

### `maintenance/views.py`
- CRUD endpoints and queryset behavior

### `maintenance/urls.py`
- route registration

### `maintenance/admin.py`, `maintenance/apps.py`, `maintenance/tests.py`
- admin setup, app metadata, tests

### `maintenance/migrations/*.py`
- initial request table schema

---

## Reports app (`backend/reports/`)

### `reports/views.py`
- dashboard report endpoint(s)
- sums/aggregations for income, outstanding balances, costs
- returns consolidated JSON for frontend dashboard

### `reports/urls.py`
- report endpoint routes

### `reports/models.py`
- often empty or minimal (computed reports instead of stored tables)

### `reports/admin.py`, `reports/apps.py`, `reports/tests.py`, `reports/migrations/__init__.py`
- standard app support files

---

## Finance app (`backend/finance/`)

### `finance/models.py`
- `BankAccount`, `TransactionCategory`, `Transaction`, `Invoice`, `InvoiceItem`
- fields define finance ledger and invoicing structure
- relationships connect invoices to tenants/items and transactions to categories/accounts

### `finance/serializers.py`
- finance model <-> JSON conversion
- nested invoice item handling (if implemented)

### `finance/views.py`
- finance API endpoints
- transaction/invoice reporting and CRUD behavior

### `finance/urls.py`
- finance route registration

### `finance/admin.py`
- inline invoice item editor (`InvoiceItemInline`)
- admin list/filter/search setup for bank accounts, categories, transactions, invoices

### `finance/tests.py`, `finance/apps.py`, `finance/migrations/*.py`
- tests, app metadata, initial schema

---

## Payroll app (`backend/payroll/`)

### `payroll/models.py`
- employee and payroll run related tables
- salary/tax/status/date fields

### `payroll/serializers.py`
- payroll JSON mapping

### `payroll/views.py`
- payroll CRUD/list/report endpoints

### `payroll/urls.py`
- payroll route registration

### `payroll/admin.py`, `payroll/apps.py`, `payroll/tests.py`, `payroll/migrations/*.py`
- admin, config, tests, schema history

---

## Boilerplate files (all apps)

### `__init__.py`
- Marks folder as Python package
- usually empty

### `apps.py`
- Defines Django app config class

### `admin.py`
- Controls Django Admin UI behavior

### `tests.py`
- Unit/integration tests

### `migrations/*.py`
- Auto-generated database schema history
- each migration file is one step in DB evolution

---

## Quick “element meaning” reference

- **Model field** = one DB column
- **ForeignKey** = relation to another table
- **Serializer field** = one JSON key in API payload
- **ViewSet method** = one API behavior (list/create/retrieve/update/delete)
- **`path()` in urls.py** = one endpoint URL mapping
- **Admin `list_display` item** = one visible column in Django Admin list view
- **Migration operation** = create/alter/remove DB structure
