"""
Sample Data Generator for Rent Management System — v2 (600 records)
=====================================================================
Generates comprehensive test data across ALL models:

  Properties        80    (8 buildings × 10 units, 10 addresses)
  Tenants           55    (long-term, recent, expiring, expired, defaulted)
  Payments         200    (deposits, rent, late fees; every status used)
  Maintenance       65    (all priorities/statuses, seasonal trends)
  BankAccounts       5
  TransactionCats   15
  Transactions      80    (income, expenses, transfers across 2+ years)
  Invoices          20    (all invoice statuses)
  InvoiceItems      40
  Employees         10    (various departments, employment types)
  PayrollRuns        6    (Sep 2025 → Feb 2026)
  Paychecks         24    (4 employees per run)
                   ───
  TOTAL            600

Scenarios covered:
  • Tenants who always pay on time
  • Tenants who steadily deteriorate (late → severe → defaulted)
  • Seasonal late-payers (late after December holidays)
  • Emergency maintenance during rainy season
  • Invoices that are overdue, partially paid, cancelled
  • Expense transactions for maintenance, payroll, utilities, insurance
  • Employees terminated, on contract, part-time
  • Transferred bank funds, voided transactions
  • Date range: Jan 2023 → Aug 2026
"""

import os
import sys
import django
import random
import calendar
from datetime import datetime, timedelta, date
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone
from houses.models import Property
from tenants.models import Tenant
from payments.models import Payment
from maintenance.models import MaintenanceRequest
from finance.models import BankAccount, TransactionCategory, Transaction, Invoice, InvoiceItem
from payroll.models import Employee, PayrollRun, Paycheck

# ── deterministic random for reproducibility ──────────────────────
random.seed(42)

TODAY = date(2026, 2, 20)

# ─────────────────────────────────────────────────────────────────
# REFERENCE DATA
# ─────────────────────────────────────────────────────────────────

ADDRESSES = [
    "123 Mombasa Road, South B, Nairobi",
    "456 Ngong Road, Karen, Nairobi",
    "789 Kiambu Road, Ruaka, Kiambu",
    "321 Thika Road, Roysambu, Nairobi",
    "654 Waiyaki Way, Westlands, Nairobi",
    "987 Langata Road, Hardy, Nairobi",
    "147 Eastern Bypass, Embakasi, Nairobi",
    "258 Mombasa Road, Industrial Area, Nairobi",
    "369 Limuru Road, Muthaiga, Nairobi",
    "741 Outering Road, Umoja, Nairobi",
]

TENANT_NAMES = [
    "James Kamau", "Mary Wanjiru", "John Ochieng", "Grace Akinyi", "Peter Mwangi",
    "Sarah Njeri", "David Otieno", "Alice Wambui", "Joseph Kipchoge", "Ruth Chebet",
    "Michael Karanja", "Elizabeth Nyambura", "Daniel Mutua", "Jane Muthoni", "Samuel Kimani",
    "Lucy Wangari", "Robert Omondi", "Catherine Wairimu", "Patrick Koech", "Nancy Achieng",
    "Francis Ndirangu", "Margaret Nyokabi", "George Waweru", "Ann Cherono", "Brian Ondiek",
    "Rose Wanjiku", "Thomas Kiplagat", "Emily Njoki", "Kenneth Muriuki", "Beatrice Adhiambo",
    "Anthony Githinji", "Pauline Jepkorir", "Vincent Onyango", "Diana Waithera", "Moses Kibet",
    "Susan Auma", "Christopher Njoroge", "Faith Jepleting", "Eric Wangila", "Christine Wangui",
    "Simon Kimutai", "Esther Mwende", "Isaac Ng'ang'a", "Lydia Chepkemoi", "Kevin Wekesa",
    "Hannah Wambui", "Mark Rotich", "Janet Kerubo", "Andrew Macharia", "Rebecca Jemutai",
    "Benjamin Odero", "Caroline Wambui", "Felix Kosgei", "Mercy Nekesa", "Edward Gathogo",
    "Agnes Chepngetich", "Nicholas Ouma", "Violet Wairimu", "Lawrence Tanui", "Priscilla Amina",
    "Stephen Wafula", "Gladys Jeptoo", "Charles Mugambi", "Irene Makena", "Oscar Odhiambo",
    "Beatrice Nyaboke", "Philip Sang", "Doris Wanjala", "Martin Mutiso", "Joan Chelagat",
]

MAINTENANCE_ISSUES = [
    ("Leaking Roof", "The roof is leaking water into the living room during rain", "HIGH"),
    ("Broken Water Heater", "Water heater not functioning, no hot water available", "HIGH"),
    ("Faulty Electrical Outlet", "Main bedroom outlet sparking, potential fire hazard", "EMERGENCY"),
    ("Clogged Drain", "Kitchen sink draining very slowly", "MEDIUM"),
    ("Broken Door Lock", "Front door lock jammed, cannot secure property", "HIGH"),
    ("Cracked Window Pane", "Bedroom window has a crack, letting in cold air", "MEDIUM"),
    ("Malfunctioning AC", "Air conditioning unit making loud noise and not cooling", "HIGH"),
    ("Pest Infestation", "Noticed cockroaches in the kitchen area", "MEDIUM"),
    ("Peeling Paint", "Bathroom walls have peeling and bubbling paint", "LOW"),
    ("Broken Toilet Flush", "Toilet handle broken, flush mechanism not working", "MEDIUM"),
    ("Leaking Faucet", "Kitchen faucet has constant drip", "LOW"),
    ("Broken Cabinet Door", "Kitchen cabinet door hinge broken, door hanging", "LOW"),
    ("Non-functioning Doorbell", "Doorbell button not working", "LOW"),
    ("Damaged Ceiling Fan", "Living room ceiling fan wobbling dangerously", "MEDIUM"),
    ("Burst Pipe", "Water pipe burst under sink, flooding bathroom", "EMERGENCY"),
    ("Broken Stove Burner", "Two burners on electric stove not heating", "MEDIUM"),
    ("Mold Growth", "Black mold visible on bathroom ceiling", "HIGH"),
    ("Broken Window Screen", "Bedroom window screen torn, insects entering", "LOW"),
    ("Noisy Water Pipes", "Loud banging noise from pipes when water is turned on", "MEDIUM"),
    ("Cracked Floor Tiles", "Several floor tiles in kitchen are cracked and loose", "MEDIUM"),
    ("Gas Leak Smell", "Strong gas smell near stove — potential gas leak", "EMERGENCY"),
    ("Sewage Backup", "Sewage backing up through ground-floor toilet", "EMERGENCY"),
    ("Broken Gate Motor", "Electric gate motor burnt out, gate stuck open", "HIGH"),
    ("Water Tank Overflow", "Roof tank overflowing continuously, wasting water", "MEDIUM"),
    ("Flickering Lights", "Lights in hallway flickering intermittently", "LOW"),
    ("Loose Balcony Railing", "Metal railing on 3rd-floor balcony is loose, safety risk", "HIGH"),
    ("Blocked Gutter", "Gutters clogged with leaves; water cascading down walls during rain", "MEDIUM"),
    ("Termite Damage", "Termite trails visible on doorframe; wood crumbling", "HIGH"),
    ("Broken Shower Head", "Shower head cracked, water spraying in all directions", "LOW"),
    ("Parking Lot Pothole", "Large pothole near carport entrance, scraping cars", "MEDIUM"),
]

EMPLOYEE_DATA = [
    ("John", "Kiptoo", "Property Manager", "Management", "FULL_TIME", 85000),
    ("Angela", "Muthoni", "Assistant Manager", "Management", "FULL_TIME", 55000),
    ("Henry", "Ouko", "Senior Plumber", "Maintenance", "FULL_TIME", 40000),
    ("Mercy", "Wanjala", "Electrician", "Maintenance", "FULL_TIME", 38000),
    ("Patrick", "Nzioka", "General Handyman", "Maintenance", "PART_TIME", 22000),
    ("Joyce", "Chege", "Accountant", "Finance", "FULL_TIME", 60000),
    ("Samuel", "Otieno", "Cleaner", "Operations", "PART_TIME", 18000),
    ("Dennis", "Wafula", "Security Guard (Night)", "Security", "FULL_TIME", 25000),
    ("Esther", "Achieng", "Security Guard (Day)", "Security", "CONTRACT", 24000),
    ("Tom", "Mwangi", "Groundskeeper", "Operations", "PART_TIME", 20000),
]

TRANSACTION_CATEGORY_DATA = [
    # Income categories
    ("Rent Collection", "INCOME", "Monthly rent collected from tenants", False),
    ("Late Fee Income", "INCOME", "Late fees charged on overdue rent", False),
    ("Deposit Income", "INCOME", "Security deposits received", False),
    ("Other Income", "INCOME", "Miscellaneous income", False),
    # Expense categories
    ("Maintenance & Repairs", "EXPENSE", "Repairs and maintenance costs", True),
    ("Payroll", "EXPENSE", "Employee salaries and wages", True),
    ("Utilities", "EXPENSE", "Water, electricity, internet for common areas", True),
    ("Insurance", "EXPENSE", "Property insurance premiums", True),
    ("Property Tax", "EXPENSE", "County government property rates", True),
    ("Legal Fees", "EXPENSE", "Lawyer fees, lease document preparation", True),
    ("Advertising", "EXPENSE", "Vacant unit listing costs", True),
    ("Cleaning Supplies", "EXPENSE", "Detergent, mops, brooms for common areas", True),
    ("Security Services", "EXPENSE", "Alarm monitoring and guard services", True),
    ("Landscaping", "EXPENSE", "Garden maintenance and tree trimming", True),
    ("Office Supplies", "EXPENSE", "Printer paper, stationery, toner", False),
]

BANK_ACCOUNTS_DATA = [
    ("KCB Rent Collection", "CHECKING", "Kenya Commercial Bank", "4521", Decimal("1250000.00")),
    ("Equity Savings", "SAVINGS", "Equity Bank", "7834", Decimal("3450000.00")),
    ("M-Pesa Paybill", "MOBILE_MONEY", "Safaricom", "9012", Decimal("85600.00")),
    ("Petty Cash", "CASH", "", "0000", Decimal("12500.00")),
    ("Stanbic Operations", "CHECKING", "Stanbic Bank", "6655", Decimal("670000.00")),
]

# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

def txn_id():
    return f"TXN{random.randint(100000, 999999)}"


def rand_date_between(start: date, end: date) -> date:
    delta = (end - start).days
    if delta <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta))


def month_iter(start: date, end: date):
    """Yield the 1st of each month from start to end (inclusive)."""
    current = start.replace(day=1)
    while current <= end:
        yield current
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1)
        else:
            current = current.replace(month=current.month + 1)


def safe_day(year, month, day):
    """Clamp day to the maximum for the given month."""
    max_day = calendar.monthrange(year, month)[1]
    return date(year, month, min(day, max_day))


# ─────────────────────────────────────────────────────────────────
# GENERATORS
# ─────────────────────────────────────────────────────────────────

def clear_all():
    print("Clearing existing data …")
    InvoiceItem.objects.all().delete()
    Invoice.objects.all().delete()
    Transaction.objects.all().delete()
    TransactionCategory.objects.all().delete()
    BankAccount.objects.all().delete()
    Paycheck.objects.all().delete()
    PayrollRun.objects.all().delete()
    Employee.objects.all().delete()
    MaintenanceRequest.objects.all().delete()
    Payment.objects.all().delete()
    Tenant.objects.all().delete()
    Property.objects.all().delete()
    print("  ✓ all tables cleared")


# ── 1. Properties (80) ───────────────────────────────────────────
def create_properties():
    print("\n── Creating Properties (80) ──")
    props = []
    buildings = list("ABCDEFGH")  # 8 buildings
    for idx, bld in enumerate(buildings):
        addr = ADDRESSES[idx % len(ADDRESSES)]
        for unit in range(1, 11):
            num = f"{bld}{unit}"
            if unit <= 3:
                beds = random.choice([1, 1, 2])
                baths = 1
                sqft = random.randint(380, 650)
                rent = Decimal(random.randint(12000, 22000))
            elif unit <= 7:
                beds = random.choice([2, 2, 3])
                baths = random.choice([1, 2])
                sqft = random.randint(650, 1000)
                rent = Decimal(random.randint(22000, 42000))
            else:
                beds = random.choice([3, 3, 4])
                baths = 2
                sqft = random.randint(1000, 1500)
                rent = Decimal(random.randint(42000, 70000))
            p = Property.objects.create(
                house_number=num, address=addr,
                bedrooms=beds, bathrooms=baths,
                square_feet=sqft, monthly_rent=rent,
                is_occupied=False,
            )
            props.append(p)
    print(f"  ✓ {len(props)} properties")
    return props


# ── 2. Tenants (55) ──────────────────────────────────────────────
def create_tenants(properties):
    print("\n── Creating Tenants (55) ──")
    names = TENANT_NAMES.copy()
    random.shuffle(names)

    scenarios = (
        ["long_term"] * 20 +
        ["recent"] * 10 +
        ["expiring_soon"] * 5 +
        ["expired"] * 5 +
        ["defaulted"] * 5 +
        ["short_term"] * 5 +
        ["seasonal"] * 5 +
        ["vacant"] * 25
    )
    random.shuffle(scenarios)
    scenarios = scenarios[:80]  # match to 80 properties

    tenants = []
    for i, prop in enumerate(properties):
        sc = scenarios[i]
        if sc == "vacant":
            continue

        name = names.pop() if names else f"Tenant {i}"
        email = name.lower().replace(" ", ".").replace("'", "") + "@example.com"
        phone = f"+254{random.randint(700000000, 799999999)}"

        if sc == "long_term":
            ls = TODAY - timedelta(days=random.randint(365, 1200))
            le = TODAY + timedelta(days=random.randint(180, 600))
            active = True
        elif sc == "recent":
            ls = TODAY - timedelta(days=random.randint(14, 75))
            le = TODAY + timedelta(days=random.randint(300, 400))
            active = True
        elif sc == "expiring_soon":
            ls = TODAY - timedelta(days=random.randint(330, 380))
            le = TODAY + timedelta(days=random.randint(1, 25))
            active = True
        elif sc == "expired":
            ls = TODAY - timedelta(days=random.randint(540, 900))
            le = TODAY - timedelta(days=random.randint(30, 200))
            active = False
        elif sc == "defaulted":
            ls = TODAY - timedelta(days=random.randint(300, 700))
            le = TODAY - timedelta(days=random.randint(10, 120))
            active = False
        elif sc == "short_term":
            ls = TODAY - timedelta(days=random.randint(60, 150))
            le = TODAY + timedelta(days=random.randint(30, 90))
            active = True
        else:  # seasonal
            ls = TODAY - timedelta(days=random.randint(180, 360))
            le = TODAY + timedelta(days=random.randint(60, 180))
            active = True

        rent_var = random.choice([Decimal("0.95"), Decimal("1.00"), Decimal("1.00"), Decimal("1.00"), Decimal("1.05")])
        rent_amt = (prop.monthly_rent * rent_var).quantize(Decimal("0.01"))
        dep_mult = random.choice([1, 1, 2])
        deposit = rent_amt * dep_mult
        due_day = random.choice([1, 1, 5, 5, 7, 10, 15, 20, 25, 28])

        t = Tenant.objects.create(
            name=name, property=prop, email=email, phone=phone,
            lease_start=ls, lease_end=le,
            rent_amount=rent_amt, deposit=deposit,
            rent_due_day=due_day, is_active=active,
        )
        t._scenario = sc  # attach for payment logic
        tenants.append(t)

        if active:
            prop.is_occupied = True
            prop.save()

    active_count = sum(1 for t in tenants if t.is_active)
    print(f"  ✓ {len(tenants)} tenants  (active {active_count}, inactive {len(tenants) - active_count})")
    return tenants


# ── 3. Payments (target 200) ─────────────────────────────────────
def create_payments(tenants, target=200):
    print(f"\n── Creating Payments (target {target}) ──")
    payments = []
    budget = target

    # Assign behaviour profiles to tenants
    profiles = {}
    for t in tenants:
        sc = getattr(t, "_scenario", "long_term")
        if sc == "defaulted":
            profiles[t.pk] = "deteriorating"
        elif sc in ("expired",):
            profiles[t.pk] = "mixed"
        elif sc == "seasonal":
            profiles[t.pk] = "seasonal_late"
        elif random.random() < 0.15:
            profiles[t.pk] = "always_late"
        elif random.random() < 0.30:
            profiles[t.pk] = "mostly_on_time"
        else:
            profiles[t.pk] = "perfect"

    for t in tenants:
        if budget <= 0:
            break

        profile = profiles.get(t.pk, "perfect")
        start = t.lease_start
        end = t.lease_end if not t.is_active else TODAY

        # Deposit payment
        dep_due = start - timedelta(days=7)
        dep_paid = start - timedelta(days=random.randint(1, 5))
        payments.append(Payment.objects.create(
            tenant=t, amount=t.deposit, date_due=dep_due,
            date_paid=dep_paid, payment_type="DEPOSIT",
            status="PAID", transaction_id=txn_id(),
        ))
        budget -= 1

        # Monthly rent payments
        month_idx = 0
        for m in month_iter(start, end):
            if budget <= 0:
                break
            due = safe_day(m.year, m.month, t.rent_due_day)
            if due < start:
                continue
            if not t.is_active and due > t.lease_end:
                break

            is_future = due > TODAY
            if is_future:
                pay_status = "PENDING"
                paid_dt = None
                tid = None
            else:
                pay_status, paid_dt, tid = _decide_payment(
                    profile, due, month_idx, t
                )

            payments.append(Payment.objects.create(
                tenant=t, amount=t.rent_amount, date_due=due,
                date_paid=paid_dt, payment_type="RENT",
                status=pay_status, transaction_id=tid,
            ))
            budget -= 1

            # Late fees for late / failed / severe / defaulted
            if pay_status in ("LATE", "FAILED", "SEVERE", "DEFAULTED") and random.random() < 0.55 and budget > 0:
                fee_amt = (t.rent_amount * Decimal("0.05")).quantize(Decimal("0.01"))
                fee_due = due + timedelta(days=5)
                if pay_status == "LATE" and paid_dt:
                    f_status, f_paid, f_tid = "PAID", paid_dt, txn_id()
                else:
                    f_status = random.choice(["PENDING", "FAILED"])
                    f_paid, f_tid = None, None
                payments.append(Payment.objects.create(
                    tenant=t, amount=fee_amt, date_due=fee_due,
                    date_paid=f_paid, payment_type="FEE",
                    status=f_status, transaction_id=f_tid,
                ))
                budget -= 1

            month_idx += 1

    by_status = {}
    for p in payments:
        by_status[p.status] = by_status.get(p.status, 0) + 1
    print(f"  ✓ {len(payments)} payments  {dict(sorted(by_status.items()))}")
    return payments


def _decide_payment(profile, due, month_idx, tenant):
    """Return (status, date_paid, txn_id) based on the tenant's payment profile."""
    if profile == "perfect":
        paid = due - timedelta(days=random.randint(0, 3))
        return "PAID", paid, txn_id()

    if profile == "mostly_on_time":
        r = random.random()
        if r < 0.80:
            paid = due + timedelta(days=random.randint(-3, 2))
            return "PAID", paid, txn_id()
        elif r < 0.92:
            paid = due + timedelta(days=random.randint(3, 15))
            if paid > TODAY:
                return "LATE", None, None
            return "LATE", paid, txn_id()
        else:
            return "LATE", None, None

    if profile == "always_late":
        r = random.random()
        if r < 0.40:
            paid = due + timedelta(days=random.randint(5, 25))
            if paid > TODAY:
                return "LATE", None, None
            return "LATE", paid, txn_id()
        elif r < 0.70:
            paid = due + timedelta(days=random.randint(1, 8))
            if paid > TODAY:
                return "LATE", None, None
            return "PAID", paid, txn_id()
        elif r < 0.85:
            return "FAILED", None, None
        else:
            return "SEVERE", None, None

    if profile == "deteriorating":
        # starts okay, gets worse over the months
        if month_idx < 4:
            paid = due + timedelta(days=random.randint(-2, 3))
            return "PAID", paid, txn_id()
        elif month_idx < 8:
            if random.random() < 0.5:
                paid = due + timedelta(days=random.randint(5, 20))
                if paid > TODAY:
                    return "LATE", None, None
                return "LATE", paid, txn_id()
            return "LATE", None, None
        elif month_idx < 12:
            return random.choice(["SEVERE", "FAILED"]), None, None
        else:
            return "DEFAULTED", None, None

    if profile == "seasonal_late":
        # late in Jan (after Dec holidays) and around Easter (April)
        month = due.month
        if month in (1, 4, 12):
            paid = due + timedelta(days=random.randint(7, 22))
            if paid > TODAY:
                return "LATE", None, None
            return "LATE", paid, txn_id()
        paid = due + timedelta(days=random.randint(-3, 2))
        return "PAID", paid, txn_id()

    # mixed
    r = random.random()
    if r < 0.55:
        paid = due + timedelta(days=random.randint(-2, 4))
        return "PAID", paid, txn_id()
    elif r < 0.80:
        paid = due + timedelta(days=random.randint(3, 18))
        if paid > TODAY:
            return "LATE", None, None
        return "LATE", paid, txn_id()
    elif r < 0.92:
        return "FAILED", None, None
    else:
        return "SEVERE", None, None


# ── 4. Maintenance Requests (65) ─────────────────────────────────
def create_maintenance(tenants, target=65):
    print(f"\n── Creating Maintenance Requests ({target}) ──")
    reqs = []
    budget = target

    for t in tenants:
        if budget <= 0:
            break
        if t.is_active:
            n = random.choices([0, 1, 2, 3, 4], weights=[15, 40, 25, 12, 8])[0]
        else:
            n = random.choices([0, 1, 2], weights=[60, 25, 15])[0]
        n = min(n, budget)

        for _ in range(n):
            title, desc, priority = random.choice(MAINTENANCE_ISSUES)
            tenancy_days = (TODAY - t.lease_start).days if t.is_active else (t.lease_end - t.lease_start).days
            req_date = t.lease_start + timedelta(days=random.randint(0, max(1, tenancy_days)))
            if req_date > TODAY:
                req_date = TODAY - timedelta(days=random.randint(1, 60))

            days_ago = (TODAY - req_date).days
            status, resolved, cost = _maint_status(priority, days_ago, req_date)

            obj = MaintenanceRequest.objects.create(
                tenant=t, title=title, description=desc,
                priority=priority, status=status, cost=cost,
            )
            # Override auto_now_add fields via queryset update
            aware_req = timezone.make_aware(datetime.combine(req_date, datetime.min.time()))
            aware_res = timezone.make_aware(datetime.combine(resolved, datetime.min.time())) if resolved else None
            MaintenanceRequest.objects.filter(pk=obj.pk).update(
                request_date=aware_req,
                resolved_date=aware_res,
            )
            reqs.append(obj)
            budget -= 1
            if budget <= 0:
                break

    by_status = {}
    for r in reqs:
        by_status[r.status] = by_status.get(r.status, 0) + 1
    print(f"  ✓ {len(reqs)} requests  {dict(sorted(by_status.items()))}")
    return reqs


def _maint_status(priority, days_ago, req_date):
    """Return (status, resolved_date | None, cost | None)."""
    if priority == "EMERGENCY":
        if days_ago > 2:
            resolved = req_date + timedelta(days=random.randint(0, 2))
            cost = Decimal(random.randint(5000, 35000))
            return "COMPLETED", resolved, cost
        elif days_ago > 0:
            return "IN_PROGRESS", None, None
        return "OPEN", None, None

    if priority == "HIGH":
        if days_ago > 7:
            if random.random() < 0.80:
                resolved = req_date + timedelta(days=random.randint(1, 7))
                cost = Decimal(random.randint(3000, 25000))
                return "COMPLETED", resolved, cost
            return "IN_PROGRESS", None, None
        elif days_ago > 2:
            return random.choice(["IN_PROGRESS", "OPEN"]), None, None
        return "OPEN", None, None

    if priority == "MEDIUM":
        if days_ago > 14:
            r = random.random()
            if r < 0.65:
                resolved = req_date + timedelta(days=random.randint(3, 14))
                cost = Decimal(random.randint(1000, 12000))
                return "COMPLETED", resolved, cost
            elif r < 0.85:
                return "IN_PROGRESS", None, None
            return "OPEN", None, None
        elif days_ago > 5:
            return random.choice(["IN_PROGRESS", "OPEN"]), None, None
        return "OPEN", None, None

    # LOW
    if days_ago > 30:
        r = random.random()
        if r < 0.55:
            resolved = req_date + timedelta(days=random.randint(7, 30))
            cost = Decimal(random.randint(500, 6000))
            return "COMPLETED", resolved, cost
        elif r < 0.80:
            return "IN_PROGRESS", None, None
        if random.random() < 0.20:
            return "CANCELLED", None, None
        return "OPEN", None, None
    elif days_ago > 10:
        return random.choice(["IN_PROGRESS", "OPEN"]), None, None
    return "OPEN", None, None


# ── 5. Bank Accounts (5) ─────────────────────────────────────────
def create_bank_accounts():
    print("\n── Creating Bank Accounts (5) ──")
    accts = []
    for name, atype, inst, last4, bal in BANK_ACCOUNTS_DATA:
        accts.append(BankAccount.objects.create(
            name=name, account_type=atype, institution=inst,
            account_number_last4=last4, balance=bal, is_active=True,
        ))
    print(f"  ✓ {len(accts)} bank accounts")
    return accts


# ── 6. Transaction Categories (15) ───────────────────────────────
def create_categories():
    print("\n── Creating Transaction Categories (15) ──")
    cats = []
    for name, ctype, desc, tax in TRANSACTION_CATEGORY_DATA:
        cats.append(TransactionCategory.objects.create(
            name=name, category_type=ctype,
            description=desc, is_tax_deductible=tax,
        ))
    print(f"  ✓ {len(cats)} categories")
    return cats


# ── 7. Transactions (80) ─────────────────────────────────────────
def create_transactions(bank_accounts, categories, payments):
    print("\n── Creating Transactions (80) ──")
    txns = []
    acct_main = bank_accounts[0]   # KCB
    acct_savings = bank_accounts[1]
    acct_mpesa = bank_accounts[2]
    acct_cash = bank_accounts[3]
    acct_ops = bank_accounts[4]

    cat_map = {c.name: c for c in categories}

    # ─ Income txns from rent payments (25) ─
    paid_payments = [p for p in payments if p.status == "PAID" and p.payment_type == "RENT"]
    random.shuffle(paid_payments)
    for pp in paid_payments[:25]:
        acct = random.choice([acct_main, acct_mpesa])
        txns.append(Transaction.objects.create(
            bank_account=acct, category=cat_map["Rent Collection"],
            transaction_type="INCOME", amount=pp.amount,
            date=pp.date_paid, description=f"Rent from {pp.tenant.name}",
            reference=pp.transaction_id or "", payee=pp.tenant.name,
            status="CLEARED", linked_payment=pp,
        ))

    # 5 deposit-income txns
    dep_payments = [p for p in payments if p.status == "PAID" and p.payment_type == "DEPOSIT"]
    random.shuffle(dep_payments)
    for dp in dep_payments[:5]:
        txns.append(Transaction.objects.create(
            bank_account=acct_main, category=cat_map["Deposit Income"],
            transaction_type="INCOME", amount=dp.amount,
            date=dp.date_paid, description=f"Deposit from {dp.tenant.name}",
            reference=dp.transaction_id or "", payee=dp.tenant.name,
            status="RECONCILED", linked_payment=dp,
        ))

    # ─ Expense txns (35) ─
    expense_templates = [
        ("Maintenance & Repairs", "Plumbing repair — Building {bld}", 2000, 18000, acct_ops),
        ("Maintenance & Repairs", "Electrical work — Building {bld}", 3000, 15000, acct_ops),
        ("Utilities", "KPLC electricity bill — common areas", 8000, 22000, acct_main),
        ("Utilities", "Nairobi Water bill — common areas", 3000, 9000, acct_main),
        ("Insurance", "Property insurance premium — Q{q}", 45000, 120000, acct_main),
        ("Property Tax", "County rates — half year", 25000, 60000, acct_main),
        ("Legal Fees", "Lease preparation — {name}", 5000, 15000, acct_ops),
        ("Advertising", "BuyRentKenya listing fee — vacant units", 2000, 8000, acct_mpesa),
        ("Cleaning Supplies", "Monthly cleaning supplies restock", 1500, 5000, acct_cash),
        ("Security Services", "CCTV maintenance & alarm monitoring", 10000, 25000, acct_ops),
        ("Landscaping", "Garden service — monthly", 5000, 12000, acct_cash),
        ("Office Supplies", "Stationery and printer toner", 800, 3500, acct_cash),
    ]
    expense_count = 0
    for month_dt in month_iter(date(2025, 1, 1), TODAY):
        if expense_count >= 35:
            break
        # 2-3 expenses per month
        n_exp = random.randint(2, 3)
        for _ in range(n_exp):
            if expense_count >= 35:
                break
            tmpl = random.choice(expense_templates)
            cat_name, desc_tmpl, lo, hi, acct = tmpl
            bld = random.choice(list("ABCDEFGH"))
            q = ((month_dt.month - 1) // 3) + 1
            desc = desc_tmpl.format(bld=bld, q=q, name=random.choice(TENANT_NAMES))
            amt = Decimal(random.randint(lo, hi))
            txn_date = rand_date_between(month_dt, safe_day(month_dt.year, month_dt.month, 28))
            txns.append(Transaction.objects.create(
                bank_account=acct, category=cat_map[cat_name],
                transaction_type="EXPENSE", amount=amt,
                date=txn_date, description=desc,
                reference=f"EXP{random.randint(10000,99999)}",
                payee=random.choice(["Supplier", "Contractor", "Nairobi City County", "KPLC", "Nairobi Water", "BuyRentKenya", ""]),
                status=random.choice(["CLEARED", "CLEARED", "RECONCILED"]),
            ))
            expense_count += 1

    # ─ Transfer txns (5) ─
    for i in range(5):
        amt = Decimal(random.randint(50000, 300000))
        dt = rand_date_between(date(2025, 3, 1), TODAY)
        txns.append(Transaction.objects.create(
            bank_account=acct_main, category=None,
            transaction_type="TRANSFER", amount=amt,
            date=dt, description=f"Transfer to Equity savings",
            reference=f"TRF{random.randint(10000,99999)}",
            payee="Equity Bank", status="CLEARED",
        ))

    # ─ A few voided / pending (fill up to 80) ─
    remaining = 80 - len(txns)
    for i in range(max(0, remaining)):
        dt = rand_date_between(date(2025, 6, 1), TODAY)
        amt = Decimal(random.randint(5000, 30000))
        status = random.choice(["VOID", "PENDING"])
        txns.append(Transaction.objects.create(
            bank_account=random.choice(bank_accounts),
            category=random.choice(categories),
            transaction_type=random.choice(["EXPENSE", "INCOME"]),
            amount=amt, date=dt,
            description=f"{'Voided' if status == 'VOID' else 'Pending'} transaction #{i+1}",
            reference="", payee="", status=status,
            notes="Duplicate entry — voided" if status == "VOID" else "Awaiting confirmation",
        ))

    print(f"  ✓ {len(txns)} transactions")
    return txns


# ── 8. Invoices (20) + Invoice Items (40) ────────────────────────
def create_invoices(tenants):
    print("\n── Creating Invoices (20) + Invoice Items (40) ──")
    invoices = []
    items = []
    active_tenants = [t for t in tenants if t.is_active]

    statuses_pool = (
        ["PAID"] * 6 + ["SENT"] * 3 + ["OVERDUE"] * 3 +
        ["PARTIAL"] * 3 + ["DRAFT"] * 2 + ["VIEWED"] * 2 + ["CANCELLED"] * 1
    )
    random.shuffle(statuses_pool)

    for i in range(20):
        inv_num = f"INV-2025-{1001 + i}"
        tenant = random.choice(active_tenants) if random.random() < 0.85 else None
        issue_dt = rand_date_between(date(2025, 1, 1), TODAY)
        due_dt = issue_dt + timedelta(days=random.choice([14, 30, 30, 30, 45]))
        status = statuses_pool[i % len(statuses_pool)]

        payment_method = ""
        amt_paid = Decimal("0.00")

        # Line items (2 per invoice)
        item_defs = _invoice_items_for(tenant)
        subtotal = sum(qty * price for _, qty, price in item_defs)
        tax_rate = random.choice([Decimal("0"), Decimal("0"), Decimal("16.00")])
        tax_amt = (subtotal * tax_rate / Decimal("100")).quantize(Decimal("0.01"))
        total = subtotal + tax_amt

        if status == "PAID":
            amt_paid = total
            payment_method = random.choice(["BANK_TRANSFER", "MOBILE_MONEY", "CASH"])
        elif status == "PARTIAL":
            amt_paid = (total * Decimal(str(random.uniform(0.3, 0.7)))).quantize(Decimal("0.01"))
            payment_method = random.choice(["BANK_TRANSFER", "MOBILE_MONEY"])
        elif status == "CANCELLED":
            amt_paid = Decimal("0.00")

        inv = Invoice.objects.create(
            invoice_number=inv_num,
            tenant=tenant,
            client_name="" if tenant else random.choice(["ABC Supplies", "XYZ Contractors", "Bright Cleaning Co."]),
            client_email="" if tenant else "vendor@example.com",
            issue_date=issue_dt, due_date=due_dt,
            status=status, subtotal=subtotal,
            tax_rate=tax_rate, tax_amount=tax_amt,
            total=total, amount_paid=amt_paid,
            payment_method=payment_method,
            notes=random.choice(["", "", "Thank you for your prompt payment.", "Please pay via M-Pesa Paybill 123456."]),
        )
        invoices.append(inv)

        for desc, qty, price in item_defs:
            it = InvoiceItem.objects.create(
                invoice=inv, description=desc,
                quantity=qty, unit_price=price,
                total=qty * price,
            )
            items.append(it)

    print(f"  ✓ {len(invoices)} invoices, {len(items)} line items")
    return invoices, items


def _invoice_items_for(tenant):
    """Return list of (description, quantity, unit_price) for 2 invoice items."""
    if tenant:
        rent = tenant.rent_amount
        return [
            (f"Monthly Rent — {tenant.property.house_number if tenant.property else 'N/A'}", Decimal("1"), rent),
            ("Water & Garbage", Decimal("1"), Decimal(random.randint(500, 2500))),
        ]
    return [
        ("Consulting service", Decimal(str(random.randint(1, 5))), Decimal(random.randint(5000, 20000))),
        ("Materials", Decimal(str(random.randint(1, 10))), Decimal(random.randint(1000, 8000))),
    ]


# ── 9. Employees (10) ────────────────────────────────────────────
def create_employees():
    print("\n── Creating Employees (10) ──")
    emps = []
    for first, last, title, dept, etype, salary in EMPLOYEE_DATA:
        hire = rand_date_between(date(2021, 1, 1), date(2024, 12, 31))
        term = None
        active = True
        # Terminate one employee
        if last == "Nzioka":
            term = date(2025, 11, 15)
            active = False

        emps.append(Employee.objects.create(
            first_name=first, last_name=last,
            email=f"{first.lower()}.{last.lower()}@rentmgmt.co.ke",
            phone=f"+254{random.randint(700000000, 799999999)}",
            id_number=f"{random.randint(20000000, 39999999)}",
            kra_pin=f"A{random.randint(100000000, 999999999)}Z",
            employment_type=etype, job_title=title,
            department=dept, hire_date=hire,
            termination_date=term, base_salary=Decimal(salary),
            pay_frequency="MONTHLY",
            bank_name=random.choice(["KCB", "Equity", "Cooperative", "Stanbic"]),
            bank_account_number=f"{random.randint(1000000000, 9999999999)}",
            nhif_number=f"NHIF{random.randint(100000, 999999)}",
            nssf_number=f"NSSF{random.randint(100000, 999999)}",
            is_active=active,
        ))
    print(f"  ✓ {len(emps)} employees")
    return emps


# ── 10. Payroll Runs (6) + Paychecks (24) ────────────────────────
def create_payroll(employees):
    print("\n── Creating Payroll Runs (6) + Paychecks (24) ──")
    runs = []
    checks = []
    active_emps = [e for e in employees if e.is_active]

    # Sep 2025 → Feb 2026
    run_months = [
        (2025, 9), (2025, 10), (2025, 11), (2025, 12),
        (2026, 1), (2026, 2),
    ]
    statuses = ["PAID", "PAID", "PAID", "PAID", "PAID", "PROCESSING"]

    for (yr, mo), run_status in zip(run_months, statuses):
        last_day = calendar.monthrange(yr, mo)[1]
        pr = PayrollRun.objects.create(
            name=f"{calendar.month_name[mo]} {yr} Payroll",
            period_start=date(yr, mo, 1),
            period_end=date(yr, mo, last_day),
            pay_date=date(yr, mo, last_day),
            status=run_status,
        )
        runs.append(pr)

        # Pick 4 employees per run (rotate through active ones)
        random.shuffle(active_emps)
        for emp in active_emps[:4]:
            gross = emp.base_salary + Decimal(random.randint(-1000, 3000))
            pc = Paycheck.objects.create(
                payroll_run=pr, employee=emp, gross_pay=gross,
            )
            checks.append(pc)

        pr.recalculate_totals()

    print(f"  ✓ {len(runs)} runs, {len(checks)} paychecks")
    return runs, checks


# ─────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────
def summary():
    props = Property.objects.count()
    tenants = Tenant.objects.count()
    payments = Payment.objects.count()
    maint = MaintenanceRequest.objects.count()
    accts = BankAccount.objects.count()
    cats = TransactionCategory.objects.count()
    txns = Transaction.objects.count()
    invs = Invoice.objects.count()
    items = InvoiceItem.objects.count()
    emps = Employee.objects.count()
    runs = PayrollRun.objects.count()
    checks = Paycheck.objects.count()

    total = props + tenants + payments + maint + accts + cats + txns + invs + items + emps + runs + checks

    print("\n" + "=" * 60)
    print("    SAMPLE DATA GENERATION — SUMMARY")
    print("=" * 60)
    print(f"  Properties              {props:>5}")
    print(f"    Occupied              {Property.objects.filter(is_occupied=True).count():>5}")
    print(f"    Vacant                {Property.objects.filter(is_occupied=False).count():>5}")
    print(f"  Tenants                 {tenants:>5}")
    print(f"    Active                {Tenant.objects.filter(is_active=True).count():>5}")
    print(f"    Inactive              {Tenant.objects.filter(is_active=False).count():>5}")
    print(f"  Payments                {payments:>5}")
    for st in ["PAID", "PENDING", "LATE", "FAILED", "SEVERE", "DEFAULTED"]:
        c = Payment.objects.filter(status=st).count()
        if c:
            print(f"    {st:<20}  {c:>5}")
    print(f"  Maintenance Requests    {maint:>5}")
    for st in ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]:
        c = MaintenanceRequest.objects.filter(status=st).count()
        if c:
            print(f"    {st:<20}  {c:>5}")
    print(f"  Bank Accounts           {accts:>5}")
    print(f"  Transaction Categories  {cats:>5}")
    print(f"  Transactions            {txns:>5}")
    for st in ["PENDING", "CLEARED", "RECONCILED", "VOID"]:
        c = Transaction.objects.filter(status=st).count()
        if c:
            print(f"    {st:<20}  {c:>5}")
    print(f"  Invoices                {invs:>5}")
    for st in ["DRAFT", "SENT", "VIEWED", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]:
        c = Invoice.objects.filter(status=st).count()
        if c:
            print(f"    {st:<20}  {c:>5}")
    print(f"  Invoice Items           {items:>5}")
    print(f"  Employees               {emps:>5}")
    print(f"    Active                {Employee.objects.filter(is_active=True).count():>5}")
    print(f"    Terminated            {Employee.objects.filter(is_active=False).count():>5}")
    print(f"  Payroll Runs            {runs:>5}")
    print(f"  Paychecks               {checks:>5}")
    print(f"  {'─' * 35}")
    print(f"  TOTAL RECORDS           {total:>5}")
    print("=" * 60)


# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  RENT MANAGEMENT SYSTEM — SAMPLE DATA GENERATOR v2")
    print("  Target: ~600 records across all models")
    print("=" * 60)

    clear_all()

    props = create_properties()                            # 80
    tenants = create_tenants(props)                        # 55
    payments = create_payments(tenants)                    # ~200
    maint = create_maintenance(tenants)                    # 65
    accts = create_bank_accounts()                         # 5
    cats = create_categories()                             # 15
    txns = create_transactions(accts, cats, payments)      # 80
    invs, inv_items = create_invoices(tenants)             # 20 + 40
    emps = create_employees()                              # 10
    pr_runs, pr_checks = create_payroll(emps)              # 6 + 24

    summary()


if __name__ == "__main__":
    main()
