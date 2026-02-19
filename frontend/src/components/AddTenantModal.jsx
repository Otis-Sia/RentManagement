import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded, preselectedPropertyId, tenant = null }) => {
    const isEditMode = !!tenant;
    const getInitialFormData = () => ({
        name: tenant?.name || '',
        property: tenant?.property || preselectedPropertyId || '',
        email: tenant?.email || '',
        phone: tenant?.phone || '',
        lease_start: tenant?.lease_start || '',
        lease_end: tenant?.lease_end || '',
        rent_amount: tenant?.rent_amount || '',
        deposit: tenant?.deposit || '',
        rent_due_day: tenant?.rent_due_day || 1,
        is_active: tenant?.is_active ?? true
    });

    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState(getInitialFormData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
            setFormData(getInitialFormData());
        }
    }, [isOpen, tenant, preselectedPropertyId]);

    useEffect(() => {
        // Update property if preselectedPropertyId changes
        if (preselectedPropertyId && !isEditMode) {
            setFormData(prev => ({ ...prev, property: preselectedPropertyId }));
        }
    }, [preselectedPropertyId, isEditMode]);

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
            const response = await fetch(isEditMode ? `/api/tenants/${tenant.id}/` : '/api/tenants/', {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    property: formData.property ? parseInt(formData.property) : null,
                    rent_due_day: parseInt(formData.rent_due_day)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            onTenantAdded(data);
            onClose();
            if (!isEditMode) {
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
                    rent_due_day: 1,
                    is_active: true
                });
            }
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} tenant:`, err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} tenant`);
        } finally {
            setLoading(false);
        }
    };

    // Style for inputs (force visible text color)
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--text-secondary)',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-primary)'
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
                    <h2 style={{ margin: 0 }}>{isEditMode ? 'Edit Tenant' : 'Add New Tenant'}</h2>
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
                        <SearchableSelect
                            name="property"
                            value={formData.property}
                            onChange={(e) => {
                                // Adapt change event to match expected format if needed, 
                                // but SearchableSelect already mimics event structure
                                handleChange(e);
                            }}
                            required
                            options={properties.map(p => ({
                                id: p.id,
                                label: `House ${p.house_number} - ${p.address} ${p.is_occupied ? '(Occupied)' : ''}`,
                                disabled: p.is_occupied && p.id !== parseInt(tenant?.property || preselectedPropertyId),
                                ...p
                            })).filter(p => !p.disabled)} // Filter out occupied properties unless preselected
                            placeholder="Select a property"
                            valueKey="id"
                        />
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
                                placeholder="+254xxxxxxxxx"
                                title="Use international format: +254xxxxxxxxx"
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

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rent Due Day</label>
                        <input
                            type="number"
                            name="rent_due_day"
                            value={formData.rent_due_day}
                            onChange={handleChange}
                            min="1"
                            max="31"
                            required
                            style={inputStyle}
                            placeholder="Day of month (1-31)"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Day of the month when rent is expected
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Tenant')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AddTenantModal;
