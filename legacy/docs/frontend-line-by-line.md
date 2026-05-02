# Frontend Architecture Guide

> **Note:** The frontend is being migrated from React/Vite to Thymeleaf (server-side rendered).
> This document will be updated once the Thymeleaf templates are implemented (Phase 7).

## Current Status

The frontend will be served by Micronaut using Thymeleaf templates from:
```
src/main/resources/templates/    # Thymeleaf HTML templates
src/main/resources/static/       # CSS, JS, images
```

## Legacy React Frontend

The `frontend/` directory contains the original React/Vite application.
It will be removed after the Thymeleaf migration is complete.

## Planned Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Income, payments, maintenance overview |
| Houses | `/houses` | Property list and detail |
| Tenants | `/tenants` | Tenant list and detail |
| Payments | `/payments` | Payment tracking and receipts |
| Maintenance | `/maintenance` | Maintenance requests |
| Finance | `/finance` | Transactions, invoices, reports |
| Payroll | `/payroll` | Employees, payroll runs |
| Messaging | `/messaging` | Broadcast messages |
