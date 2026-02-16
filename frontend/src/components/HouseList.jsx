import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddHouseModal from './AddHouseModal';
import { formatCurrency } from '../utils/format';

const HouseList = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleHouseAdded = (newHouse) => {
        setHouses(prev => [...prev, newHouse]);
        fetchHouses();
    };

    const filteredHouses = houses.filter(house =>
        house.house_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ position: 'relative' }}>
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
                            <div style={{ marginTop: 'var(--spacing-md)', padding: '0.5rem', backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={14} color="var(--primary-color)" />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>{house.current_tenant_name}</span>
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

            <AddHouseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onHouseAdded={handleHouseAdded}
            />
        </div>
    );
};

export default HouseList;
