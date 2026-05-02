import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

const HouseModal = ({ isOpen, onClose, onHouseSaved, house = null }) => {
    const [formData, setFormData] = useState({
        house_number: '',
        address: '',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: '',
        monthly_rent: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (house) {
            setFormData({
                house_number: house.house_number,
                address: house.address,
                bedrooms: house.bedrooms,
                bathrooms: house.bathrooms,
                square_feet: house.square_feet || '',
                monthly_rent: house.monthly_rent
            });
        } else {
            setFormData({
                house_number: '',
                address: '',
                bedrooms: 1,
                bathrooms: 1,
                square_feet: '',
                monthly_rent: ''
            });
        }
        setErrors({});
    }, [house, isOpen]);

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-primary)',
        fontSize: '1rem'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.house_number.toString().trim()) newErrors.house_number = 'House number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.monthly_rent || parseFloat(formData.monthly_rent) <= 0) {
            newErrors.monthly_rent = 'Valid monthly rent is required';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            const url = house ? `/api/houses/${house.id}/` : '/api/houses/';
            let response;

            if (house) {
                response = await api.put(url, {
                    ...formData,
                    square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
                    bedrooms: parseInt(formData.bedrooms),
                    bathrooms: parseInt(formData.bathrooms),
                    monthly_rent: parseFloat(formData.monthly_rent)
                });
            } else {
                response = await api.post(url, {
                    ...formData,
                    square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
                    bedrooms: parseInt(formData.bedrooms),
                    bathrooms: parseInt(formData.bathrooms),
                    monthly_rent: parseFloat(formData.monthly_rent)
                });
            }

            if (response.offline) {
                // Handle offline success
                onHouseSaved(response); // Mock response uses payload
                onClose();
                alert('House saved to offline queue. It will sync when you reconnect.');
            } else if (response.id) {
                onHouseSaved(response);
                onClose();
            } else {
                setErrors(response);
            }
        } catch (error) {
            console.error('Error saving house:', error);
            setErrors({ general: 'Failed to save house. ' + (error.message || '') });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
        }} onClick={onClose}>
            <div
                className="card modal-content"
                style={{
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                        {house ? 'Edit House' : 'Add New House'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {errors.general && (
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            House Number *
                        </label>
                        <input
                            type="text"
                            name="house_number"
                            value={formData.house_number}
                            onChange={handleChange}
                            placeholder="e.g., 101, A1, etc."
                            style={{
                                ...inputStyle,
                                border: `1px solid ${errors.house_number ? 'var(--danger-color)' : 'var(--text-secondary)'}`
                            }}
                        />
                        {errors.house_number && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{errors.house_number}</span>}
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Full address of the property"
                            style={{
                                ...inputStyle,
                                border: `1px solid ${errors.address ? 'var(--danger-color)' : 'var(--text-secondary)'}`
                            }}
                        />
                        {errors.address && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{errors.address}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                Bedrooms
                            </label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                style={{
                                    ...inputStyle,
                                    border: '1px solid var(--text-secondary)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                Bathrooms
                            </label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                style={{
                                    ...inputStyle,
                                    border: '1px solid var(--text-secondary)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            Square Feet (Optional)
                        </label>
                        <input
                            type="number"
                            name="square_feet"
                            value={formData.square_feet}
                            onChange={handleChange}
                            placeholder="Property size in sq ft"
                            min="0"
                            style={{
                                ...inputStyle,
                                border: '1px solid var(--text-secondary)'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            Monthly Rent (KSh) *
                        </label>
                        <input
                            type="number"
                            name="monthly_rent"
                            value={formData.monthly_rent}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            style={{
                                ...inputStyle,
                                border: `1px solid ${errors.monthly_rent ? 'var(--danger-color)' : 'var(--text-secondary)'}`
                            }}
                        />
                        {errors.monthly_rent && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{errors.monthly_rent}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                        >
                            {submitting ? 'Saving...' : (house ? 'Update House' : 'Add House')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HouseModal;
