import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddPaymentModal = ({ isOpen, onClose, onPaymentAdded }) => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        tenant: '', // This will store the tenant ID
        house_id: '', // Just for UI state, not sent to backend if backend expects tenant
        amount: '',
        date_due: '',
        date_paid: '',
        payment_type: 'RENT',
        // status is removed from initial state as it's calculated
        transaction_id: ''
    });
    const [calculatedStatus, setCalculatedStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
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

    const handleHouseChange = (e) => {
        const houseId = parseInt(e.target.value);
        const house = properties.find(p => p.id === houseId);

        if (house && house.current_tenant_id) {
            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: house.current_tenant_id,
                // Optional: Auto-fill rent amount if not set
                amount: prev.amount || house.monthly_rent || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

        if (!formData.date_paid) {
            setCalculatedStatus('PENDING');
            return;
        }

        const due = new Date(formData.date_due);
        const paid = new Date(formData.date_paid);

        // Calculate difference in days
        const diffTime = paid - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            setCalculatedStatus('PAID');
        } else if (diffDays > 30) {
            setCalculatedStatus('FAILED');
        } else {
            setCalculatedStatus('LATE');
        }
    }, [formData.date_due, formData.date_paid]);

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
                transaction_id: formData.transaction_id
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
                transaction_id: ''
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
        border: '1px solid var(--text-secondary-light)',
        backgroundColor: 'var(--background-light)',
        color: 'var(--text-primary-light)' // Force dark text 
    };

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
                        <select
                            name="house_id"
                            value={formData.house_id}
                            onChange={handleHouseChange}
                            required
                            style={inputStyle}
                        >
                            <option value="">Select a house</option>
                            {properties.map(property => (
                                <option key={property.id} value={property.id}>
                                    House {property.house_number} ({property.current_tenant_name})
                                </option>
                            ))}
                        </select>
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
                                <option value="RENT">Rent</option>
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
                                backgroundColor: 'var(--background-light)',
                                border: '1px solid var(--text-secondary-light)',
                                color:
                                    calculatedStatus === 'PAID' ? 'var(--success-color)' :
                                        calculatedStatus === 'LATE' ? 'var(--warning-color)' :
                                            calculatedStatus === 'FAILED' ? 'var(--danger-color)' :
                                                'var(--text-secondary-light)',
                                fontWeight: 600
                            }}>
                                {calculatedStatus}
                                {calculatedStatus === 'FAILED' && (
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                                        ⚠️ Payment is over 30 days late!
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
