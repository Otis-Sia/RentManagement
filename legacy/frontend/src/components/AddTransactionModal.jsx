import React, { useState } from 'react';
import { X } from 'lucide-react';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = {
    backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)',
    width: '90%', maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto', position: 'relative'
};
const fieldStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' };
const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)',
    backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem'
};

const AddTransactionModal = ({ isOpen, onClose, onAdded, accounts, categories }) => {
    const [form, setForm] = useState({
        transaction_type: 'EXPENSE', bank_account: '', category: '', amount: '',
        date: new Date().toISOString().split('T')[0], description: '', payee: '', reference: '', notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const body = { ...form };
            if (!body.bank_account) delete body.bank_account;
            if (!body.category) delete body.category;
            const res = await fetch('/api/finance/transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(JSON.stringify(err));
            }
            setForm({ transaction_type: 'EXPENSE', bank_account: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', payee: '', reference: '', notes: '' });
            onAdded();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCats = categories.filter(c =>
        form.transaction_type === 'TRANSFER' ? true : c.category_type === form.transaction_type
    );

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: 0 }}>Add Transaction</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'var(--danger-color)', marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Type *</label>
                        <select name="transaction_type" value={form.transaction_type} onChange={handleChange} style={inputStyle}>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="TRANSFER">Transfer</option>
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Description *</label>
                        <input name="description" value={form.description} onChange={handleChange} required style={inputStyle} placeholder="What is this transaction for?" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Amount *</label>
                            <input name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Date *</label>
                            <input name="date" type="date" value={form.date} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Account</label>
                        <select name="bank_account" value={form.bank_account} onChange={handleChange} style={inputStyle}>
                            <option value="">-- Select Account --</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Category</label>
                        <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                            <option value="">-- Select Category --</option>
                            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Payee</label>
                        <input name="payee" value={form.payee} onChange={handleChange} style={inputStyle} placeholder="Who was paid / who paid you?" />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Reference</label>
                        <input name="reference" value={form.reference} onChange={handleChange} style={inputStyle} placeholder="Check #, reference ID" />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: '60px' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                        {submitting ? 'Saving...' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
