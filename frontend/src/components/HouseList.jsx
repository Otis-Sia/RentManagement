import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, Users, Pencil, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HouseModal from './HouseModal';
import { formatCurrency } from '../utils/format';

const HouseList = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHouses();
    }, []);

    const fetchHouses = async () => {
        try {
            const response = await fetch('/api/houses/');
            const data = await response.json();
            setHouses(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching houses:', error);
            setLoading(false);
        }
    };

    const handleHouseSaved = (savedHouse) => {
        if (selectedHouse) {
            setHouses(prev => prev.map(h => h.id === savedHouse.id ? savedHouse : h));
        } else {
            setHouses(prev => [...prev, savedHouse]);
        }
        setSelectedHouse(null);
        // fetchHouses(); // Optional: Re-fetch if needed, but local update is faster
    };

    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredHouses = houses.filter(house => {
        const matchesSearch = house.house_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            house.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'OCCUPIED' ? house.is_occupied : !house.is_occupied);

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div>Loading houses...</div>;

    return (
        <div className="container">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Houses</h1>
                    <p style={{ color: 'var(--text-secondary-light)', marginTop: '0.5rem' }}>Manage your properties and tenants</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add House
                </button>
            </header>

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-light)' }} />
                    <input
                        type="text"
                        placeholder="Search houses by number or address..."
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
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--text-secondary-light)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontSize: '1rem',
                        minWidth: '150px'
                    }}
                >
                    <option value="ALL">All Status</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="VACANT">Vacant</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {filteredHouses.map(house => (
                    <div
                        key={house.id}
                        className="card"
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => navigate(`/houses/${house.id}`)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: house.is_occupied ? 'var(--primary-color)' : 'var(--text-secondary-light)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '1.25rem'
                            }}>
                                <Home size={24} />
                            </div>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: house.is_occupied ? 'var(--success-color)' : 'var(--text-secondary-light)',
                                color: 'white'
                            }}>
                                {house.is_occupied ? 'Occupied' : 'Vacant'}
                            </span>
                        </div>

                        <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedHouse(house);
                                    setIsModalOpen(true);
                                }}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid var(--text-secondary-light)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="Edit House"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>

                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>House {house.house_number}</h3>
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary-light)', fontSize: '0.875rem' }}>
                            {house.address}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--text-secondary-light)' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary-light)' }}>Rent</p>
                                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{formatCurrency(house.monthly_rent)}/mo</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary-light)' }}>Beds/Baths</p>
                                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{house.bedrooms}/{house.bathrooms}</p>
                            </div>
                        </div>

                        {house.current_tenant_name && (
                            <div style={{ marginTop: 'var(--spacing-md)', padding: '0.5rem', backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: house.latest_payment_status ? '0.25rem' : 0 }}>
                                    <Users size={14} color="var(--primary-color)" />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>{house.current_tenant_name}</span>
                                </div>
                                {house.latest_payment_status && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                        {house.latest_payment_status.status === 'PAID' && <CheckCircle size={12} color="var(--success-color)" />}
                                        {house.latest_payment_status.status === 'LATE' && <AlertCircle size={12} color="var(--warning-color)" />}
                                        {house.latest_payment_status.status === 'FAILED' && <AlertCircle size={12} color="var(--danger-color)" />}
                                        {house.latest_payment_status.status === 'PENDING' && <Clock size={12} color="var(--accent-color)" />}

                                        <span style={{
                                            color: house.latest_payment_status.status === 'PAID' ? 'var(--success-color)' :
                                                house.latest_payment_status.status === 'LATE' ? 'var(--warning-color)' :
                                                    house.latest_payment_status.status === 'FAILED' ? 'var(--danger-color)' :
                                                        'var(--text-secondary-light)',
                                            fontWeight: 600
                                        }}>
                                            {house.latest_payment_status.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {filteredHouses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary-light)', gridColumn: '1 / -1' }}>
                        No houses found matching your search.
                    </div>
                )}
            </div>

            <HouseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedHouse(null);
                }}
                onHouseSaved={handleHouseSaved}
                house={selectedHouse}
            />
        </div>
    );
};

export default HouseList;
