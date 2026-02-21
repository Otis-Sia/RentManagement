import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ComposeBroadcastModal = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = useState({
        subject: '',
        body: '',
        audience: 'ALL_TENANTS',
        building_address: '',
        priority: 'NORMAL',
    });
    const [addresses, setAddresses] = useState([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetch('/api/messaging/building-addresses/')
                .then(r => r.json())
                .then(setAddresses)
                .catch(() => { });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e, sendNow = false) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            // 1. Create the message
            const createRes = await fetch('/api/messaging/broadcasts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!createRes.ok) {
                const errData = await createRes.json();
                const msg = Object.values(errData).flat().join(' ');
                throw new Error(msg || 'Failed to create message.');
            }

            const created = await createRes.json();

            // 2. Optionally send immediately
            if (sendNow) {
                const sendRes = await fetch(`/api/messaging/broadcasts/${created.id}/send/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!sendRes.ok) {
                    const errData = await sendRes.json();
                    throw new Error(errData.detail || 'Failed to send message.');
                }
            }

            setForm({ subject: '', body: '', audience: 'ALL_TENANTS', building_address: '', priority: 'NORMAL' });
            onCreated?.();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--text-secondary)',
        backgroundColor: 'transparent',
        color: 'inherit',
        fontSize: '1rem',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem',
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                }}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem', fontWeight: 700 }}>
                    Compose Broadcast
                </h2>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem', marginBottom: 'var(--spacing-md)',
                        backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)',
                        color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e, true)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {/* Audience */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Audience</label>
                            <select name="audience" value={form.audience} onChange={handleChange} style={inputStyle}>
                                <option value="ALL_TENANTS">All Active Tenants</option>
                                <option value="BUILDING_TENANTS">Tenants in a Specific Building</option>
                                <option value="ALL_EMPLOYEES">All Active Employees</option>
                            </select>
                        </div>

                        {/* Building picker — only when BUILDING_TENANTS */}
                        {form.audience === 'BUILDING_TENANTS' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Building Address</label>
                                <select name="building_address" value={form.building_address} onChange={handleChange} style={inputStyle} required>
                                    <option value="">-- Select Building --</option>
                                    {addresses.map(addr => (
                                        <option key={addr} value={addr}>{addr}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Priority */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Priority</label>
                            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Subject</label>
                            <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Message subject..." style={inputStyle} required />
                        </div>

                        {/* Body */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Message</label>
                            <textarea name="body" value={form.body} onChange={handleChange} rows={6} placeholder="Write your message here..."
                                style={{ ...inputStyle, resize: 'vertical' }} required />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
                            <button type="button" className="btn" onClick={(e) => handleSubmit(e, false)} disabled={sending}
                                style={{ backgroundColor: 'var(--text-secondary)', color: 'white' }}>
                                {sending ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                {sending ? 'Sending...' : 'Send Now'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeBroadcastModal;
