import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import AddMaintenanceModal from './AddMaintenanceModal';

const entityLinkStyle = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: 500
};

const MaintenanceList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/maintenance/');
            const data = await response.json();
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            setLoading(false);
        }
    };

    const handleRequestAdded = (newRequest) => {
        setRequests(prev => [...prev, newRequest]);
        fetchRequests();
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
            case 'EMERGENCY': return 'var(--danger-color)';
            case 'MEDIUM': return 'var(--accent-color)';
            case 'LOW': return 'var(--success-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return AlertTriangle;
            case 'IN_PROGRESS': return Clock;
            case 'COMPLETED': return CheckCircle;
            case 'CANCELLED': return XCircle;
            default: return AlertTriangle;
        }
    };

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.tenant_name && req.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.house_number && req.house_number.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (loading) return <div>Loading maintenance requests...</div>;

    return (
        <div className="container">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Maintenance</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Track work orders and repairs</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    New Request
                </button>
            </header>

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search requests, houses, or tenants..."
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
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--text-secondary)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontSize: '1rem',
                        minWidth: '150px'
                    }}
                >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--text-secondary)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontSize: '1rem',
                        minWidth: '150px'
                    }}
                >
                    <option value="ALL">All Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filteredRequests.map(req => {
                    const StatusIcon = getStatusIcon(req.status);
                    const priorityColor = getPriorityColor(req.priority);

                    return (
                        <div key={req.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--surface-dark)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Wrench size={24} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{req.title}</h3>
                                        {req.house_number && (
                                            <span style={{ marginLeft: '1rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--surface-dark)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                                {req.house_id ? (
                                                    <Link to={`/houses/${req.house_id}`} style={{ color: 'white', textDecoration: 'none' }}>
                                                        House {req.house_number}
                                                    </Link>
                                                ) : (
                                                    `House ${req.house_number}`
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: 500 }}>
                                        {req.tenant ? (
                                            <Link to={`/tenants/${req.tenant}`} style={entityLinkStyle}>
                                                {req.tenant_name}
                                            </Link>
                                        ) : (
                                            req.tenant_name
                                        )}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '600px' }}>
                                        {req.description}
                                    </p>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: `color-mix(in srgb, ${priorityColor} 15%, transparent)`,
                                            color: priorityColor,
                                            fontWeight: 600
                                        }}>
                                            {req.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontWeight: 500 }}>
                                    <StatusIcon size={16} />
                                    {req.status.replace('_', ' ')}
                                </div>
                                {req.cost && <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Cost: {formatCurrency(req.cost)}</div>}
                            </div>
                        </div>
                    );
                })}
                {filteredRequests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No maintenance requests found.
                    </div>
                )}
            </div>

            <AddMaintenanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRequestAdded={handleRequestAdded}
            />
        </div>
    );
};

export default MaintenanceList;
