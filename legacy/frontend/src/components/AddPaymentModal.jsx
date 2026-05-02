import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import PaymentReceiptModal from './PaymentReceiptModal';

const AddPaymentModal = ({ isOpen, onClose, onPaymentAdded }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [properties, setProperties] = useState([]);
    const [arrearsPayments, setArrearsPayments] = useState([]);
    const [formData, setFormData] = useState({
        tenant: '', // This will store the tenant ID
        house_id: '', // Just for UI state, not sent to backend if backend expects tenant
        amount: '',
        date_due: '',
        date_paid: todayStr,
        payment_type: 'ALL_INCLUSIVE',
        payment_method: 'CASH',
        // status is removed from initial state as it's calculated
        transaction_id: '',
        notes: '',
        clear_arrears_payment_id: '',
    });
    const [calculatedStatus, setCalculatedStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
            fetchArrearsPayments();
        }
    }, [isOpen]);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/houses/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            // Filter only occupied properties for payments
            const occupiedProperties = data.filter(p => p.is_occupied);
            setProperties(occupiedProperties);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    };

    const fetchArrearsPayments = async () => {
        try {
            const response = await fetch('/api/payments/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setArrearsPayments(data.filter(
                payment => payment.status === 'LATE' || payment.status === 'FAILED' || payment.status === 'SEVERE' || payment.status === 'DEFAULTED'
            ));
        } catch (err) {
            console.error('Error fetching arrears payments:', err);
        }
    };

    const handleHouseChange = (e) => {
        const houseId = parseInt(e.target.value, 10) || 0;
        const house = properties.find(p => p.id === houseId);

        if (house && house.current_tenant_id) {
            let dueDate = '';

            // Auto-calculate due date based on lease agreement
            if (house.current_tenant_rent_due_day) {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                // Create date for current month with the agreed due day
                const agreedDate = new Date(currentYear, currentMonth, house.current_tenant_rent_due_day);

                // Format as YYYY-MM-DD
                // Adjust for timezone offset to ensure correct day is picked
                const offset = agreedDate.getTimezoneOffset();
                const adjustedDate = new Date(agreedDate.getTime() - (offset * 60 * 1000));
                dueDate = adjustedDate.toISOString().split('T')[0];
            }

            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: house.current_tenant_id,
                // Optional: Auto-fill rent amount if not set
                amount: prev.amount || house.monthly_rent || '',
                date_due: dueDate,
                clear_arrears_payment_id: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: '',
                date_due: '',
                clear_arrears_payment_id: ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'clear_arrears_payment_id') {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                [name]: value,
                payment_type: value ? (prev.payment_type === 'ALL_INCLUSIVE' ? 'RENT' : prev.payment_type) : prev.payment_type,
                date_paid: value && !prev.date_paid ? today : prev.date_paid
            }));
            return;
        }

        if (name === 'payment_type') {
            setFormData(prev => ({
                ...prev,
                payment_type: value,
                clear_arrears_payment_id: value === 'ALL_INCLUSIVE' ? '' : prev.clear_arrears_payment_id
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Effect to calculate status for preview
    // Aligned with backend payments/status.py thresholds
    useEffect(() => {
        if (!formData.date_due) {
            setCalculatedStatus('PENDING');
            return;
        }

        const LATE_AFTER_DAYS = 5;
        const FAILED_AFTER_DAYS = 35;
        const DEFAULTED_AFTER_DAYS = 90;
        const MAX_RENT_FAILED_BEFORE_SEVERE = 2;

        const due = new Date(formData.date_due);
        const effectiveDate = formData.date_paid ? new Date(formData.date_paid) : new Date();

        // Calculate difference in days
        const diffTime = effectiveDate - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Paid (even late) → always PAID
        if (formData.date_paid) {
            setCalculatedStatus('PAID');
            return;
        }

        // Not overdue
        if (diffDays <= 0) {
            setCalculatedStatus('PENDING');
            return;
        }

        // Unpaid escalation ladder
        if (diffDays > DEFAULTED_AFTER_DAYS) {
            setCalculatedStatus('DEFAULTED');
            return;
        }

        if (diffDays > FAILED_AFTER_DAYS) {
            if (formData.payment_type === 'RENT' || formData.payment_type === 'ALL_INCLUSIVE') {
                const rentFailedCount = arrearsPayments.filter(payment =>
                    parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) &&
                    payment.payment_type === 'RENT' &&
                    payment.status === 'FAILED'
                ).length;
                setCalculatedStatus(rentFailedCount >= MAX_RENT_FAILED_BEFORE_SEVERE ? 'SEVERE' : 'FAILED');
            } else {
                setCalculatedStatus('FAILED');
            }
            return;
        }

        if (diffDays > LATE_AFTER_DAYS) {
            const hasExistingLate = arrearsPayments.some(payment =>
                parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) && payment.status === 'LATE'
            );

            if (!hasExistingLate) {
                setCalculatedStatus('LATE');
            } else if (formData.payment_type === 'RENT' || formData.payment_type === 'ALL_INCLUSIVE') {
                const rentFailedCount = arrearsPayments.filter(payment =>
                    parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) &&
                    payment.payment_type === 'RENT' &&
                    payment.status === 'FAILED'
                ).length;
                setCalculatedStatus(rentFailedCount >= MAX_RENT_FAILED_BEFORE_SEVERE ? 'SEVERE' : 'FAILED');
            } else {
                setCalculatedStatus('FAILED');
            }
            return;
        }

        setCalculatedStatus('PENDING');
    }, [formData.date_due, formData.date_paid, formData.tenant, formData.payment_type, arrearsPayments]);

    if (!isOpen && !showReceipt) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.tenant) {
            setError('Selected house has no active tenant.');
            setLoading(false);
            return;
        }

        try {
            const isAllInclusive = formData.payment_type === 'ALL_INCLUSIVE';
            const submitData = {
                tenant: parseInt(formData.tenant),
                amount: formData.amount,
                date_due: formData.date_due,
                date_paid: formData.date_paid || null,
                payment_type: isAllInclusive ? 'RENT' : formData.payment_type,
                payment_method: formData.payment_method || 'CASH',
                // status is handled by backend
                transaction_id: formData.transaction_id,
                notes: formData.notes || '',
                clear_arrears_payment_id: formData.clear_arrears_payment_id ? parseInt(formData.clear_arrears_payment_id, 10) : null,
                all_inclusive: isAllInclusive
            };

            const response = await fetch('/api/payments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            onPaymentAdded(data);

            // Fetch and show receipt if payment is PAID
            if (data.status === 'PAID') {
                try {
                    const receiptResponse = await fetch(`/api/payments/${data.id}/receipt/`);
                    if (receiptResponse.ok) {
                        const receipt = await receiptResponse.json();
                        setReceiptData(receipt);
                        setShowReceipt(true);
                    }
                } catch (receiptErr) {
                    console.error('Error fetching receipt:', receiptErr);
                }
            }

            // Reset form
            setFormData({
                tenant: '',
                house_id: '',
                amount: '',
                date_due: '',
                date_paid: new Date().toISOString().split('T')[0],
                payment_type: 'ALL_INCLUSIVE',
                payment_method: 'CASH',
                transaction_id: '',
                notes: '',
                clear_arrears_payment_id: '',
            });

            // Only close the main modal if we're not showing a receipt
            if (data.status !== 'PAID') {
                onClose();
            }
        } catch (err) {
            console.error('Error adding payment:', err);
            setError(err.message || 'Failed to add payment');
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptClose = () => {
        setShowReceipt(false);
        setReceiptData(null);
        onClose();
    };

    // Style for inputs (force visible text color)
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--text-secondary)',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-primary)'
    };

    const tenantArrearsPayments = arrearsPayments.filter(
        payment => parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10)
    );

    return (
        <>
        {isOpen && (
        <div onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div onClick={(e) => e.stopPropagation()} className="card" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Record Payment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>House Number</label>
                        <SearchableSelect
                            name="house_id"
                            value={formData.house_id}
                            onChange={handleHouseChange}
                            required
                            options={properties.map(p => ({
                                id: p.id,
                                label: `House ${p.house_number} - ${p.address} (${p.current_tenant_name || 'Vacant'})`,
                                ...p // spread other props just in case
                            }))}
                            placeholder="Select a house"
                            labelKey="label"
                            valueKey="id"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Type</label>
                            <select
                                name="payment_type"
                                value={formData.payment_type}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            >
                                <option value="ALL_INCLUSIVE">All Inclusive (Rent + Clear Arrears)</option>
                                <option value="RENT">Rent Only</option>
                                <option value="DEPOSIT">Security Deposit</option>
                                <option value="FEE">Late Fee</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preview Status</label>
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--surface-color)',
                                border: '1px solid var(--text-secondary)',
                                color:
                                    calculatedStatus === 'PAID' ? 'var(--success-color)' :
                                        calculatedStatus === 'LATE' ? 'var(--warning-color)' :
                                            calculatedStatus === 'DEFAULTED' ? '#a855f7' :
                                                (calculatedStatus === 'FAILED' || calculatedStatus === 'SEVERE') ? 'var(--danger-color)' :
                                                    'var(--text-secondary)',
                                fontWeight: 600
                            }}>
                                {calculatedStatus}
                                {(calculatedStatus === 'FAILED' || calculatedStatus === 'SEVERE') && (
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                                        ⚠️ Payment is over 35 days late!
                                    </span>
                                )}
                                {calculatedStatus === 'DEFAULTED' && (
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#a855f7', marginTop: '0.25rem' }}>
                                        ⚠️ Payment is over 90 days late!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount (KSh)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date Due</label>
                            <input
                                type="date"
                                name="date_due"
                                value={formData.date_due}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date Paid</label>
                            <input
                                type="date"
                                name="date_paid"
                                value={formData.date_paid}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {formData.tenant && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Clear Arrears Payment (Optional)
                            </label>
                            <select
                                name="clear_arrears_payment_id"
                                value={formData.clear_arrears_payment_id}
                                onChange={handleChange}
                                disabled={formData.payment_type === 'ALL_INCLUSIVE'}
                                style={inputStyle}
                            >
                                <option value="">No arrears payment selected</option>
                                {tenantArrearsPayments.map(payment => (
                                    <option key={payment.id} value={payment.id}>
                                        {`${payment.status} - ${payment.payment_type} - Due ${payment.date_due} - KSh ${payment.amount}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}



                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Method</label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="MPESA">M-Pesa</option>
                                <option value="CASH">Cash</option>
                                <option value="BANK">Bank Transfer</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Transaction ID (Optional)</label>
                            <input
                                type="text"
                                name="transaction_id"
                                value={formData.transaction_id}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Any additional notes about this payment..."
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
        )}

        {/* Receipt Modal - shown immediately after payment, auto-sends WhatsApp */}
        <PaymentReceiptModal
            isOpen={showReceipt}
            onClose={handleReceiptClose}
            receiptData={receiptData}
            autoSendWhatsApp={true}
        />
        </>
    );
};

export default AddPaymentModal;
