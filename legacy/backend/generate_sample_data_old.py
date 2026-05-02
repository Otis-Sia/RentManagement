"""
Sample Data Generator for Rent Management System
Generates comprehensive test data covering various scenarios:
- 60 houses (A1-A10, B1-B10, C1-C10, D1-D10, E1-E10, F1-F10)
- 7 different addresses
- Various payment scenarios (paid, late, failed, pending)
- Various maintenance scenarios (emergency, high, medium, low priority)
- Different occupancy states
- Different lease durations
"""

import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from houses.models import Property
from tenants.models import Tenant
from payments.models import Payment
from maintenance.models import MaintenanceRequest

# Sample data for generating realistic entries
ADDRESSES = [
    "123 Mombasa Road, Nairobi",
    "456 Ngong Road, Karen",
    "789 Kiambu Road, Ruaka",
    "321 Thika Road, Roysambu",
    "654 Waiyaki Way, Westlands",
    "987 Langata Road, Hardy",
    "147 Eastern Bypass, Embakasi"
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
    "Agnes Chepngetich", "Nicholas Ouma", "Violet Wairimu", "Lawrence Tanui", "Priscilla Amina"
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
]

def clear_existing_data():
    """Clear all existing data"""
    print("Clearing existing data...")
    MaintenanceRequest.objects.all().delete()
    Payment.objects.all().delete()
    Tenant.objects.all().delete()
    Property.objects.all().delete()
    print("✓ Data cleared")

def create_properties():
    """Create 60 properties across 7 addresses"""
    print("\nCreating properties...")
    properties = []
    building_letters = ['A', 'B', 'C', 'D', 'E', 'F']
    
    for building in building_letters:
        # Each building at a different address (cycling through 7 addresses)
        address_index = ord(building) - ord('A')
        address = ADDRESSES[address_index % len(ADDRESSES)]
        
        for unit_num in range(1, 11):  # Units 1-10
            house_number = f"{building}{unit_num}"
            
            # Vary property characteristics
            # Lower floors (1-3) tend to be cheaper and smaller
            # Upper floors (8-10) tend to be more expensive and larger
            if unit_num <= 3:
                bedrooms = random.choice([1, 2])
                bathrooms = 1
                square_feet = random.randint(450, 700)
                base_rent = Decimal(random.randint(15000, 25000))
            elif unit_num <= 7:
                bedrooms = random.choice([2, 3])
                bathrooms = random.choice([1, 2])
                square_feet = random.randint(700, 1000)
                base_rent = Decimal(random.randint(25000, 40000))
            else:
                bedrooms = random.choice([3, 4])
                bathrooms = 2
                square_feet = random.randint(1000, 1400)
                base_rent = Decimal(random.randint(40000, 65000))
            
            prop = Property.objects.create(
                house_number=house_number,
                address=address,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                square_feet=square_feet,
                monthly_rent=base_rent,
                is_occupied=False  # Will be updated when tenants are created
            )
            properties.append(prop)
    
    print(f"✓ Created {len(properties)} properties")
    return properties

def create_tenants_and_leases(properties):
    """Create tenants with various lease scenarios"""
    print("\nCreating tenants...")
    tenants = []
    available_names = TENANT_NAMES.copy()
    random.shuffle(available_names)
    
    today = datetime.now().date()
    
    # Different tenant scenarios:
    # 1. Long-term active tenants (30% - about 18 units)
    # 2. Recent move-ins (20% - about 12 units)
    # 3. About to expire leases (10% - about 6 units)
    # 4. Expired/inactive tenants (5% - about 3 units)
    # 5. Vacant properties (35% - about 21 units)
    
    scenarios = []
    
    # Long-term active tenants (started 1-3 years ago, ending 6-18 months from now)
    scenarios.extend(['long_term'] * 18)
    # Recent move-ins (started 1-3 months ago, ending 11-13 months from now)
    scenarios.extend(['recent'] * 12)
    # About to expire (started 11-13 months ago, ending 1-30 days from now)
    scenarios.extend(['expiring_soon'] * 6)
    # Expired/inactive (ended 1-6 months ago)
    scenarios.extend(['expired'] * 3)
    # Vacant
    scenarios.extend(['vacant'] * 21)
    
    random.shuffle(scenarios)
    
    for i, prop in enumerate(properties):
        scenario = scenarios[i]
        
        if scenario == 'vacant':
            continue  # Skip vacant properties
        
        if not available_names:
            available_names = TENANT_NAMES.copy()
            random.shuffle(available_names)
        
        name = available_names.pop()
        
        # Generate email from name
        email_name = name.lower().replace(' ', '.')
        email = f"{email_name}@example.com"
        
        # Generate phone number
        phone = f"+254{random.randint(700000000, 799999999)}"
        
        # Determine lease dates based on scenario
        if scenario == 'long_term':
            lease_start = today - timedelta(days=random.randint(365, 1095))  # 1-3 years ago
            lease_end = today + timedelta(days=random.randint(180, 540))  # 6-18 months from now
            is_active = True
        elif scenario == 'recent':
            lease_start = today - timedelta(days=random.randint(30, 90))  # 1-3 months ago
            lease_end = today + timedelta(days=random.randint(330, 390))  # 11-13 months from now
            is_active = True
        elif scenario == 'expiring_soon':
            lease_start = today - timedelta(days=random.randint(330, 390))  # 11-13 months ago
            lease_end = today + timedelta(days=random.randint(1, 30))  # 1-30 days from now
            is_active = True
        else:  # expired
            lease_start = today - timedelta(days=random.randint(545, 730))  # 18-24 months ago
            lease_end = today - timedelta(days=random.randint(30, 180))  # Ended 1-6 months ago
            is_active = False
        
        # Rent amount usually matches property rent, but could have been negotiated
        rent_variation = random.choice([0.95, 1.0, 1.0, 1.0, 1.05])  # Usually same, sometimes ±5%
        rent_amount = prop.monthly_rent * Decimal(str(rent_variation))
        
        # Deposit is typically 1-2 months rent
        deposit_multiplier = random.choice([1, 1, 2])
        deposit = rent_amount * deposit_multiplier
        
        # Rent due day
        rent_due_day = random.choice([1, 5, 7, 10, 15, 20, 25])
        
        tenant = Tenant.objects.create(
            name=name,
            property=prop,
            email=email,
            phone=phone,
            lease_start=lease_start,
            lease_end=lease_end,
            rent_amount=rent_amount,
            deposit=deposit,
            rent_due_day=rent_due_day,
            is_active=is_active
        )
        tenants.append(tenant)
        
        # Update property occupancy
        if is_active:
            prop.is_occupied = True
            prop.save()
    
    print(f"✓ Created {len(tenants)} tenants")
    print(f"  - Active tenants: {sum(1 for t in tenants if t.is_active)}")
    print(f"  - Inactive tenants: {sum(1 for t in tenants if not t.is_active)}")
    print(f"  - Vacant properties: {sum(1 for p in properties if not p.is_occupied)}")
    
    return tenants

def create_payments(tenants):
    """Create payment records with various scenarios"""
    print("\nCreating payment records...")
    payments = []
    today = datetime.now().date()
    
    for tenant in tenants:
        # Calculate how many months tenant has been/was in property
        start_date = tenant.lease_start
        if tenant.is_active:
            end_date = today
        else:
            end_date = tenant.lease_end
        
        months_in_property = ((end_date.year - start_date.year) * 12 + 
                             end_date.month - start_date.month)
        
        # Create initial deposit payment
        deposit_due = start_date - timedelta(days=7)
        deposit_paid = start_date - timedelta(days=random.randint(1, 5))
        
        payment = Payment.objects.create(
            tenant=tenant,
            amount=tenant.deposit,
            date_due=deposit_due,
            date_paid=deposit_paid,
            payment_type='DEPOSIT',
            status='PAID',
            transaction_id=f"TXN{random.randint(100000, 999999)}"
        )
        payments.append(payment)
        
        # Create monthly rent payments
        for month_offset in range(max(0, months_in_property + 1)):
            # Calculate due date for this month
            due_date = start_date + timedelta(days=30 * month_offset)
            # Adjust to the rent_due_day
            due_date = due_date.replace(day=min(tenant.rent_due_day, 28))
            
            # Skip if due date is in the future for inactive tenants
            if not tenant.is_active and due_date > tenant.lease_end:
                break
            
            # Determine payment status and paid date based on various scenarios
            is_future = due_date > today
            
            if is_future:
                # Future payment - always pending
                status = 'PENDING'
                date_paid = None
                transaction_id = None
            else:
                # Past payment - various scenarios
                scenario_roll = random.random()
                
                if scenario_roll < 0.70:  # 70% - Paid on time
                    status = 'PAID'
                    # Paid within 5 days before to 2 days after due date
                    days_offset = random.randint(-5, 2)
                    date_paid = due_date + timedelta(days=days_offset)
                    transaction_id = f"TXN{random.randint(100000, 999999)}"
                    
                elif scenario_roll < 0.85:  # 15% - Paid late (but paid)
                    status = 'LATE'
                    # Paid 3-20 days after due date
                    days_offset = random.randint(3, 20)
                    date_paid = due_date + timedelta(days=days_offset)
                    if date_paid > today:
                        date_paid = today - timedelta(days=random.randint(1, 5))
                    transaction_id = f"TXN{random.randint(100000, 999999)}"
                    
                elif scenario_roll < 0.93:  # 8% - Currently late (not yet paid)
                    status = 'LATE'
                    date_paid = None
                    transaction_id = None
                    
                else:  # 7% - Failed payment
                    status = 'FAILED'
                    date_paid = None
                    transaction_id = None
            
            payment = Payment.objects.create(
                tenant=tenant,
                amount=tenant.rent_amount,
                date_due=due_date,
                date_paid=date_paid,
                payment_type='RENT',
                status=status,
                transaction_id=transaction_id
            )
            payments.append(payment)
            
            # Some late payments incur late fees
            if status in ['LATE', 'FAILED'] and random.random() < 0.6:
                late_fee_amount = tenant.rent_amount * Decimal('0.05')  # 5% late fee
                fee_due = due_date + timedelta(days=5)
                
                if status == 'LATE' and date_paid:
                    # Late fee paid with the late rent
                    fee_status = 'PAID'
                    fee_paid_date = date_paid
                    fee_transaction = f"TXN{random.randint(100000, 999999)}"
                else:
                    # Late fee still pending or failed
                    fee_status = random.choice(['PENDING', 'FAILED'])
                    fee_paid_date = None
                    fee_transaction = None
                
                payment = Payment.objects.create(
                    tenant=tenant,
                    amount=late_fee_amount,
                    date_due=fee_due,
                    date_paid=fee_paid_date,
                    payment_type='FEE',
                    status=fee_status,
                    transaction_id=fee_transaction
                )
                payments.append(payment)
    
    print(f"✓ Created {len(payments)} payment records")
    status_counts = {}
    for p in payments:
        status_counts[p.status] = status_counts.get(p.status, 0) + 1
    for status, count in sorted(status_counts.items()):
        print(f"  - {status}: {count}")
    
    return payments

def create_maintenance_requests(tenants):
    """Create maintenance requests with various scenarios"""
    print("\nCreating maintenance requests...")
    requests = []
    today = datetime.now().date()
    
    # Not all tenants will have maintenance requests
    # Active tenants more likely to have requests
    for tenant in tenants:
        # Determine number of maintenance requests for this tenant
        if tenant.is_active:
            # Active tenants: 0-5 requests, weighted towards fewer
            num_requests = random.choices([0, 1, 2, 3, 4, 5], weights=[30, 40, 15, 10, 3, 2])[0]
        else:
            # Inactive tenants: 0-2 requests, mostly 0
            num_requests = random.choices([0, 1, 2], weights=[70, 20, 10])[0]
        
        for _ in range(num_requests):
            # Pick a random issue
            title, description, priority = random.choice(MAINTENANCE_ISSUES)
            
            # Request date - somewhere during tenancy
            days_in_tenancy = (today - tenant.lease_start).days if tenant.is_active else (tenant.lease_end - tenant.lease_start).days
            days_offset = random.randint(0, max(1, days_in_tenancy))
            request_date = tenant.lease_start + timedelta(days=days_offset)
            
            # Ensure request date is not in the future
            if request_date > today:
                request_date = today - timedelta(days=random.randint(1, 30))
            
            # Determine status based on how long ago the request was made
            days_since_request = (today - request_date).days
            
            if priority == 'EMERGENCY':
                # Emergencies are usually resolved quickly
                if days_since_request > 2:
                    status = 'COMPLETED'
                    resolved_date = request_date + timedelta(days=random.randint(0, 2))
                elif days_since_request > 0:
                    status = 'IN_PROGRESS'
                    resolved_date = None
                else:
                    status = 'OPEN'
                    resolved_date = None
            
            elif priority == 'HIGH':
                # High priority resolved in 1-7 days
                if days_since_request > 7:
                    status = random.choices(['COMPLETED', 'IN_PROGRESS'], weights=[80, 20])[0]
                    resolved_date = request_date + timedelta(days=random.randint(1, 7)) if status == 'COMPLETED' else None
                elif days_since_request > 2:
                    status = random.choices(['IN_PROGRESS', 'OPEN'], weights=[70, 30])[0]
                    resolved_date = None
                else:
                    status = 'OPEN'
                    resolved_date = None
            
            elif priority == 'MEDIUM':
                # Medium priority resolved in 3-14 days
                if days_since_request > 14:
                    status = random.choices(['COMPLETED', 'IN_PROGRESS', 'OPEN'], weights=[70, 20, 10])[0]
                    resolved_date = request_date + timedelta(days=random.randint(3, 14)) if status == 'COMPLETED' else None
                elif days_since_request > 5:
                    status = random.choices(['IN_PROGRESS', 'OPEN'], weights=[60, 40])[0]
                    resolved_date = None
                else:
                    status = 'OPEN'
                    resolved_date = None
            
            else:  # LOW
                # Low priority - resolved in 7-30 days, some still open
                if days_since_request > 30:
                    status = random.choices(['COMPLETED', 'IN_PROGRESS', 'OPEN'], weights=[60, 25, 15])[0]
                    resolved_date = request_date + timedelta(days=random.randint(7, 30)) if status == 'COMPLETED' else None
                elif days_since_request > 10:
                    status = random.choices(['IN_PROGRESS', 'OPEN'], weights=[50, 50])[0]
                    resolved_date = None
                else:
                    status = 'OPEN'
                    resolved_date = None
            
            # Some requests get cancelled (especially low priority ones)
            if status != 'COMPLETED' and random.random() < (0.15 if priority == 'LOW' else 0.05):
                status = 'CANCELLED'
                resolved_date = None
            
            # Determine cost (only for completed requests)
            if status == 'COMPLETED':
                # Cost varies by priority
                if priority == 'EMERGENCY':
                    cost = Decimal(random.randint(5000, 30000))
                elif priority == 'HIGH':
                    cost = Decimal(random.randint(3000, 20000))
                elif priority == 'MEDIUM':
                    cost = Decimal(random.randint(1000, 10000))
                else:
                    cost = Decimal(random.randint(500, 5000))
            else:
                cost = None
            
            request = MaintenanceRequest.objects.create(
                tenant=tenant,
                title=title,
                description=description,
                priority=priority,
                status=status,
                cost=cost,
                request_date=request_date,
                resolved_date=resolved_date
            )
            requests.append(request)
    
    print(f"✓ Created {len(requests)} maintenance requests")
    
    # Print statistics
    status_counts = {}
    priority_counts = {}
    for r in requests:
        status_counts[r.status] = status_counts.get(r.status, 0) + 1
        priority_counts[r.priority] = priority_counts.get(r.priority, 0) + 1
    
    print("  Status breakdown:")
    for status, count in sorted(status_counts.items()):
        print(f"    - {status}: {count}")
    
    print("  Priority breakdown:")
    for priority, count in sorted(priority_counts.items()):
        print(f"    - {priority}: {count}")
    
    return requests

def generate_summary_report():
    """Generate a summary report of all created data"""
    print("\n" + "="*60)
    print("SAMPLE DATA GENERATION COMPLETE")
    print("="*60)
    
    print(f"\nProperties: {Property.objects.count()}")
    print(f"  - Occupied: {Property.objects.filter(is_occupied=True).count()}")
    print(f"  - Vacant: {Property.objects.filter(is_occupied=False).count()}")
    
    print(f"\nAddresses ({len(set(Property.objects.values_list('address', flat=True)))} unique):")
    for address in sorted(set(Property.objects.values_list('address', flat=True))):
        count = Property.objects.filter(address=address).count()
        print(f"  - {address}: {count} properties")
    
    print(f"\nTenants: {Tenant.objects.count()}")
    print(f"  - Active: {Tenant.objects.filter(is_active=True).count()}")
    print(f"  - Inactive: {Tenant.objects.filter(is_active=False).count()}")
    
    print(f"\nPayments: {Payment.objects.count()}")
    for status in ['PENDING', 'PAID', 'LATE', 'FAILED']:
        count = Payment.objects.filter(status=status).count()
        print(f"  - {status}: {count}")
    
    print(f"\nMaintenance Requests: {MaintenanceRequest.objects.count()}")
    for status in ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']:
        count = MaintenanceRequest.objects.filter(status=status).count()
        print(f"  - {status}: {count}")
    
    print("\n" + "="*60)

def main():
    """Main execution function"""
    print("="*60)
    print("RENT MANAGEMENT SYSTEM - SAMPLE DATA GENERATOR")
    print("="*60)
    
    # Clear existing data
    clear_existing_data()
    
    # Create all data
    properties = create_properties()
    tenants = create_tenants_and_leases(properties)
    payments = create_payments(tenants)
    maintenance_requests = create_maintenance_requests(tenants)
    
    # Generate summary
    generate_summary_report()

if __name__ == '__main__':
    main()
