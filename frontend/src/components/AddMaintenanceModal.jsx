import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const AddMaintenanceModal = ({ isOpen, onClose, onRequestAdded }) => {
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        tenant: '',
        house_id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        cost: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
        }
    }, [isOpen]);

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

    const handleHouseChange = (e) => {
        const houseId = parseInt(e.target.value);
        const house = properties.find(p => p.id === houseId);

        if (house) {
            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: house.current_tenant_id || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                house_id: houseId,
                tenant: ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Note: We're sending tenant ID even if inferred from house. 
        // If the backend requires a tenant, this will fail for vacant houses unless we allow null.
        // Assuming for now maintenance tracks tenant liability or reporting.

        try {
            const submitData = {
                ...formData,
                tenant: formData.tenant ? parseInt(formData.tenant) : null,
                cost: formData.cost ? parseFloat(formData.cost) : null
            };

            const response = await fetch('/api/maintenance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            onRequestAdded(data);
            onClose();
            // Reset form
            setFormData({
                tenant: '',
                house_id: '',
                title: '',
                description: '',
                priority: 'MEDIUM',
                status: 'OPEN',
                cost: ''
            });
        } catch (err) {
            console.error('Error adding maintenance request:', err);
            setError(err.message || 'Failed to add maintenance request');
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
                    <h2 style={{ margin: 0 }}>New Maintenance Request</h2>
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>House Number</label>
                        <SearchableSelect
                            name="house_id"
                            value={formData.house_id}
                            onChange={handleHouseChange}
                            required
                            options={properties.map(p => ({
                                id: p.id,
                                label: `House ${p.house_number} - ${p.address} ${p.is_occupied ? `(${p.current_tenant_name})` : '(Vacant)'}`,
                                ...p
                            }))}
                            placeholder="Select a house"
                            valueKey="id"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Leaking faucet in bathroom"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Provide detailed information about the issue..."
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Estimated Cost (KSh) - Optional</label>
                        <input
                            type="number"
                            name="cost"
                            value={formData.cost}
                            onChange={handleChange}
                            step="0.01"
                            placeholder="Leave blank if unknown"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AddMaintenanceModal;
