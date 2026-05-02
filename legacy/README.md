# Rent Management System

A property management application for tracking tenants, payments, maintenance, finance, payroll, and messaging — built with **Java 21 + Micronaut + PostgreSQL**.

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Java 21 |
| **Framework** | Micronaut 4.x |
| **Build** | Gradle 8.12 (wrapper included) |
| **Database** | PostgreSQL (`rent_management` DB) |
| **ORM** | Hibernate / JPA |
| **Views** | Thymeleaf (server-rendered) |
| **Serialization** | Jackson (snake_case) |
| **Server** | Netty (embedded) |

## Quick Start

```bash
# Start everything (DB migrations, build, NGINX, backend)
./start_system.sh

# Or run the backend directly
./gradlew run
```

The app runs on **http://localhost:8000** by default.

## Project Structure

```
src/main/java/com/rentmanagement/
├── Application.java              # Entry point
├── config/
│   └── DjangoNamingStrategy.java # Maps camelCase → snake_case DB columns
├── domain/                       # 15 JPA entities
│   ├── Property.java
│   ├── Tenant.java
│   ├── LeaseDocument.java
│   ├── Payment.java
│   ├── MaintenanceRequest.java
│   ├── BankAccount.java
│   ├── TransactionCategory.java
│   ├── FinTransaction.java
│   ├── Invoice.java
│   ├── InvoiceItem.java
│   ├── Employee.java
│   ├── PayrollRun.java
│   ├── Paycheck.java             # Kenyan tax bracket calculation
│   ├── BroadcastMessage.java
│   └── MessageRecipient.java
├── repository/                   # 15 JPA repositories
└── controller/                   # 8 REST controllers
    ├── PropertyController.java       /api/houses/
    ├── TenantController.java         /api/tenants/
    ├── PaymentController.java        /api/payments/
    ├── MaintenanceController.java    /api/maintenance/
    ├── LeaseDocumentController.java  /api/leases/
    ├── FinanceController.java        /api/finance/*
    ├── PayrollController.java        /api/payroll/*
    ├── MessagingController.java      /api/messaging/*
    └── DashboardController.java      /api/reports/dashboard/

src/main/resources/
├── application.yml               # DB, CORS, Hibernate, Jackson config
├── logback.xml                   # Logging config
└── templates/                    # Thymeleaf templates (planned)
```

## API Endpoints

| Endpoint | Methods | Description |
|---|---|---|
| `/api/houses/` | GET, POST, PUT, PATCH, DELETE | Property management |
| `/api/tenants/` | GET, POST, PUT, PATCH, DELETE | Tenant management |
| `/api/leases/` | GET, POST, DELETE | Lease documents |
| `/api/payments/` | GET, POST, PUT, PATCH, DELETE | Payment tracking |
| `/api/payments/{id}/receipt` | GET | Payment receipt |
| `/api/maintenance/` | GET, POST, PUT, PATCH, DELETE | Maintenance requests |
| `/api/finance/accounts/` | GET, POST, PUT, DELETE | Bank accounts |
| `/api/finance/categories/` | GET, POST, PUT, DELETE | Transaction categories |
| `/api/finance/transactions/` | GET, POST, PUT, DELETE | Financial transactions |
| `/api/finance/invoices/` | GET, POST, PUT, DELETE | Invoices |
| `/api/finance/reports/` | GET | P&L, Balance Sheet, Cash Flow, Tax |
| `/api/payroll/employees/` | GET, POST, PUT, PATCH, DELETE | Employee management |
| `/api/payroll/payroll-runs/` | GET, POST, PUT, DELETE | Payroll runs |
| `/api/payroll/paychecks/` | GET, DELETE | Individual paychecks |
| `/api/messaging/broadcasts/` | GET, POST, DELETE | Broadcast messages |
| `/api/messaging/building-addresses/` | GET | Building address list |
| `/api/reports/dashboard/` | GET | Dashboard aggregation |

## Key Business Logic

- **Payment Reconciliation**: Creating a payment for an existing pending rent record updates it instead of creating a duplicate
- **Auto-generation**: Paying rent automatically creates next month's pending payment
- **Kenyan Tax Calculation**: Paychecks compute PAYE, NHIF, NSSF, and Housing Levy based on Kenya 2024/2025 brackets
- **Financial Reports**: P&L, Balance Sheet, Cash Flow, and Tax Summary computed from transaction data
- **Broadcast Messaging**: Send to all tenants, building-specific tenants, or all employees

## Configuration

Database and server settings are in `src/main/resources/application.yml`:

```yaml
datasources:
  default:
    url: jdbc:postgresql://localhost:5432/rent_management
    username: postgres
    password: postgres

micronaut:
  server:
    port: 8000
```

## Development

```bash
# Compile
./gradlew compileJava

# Run dev server (auto-restart)
./gradlew run

# Run tests
./gradlew test
```

## Deployment

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for network deployment with NGINX.

## Legacy Code

The `backend/` directory contains the original Python/Django implementation (being replaced).
The `frontend/` directory contains the original React/Vite frontend (being replaced with Thymeleaf).
