import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Send, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddInvoiceModal from './AddInvoiceModal';
import InvoiceDetail from './InvoiceDetail';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/finance/invoices/');
            const data = await res.json();
            setInvoices(data);
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'var(--success-color)';
            case 'SENT': case 'VIEWED': return 'var(--primary-color)';
            case 'DRAFT': return 'var(--text-secondary)';
            case 'PARTIAL': return 'var(--accent-color)';
            case 'OVERDUE': return 'var(--danger-color)';
            case 'CANCELLED': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'SENT': return Send;
            case 'VIEWED': return Eye;
            case 'DRAFT': return Clock;
            case 'OVERDUE': return AlertCircle;
            default: return FileText;
        }
    };

    const handleSendInvoice = async (id) => {
        try {
            await fetch(`/api/finance/invoices/${id}/send_invoice/`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            fetchInvoices();
        } catch (err) { console.error(err); }
    };

    const totals = invoices.reduce((acc, inv) => {
        acc.total += parseFloat(inv.total || 0);
        acc.paid += parseFloat(inv.amount_paid || 0);
        acc.outstanding += parseFloat(inv.balance_due || 0);
        return acc;
    }, { total: 0, paid: 0, outstanding: 0 });

    const filtered = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.tenant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div>Loading invoices...</div>;

    if (selectedInvoice) {
        return <InvoiceDetail invoice={selectedInvoice} onBack={() => { setSelectedInvoice(null); fetchInvoices(); }} />;
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Invoices</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create and manage client invoices</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Create Invoice
                </button>
            </header>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Invoiced</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{formatCurrency(totals.total)}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Collected</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(totals.paid)}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Outstanding</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--danger-color)' }}>{formatCurrency(totals.outstanding)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }} />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem', minWidth: '150px' }}>
                    <option value="ALL">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            {/* Invoice List */}
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filtered.map(inv => {
                    const StatusIcon = getStatusIcon(inv.status);
                    const color = getStatusColor(inv.status);
                    return (
                        <div key={inv.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)', cursor: 'pointer' }} onClick={() => setSelectedInvoice(inv)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 auto', minWidth: '200px' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>#{inv.invoice_number}</h4>
                                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {inv.tenant_name || inv.client_name || 'No client'}
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                        <span>Issued: {formatDate(inv.issue_date)}</span>
                                        <span>Due: {formatDate(inv.due_date)}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(inv.total)}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color, fontSize: '0.875rem' }}>
                                    <StatusIcon size={14} /> {inv.status}
                                </div>
                                {inv.status === 'DRAFT' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleSendInvoice(inv.id); }}
                                        className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', minHeight: 'auto', marginTop: '0.25rem' }}>
                                        <Send size={12} style={{ marginRight: '0.25rem' }} /> Send
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No invoices found. Create your first invoice to get started.
                    </div>
                )}
            </div>

            <AddInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdded={fetchInvoices} />
        </div>
    );
};

export default InvoiceList;
