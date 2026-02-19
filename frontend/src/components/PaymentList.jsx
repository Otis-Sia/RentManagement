import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, DollarSign, Calendar, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddPaymentModal from './AddPaymentModal';

const entityLinkStyle = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: 500
};

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

    const [activeTab, setActiveTab] = useState('ALL');

    const filteredPayments = payments.filter(payment => {
        // First apply tab filter
        if (activeTab === 'LATE') {
            if (payment.status !== 'LATE' && payment.status !== 'FAILED') {
                return false;
            }
        }

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

            <div className="tabs-container" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px' }}>
                <button
                    className={`tab-button ${activeTab === 'ALL' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ALL')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'ALL' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        color: activeTab === 'ALL' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'ALL' ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    All Payments
                </button>
                <button
                    className={`tab-button ${activeTab === 'LATE' ? 'active' : ''}`}
                    onClick={() => setActiveTab('LATE')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'LATE' ? '2px solid var(--danger-color)' : '2px solid transparent',
                        color: activeTab === 'LATE' ? 'var(--danger-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'LATE' ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    Late/Failed Payments
                    {payments.filter(p => p.status === 'LATE' || p.status === 'FAILED').length > 0 && (
                        <span style={{
                            backgroundColor: 'var(--danger-color)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}>
                            {payments.filter(p => p.status === 'LATE' || p.status === 'FAILED').length}
                        </span>
                    )}
                </button>
            </div>

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
                {activeTab === 'ALL' && (
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
                )}
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
                                    <div className="tenant-name">
                                        {payment.tenant ? (
                                            <Link to={`/tenants/${payment.tenant}`} style={entityLinkStyle}>
                                                {payment.tenant_name}
                                            </Link>
                                        ) : (
                                            payment.tenant_name
                                        )}
                                    </div>
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
                                        {payment.house_id ? (
                                            <Link to={`/houses/${payment.house_id}`} style={entityLinkStyle}>
                                                House {payment.house_number}
                                            </Link>
                                        ) : (
                                            `House ${payment.house_number}`
                                        )}
                                    </div>
                                )}
                                <div className="payment-status-badge" style={{ color: statusColor }}>
                                    <StatusIcon size={14} />
                                    {payment.status}
                                </div>
                                {(payment.status === 'LATE' || payment.status === 'FAILED') && (
                                    <button
                                        onClick={() => {
                                            const phone = (payment.tenant_phone || '').replace(/[^\d]/g, '');
                                            const message = [
                                                `Hello ${payment.tenant_name},`,
                                                ``,
                                                `This is a payment reminder regarding your outstanding ${payment.payment_type} payment of ${formatCurrency(payment.amount)}.`,
                                                ``,
                                                `*Reason:* Payment request for ${payment.payment_type}${payment.house_number ? ` — House ${payment.house_number}` : ''}`,
                                                `*Due Date:* ${formatDate(payment.date_due)}`,
                                                `*Payment Type:* ${payment.payment_type}`,
                                                `*Amount:* ${formatCurrency(payment.amount)}`,
                                                ``,
                                                `Please arrange payment at your earliest convenience. Thank you.`
                                            ].join('\n');
                                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                                            window.open(url, '_blank');
                                        }}
                                        style={{
                                            marginTop: '8px',
                                            padding: '6px 12px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #25D366',
                                            color: '#25D366',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#25D366';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#25D366';
                                        }}
                                    >
                                        <Send size={14} />
                                        Request Payment
                                    </button>
                                )}
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
