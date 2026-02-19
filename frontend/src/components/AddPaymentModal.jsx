import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const AddPaymentModal = ({ isOpen, onClose, onPaymentAdded }) => {
    const [properties, setProperties] = useState([]);
    const [arrearsPayments, setArrearsPayments] = useState([]);
    const [formData, setFormData] = useState({
        tenant: '', // This will store the tenant ID
        house_id: '', // Just for UI state, not sent to backend if backend expects tenant
        amount: '',
        date_due: '',
        date_paid: '',
        payment_type: 'RENT',
        // status is removed from initial state as it's calculated
        transaction_id: '',
        clear_arrears_payment_id: '',
        all_inclusive: false
    });
    const [calculatedStatus, setCalculatedStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
            fetchArrearsPayments();
        }
    }, [isOpen]);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/houses/');
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
                all_inclusive: value ? false : prev.all_inclusive,
                date_paid: value && !prev.date_paid ? today : prev.date_paid
            }));
            return;
        }

        if (name === 'all_inclusive') {
            const checked = e.target.checked;
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                all_inclusive: checked,
                clear_arrears_payment_id: checked ? '' : prev.clear_arrears_payment_id,
                date_paid: checked && !prev.date_paid ? today : prev.date_paid
            }));
            return;
        }

        if (name === 'payment_type') {
            if (value === 'RENT_ALL_INCLUSIVE') {
                setFormData(prev => ({
                    ...prev,
                    payment_type: 'RENT',
                    all_inclusive: true,
                    // Auto-disable clear arrears if all inclusive is selected (logic handled in render mostly, but good to keep state consistent)
                    clear_arrears_payment_id: ''
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    payment_type: value,
                    all_inclusive: false
                }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Effect to calculate status for preview
    useEffect(() => {
        if (!formData.date_due) {
            setCalculatedStatus('PENDING');
            return;
        }

        const due = new Date(formData.date_due);
        const effectiveDate = formData.date_paid ? new Date(formData.date_paid) : new Date();

        // Calculate difference in days
        const diffTime = effectiveDate - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            setCalculatedStatus(formData.date_paid ? 'PAID' : 'PENDING');
        } else if (formData.date_paid && diffDays <= 5) {
            setCalculatedStatus('PAID');
        } else if (formData.date_paid) {
            setCalculatedStatus('PAID');
        } else if (diffDays > 90) {
            setCalculatedStatus('DEFAULTED');
        } else if (diffDays > 35) {
            if (formData.payment_type === 'RENT') {
                const rentFailedCount = arrearsPayments.filter(payment =>
                    parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) &&
                    payment.payment_type === 'RENT' &&
                    payment.status === 'FAILED'
                ).length;

                setCalculatedStatus(rentFailedCount >= 2 ? 'SEVERE' : 'FAILED');
            } else {
                setCalculatedStatus('FAILED');
            }
        } else if (diffDays > 5) {
            const hasExistingLate = arrearsPayments.some(payment =>
                parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) && payment.status === 'LATE'
            );

            if (!hasExistingLate) {
                setCalculatedStatus('LATE');
            } else if (formData.payment_type === 'RENT') {
                const rentFailedCount = arrearsPayments.filter(payment =>
                    parseInt(payment.tenant, 10) === parseInt(formData.tenant, 10) &&
                    payment.payment_type === 'RENT' &&
                    payment.status === 'FAILED'
                ).length;
                setCalculatedStatus(rentFailedCount >= 2 ? 'SEVERE' : 'FAILED');
            } else {
                setCalculatedStatus('FAILED');
            }
        } else {
            setCalculatedStatus('PENDING');
        }
    }, [formData.date_due, formData.date_paid, formData.tenant, formData.payment_type, arrearsPayments]);

    if (!isOpen) return null;

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
            const submitData = {
                tenant: parseInt(formData.tenant),
                amount: formData.amount,
                date_due: formData.date_due,
                date_paid: formData.date_paid || null,
                payment_type: formData.payment_type,
                // status is handled by backend
                transaction_id: formData.transaction_id,
                clear_arrears_payment_id: formData.clear_arrears_payment_id ? parseInt(formData.clear_arrears_payment_id, 10) : null,
                all_inclusive: formData.payment_type === 'RENT' ? formData.all_inclusive : false
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
            onClose();
            // Reset form
            setFormData({
                tenant: '',
                house_id: '',
                amount: '',
                date_due: '',
                date_paid: '',
                payment_type: 'RENT',
                transaction_id: '',
                clear_arrears_payment_id: '',
                all_inclusive: false
            });
        } catch (err) {
            console.error('Error adding payment:', err);
            setError(err.message || 'Failed to add payment');
        } finally {
            setLoading(false);
        }
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
        <div style={{
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
            <div className="card" style={{
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
                                value={formData.all_inclusive && formData.payment_type === 'RENT' ? 'RENT_ALL_INCLUSIVE' : formData.payment_type}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            >
                                <option value="RENT">Rent</option>
                                <option value="RENT_ALL_INCLUSIVE">Rent (All Inclusive)</option>
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
                                            (calculatedStatus === 'FAILED' || calculatedStatus === 'SEVERE' || calculatedStatus === 'DEFAULTED') ? 'var(--danger-color)' :
                                                'var(--text-secondary)',
                                fontWeight: 600
                            }}>
                                {calculatedStatus}
                                {(calculatedStatus === 'FAILED' || calculatedStatus === 'SEVERE' || calculatedStatus === 'DEFAULTED') && (
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                                        {calculatedStatus === 'DEFAULTED' ? '⚠️ Payment is over 90 days late!' : '⚠️ Payment is over 35 days late!'}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date Paid (Optional)</label>
                            <input
                                type="date"
                                name="date_paid"
                                value={formData.date_paid}
                                onChange={handleChange}
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
                                disabled={formData.payment_type === 'RENT' && formData.all_inclusive}
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
    );
};

export default AddPaymentModal;
