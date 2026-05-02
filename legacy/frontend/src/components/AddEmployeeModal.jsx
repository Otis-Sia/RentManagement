import React, { useState } from 'react';
import { X } from 'lucide-react';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = {
    backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)',
    width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
};
const fieldStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' };
const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)',
    backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem'
};

const AddEmployeeModal = ({ isOpen, onClose, onAdded }) => {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '', id_number: '', kra_pin: '',
        employment_type: 'FULL_TIME', job_title: '', department: '',
        hire_date: new Date().toISOString().split('T')[0], base_salary: '',
        pay_frequency: 'MONTHLY', bank_name: '', bank_account_number: '',
        nhif_number: '', nssf_number: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/payroll/employees/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(JSON.stringify(err));
            }
            setForm({ first_name: '', last_name: '', email: '', phone: '', id_number: '', kra_pin: '', employment_type: 'FULL_TIME', job_title: '', department: '', hire_date: new Date().toISOString().split('T')[0], base_salary: '', pay_frequency: 'MONTHLY', bank_name: '', bank_account_number: '', nhif_number: '', nssf_number: '' });
            onAdded();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: 0 }}>Add Employee</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'var(--danger-color)', marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>First Name *</label>
                            <input name="first_name" value={form.first_name} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Last Name *</label>
                            <input name="last_name" value={form.last_name} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Job Title *</label>
                            <input name="job_title" value={form.job_title} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Department</label>
                            <input name="department" value={form.department} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Employment Type</label>
                            <select name="employment_type" value={form.employment_type} onChange={handleChange} style={inputStyle}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Pay Frequency</label>
                            <select name="pay_frequency" value={form.pay_frequency} onChange={handleChange} style={inputStyle}>
                                <option value="MONTHLY">Monthly</option>
                                <option value="BIWEEKLY">Bi-Weekly</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Base Salary (Monthly) *</label>
                            <input name="base_salary" type="number" step="0.01" min="0" value={form.base_salary} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Hire Date *</label>
                            <input name="hire_date" type="date" value={form.hire_date} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>

                    <h4 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Statutory Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>ID Number</label>
                            <input name="id_number" value={form.id_number} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>KRA PIN</label>
                            <input name="kra_pin" value={form.kra_pin} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>NHIF Number</label>
                            <input name="nhif_number" value={form.nhif_number} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>NSSF Number</label>
                            <input name="nssf_number" value={form.nssf_number} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <h4 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Bank Details (for Direct Deposit)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Bank Name</label>
                            <input name="bank_name" value={form.bank_name} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Account Number</label>
                            <input name="bank_account_number" value={form.bank_account_number} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                        {submitting ? 'Saving...' : 'Add Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
