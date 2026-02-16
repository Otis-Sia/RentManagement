import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, DollarSign, Wrench, Clock, CheckCircle, Plus, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddTenantModal from './AddTenantModal';
import HouseModal from './HouseModal';

const HouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [house, setHouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchHouseDetail();
    }, [id]);

    const fetchHouseDetail = async () => {
        try {
            const response = await fetch(`/api/houses/${id}/`);
            const data = await response.json();
            setHouse(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching house details:', error);
            setLoading(false);
        }
    };

    const handleTenantAdded = () => {
        fetchHouseDetail(); // Refresh data to show new tenant
    };

    const handleHouseUpdated = (updatedHouse) => {
        setHouse(prev => ({ ...prev, ...updatedHouse }));
    };

    if (loading) return <div>Loading house details...</div>;
    if (!house) return <div>House not found</div>;

    return (
        <div className="container">
            <button
                onClick={() => navigate('/houses')}
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
                Back to Houses
            </button>

            {/* Property Information */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Home size={32} />
                                House {house.house_number}
                            </h1>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--text-secondary-light)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary-light)',
                                    transition: 'all 0.2s'
                                }}
                                title="Edit House Details"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary-light)', marginTop: '0.5rem', fontSize: '1rem' }}>
                            {house.address}
                        </p>
                    </div>
                    <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: house.is_occupied ? 'var(--success-color)' : 'var(--text-secondary-light)',
                        color: 'white'
                    }}>
                        {house.is_occupied ? 'Occupied' : 'Vacant'}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--text-secondary-light)' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Monthly Rent</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(house.monthly_rent)}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Bedrooms</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{house.bedrooms}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Bathrooms</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{house.bathrooms}</p>
                    </div>
                    {house.square_feet && (
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Square Feet</p>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{house.square_feet}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Current Tenant */}
            {house.current_tenant ? (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={24} />
                        Current Tenant
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Name</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{house.current_tenant.name}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Email</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{house.current_tenant.email}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Phone</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{house.current_tenant.phone}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Lease Period</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>
                                {formatDate(house.current_tenant.lease_start)} - {formatDate(house.current_tenant.lease_end)}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={24} />
                            No Current Tenant
                        </h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary-light)' }}>This property is currently vacant.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsAddTenantModalOpen(true)}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Add Tenant
                    </button>
                </div>
            )}

            {/* Payment History */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={24} />
                    Payment History
                </h2>
                {house.payment_history && house.payment_history.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--text-secondary-light)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Tenant</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Amount</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Due Date</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Paid Date</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {house.payment_history.map((payment) => (
                                    <tr key={payment.id} style={{ borderBottom: '1px solid var(--text-secondary-light)' }}>
                                        <td style={{ padding: '0.75rem' }}>{payment.tenant_name}</td>
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
                    <p style={{ color: 'var(--text-secondary-light)', textAlign: 'center', padding: '2rem' }}>No payment history</p>
                )}
            </div>

            {/* Maintenance Requests */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={24} />
                    Maintenance Requests
                </h2>
                {house.maintenance_requests && house.maintenance_requests.length > 0 ? (
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {house.maintenance_requests.map((request) => (
                            <div key={request.id} style={{ padding: 'var(--spacing-md)', border: '1px solid var(--text-secondary-light)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{request.title}</h3>
                                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>Tenant: {request.tenant_name}</p>
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
                                                        'var(--text-secondary-light)',
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
                                                        'var(--text-secondary-light)',
                                            color: 'white'
                                        }}>
                                            {request.status}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>{request.description}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>
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
                    <p style={{ color: 'var(--text-secondary-light)', textAlign: 'center', padding: '2rem' }}>No maintenance requests</p>
                )}
            </div>

            {/* Tenant History */}
            {house.tenant_history && house.tenant_history.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={24} />
                        Tenant History
                    </h2>
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        {house.tenant_history.map((tenant) => (
                            <div key={tenant.id} style={{ padding: 'var(--spacing-md)', border: '1px solid var(--text-secondary-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{tenant.name}</h3>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>
                                        {tenant.email} • {tenant.phone}
                                    </p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>
                                        {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
                                    </p>
                                </div>
                                {tenant.is_active && (
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: 'var(--success-color)',
                                        color: 'white'
                                    }}>
                                        CURRENT
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AddTenantModal
                isOpen={isAddTenantModalOpen}
                onClose={() => setIsAddTenantModalOpen(false)}
                onTenantAdded={handleTenantAdded}
                preselectedPropertyId={id}
            />

            <HouseModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onHouseSaved={handleHouseUpdated}
                house={house}
            />
        </div>
    );
};

export default HouseDetail;
