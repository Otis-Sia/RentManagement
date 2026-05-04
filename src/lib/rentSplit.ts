/**
 * rentSplit.ts
 *
 * Utility that splits a RENT payment into per-month slots.
 *
 * Rules:
 * 1. Arrear months (due date < date_paid) are settled first → status: LATE
 * 2. Current-cycle month (due date >= date_paid but <= end of payment month) → status: PAID
 * 3. Future months (due date > payment month end) → status: PREPAID
 * 4. If money runs out before all outstanding months are covered → status: PENDING (amount: 0)
 */

export type SlotStatus = 'PAID' | 'LATE' | 'PREPAID' | 'PENDING';

export interface MonthSlot {
    /** YYYY-MM */
    month: string;
    /** e.g. "April 2026" */
    label: string;
    /** amount allocated to this slot (0 if PENDING) */
    amount: number;
    status: SlotStatus;
    date_due: string;   // YYYY-MM-DD
    date_paid: string;  // YYYY-MM-DD (actual payment date)
}

/**
 * Returns a "YYYY-MM" key for a given Date.
 */
export function toMonthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Returns the due date string for a given year/month and rentDueDay.
 * Clamps to the last day of the month if rentDueDay > days in month.
 */
export function dueDateFor(year: number, month: number, rentDueDay: number): string {
    // month is 0-indexed here
    const lastDay = new Date(year, month + 1, 0).getDate();
    const day = Math.min(rentDueDay, lastDay);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Human-readable label for a YYYY-MM string.
 */
export function monthLabel(monthKey: string): string {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Split a rent payment into month slots.
 *
 * @param amountPaid      - Total KES received
 * @param datePaid        - "YYYY-MM-DD" — actual date money was received
 * @param rentAmount      - Monthly rent (KES per month)
 * @param rentDueDay      - Day of month rent is due (e.g. 4 → 4th of each month)
 * @param leaseStart      - "YYYY-MM-DD" — tenant's lease start date
 * @param alreadyPaid     - Map of "YYYY-MM" to total KES already paid for that month
 */
export function splitRentPayment(
    amountPaid: number,
    datePaid: string,
    rentAmount: number,
    rentDueDay: number,
    leaseStart: string,
    alreadyPaid: Map<string, number>
): MonthSlot[] {
    if (rentAmount <= 0) return [];

    const paid = new Date(datePaid);
    paid.setHours(0, 0, 0, 0);

    const leaseStartDate = new Date(leaseStart);
    leaseStartDate.setHours(0, 0, 0, 0);

    const slots: MonthSlot[] = [];
    let remaining = amountPaid;

    const startYear = leaseStartDate.getFullYear();
    const startMonth = leaseStartDate.getMonth();

    const endYear = paid.getFullYear();
    const endMonth = paid.getMonth() + 12;

    for (let absMonth = startYear * 12 + startMonth; absMonth <= endYear * 12 + endMonth; absMonth++) {
        const year = Math.floor(absMonth / 12);
        const month = absMonth % 12;

        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        // How much is already paid for this month?
        const existingPaid = alreadyPaid.get(key) || 0;
        
        // If already fully paid, skip
        if (existingPaid >= rentAmount) continue;

        const needed = rentAmount - existingPaid;

        const dueDateStr = dueDateFor(year, month, rentDueDay);
        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0, 0, 0, 0);

        const isPast = dueDate < paid;
        const isCurrent = dueDate >= paid && dueDate <= new Date(paid.getFullYear(), paid.getMonth() + 1, 0);
        const isFuture = dueDate > new Date(paid.getFullYear(), paid.getMonth() + 1, 0);

        if (isFuture && remaining <= 0) break;
        if (!isPast && !isCurrent && !(isFuture && remaining > 0)) continue;

        let slotAmount: number;
        let status: SlotStatus;

        if (remaining >= needed) {
            slotAmount = needed;
            remaining -= needed;

            if (isPast) {
                status = 'LATE';
            } else if (isFuture) {
                status = 'PREPAID';
            } else {
                status = 'PAID';
            }
        } else if (remaining > 0) {
            slotAmount = remaining;
            remaining = 0;
            
            if (isPast) {
                status = 'LATE';
            } else if (isFuture) {
                status = 'PREPAID';
            } else {
                status = 'PENDING';
            }
        } else {
            slotAmount = 0;
            status = 'PENDING';
        }

        slots.push({
            month: key,
            label: monthLabel(key),
            amount: slotAmount,
            status,
            date_due: dueDateStr,
            date_paid: datePaid,
        });
    }

    return slots;
}

/**
 * Given an array of month slots, determine the top-level payment status.
 * Precedence (worst first): LATE > PENDING > PREPAID > PAID
 */
export function computePaymentStatus(slots: MonthSlot[]): string {
    if (slots.length === 0) return 'PAID';
    
    if (slots.some(s => s.status === 'LATE' && s.amount > 0)) return 'LATE';
    if (slots.some(s => s.status === 'PENDING' && s.amount > 0)) return 'PENDING';
    
    if (slots.some(s => s.status === 'LATE')) return 'LATE';
    if (slots.some(s => s.status === 'PENDING')) return 'PENDING';
    if (slots.some(s => s.status === 'PREPAID')) return 'PREPAID';
    
    return 'PAID';
}

/**
 * Extract a map of month -> total paid from existing payments.
 */
export function extractCoveredMonths(existingPayments: Array<{ utilization_data?: MonthSlot[] }>): Map<string, number> {
    const paidMap = new Map<string, number>();
    for (const p of existingPayments) {
        for (const slot of p.utilization_data ?? []) {
            const current = paidMap.get(slot.month) || 0;
            paidMap.set(slot.month, current + slot.amount);
        }
    }
    return paidMap;
}

/**
 * Calculate the total balance owed by a tenant.
 */
export function calculateTenantBalance(
    rentAmount: number,
    rentDueDay: number,
    leaseStart: string,
    existingPayments: Array<{ utilization_data?: MonthSlot[], payment_type: string }>
) {
    const rentPayments = existingPayments.filter(p => p.payment_type === 'RENT');
    const coveredMonths = extractCoveredMonths(rentPayments as any);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Use splitRentPayment with 0 amount to get all slots up to today
    const slots = splitRentPayment(
        0,
        today,
        rentAmount,
        rentDueDay,
        leaseStart,
        coveredMonths
    );

    // Filter to only include past and current slots that are not fully paid
    const unpaidSlots = slots.filter(s => s.amount === 0 || s.status === 'LATE' || s.status === 'PENDING');
    
    // Total owed is (rentAmount - alreadyPaid) for each month up to today
    let totalOwed = 0;
    const now = new Date();
    const currentMonthKey = toMonthKey(now);
    
    // We only care about months up to the current month for "balance owed"
    // Future months are not "owed" yet.
    
    for (const [monthKey, paid] of Array.from(coveredMonths.entries())) {
        if (monthKey <= currentMonthKey) {
            // This doesn't account for months with 0 payment records.
        }
    }

    // Better way: use the slots from splitRentPayment(0, today, ...)
    // These slots are all the months from lease start to today (and maybe 12 months ahead)
    // but the loop in splitRentPayment has:
    // const endMonth = paid.getMonth() + 12;
    // We should filter slots where date_due <= today (or end of current month)
    
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);
    
    const relevantSlots = slots.filter(s => {
        const d = new Date(s.date_due);
        return d <= todayObj;
    });

    totalOwed = relevantSlots.reduce((acc, s) => {
        const paidForThisMonth = coveredMonths.get(s.month) || 0;
        return acc + (rentAmount - paidForThisMonth);
    }, 0);

    const rentArrears = relevantSlots.filter(s => (coveredMonths.get(s.month) || 0) < rentAmount).map(s => ({
        type: 'RENT',
        month: s.month,
        label: `${s.label} (Rent)`,
        amountPaid: coveredMonths.get(s.month) || 0,
        amountOwed: rentAmount - (coveredMonths.get(s.month) || 0),
        status: s.status
    }));

    // Find other unpaid payments (Maintenance, Late Fees, etc.)
    const otherArrears = existingPayments
        .filter(p => p.payment_type !== 'RENT' && ['PENDING', 'LATE', 'FAILED', 'SEVERE', 'DEFAULTED'].includes(p.status))
        .map(p => ({
            type: p.payment_type,
            label: p.payment_type,
            amountPaid: 0, // In this simplified model, non-rent items are either paid or not in full
            amountOwed: p.amount,
            status: p.status
        }));

    const allArrears = [...rentArrears, ...otherArrears];
    const grandTotalOwed = allArrears.reduce((acc, a) => acc + a.amountOwed, 0);

    return {
        totalOwed: grandTotalOwed,
        unpaidMonths: allArrears
    };
}
