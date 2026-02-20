import React, { useState, useEffect } from 'react';
import { Plus, Play, CheckCircle, Clock, DollarSign, Users, Calendar, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const PayrollRunList = () => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('list'); // 'list' | 'detail' | 'create'
    const [selectedRun, setSelectedRun] = useState(null);
    const [createForm, setCreateForm] = useState({
        name: '', period_start: '', period_end: '', pay_date: '', notes: ''
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchRuns(); }, []);

    const fetchRuns = async () => {
        try {
            const res = await fetch('/api/payroll/payroll-runs/');
            const data = await res.json();
            setRuns(data);
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'var(--success-color)';
            case 'APPROVED': return 'var(--primary-color)';
            case 'PROCESSING': return 'var(--accent-color)';
            case 'DRAFT': return 'var(--text-secondary)';
            case 'CANCELLED': return 'var(--danger-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleCreateRun = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/payroll/payroll-runs/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            });
            if (res.ok) {
                setCreateForm({ name: '', period_start: '', period_end: '', pay_date: '', notes: '' });
                setActiveView('list');
                fetchRuns();
            }
        } catch (err) { console.error(err); }
        setCreating(false);
    };

    const handleGeneratePaychecks = async (id) => {
        try {
            const res = await fetch(`/api/payroll/payroll-runs/${id}/generate_paychecks/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedRun(data.payroll);
                fetchRuns();
            }
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`/api/payroll/payroll-runs/${id}/approve/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedRun(data);
                fetchRuns();
            }
        } catch (err) { console.error(err); }
    };

    const handleMarkPaid = async (id) => {
        try {
            const res = await fetch(`/api/payroll/payroll-runs/${id}/mark_paid/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedRun(data);
                fetchRuns();
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return <div>Loading payroll runs...</div>;

    const inputStyle = {
        width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)',
        backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem'
    };

    // Detail View
    if (activeView === 'detail' && selectedRun) {
        const color = getStatusColor(selectedRun.status);
        return (
            <div className="container">
                <button onClick={() => setActiveView('list')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)', fontSize: '1rem' }}>
                    <ArrowLeft size={20} /> Back to Payroll Runs
                </button>

                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div>
                            <h1 style={{ margin: 0 }}>{selectedRun.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                                {formatDate(selectedRun.period_start)} — {formatDate(selectedRun.period_end)} | Pay Date: {formatDate(selectedRun.pay_date)}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color, fontWeight: 600 }}>
                                {selectedRun.status}
                            </span>
                            {selectedRun.status === 'DRAFT' && (
                                <button onClick={() => handleGeneratePaychecks(selectedRun.id)} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                    <Play size={14} style={{ marginRight: '0.25rem' }} /> Generate Paychecks
                                </button>
                            )}
                            {selectedRun.status === 'PROCESSING' && (
                                <button onClick={() => handleApprove(selectedRun.id)} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                    <CheckCircle size={14} style={{ marginRight: '0.25rem' }} /> Approve
                                </button>
                            )}
                            {selectedRun.status === 'APPROVED' && (
                                <button onClick={() => handleMarkPaid(selectedRun.id)} className="btn btn-primary" style={{ fontSize: '0.875rem', backgroundColor: 'var(--success-color)' }}>
                                    <DollarSign size={14} style={{ marginRight: '0.25rem' }} /> Process Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Totals */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Total Gross</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0' }}>{formatCurrency(selectedRun.total_gross)}</p>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Deductions</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--danger-color)' }}>{formatCurrency(selectedRun.total_deductions)}</p>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Net Pay</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(selectedRun.total_net)}</p>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Employer Taxes</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0', color: 'var(--accent-color)' }}>{formatCurrency(selectedRun.total_employer_taxes)}</p>
                    </div>
                </div>

                {/* Paychecks Table */}
                {(selectedRun.paychecks || []).length > 0 && (
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Paychecks</h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employee</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gross</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PAYE</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NHIF</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NSSF</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Housing</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Net Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRun.paychecks.map(pc => (
                                        <tr key={pc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{pc.employee_name}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(pc.gross_pay)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger-color)' }}>{formatCurrency(pc.paye_tax)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger-color)' }}>{formatCurrency(pc.nhif_deduction)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger-color)' }}>{formatCurrency(pc.nssf_deduction)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger-color)' }}>{formatCurrency(pc.housing_levy)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--success-color)' }}>{formatCurrency(pc.net_pay)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(selectedRun.paychecks || []).length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No paychecks generated yet. Click "Generate Paychecks" to create paychecks for all active employees.
                    </div>
                )}
            </div>
        );
    }

    // Create Form
    if (activeView === 'create') {
        return (
            <div className="container">
                <button onClick={() => setActiveView('list')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)', fontSize: '1rem' }}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="card" style={{ maxWidth: '600px' }}>
                    <h2 style={{ marginTop: 0 }}>Create Payroll Run</h2>
                    <form onSubmit={handleCreateRun}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Name *</label>
                            <input value={createForm.name} onChange={(e) => setCreateForm(p => ({ ...p, name: e.target.value }))} required style={inputStyle} placeholder="e.g. February 2026 Payroll" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Period Start *</label>
                                <input type="date" value={createForm.period_start} onChange={(e) => setCreateForm(p => ({ ...p, period_start: e.target.value }))} required style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Period End *</label>
                                <input type="date" value={createForm.period_end} onChange={(e) => setCreateForm(p => ({ ...p, period_end: e.target.value }))} required style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Pay Date *</label>
                            <input type="date" value={createForm.pay_date} onChange={(e) => setCreateForm(p => ({ ...p, pay_date: e.target.value }))} required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Notes</label>
                            <textarea value={createForm.notes} onChange={(e) => setCreateForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, minHeight: '60px' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%' }}>
                            {creating ? 'Creating...' : 'Create Payroll Run'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Payroll Runs</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Process and manage payroll</p>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveView('create')}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    New Payroll Run
                </button>
            </header>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {runs.map(run => {
                    const color = getStatusColor(run.status);
                    return (
                        <div key={run.id} className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}
                            onClick={() => { setSelectedRun(run); setActiveView('detail'); }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 auto', minWidth: '200px' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{run.name}</h4>
                                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {formatDate(run.period_start)} — {formatDate(run.period_end)}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(run.total_net)}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color, fontSize: '0.875rem', justifyContent: 'flex-end' }}>
                                    {run.status === 'PAID' ? <CheckCircle size={14} /> : <Clock size={14} />} {run.status}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {(run.paychecks || []).length} employee(s)
                                </span>
                            </div>
                        </div>
                    );
                })}
                {runs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No payroll runs yet. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollRunList;
