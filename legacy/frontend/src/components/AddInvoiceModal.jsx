import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = {
    backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)',
    width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
};
const fieldStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' };
const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)',
    backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem'
};

const AddInvoiceModal = ({ isOpen, onClose, onAdded }) => {
    const [tenants, setTenants] = useState([]);
    const [form, setForm] = useState({
        tenant: '', client_name: '', client_email: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '', tax_rate: '0', notes: '', payment_method: ''
    });
    const [items, setItems] = useState([{ description: '', quantity: '1', unit_price: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetch('/api/tenants/').then(r => r.json()).then(setTenants).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemChange = (idx, field, value) => {
        const newItems = [...items];
        newItems[idx][field] = value;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { description: '', quantity: '1', unit_price: '' }]);
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
    const taxAmount = subtotal * (parseFloat(form.tax_rate) || 0) / 100;
    const total = subtotal + taxAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            // Generate invoice number
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
            const body = {
                invoice_number: invoiceNumber,
                issue_date: form.issue_date,
                due_date: form.due_date,
                tax_rate: form.tax_rate || '0',
                notes: form.notes,
                payment_method: form.payment_method,
                items: items.filter(i => i.description && i.unit_price).map(i => ({
                    description: i.description,
                    quantity: parseFloat(i.quantity) || 1,
                    unit_price: parseFloat(i.unit_price),
                })),
            };
            if (form.tenant) body.tenant = parseInt(form.tenant);
            if (form.client_name) body.client_name = form.client_name;
            if (form.client_email) body.client_email = form.client_email;

            const res = await fetch('/api/finance/invoices/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(JSON.stringify(err));
            }
            setForm({ tenant: '', client_name: '', client_email: '', issue_date: new Date().toISOString().split('T')[0], due_date: '', tax_rate: '0', notes: '', payment_method: '' });
            setItems([{ description: '', quantity: '1', unit_price: '' }]);
            onAdded();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatKSh = (n) => `KSh ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: 0 }}>Create Invoice</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'var(--danger-color)', marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Bill To (Tenant)</label>
                        <select name="tenant" value={form.tenant} onChange={handleChange} style={inputStyle}>
                            <option value="">-- Select Tenant (or enter client below) --</option>
                            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {!form.tenant && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Client Name</label>
                                <input name="client_name" value={form.client_name} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Client Email</label>
                                <input name="client_email" type="email" value={form.client_email} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Issue Date *</label>
                            <input name="issue_date" type="date" value={form.issue_date} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Due Date *</label>
                            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Tax Rate (%)</label>
                            <input name="tax_rate" type="number" step="0.01" min="0" value={form.tax_rate} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Payment Method</label>
                            <select name="payment_method" value={form.payment_method} onChange={handleChange} style={inputStyle}>
                                <option value="">-- Select --</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                                <option value="MOBILE_MONEY">M-Pesa</option>
                                <option value="CASH">Cash</option>
                                <option value="CHECK">Check</option>
                            </select>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Line Items</label>
                            <button type="button" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                <Plus size={16} /> Add Item
                            </button>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                                <input placeholder="Description" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} style={{ ...inputStyle, padding: '0.5rem' }} />
                                <input placeholder="Qty" type="number" min="1" step="0.01" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} style={{ ...inputStyle, padding: '0.5rem' }} />
                                <input placeholder="Price" type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)} style={{ ...inputStyle, padding: '0.5rem' }} />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.5rem' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                            <span>Subtotal</span><span>{formatKSh(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                            <span>Tax ({form.tax_rate}%)</span><span>{formatKSh(taxAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, fontSize: '1.125rem', borderTop: '1px solid var(--border-color)' }}>
                            <span>Total</span><span>{formatKSh(total)}</span>
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: '50px' }} placeholder="Payment terms, thank you message, etc." />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                        {submitting ? 'Creating...' : 'Create Invoice'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddInvoiceModal;
