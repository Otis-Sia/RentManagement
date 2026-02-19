import React, { useState, useEffect } from 'react';
import { Plus, Search, Home, Users, Pencil, AlertCircle, CheckCircle, Clock, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HouseModal from './HouseModal';
import { formatCurrency } from '../utils/format';
import { api } from '../utils/api';

const entityLinkStyle = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: 500
};

const HouseList = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('HOUSES');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHouses();
    }, []);

    const fetchHouses = async () => {
        try {
            // Use offline-aware API wrapper
            const data = await api.get('/api/houses/');
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

    const buildings = Object.values(
        houses.reduce((acc, house) => {
            const buildingAddress = (house.address || 'Unknown Address').trim();
            const key = buildingAddress.toLowerCase();

            if (!acc[key]) {
                acc[key] = {
                    key,
                    address: buildingAddress,
                    totalUnits: 0,
                    occupiedUnits: 0,
                    vacantUnits: 0,
                    totalMonthlyRent: 0,
                    houses: []
                };
            }

            acc[key].totalUnits += 1;
            acc[key].occupiedUnits += house.is_occupied ? 1 : 0;
            acc[key].vacantUnits += house.is_occupied ? 0 : 1;
            acc[key].totalMonthlyRent += parseFloat(house.monthly_rent || 0);
            acc[key].houses.push(house);

            return acc;
        }, {})
    )
        .filter(building => building.address.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.address.localeCompare(b.address));

    if (loading) return <div>Loading houses...</div>;

    return (
        <div className="container">
            <header className="house-page-header">
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Houses</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your properties and tenants</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add House
                </button>
            </header>

            <div className="house-subtabs">
                <button
                    className={`house-subtab-button ${activeSubTab === 'HOUSES' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('HOUSES')}
                >
                    Houses ({houses.length})
                </button>
                <button
                    className={`house-subtab-button ${activeSubTab === 'BUILDINGS' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('BUILDINGS')}
                >
                    Buildings ({Object.keys(houses.reduce((acc, house) => {
                        const key = (house.address || 'Unknown Address').trim().toLowerCase();
                        acc[key] = true;
                        return acc;
                    }, {})).length})
                </button>
            </div>

            <div className="card house-filters">
                <div className="house-search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={activeSubTab === 'BUILDINGS' ? 'Search buildings by address...' : 'Search houses by number or address...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="house-search-input"
                    />
                </div>
                {activeSubTab === 'HOUSES' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="house-status-select"
                    >
                        <option value="ALL">All Status</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="VACANT">Vacant</option>
                    </select>
                )}
            </div>

            {activeSubTab === 'HOUSES' ? (
                <div className="house-grid">
                    {filteredHouses.map(house => (
                        <div
                            key={house.id}
                            className="card house-card"
                            onClick={() => navigate(`/houses/${house.id}`)}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                                <div className="house-icon-wrapper" style={{
                                    backgroundColor: house.is_occupied ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    color: 'white'
                                }}>
                                    <Home size={24} />
                                </div>
                                <span className="house-status-badge" style={{
                                    backgroundColor: house.is_occupied ? 'var(--success-color)' : 'var(--text-secondary)'
                                }}>
                                    {house.is_occupied ? 'Occupied' : 'Vacant'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>House {house.house_number}</h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedHouse(house);
                                        setIsModalOpen(true);
                                    }}
                                    className="house-edit-button"
                                    title="Edit House"
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>
                            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {house.address}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--text-secondary)' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rent</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{formatCurrency(house.monthly_rent)}/mo</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Beds/Baths</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{house.bedrooms}/{house.bathrooms}</p>
                                </div>
                            </div>

                            {house.current_tenant_name && (
                                <div style={{ marginTop: 'var(--spacing-md)', padding: '0.5rem', backgroundColor: 'var(--surface-dark)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: house.latest_payment_status ? '0.25rem' : 0 }}>
                                        <Users size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {house.current_tenant_id ? (
                                                <Link
                                                    to={`/tenants/${house.current_tenant_id}`}
                                                    style={entityLinkStyle}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {house.current_tenant_name}
                                                </Link>
                                            ) : (
                                                house.current_tenant_name
                                            )}
                                        </span>
                                    </div>
                                    {house.latest_payment_status && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                            {house.latest_payment_status.status === 'PAID' && <CheckCircle size={12} color="var(--success-color)" />}
                                            {house.latest_payment_status.status === 'LATE' && <AlertCircle size={12} color="var(--warning-color)" />}
                                            {house.latest_payment_status.status === 'FAILED' && <AlertCircle size={12} color="var(--danger-color)" />}
                                            {house.latest_payment_status.status === 'SEVERE' && <AlertCircle size={12} color="var(--danger-color)" />}
                                            {house.latest_payment_status.status === 'PENDING' && <Clock size={12} color="var(--accent-color)" />}

                                            <span style={{
                                                color: house.latest_payment_status.status === 'PAID' ? 'var(--success-color)' :
                                                    house.latest_payment_status.status === 'LATE' ? 'var(--warning-color)' :
                                                        (house.latest_payment_status.status === 'FAILED' || house.latest_payment_status.status === 'SEVERE') ? 'var(--danger-color)' :
                                                            'var(--text-secondary)',
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
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                            No houses found matching your search.
                        </div>
                    )}
                </div>
            ) : (
                <div className="building-grid">
                    {buildings.map((building) => (
                        <div key={building.key} className="card building-card">
                            <div className="building-card-header">
                                <div className="house-icon-wrapper" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                                    <Building size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{building.address}</h3>
                            </div>

                            <div className="building-metrics">
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Units</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{building.totalUnits}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Occupied</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{building.occupiedUnits}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vacant</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{building.vacantUnits}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Rent</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{formatCurrency(building.totalMonthlyRent)}/mo</p>
                                </div>
                            </div>

                            <p className="building-units">
                                Houses: {building.houses.map(house => house.house_number).join(', ')}
                            </p>
                        </div>
                    ))}
                    {buildings.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                            No buildings found matching your search.
                        </div>
                    )}
                </div>
            )}

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
