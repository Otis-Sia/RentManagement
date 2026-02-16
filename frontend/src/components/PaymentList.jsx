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
            case 'LATE': return 'var(--warning-color)';
            case 'FAILED': return 'var(--danger-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'PENDING': return Clock;
            case 'LATE': return AlertCircle;
            case 'FAILED': return AlertCircle;
            default: return AlertCircle;
        }
    };

    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.tenant_name && payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.house_number && payment.house_number.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div>Loading payments...</div>;

    const failedPayments = payments.filter(p => p.status === 'FAILED');

    return (
        <div className="container payment-container">
            {failedPayments.length > 0 && (
                <div className="payment-alert">
                    <AlertCircle size={24} />
                    <div>
                        <strong>Action Required:</strong> {failedPayments.length} payment(s) have failed (over 30 days late).
                    </div>
                </div>
            )}

            <header className="page-header payment-page-header">
                <div className="header-content">
                    <h1>Payments</h1>
                    <p>Track rent and fee collections</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Record Payment
                </button>
            </header>

            <div className="card payment-filters">
                <div className="payment-search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search payments, tenants, or houses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="payment-status-select"
                >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="LATE">Late</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            <div className="payment-list">
                {filteredPayments.map(payment => {
                    const StatusIcon = getStatusIcon(payment.status);
                    const statusColor = getStatusColor(payment.status);

                    return (
                        <div key={payment.id} className="card payment-card">
                            <div className="payment-info-wrapper">
                                <div className="payment-icon-wrapper" style={{
                                    backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
                                    color: statusColor
                                }}>
                                    <DollarSign size={24} />
                                </div>
                                <div className="payment-details">
                                    <h3>{payment.payment_type}</h3>
                                    <div className="tenant-name">{payment.tenant_name}</div>
                                    <div className="payment-meta">
                                        <span>
                                            <Calendar size={14} /> Due: {formatDate(payment.date_due)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-amount-wrapper">
                                <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                                {payment.house_number && (
                                    <div className="payment-house-info">
                                        House {payment.house_number}
                                    </div>
                                )}
                                <div className="payment-status-badge" style={{ color: statusColor }}>
                                    <StatusIcon size={14} />
                                    {payment.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredPayments.length === 0 && (
                    <div className="payment-empty-state">
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
