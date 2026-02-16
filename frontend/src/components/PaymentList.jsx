import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddPaymentModal from './AddPaymentModal';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await fetch('/api/payments/');
            const data = await response.json();
            setPayments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setLoading(false);
        }
    };

    const handlePaymentAdded = (newPayment) => {
        setPayments(prev => [...prev, newPayment]);
        fetchPayments();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'var(--success-color)';
            case 'PENDING': return 'var(--accent-color)';
            case 'LATE': return 'var(--danger-color)';
            case 'FAILED': return 'var(--text-secondary-light)';
            default: return 'var(--text-secondary-light)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'PENDING': return Clock;
            case 'LATE': return AlertCircle;
            default: return AlertCircle;
        }
    };

    const filteredPayments = payments.filter(payment =>
        payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.tenant_name && payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.house_number && payment.house_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div>Loading payments...</div>;

    return (
        <div className="container">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Payments</h1>
                    <p style={{ color: 'var(--text-secondary-light)', marginTop: '0.5rem' }}>Track rent and fee collections</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Record Payment
                </button>
            </header>

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-light)' }} />
                    <input
                        type="text"
                        placeholder="Search payments, tenants, or houses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--text-secondary-light)',
                            backgroundColor: 'transparent',
                            color: 'inherit',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filteredPayments.map(payment => {
                    const StatusIcon = getStatusIcon(payment.status);
                    const statusColor = getStatusColor(payment.status);

                    return (
                        <div key={payment.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
                                    color: statusColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{payment.payment_type}</h3>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.125rem' }}>{payment.tenant_name}</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', color: 'var(--text-secondary-light)', fontSize: '0.875rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={14} /> Due: {formatDate(payment.date_due)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formatCurrency(payment.amount)}</div>
                                {payment.house_number && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary-light)', marginTop: '0.25rem' }}>
                                        House {payment.house_number}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.875rem', color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    <StatusIcon size={14} />
                                    {payment.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredPayments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary-light)' }}>
                        No payments found.
                    </div>
                )}
            </div>

            <AddPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPaymentAdded={handlePaymentAdded}
            />
        </div>
    );
};

export default PaymentList;
