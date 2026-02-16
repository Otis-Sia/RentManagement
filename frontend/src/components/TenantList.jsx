import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, Mail, FileText, Home, Calendar } from 'lucide-react';
import AddTenantModal from './AddTenantModal';
import { formatCurrency } from '../utils/format';

const TenantList = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await fetch('/api/tenants/');
            const data = await response.json();
            setTenants(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            setLoading(false);
        }
    };

    const handleTenantAdded = (newTenant) => {
        setTenants(prev => [...prev, newTenant]);
        // Optionally refetch to ensure sync
        fetchTenants();
    };

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' ? tenant.is_active : !tenant.is_active);

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div>Loading tenants...</div>;

    return (
        <div className="container">
            <header className="page-header" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Tenants</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your residents and leases</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add Tenant
                </button>
            </header>

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search tenants by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--text-secondary)',
                            backgroundColor: 'transparent',
                            color: 'inherit',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        flex: '0 1 auto',
                        minWidth: '150px',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--text-secondary)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontSize: '1rem'
                    }}
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active Lease</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filteredTenants.map(tenant => (
                    <div
                        key={tenant.id}
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => navigate(`/tenants/${tenant.id}`)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-color)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '1.25rem',
                                flexShrink: 0
                            }}>
                                {tenant.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{tenant.name}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {tenant.email}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {tenant.phone}</span>
                                    {tenant.house_number && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Home size={14} /> {tenant.house_number}</span>
                                    )}
                                    {tenant.rent_due_day && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Due day: {tenant.rent_due_day}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formatCurrency(tenant.rent_amount)}/mo</div>
                            <div style={{ fontSize: '0.875rem', color: tenant.is_active ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                                {tenant.is_active ? 'Active Lease' : 'Inactive'}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredTenants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No tenants found matching your search.
                    </div>
                )}
            </div>

            <AddTenantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTenantAdded={handleTenantAdded}
            />
        </div>
    );
};

export default TenantList;
