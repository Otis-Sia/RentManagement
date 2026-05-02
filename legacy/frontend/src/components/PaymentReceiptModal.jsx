import React, { useRef, useEffect } from 'react';
import { X, Printer, CheckCircle, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

/**
 * Build a WhatsApp-friendly plain-text receipt from receipt data.
 */
const buildReceiptText = ({ receipt_number, date_issued, tenant, property, payment, utilization, balance }) => {
    const divider = '─'.repeat(30);

    const utilizationLines = (utilization || []).map((item, i) =>
        `  ${i + 1}. ${item.description}\n     Amount: ${formatCurrency(item.amount_applied)} — _${item.status}_`
    );

    const lines = [
        `✅ *PAYMENT RECEIPT*`,
        `${receipt_number}`,
        `Date: ${formatDate(date_issued)}`,
        ``,
        divider,
        `*Tenant:* ${tenant?.name || 'N/A'}`,
        `*Property:* ${property?.house_number ? `House ${property.house_number}` : 'N/A'}${property?.address ? ` — ${property.address}` : ''}`,
        divider,
        ``,
        `*Payment Details*`,
        `Type: ${payment?.type || 'N/A'}`,
        `Method: ${payment?.method || 'N/A'}`,
        `Date Due: ${formatDate(payment?.date_due)}`,
        `Date Paid: ${formatDate(payment?.date_paid)}`,
        ...(payment?.transaction_id ? [`Transaction ID: ${payment.transaction_id}`] : []),
        ``,
        divider,
        ``,
        `*💰 Money Utilization Breakdown*`,
        ...utilizationLines,
        ``,
        divider,
        `*Total Paid: ${formatCurrency(payment?.amount_paid || payment?.amount)}*`,
    ];

    if (balance && parseFloat(balance) > 0) {
        lines.push(`⚠️ Outstanding Balance: ${formatCurrency(balance)}`);
    }

    if (payment?.notes) {
        lines.push(``, `_Notes: ${payment.notes}_`);
    }

    lines.push(
        ``,
        divider,
        `_This is a computer-generated receipt._`,
        `_Thank you for your payment!_`
    );

    return lines.join('\n');
};

/**
 * Open WhatsApp with the receipt text pre-filled for the tenant.
 */
const sendReceiptViaWhatsApp = (receiptData) => {
    const phone = (receiptData.tenant?.phone || '').replace(/[^\d]/g, '');
    if (!phone) {
        alert(`No phone number available for ${receiptData.tenant?.name || 'this tenant'}.`);
        return;
    }
    const message = buildReceiptText(receiptData);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

const PaymentReceiptModal = ({ isOpen, onClose, receiptData, autoSendWhatsApp = false }) => {
    const receiptRef = useRef(null);

    // Auto-send WhatsApp when modal opens (used after payment submission)
    useEffect(() => {
        if (isOpen && receiptData && autoSendWhatsApp) {
            sendReceiptViaWhatsApp(receiptData);
        }
    }, [isOpen, receiptData, autoSendWhatsApp]);

    if (!isOpen || !receiptData) return null;

    const { receipt_number, date_issued, tenant, property, payment, utilization, balance } = receiptData;

    const handlePrint = () => {
        const printContents = receiptRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Payment Receipt - ${receipt_number}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; }
                    .receipt-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #16213e; padding-bottom: 20px; }
                    .receipt-header h1 { font-size: 24px; color: #16213e; margin-bottom: 4px; }
                    .receipt-header .receipt-num { font-size: 14px; color: #666; }
                    .receipt-header .date { font-size: 13px; color: #888; margin-top: 4px; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #16213e; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
                    .info-item label { font-size: 11px; color: #888; display: block; }
                    .info-item span { font-size: 14px; font-weight: 500; }
                    .utilization-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                    .utilization-table th { background: #16213e; color: white; padding: 8px 12px; text-align: left; font-size: 12px; }
                    .utilization-table td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
                    .utilization-table tr:last-child td { border-bottom: none; }
                    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                    .status-cleared { background: #d4edda; color: #155724; }
                    .status-partial { background: #fff3cd; color: #856404; }
                    .status-credit { background: #cce5ff; color: #004085; }
                    .status-paid { background: #d4edda; color: #155724; }
                    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid #16213e; margin-top: 12px; font-size: 16px; font-weight: 700; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ccc; color: #888; font-size: 12px; }
                    .checkmark { color: #28a745; font-size: 48px; text-align: center; margin-bottom: 8px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                ${printContents}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return '';
        const s = status.toLowerCase();
        if (s.includes('fully') || s.includes('paid')) return 'cleared';
        if (s.includes('partial')) return 'partial';
        if (s.includes('credit')) return 'credit';
        return 'paid';
    };

    return (
        <div onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
                backgroundColor: 'var(--surface-color, #fff)',
                borderRadius: 'var(--radius-lg, 12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--text-secondary, #ddd)',
                    position: 'sticky', top: 0,
                    backgroundColor: 'var(--surface-color, #fff)',
                    borderRadius: 'var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={20} color="var(--success-color, #28a745)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Payment Receipt</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => sendReceiptViaWhatsApp(receiptData)} style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#25D366', cursor: 'pointer',
                            color: 'white', fontSize: '13px', fontWeight: 600
                        }}>
                            <MessageCircle size={14} /> Send WhatsApp
                        </button>
                        <button onClick={handlePrint} style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '6px',
                            border: '1px solid var(--text-secondary, #ccc)',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            color: 'var(--text-primary)', fontSize: '13px'
                        }}>
                            <Printer size={14} /> Print
                        </button>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '4px', color: 'var(--text-primary)'
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div ref={receiptRef} style={{ padding: '24px' }}>
                    {/* Header */}
                    <div className="receipt-header" style={{
                        textAlign: 'center', marginBottom: '24px',
                        borderBottom: '3px solid var(--primary-color, #16213e)',
                        paddingBottom: '16px'
                    }}>
                        <div style={{ fontSize: '36px', marginBottom: '4px' }}>&#10003;</div>
                        <h1 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                            PAYMENT RECEIPT
                        </h1>
                        <div className="receipt-num" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {receipt_number}
                        </div>
                        <div className="date" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Issued: {formatDate(date_issued)}
                        </div>
                    </div>

                    {/* Tenant & Property Info */}
                    <div className="section" style={{ marginBottom: '20px' }}>
                        <div className="section-title" style={{
                            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                            color: 'var(--text-secondary)', letterSpacing: '0.5px',
                            marginBottom: '8px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                            paddingBottom: '4px'
                        }}>
                            Tenant Information
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Name</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{tenant?.name}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Phone</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{tenant?.phone}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Email</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{tenant?.email}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Property</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {property?.house_number ? `House ${property.house_number}` : 'N/A'}
                                    {property?.address ? ` — ${property.address}` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="section" style={{ marginBottom: '20px' }}>
                        <div className="section-title" style={{
                            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                            color: 'var(--text-secondary)', letterSpacing: '0.5px',
                            marginBottom: '8px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                            paddingBottom: '4px'
                        }}>
                            Payment Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Type</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{payment?.type}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Method</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{payment?.method}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Date Due</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{formatDate(payment?.date_due)}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Date Paid</label>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{formatDate(payment?.date_paid)}</span>
                            </div>
                            {payment?.transaction_id && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Transaction ID</label>
                                    <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{payment.transaction_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Money Utilization Breakdown */}
                    <div className="section" style={{ marginBottom: '20px' }}>
                        <div className="section-title" style={{
                            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                            color: 'var(--text-secondary)', letterSpacing: '0.5px',
                            marginBottom: '8px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                            paddingBottom: '4px'
                        }}>
                            Money Utilization Breakdown
                        </div>
                        <table className="utilization-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        backgroundColor: 'var(--primary-color, #16213e)', color: 'white',
                                        padding: '8px 12px', textAlign: 'left', fontSize: '12px',
                                        borderRadius: '4px 0 0 0'
                                    }}>Description</th>
                                    <th style={{
                                        backgroundColor: 'var(--primary-color, #16213e)', color: 'white',
                                        padding: '8px 12px', textAlign: 'right', fontSize: '12px'
                                    }}>Amount</th>
                                    <th style={{
                                        backgroundColor: 'var(--primary-color, #16213e)', color: 'white',
                                        padding: '8px 12px', textAlign: 'center', fontSize: '12px',
                                        borderRadius: '0 4px 0 0'
                                    }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilization && utilization.map((item, index) => (
                                    <tr key={index} style={{
                                        backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--background-color, #f8f9fa)'
                                    }}>
                                        <td style={{
                                            padding: '10px 12px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                                            fontSize: '13px', color: 'var(--text-primary)'
                                        }}>
                                            {item.description}
                                        </td>
                                        <td style={{
                                            padding: '10px 12px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                                            fontSize: '13px', fontWeight: 600, textAlign: 'right',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {formatCurrency(item.amount_applied)}
                                        </td>
                                        <td style={{
                                            padding: '10px 12px', borderBottom: '1px solid var(--text-secondary, #e0e0e0)',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 8px',
                                                borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                backgroundColor:
                                                    getStatusBadgeClass(item.status) === 'cleared' ? '#d4edda' :
                                                    getStatusBadgeClass(item.status) === 'partial' ? '#fff3cd' :
                                                    getStatusBadgeClass(item.status) === 'credit' ? '#cce5ff' :
                                                    '#d4edda',
                                                color:
                                                    getStatusBadgeClass(item.status) === 'cleared' ? '#155724' :
                                                    getStatusBadgeClass(item.status) === 'partial' ? '#856404' :
                                                    getStatusBadgeClass(item.status) === 'credit' ? '#004085' :
                                                    '#155724',
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 0', borderTop: '2px solid var(--primary-color, #16213e)',
                        marginTop: '12px'
                    }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Total Paid</span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success-color, #28a745)' }}>
                            {formatCurrency(payment?.amount_paid || payment?.amount)}
                        </span>
                    </div>

                    {balance && parseFloat(balance) > 0 && (
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 0', color: 'var(--danger-color, #dc3545)'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>Outstanding Balance</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatCurrency(balance)}</span>
                        </div>
                    )}

                    {payment?.notes && (
                        <div style={{
                            marginTop: '12px', padding: '10px',
                            backgroundColor: 'var(--background-color, #f8f9fa)',
                            borderRadius: '6px', fontSize: '13px',
                            color: 'var(--text-secondary)'
                        }}>
                            <strong>Notes:</strong> {payment.notes}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="footer" style={{
                        textAlign: 'center', marginTop: '30px', paddingTop: '16px',
                        borderTop: '1px dashed var(--text-secondary, #ccc)',
                        color: 'var(--text-secondary)', fontSize: '12px'
                    }}>
                        <p>This is a computer-generated receipt and is valid without a signature.</p>
                        <p style={{ marginTop: '4px' }}>Thank you for your payment!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceiptModal;
