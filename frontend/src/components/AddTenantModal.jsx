import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded, preselectedPropertyId }) => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        property: preselectedPropertyId || '',
        email: '',
        phone: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '',
        deposit: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
        }
    }, [isOpen]);

    useEffect(() => {
        // Update property if preselectedPropertyId changes
        if (preselectedPropertyId) {
            setFormData(prev => ({ ...prev, property: preselectedPropertyId }));
        }
    }, [preselectedPropertyId]);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/houses/');
            const data = await response.json();
            setProperties(data);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tenants/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    property: formData.property ? parseInt(formData.property) : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            onTenantAdded(data);
            onClose();
            // Reset form (keep property if preselected)
            setFormData({
                name: '',
                property: preselectedPropertyId || '',
                email: '',
                phone: '',
                lease_start: '',
                lease_end: '',
                rent_amount: '',
                deposit: '',
                is_active: true
            });
        } catch (err) {
            console.error('Error adding tenant:', err);
            setError(err.message || 'Failed to add tenant');
        } finally {
            setLoading(false);
        }
    };

    // Style for inputs (force visible text color)
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--text-secondary-light)',
        backgroundColor: 'var(--background-light)',
        color: 'var(--text-primary-light)' // Force dark text 
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Add New Tenant</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>House / Property</label>
                        <select
                            name="property"
                            value={formData.property}
                            onChange={handleChange}
                            required
                            disabled={!!preselectedPropertyId}
                            style={{
                                ...inputStyle,
                                opacity: preselectedPropertyId ? 0.7 : 1,
                            }}
                        >
                            <option value="">Select a property</option>
                            {properties.map(property => (
                                <option key={property.id} value={property.id} disabled={property.is_occupied && property.id !== parseInt(preselectedPropertyId)}>
                                    House {property.house_number} {property.is_occupied ? '(Occupied)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Lease Start</label>
                            <input
                                type="date"
                                name="lease_start"
                                value={formData.lease_start}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Lease End</label>
                            <input
                                type="date"
                                name="lease_end"
                                value={formData.lease_end}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rent Amount (KSh)</label>
                            <input
                                type="number"
                                name="rent_amount"
                                value={formData.rent_amount}
                                onChange={handleChange}
                                step="0.01"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deposit (KSh)</label>
                            <input
                                type="number"
                                name="deposit"
                                value={formData.deposit}
                                onChange={handleChange}
                                step="0.01"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTenantModal;
