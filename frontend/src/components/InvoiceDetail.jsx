import React, { useState } from 'react';
import { ArrowLeft, Send, DollarSign, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const InvoiceDetail = ({ invoice, onBack }) => {
    const [inv, setInv] = useState(invoice);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSend = async () => {
        try {
            const res = await fetch(`/api/finance/invoices/${inv.id}/send_invoice/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                setInv(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/finance/invoices/${inv.id}/record_payment/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: paymentAmount, payment_method: paymentMethod }),
            });
            if (res.ok) {
                const data = await res.json();
                setInv(data);
                setPaymentAmount('');
            }
        } catch (err) { console.error(err); }
        setProcessing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'var(--success-color)';
            case 'SENT': case 'VIEWED': return 'var(--primary-color)';
            case 'DRAFT': return 'var(--text-secondary)';
            case 'PARTIAL': return 'var(--accent-color)';
            case 'OVERDUE': return 'var(--danger-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const statusColor = getStatusColor(inv.status);

    return (
        <div className="container">
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)', fontSize: '1rem' }}>
                <ArrowLeft size={20} /> Back to Invoices
            </button>

            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    <div>
                        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={28} /> Invoice #{inv.invoice_number}
                        </h1>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Issued: {formatDate(inv.issue_date)} | Due: {formatDate(inv.due_date)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`, color: statusColor, fontWeight: 600 }}>
                            {inv.status}
                        </span>
                        {inv.status === 'DRAFT' && (
                            <button onClick={handleSend} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                <Send size={14} style={{ marginRight: '0.25rem' }} /> Send Invoice
                            </button>
                        )}
                    </div>
                </div>

                {/* Client Info */}
                <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'color-mix(in srgb, var(--primary-color) 5%, transparent)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bill To</h3>
                    <p style={{ margin: 0, fontWeight: 600 }}>{inv.tenant_name || inv.client_name || 'N/A'}</p>
                    {inv.client_email && <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inv.client_email}</p>}
                </div>

                {/* Line Items */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(inv.items || []).map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem' }}>{item.description}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
                    <div style={{ width: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <span>Subtotal</span><span>{formatCurrency(inv.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <span>Tax ({inv.tax_rate}%)</span><span>{formatCurrency(inv.tax_amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1.25rem', borderTop: '2px solid var(--border-color)' }}>
                            <span>Total</span><span>{formatCurrency(inv.total)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--success-color)' }}>
                            <span>Paid</span><span>{formatCurrency(inv.amount_paid)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, color: 'var(--danger-color)' }}>
                            <span>Balance Due</span><span>{formatCurrency(inv.balance_due)}</span>
                        </div>
                    </div>
                </div>

                {inv.notes && (
                    <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem' }}>Notes</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inv.notes}</p>
                    </div>
                )}
            </div>

            {/* Record Payment */}
            {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} /> Record Payment
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Amount</label>
                            <input type="number" step="0.01" min="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }}
                                placeholder={`Balance: ${parseFloat(inv.balance_due || 0).toFixed(2)}`} />
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Method</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }}>
                                <option value="">-- Select --</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                                <option value="MOBILE_MONEY">M-Pesa</option>
                                <option value="CASH">Cash</option>
                            </select>
                        </div>
                        <button onClick={handleRecordPayment} className="btn btn-primary" disabled={processing}>
                            {processing ? 'Processing...' : 'Record Payment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
