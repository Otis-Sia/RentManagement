# Backend Architecture Guide

This file explains the Java/Micronaut backend structure and how to read each component.

---

## How the Backend is Organized

The backend follows a standard layered architecture:

```
Domain (Entities) → Repository (Data Access) → Controller (API)
```

- **Domain**: JPA entity classes that map to PostgreSQL tables
- **Repository**: Interfaces for database queries (auto-implemented by Micronaut Data)
- **Controller**: HTTP endpoints that handle requests and return JSON

---

## Configuration

### `src/main/resources/application.yml`
- **datasources**: PostgreSQL connection URL, credentials
- **jpa**: Hibernate settings, entity scan packages, naming strategy
- **jackson**: snake_case JSON serialization
- **micronaut.server**: Port (8000), CORS settings

### `src/main/java/com/rentmanagement/config/DjangoNamingStrategy.java`
- Converts Java camelCase field names to snake_case column names
- Ensures compatibility with the PostgreSQL schema (originally created by Django)

---

## Domain Entities (`domain/`)

Each entity class:
- Uses `@Entity` and `@Table(name=...)` to map to a PostgreSQL table
- Has `@Id` with `@GeneratedValue(strategy = IDENTITY)` for auto-increment primary keys
- Uses `@Enumerated(EnumType.STRING)` for enum-backed columns
- Has `@PrePersist` / `@PreUpdate` lifecycle hooks for timestamps
- Uses `@ManyToOne(fetch = LAZY)` for foreign key relationships

### Key entities with business logic:
- **`Payment.java`**: Has `getBalance()` computed property (amount - amountPaid), display name helpers
- **`Paycheck.java`**: Full Kenyan tax bracket calculation in `calculate()` method — computes PAYE, NHIF (tiered), NSSF (Tier I+II), Housing Levy, and employer contributions
- **`Invoice.java`**: `recalculateTotals()` sums line items, computes tax, and updates total
- **`PayrollRun.java`**: `recalculateTotals()` aggregates all paycheck amounts

---

## Repositories (`repository/`)

Each repository:
- Extends `JpaRepository<Entity, Long>` for standard CRUD
- Uses method naming conventions for auto-generated queries (e.g., `findByIsActiveTrue()`)
- Uses `@Query` JPQL for complex queries

### Notable custom queries:
- `PaymentRepository`: reconciliation lookup, upcoming due payments, paid-by-year-and-month for reports
- `MaintenanceRequestRepository`: count by status for dashboard
- `MessageRecipientRepository`: count read/total for broadcast stats
- `FinTransactionRepository`: date range queries for financial reports

---

## Controllers (`controller/`)

Each controller:
- Uses `@Controller("/api/...")` to define the base URL
- Has `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` methods
- Uses `@Body` for request bodies and `@QueryValue` for query parameters
- Returns `HttpResponse<?>` for proper HTTP status codes
- Uses `@Transactional` for database write operations

### Key controllers with business logic:

#### `PaymentController.java` (`/api/payments/`)
- **Create**: Reconciles with existing PENDING payments for same tenant/date; auto-generates next month's rent when a RENT payment is PAID
- **Update**: Blocks modification of immutable fields (amount, date_due, tenant, payment_type) on PAID payments
- **Delete**: Blocks deletion of PAID payments
- **Receipt** (`GET /{id}/receipt`): Generates structured receipt JSON

#### `FinanceController.java` (`/api/finance/`)
- Combines 4 sub-resources: accounts, categories, transactions, invoices
- Financial reports endpoint: P&L, Balance Sheet, Cash Flow, Tax Summary
- Auto-categorize action for uncategorized transactions

#### `PayrollController.java` (`/api/payroll/`)
- Manages employees, payroll runs, and paychecks
- Payroll run lifecycle: DRAFT → generate paychecks → PROCESSING → approve → APPROVED → mark paid → PAID

#### `MessagingController.java` (`/api/messaging/`)
- Broadcast sending creates recipient records based on audience (ALL_TENANTS, BUILDING_TENANTS, ALL_EMPLOYEES)
- Read tracking and WhatsApp send tracking per recipient

#### `DashboardController.java` (`/api/reports/dashboard/`)
- Aggregates: monthly income, outstanding balance, maintenance costs, net cash flow
- Lists: recent payments, upcoming payments, active maintenance
- Charts: payment trends (6 months), payment status distribution, property occupancy rate

---

## Quick Reference

| Concept | Django (old) | Java/Micronaut (new) |
|---|---|---|
| Model | `models.Model` subclass | `@Entity` class |
| Migration | `python manage.py migrate` | Hibernate `hbm2ddl.auto: update` |
| Serializer | DRF `ModelSerializer` | Manual `Map<String, Object>` or Jackson |
| ViewSet | DRF `ModelViewSet` | `@Controller` class |
| URL routing | `urls.py` + Router | `@Get`/`@Post` annotations |
| Database query | `Model.objects.filter(...)` | Repository method or `@Query` |
| Settings | `settings.py` | `application.yml` |
| Run server | `python manage.py runserver` | `./gradlew run` |
