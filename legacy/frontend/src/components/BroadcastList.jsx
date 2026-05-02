import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Send, Mail, MailOpen, Clock, Users, Building, Briefcase, ChevronDown, ChevronUp, Phone, CheckCircle, MessageCircle } from 'lucide-react';
import { formatDate } from '../utils/format';
import ComposeBroadcastModal from './ComposeBroadcastModal';

const WHATSAPP_GREEN = '#25D366';

/**
 * Build a WhatsApp deep-link.
 * Strips non-digit chars, ensures a leading country code (defaults to 254 for Kenya).
 */
const buildWhatsAppLink = (phone, text) => {
    let digits = (phone || '').replace(/\D/g, '');
    // If the number starts with 0, assume local and prepend country code
    if (digits.startsWith('0')) digits = '254' + digits.slice(1);
    // If it's too short to have a country code, prepend 254
    if (digits.length <= 9) digits = '254' + digits;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

const BroadcastList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [expandedDetail, setExpandedDetail] = useState(null);
    const [sendingAll, setSendingAll] = useState(false);

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messaging/broadcasts/');
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create recipient rows on the backend (resolve audience)
    const handleSend = async (id) => {
        if (!confirm('Resolve recipients for this broadcast? You can then send WhatsApp messages to each.')) return;
        try {
            const res = await fetch(`/api/messaging/broadcasts/${id}/send/`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                await fetchMessages();
                // Auto-expand so user can see recipients & send WhatsApp
                toggleExpand(id, true);
            } else {
                const err = await res.json();
                alert(err.detail || 'Failed to send.');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const toggleExpand = async (id, forceOpen = false) => {
        if (expandedId === id && !forceOpen) {
            setExpandedId(null);
            setExpandedDetail(null);
            return;
        }
        setExpandedId(id);
        try {
            const res = await fetch(`/api/messaging/broadcasts/${id}/`);
            const data = await res.json();
            setExpandedDetail(data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // Open WhatsApp link for a single recipient and mark as sent
    const openWhatsApp = useCallback(async (messageId, recipient, messageText) => {
        const link = buildWhatsAppLink(recipient.recipient_phone, messageText);
        window.open(link, '_blank');
        // Mark as sent on backend
        try {
            await fetch(`/api/messaging/broadcasts/${messageId}/mark-whatsapp-sent/${recipient.id}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            console.error('Error marking sent:', err);
        }
    }, []);

    // Batch-open WhatsApp links for all pending recipients
    const sendAllWhatsApp = useCallback(async (detail) => {
        const pending = (detail.recipients || []).filter(r => r.whatsapp_status !== 'SENT' && r.recipient_phone);
        if (pending.length === 0) {
            alert('All recipients have already been sent to, or none have a phone number.');
            return;
        }
        if (!confirm(`This will open ${pending.length} WhatsApp conversation(s) one by one. Continue?`)) return;

        setSendingAll(true);
        const messageText = `*${detail.subject}*\n\n${detail.body}`;

        for (let i = 0; i < pending.length; i++) {
            const r = pending[i];
            const link = buildWhatsAppLink(r.recipient_phone, messageText);
            window.open(link, '_blank');
            // Mark as sent
            try {
                await fetch(`/api/messaging/broadcasts/${detail.id}/mark-whatsapp-sent/${r.id}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (err) { /* best-effort */ }
            // Small delay so browser doesn't block popups
            if (i < pending.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        // Refresh detail
        try {
            const res = await fetch(`/api/messaging/broadcasts/${detail.id}/`);
            const data = await res.json();
            setExpandedDetail(data);
        } catch (err) { /* best-effort */ }
        await fetchMessages();
        setSendingAll(false);
    }, []);

    const getPriorityColor = (p) => {
        switch (p) {
            case 'URGENT': return 'var(--danger-color)';
            case 'HIGH': return '#e67e22';
            case 'NORMAL': return 'var(--primary-color)';
            case 'LOW': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    const getAudienceIcon = (audience) => {
        switch (audience) {
            case 'ALL_TENANTS': return <Users size={16} />;
            case 'BUILDING_TENANTS': return <Building size={16} />;
            case 'ALL_EMPLOYEES': return <Briefcase size={16} />;
            default: return <Users size={16} />;
        }
    };

    const getAudienceLabel = (msg) => {
        switch (msg.audience) {
            case 'ALL_TENANTS': return 'All Active Tenants';
            case 'BUILDING_TENANTS': return `Building: ${msg.building_address}`;
            case 'ALL_EMPLOYEES': return 'All Active Employees';
            default: return msg.audience;
        }
    };

    const getWhatsAppBadge = (status) => {
        switch (status) {
            case 'SENT': return { color: WHATSAPP_GREEN, label: 'Sent' };
            case 'FAILED': return { color: 'var(--danger-color)', label: 'Failed' };
            default: return { color: 'var(--text-secondary)', label: 'Pending' };
        }
    };

    const filtered = messages.filter(msg => {
        const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.body.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' ||
            (filter === 'SENT' && msg.is_sent) ||
            (filter === 'DRAFT' && !msg.is_sent) ||
            msg.audience === filter;
        return matchesSearch && matchesFilter;
    });

    const totalSent = messages.filter(m => m.is_sent).length;
    const totalDrafts = messages.filter(m => !m.is_sent).length;
    const totalWhatsAppSent = messages.reduce((s, m) => s + (m.whatsapp_sent_count || 0), 0);

    if (loading) return <div>Loading broadcasts...</div>;

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>
                        <MessageCircle size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: WHATSAPP_GREEN }} />
                        WhatsApp Broadcasts
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Send WhatsApp messages to tenants and employees</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Compose
                </button>
            </header>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Broadcasts Sent</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{totalSent}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Drafts</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--accent-color)' }}>{totalDrafts}</p>
                </div>
                <div className="card" style={{ borderLeft: `4px solid ${WHATSAPP_GREEN}` }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>WhatsApp Sent</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: WHATSAPP_GREEN }}>{totalWhatsAppSent}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="text" placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }} />
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem', minWidth: '150px' }}>
                    <option value="ALL">All</option>
                    <option value="SENT">Sent</option>
                    <option value="DRAFT">Drafts</option>
                    <option value="ALL_TENANTS">All Tenants</option>
                    <option value="BUILDING_TENANTS">Building Tenants</option>
                    <option value="ALL_EMPLOYEES">All Employees</option>
                </select>
            </div>

            {/* Message List */}
            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <MessageCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No broadcasts yet. Click <strong>Compose</strong> to create one.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {filtered.map(msg => {
                        const priorityColor = getPriorityColor(msg.priority);
                        const isExpanded = expandedId === msg.id;
                        return (
                            <div key={msg.id} className="card" style={{ borderLeft: `4px solid ${priorityColor}` }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-sm)', cursor: 'pointer' }}
                                    onClick={() => toggleExpand(msg.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 auto', minWidth: '200px' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: msg.is_sent
                                                ? `color-mix(in srgb, ${WHATSAPP_GREEN} 15%, transparent)`
                                                : 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                                            color: msg.is_sent ? WHATSAPP_GREEN : 'var(--accent-color)',
                                        }}>
                                            {msg.is_sent ? <MessageCircle size={20} /> : <Mail size={20} />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{msg.subject}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {getAudienceIcon(msg.audience)}
                                                <span>{getAudienceLabel(msg)}</span>
                                                <span>·</span>
                                                <span style={{ color: priorityColor, fontWeight: 600 }}>{msg.priority}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexShrink: 0 }}>
                                        {msg.is_sent ? (
                                            <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                    {formatDate(msg.sent_at)}
                                                </p>
                                                <p style={{ margin: 0, color: WHATSAPP_GREEN }}>
                                                    <MessageCircle size={12} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                    {msg.whatsapp_sent_count}/{msg.recipient_count} sent
                                                </p>
                                            </div>
                                        ) : (
                                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                onClick={(e) => { e.stopPropagation(); handleSend(msg.id); }}>
                                                <Send size={14} style={{ marginRight: '0.35rem' }} /> Resolve Recipients
                                            </button>
                                        )}
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && expandedDetail && expandedDetail.id === msg.id && (
                                    <div style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid color-mix(in srgb, var(--text-secondary) 25%, transparent)', paddingTop: 'var(--spacing-lg)' }}>
                                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: 'var(--spacing-lg)', lineHeight: 1.6, color: 'var(--text-primary)', backgroundColor: 'color-mix(in srgb, var(--text-secondary) 5%, transparent)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                            {expandedDetail.body}
                                        </div>

                                        {expandedDetail.recipients && expandedDetail.recipients.length > 0 && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                                                        Recipients ({expandedDetail.recipients.length})
                                                    </h4>
                                                    {expandedDetail.recipients.some(r => r.whatsapp_status !== 'SENT' && r.recipient_phone) && (
                                                        <button
                                                            className="btn"
                                                            disabled={sendingAll}
                                                            onClick={() => sendAllWhatsApp(expandedDetail)}
                                                            style={{
                                                                fontSize: '0.8rem', padding: '0.5rem 1rem',
                                                                backgroundColor: WHATSAPP_GREEN, color: 'white', border: 'none',
                                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                            }}>
                                                            <MessageCircle size={14} />
                                                            {sendingAll ? 'Sending...' : 'Send All via WhatsApp'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'grid', gap: '0.35rem' }}>
                                                    {expandedDetail.recipients.map(r => {
                                                        const badge = getWhatsAppBadge(r.whatsapp_status);
                                                        const messageText = `*${expandedDetail.subject}*\n\n${expandedDetail.body}`;
                                                        return (
                                                            <div key={r.id} style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                                                                backgroundColor: 'color-mix(in srgb, var(--text-secondary) 8%, transparent)', fontSize: '0.85rem',
                                                                flexWrap: 'wrap', gap: '0.5rem',
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: '180px' }}>
                                                                    <strong>{r.recipient_name}</strong>
                                                                    {r.recipient_phone && (
                                                                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                            <Phone size={12} /> {r.recipient_phone}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: badge.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                        {r.whatsapp_status === 'SENT' && <CheckCircle size={12} />}
                                                                        {badge.label}
                                                                        {r.whatsapp_sent_at && ` · ${formatDate(r.whatsapp_sent_at)}`}
                                                                    </span>
                                                                    {r.whatsapp_status !== 'SENT' && r.recipient_phone && (
                                                                        <button
                                                                            onClick={() => openWhatsApp(expandedDetail.id, r, messageText)}
                                                                            style={{
                                                                                padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
                                                                                backgroundColor: WHATSAPP_GREEN, color: 'white',
                                                                                border: 'none', borderRadius: 'var(--radius-sm)',
                                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                                            }}>
                                                                            <MessageCircle size={12} /> Send
                                                                        </button>
                                                                    )}
                                                                    {!r.recipient_phone && (
                                                                        <span style={{ fontSize: '0.7rem', color: 'var(--danger-color)' }}>No phone</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {expandedDetail.is_sent && expandedDetail.recipients.length === 0 && (
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recipients matched the audience criteria.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <ComposeBroadcastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchMessages}
            />
        </div>
    );
};

export default BroadcastList;
