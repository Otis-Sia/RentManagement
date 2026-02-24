package com.rentmanagement.controller;

import com.rentmanagement.domain.*;
import com.rentmanagement.domain.FinTransaction.*;
import com.rentmanagement.repository.*;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Controller("/api/finance")
public class FinanceController {

    @Inject
    BankAccountRepository bankAccountRepo;
    @Inject
    TransactionCategoryRepository categoryRepo;
    @Inject
    FinTransactionRepository transactionRepo;
    @Inject
    InvoiceRepository invoiceRepo;
    @Inject
    InvoiceItemRepository invoiceItemRepo;
    @Inject
    TenantRepository tenantRepo;
    @Inject
    PaymentRepository paymentRepo;
    @Inject
    MaintenanceRequestRepository maintenanceRepo;
    @Inject
    PropertyRepository propertyRepo;

    // ========== Bank Accounts ==========
    @Get("/accounts/")
    public List<BankAccount> listAccounts() {
        return bankAccountRepo.findAll();
    }

    @Get("/accounts/{id}")
    public HttpResponse<BankAccount> getAccount(Long id) {
        return bankAccountRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/accounts/")
    @Transactional
    public HttpResponse<BankAccount> createAccount(@Body BankAccount account) {
        return HttpResponse.created(bankAccountRepo.save(account));
    }

    @Put("/accounts/{id}")
    @Transactional
    public HttpResponse<BankAccount> updateAccount(Long id, @Body BankAccount account) {
        return bankAccountRepo.findById(id).map(existing -> {
            existing.setName(account.getName());
            existing.setAccountType(account.getAccountType());
            existing.setInstitution(account.getInstitution());
            existing.setAccountNumberLast4(account.getAccountNumberLast4());
            existing.setBalance(account.getBalance());
            existing.setIsActive(account.getIsActive());
            return HttpResponse.ok(bankAccountRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/accounts/{id}")
    @Transactional
    public HttpResponse<?> deleteAccount(Long id) {
        if (bankAccountRepo.existsById(id)) {
            bankAccountRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    // ========== Transaction Categories ==========
    @Get("/categories/")
    public List<TransactionCategory> listCategories() {
        return categoryRepo.findAll();
    }

    @Get("/categories/{id}")
    public HttpResponse<TransactionCategory> getCategory(Long id) {
        return categoryRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/categories/")
    @Transactional
    public HttpResponse<TransactionCategory> createCategory(@Body TransactionCategory cat) {
        return HttpResponse.created(categoryRepo.save(cat));
    }

    @Put("/categories/{id}")
    @Transactional
    public HttpResponse<TransactionCategory> updateCategory(Long id, @Body TransactionCategory cat) {
        return categoryRepo.findById(id).map(existing -> {
            existing.setName(cat.getName());
            existing.setCategoryType(cat.getCategoryType());
            existing.setDescription(cat.getDescription());
            existing.setIsTaxDeductible(cat.getIsTaxDeductible());
            return HttpResponse.ok(categoryRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/categories/{id}")
    @Transactional
    public HttpResponse<?> deleteCategory(Long id) {
        if (categoryRepo.existsById(id)) {
            categoryRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    // ========== Transactions ==========
    @Get("/transactions/")
    public List<FinTransaction> listTransactions(
            @QueryValue Optional<String> transaction_type,
            @QueryValue Optional<String> start_date,
            @QueryValue Optional<String> end_date) {
        List<FinTransaction> all = transactionRepo.findAll();
        return all.stream()
                .filter(t -> transaction_type.isEmpty() || t.getTransactionType().name().equals(transaction_type.get()))
                .toList();
    }

    @Get("/transactions/{id}")
    public HttpResponse<FinTransaction> getTransaction(Long id) {
        return transactionRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/transactions/")
    @Transactional
    public HttpResponse<FinTransaction> createTransaction(@Body Map<String, Object> body) {
        FinTransaction tx = new FinTransaction();
        mapTransactionBody(tx, body);
        return HttpResponse.created(transactionRepo.save(tx));
    }

    @Put("/transactions/{id}")
    @Transactional
    public HttpResponse<FinTransaction> updateTransaction(Long id, @Body Map<String, Object> body) {
        return transactionRepo.findById(id).map(existing -> {
            mapTransactionBody(existing, body);
            return HttpResponse.ok(transactionRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/transactions/{id}")
    @Transactional
    public HttpResponse<?> deleteTransaction(Long id) {
        if (transactionRepo.existsById(id)) {
            transactionRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    @Post("/transactions/auto_categorize/")
    @Transactional
    public HttpResponse<?> autoCategorize() {
        var uncategorized = transactionRepo.findByCategoryIsNull();
        int categorized = 0;
        var categories = categoryRepo.findAll();

        for (FinTransaction tx : uncategorized) {
            String desc = tx.getDescription().toLowerCase();
            for (TransactionCategory cat : categories) {
                if (desc.contains(cat.getName().toLowerCase())) {
                    tx.setCategory(cat);
                    tx.setIsAutoCategorized(true);
                    transactionRepo.update(tx);
                    categorized++;
                    break;
                }
            }
        }
        return HttpResponse.ok(Map.of("categorized", categorized));
    }

    // ========== Invoices ==========
    @Get("/invoices/")
    public List<Invoice> listInvoices(@QueryValue Optional<String> status) {
        List<Invoice> all = invoiceRepo.findAll();
        return all.stream()
                .filter(i -> status.isEmpty() || i.getStatus().name().equals(status.get()))
                .toList();
    }

    @Get("/invoices/{id}")
    public HttpResponse<Invoice> getInvoice(Long id) {
        return invoiceRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/invoices/")
    @Transactional
    public HttpResponse<Invoice> createInvoice(@Body Map<String, Object> body) {
        Invoice inv = new Invoice();
        mapInvoiceBody(inv, body);
        return HttpResponse.created(invoiceRepo.save(inv));
    }

    @Put("/invoices/{id}")
    @Transactional
    public HttpResponse<Invoice> updateInvoice(Long id, @Body Map<String, Object> body) {
        return invoiceRepo.findById(id).map(existing -> {
            mapInvoiceBody(existing, body);
            return HttpResponse.ok(invoiceRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/invoices/{id}")
    @Transactional
    public HttpResponse<?> deleteInvoice(Long id) {
        if (invoiceRepo.existsById(id)) {
            invoiceRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    @Post("/invoices/{id}/send_invoice/")
    @Transactional
    public HttpResponse<?> sendInvoice(Long id) {
        return invoiceRepo.findById(id).map(inv -> {
            inv.setStatus(Invoice.InvoiceStatus.SENT);
            invoiceRepo.update(inv);
            return HttpResponse.ok(Map.of("detail", "Invoice sent"));
        }).orElse(HttpResponse.notFound());
    }

    @Post("/invoices/{id}/record_payment/")
    @Transactional
    public HttpResponse<?> recordPayment(Long id, @Body Map<String, Object> body) {
        return invoiceRepo.findById(id).map(inv -> {
            BigDecimal paymentAmount = new BigDecimal(body.get("amount").toString());
            inv.setAmountPaid(inv.getAmountPaid().add(paymentAmount));
            if (inv.getAmountPaid().compareTo(inv.getTotal()) >= 0) {
                inv.setStatus(Invoice.InvoiceStatus.PAID);
            } else {
                inv.setStatus(Invoice.InvoiceStatus.PARTIAL);
            }
            invoiceRepo.update(inv);
            return HttpResponse.ok(inv);
        }).orElse(HttpResponse.notFound());
    }

    @Post("/invoices/{id}/add_item/")
    @Transactional
    public HttpResponse<?> addItem(Long id, @Body Map<String, Object> body) {
        return invoiceRepo.findById(id).map(inv -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(inv);
            item.setDescription((String) body.get("description"));
            item.setQuantity(new BigDecimal(body.getOrDefault("quantity", "1").toString()));
            item.setUnitPrice(new BigDecimal(body.get("unit_price").toString()));
            invoiceItemRepo.save(item);
            inv.recalculateTotals();
            invoiceRepo.update(inv);
            return HttpResponse.ok(inv);
        }).orElse(HttpResponse.notFound());
    }

    // ========== Financial Reports ==========
    @Get("/reports/")
    @Transactional
    public HttpResponse<?> financialReports(
            @QueryValue Optional<String> type,
            @QueryValue Optional<Integer> year,
            @QueryValue Optional<Integer> month) {

        int y = year.orElse(LocalDate.now().getYear());
        int m = month.orElse(LocalDate.now().getMonthValue());
        String reportType = type.orElse("profit_loss");

        return switch (reportType) {
            case "profit_loss" -> HttpResponse.ok(profitAndLoss(y, m));
            case "balance_sheet" -> HttpResponse.ok(balanceSheet());
            case "cash_flow" -> HttpResponse.ok(cashFlow(y, m));
            case "tax_summary" -> HttpResponse.ok(taxSummary(y));
            default -> HttpResponse.ok(profitAndLoss(y, m));
        };
    }

    private Map<String, Object> profitAndLoss(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        var payments = paymentRepo.findPaidByYearAndMonth(year, month);
        BigDecimal rentIncome = payments.stream()
                .filter(p -> p.getPaymentType() == Payment.PaymentType.RENT)
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        var transactions = transactionRepo.findByDateBetween(start, end);
        BigDecimal expenses = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                .map(FinTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", year + "-" + String.format("%02d", month));
        result.put("rent_income", rentIncome);
        result.put("total_income", rentIncome);
        result.put("total_expenses", expenses);
        result.put("net_income", rentIncome.subtract(expenses));
        return result;
    }

    private Map<String, Object> balanceSheet() {
        var accounts = bankAccountRepo.findAll();
        BigDecimal totalAssets = accounts.stream()
                .filter(a -> a.getIsActive())
                .map(BankAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total_assets", totalAssets);
        result.put("total_liabilities", BigDecimal.ZERO);
        result.put("equity", totalAssets);
        return result;
    }

    private Map<String, Object> cashFlow(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        var transactions = transactionRepo.findByDateBetween(start, end);
        BigDecimal inflows = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                .map(FinTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outflows = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                .map(FinTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", year + "-" + String.format("%02d", month));
        result.put("cash_inflows", inflows);
        result.put("cash_outflows", outflows);
        result.put("net_cash_flow", inflows.subtract(outflows));
        return result;
    }

    private Map<String, Object> taxSummary(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        var transactions = transactionRepo.findByDateBetween(start, end);
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                .map(FinTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal deductibleExpenses = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                .filter(t -> t.getCategory() != null && t.getCategory().getIsTaxDeductible())
                .map(FinTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year", year);
        result.put("total_income", totalIncome);
        result.put("deductible_expenses", deductibleExpenses);
        result.put("taxable_income", totalIncome.subtract(deductibleExpenses));
        return result;
    }

    // Helper methods
    private void mapTransactionBody(FinTransaction tx, Map<String, Object> body) {
        if (body.containsKey("transaction_type"))
            tx.setTransactionType(TransactionType.valueOf((String) body.get("transaction_type")));
        if (body.containsKey("amount"))
            tx.setAmount(new BigDecimal(body.get("amount").toString()));
        if (body.containsKey("date"))
            tx.setDate(LocalDate.parse((String) body.get("date")));
        if (body.containsKey("description"))
            tx.setDescription((String) body.get("description"));
        if (body.containsKey("reference"))
            tx.setReference((String) body.get("reference"));
        if (body.containsKey("payee"))
            tx.setPayee((String) body.get("payee"));
        if (body.containsKey("status"))
            tx.setStatus(FinTransaction.TransactionStatus.valueOf((String) body.get("status")));
        if (body.containsKey("notes"))
            tx.setNotes((String) body.get("notes"));
        if (body.containsKey("bank_account") && body.get("bank_account") != null) {
            Long baId = Long.valueOf(body.get("bank_account").toString());
            bankAccountRepo.findById(baId).ifPresent(tx::setBankAccount);
        }
        if (body.containsKey("category") && body.get("category") != null) {
            Long catId = Long.valueOf(body.get("category").toString());
            categoryRepo.findById(catId).ifPresent(tx::setCategory);
        }
    }

    private void mapInvoiceBody(Invoice inv, Map<String, Object> body) {
        if (body.containsKey("invoice_number"))
            inv.setInvoiceNumber((String) body.get("invoice_number"));
        if (body.containsKey("issue_date"))
            inv.setIssueDate(LocalDate.parse((String) body.get("issue_date")));
        if (body.containsKey("due_date"))
            inv.setDueDate(LocalDate.parse((String) body.get("due_date")));
        if (body.containsKey("status"))
            inv.setStatus(Invoice.InvoiceStatus.valueOf((String) body.get("status")));
        if (body.containsKey("notes"))
            inv.setNotes((String) body.get("notes"));
        if (body.containsKey("client_name"))
            inv.setClientName((String) body.get("client_name"));
        if (body.containsKey("client_email"))
            inv.setClientEmail((String) body.get("client_email"));
        if (body.containsKey("tax_rate"))
            inv.setTaxRate(new BigDecimal(body.get("tax_rate").toString()));
        if (body.containsKey("tenant") && body.get("tenant") != null) {
            Long tid = Long.valueOf(body.get("tenant").toString());
            tenantRepo.findById(tid).ifPresent(inv::setTenant);
        }
    }
}
