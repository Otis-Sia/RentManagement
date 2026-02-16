import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Home, DollarSign, Wrench, Clock, CheckCircle, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const TenantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenantDetail();
    }, [id]);

    const fetchTenantDetail = async () => {
        try {
            const response = await fetch(`/api/tenants/${id}/`);
            const data = await response.json();
            setTenant(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tenant details:', error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading tenant details...</div>;
    if (!tenant) return <div>Tenant not found</div>;

    return (
        <div className="container">
            <button
                onClick={() => navigate('/tenants')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    marginBottom: 'var(--spacing-lg)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
            >
                <ArrowLeft size={16} />
                Back to Tenants
            </button>

            {/* Tenant Information */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <User size={32} />
                                {tenant.name}
                            </h1>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> {tenant.email}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} /> {tenant.phone}
                            </span>
                        </div>
                    </div>
                    <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: tenant.is_active ? 'var(--success-color)' : 'var(--text-secondary)',
                        color: 'white'
                    }}>
                        {tenant.is_active ? 'Active Lease' : 'Inactive'}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--text-secondary)' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Property</p>
                        {tenant.property ? (
                            <div
                                onClick={() => navigate(`/houses/${tenant.property}`)}
                                style={{
                                    margin: '0.5rem 0 0',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--primary-color)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Home size={18} />
                                House {tenant.house_number}
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({tenant.house_address})</span>
                            </div>
                        ) : (
                            <p style={{ margin: '0.5rem 0 0', fontWeight: 600, color: 'var(--text-secondary)' }}>No active property</p>
                        )}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Monthly Rent</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(tenant.rent_amount)}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Lease Period</p>
                        <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>
                            {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rent Due Day</p>
                        <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>Day {tenant.rent_due_day} of month</p>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={24} />
                    Payment History
                </h2>
                {tenant.payments && tenant.payments.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--text-secondary)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Amount</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Due Date</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Paid Date</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenant.payments.sort((a, b) => new Date(b.date_due) - new Date(a.date_due)).map((payment) => (
                                    <tr key={payment.id} style={{ borderBottom: '1px solid var(--text-secondary)' }}>
                                        <td style={{ padding: '0.75rem' }}>{payment.payment_type}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{formatCurrency(payment.amount)}</td>
                                        <td style={{ padding: '0.75rem' }}>{formatDate(payment.date_due)}</td>
                                        <td style={{ padding: '0.75rem' }}>{payment.date_paid ? formatDate(payment.date_paid) : '-'}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: payment.status === 'PAID' ? 'var(--success-color)' : payment.status === 'PENDING' ? 'var(--accent-color)' : 'var(--danger-color)',
                                                color: 'white'
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No payment history</p>
                )}
            </div>

            {/* Maintenance Requests */}
            <div className="card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={24} />
                    Maintenance Requests
                </h2>
                {tenant.maintenance_requests && tenant.maintenance_requests.length > 0 ? (
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {tenant.maintenance_requests.sort((a, b) => new Date(b.request_date) - new Date(a.request_date)).map((request) => (
                            <div key={request.id} style={{ padding: 'var(--spacing-md)', border: '1px solid var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{request.title}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor:
                                                request.priority === 'EMERGENCY' ? 'var(--danger-color)' :
                                                    request.priority === 'HIGH' ? 'var(--accent-color)' :
                                                        'var(--text-secondary)',
                                            color: 'white'
                                        }}>
                                            {request.priority}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor:
                                                request.status === 'COMPLETED' ? 'var(--success-color)' :
                                                    request.status === 'IN_PROGRESS' ? 'var(--accent-color)' :
                                                        'var(--text-secondary)',
                                            color: 'white'
                                        }}>
                                            {request.status}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>{request.description}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={14} />
                                        {formatDate(request.request_date)}
                                    </span>
                                    {request.cost && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <DollarSign size={14} />
                                            {formatCurrency(request.cost)}
                                        </span>
                                    )}
                                    {request.resolved_date && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CheckCircle size={14} />
                                            Resolved: {formatDate(request.resolved_date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No maintenance requests</p>
                )}
            </div>
        </div >
    );
};

export default TenantDetail;
