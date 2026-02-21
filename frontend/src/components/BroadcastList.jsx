import React, { useState, useEffect } from 'react';
import { Plus, Search, Send, Mail, MailOpen, Clock, AlertTriangle, Users, Building, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/format';
import ComposeBroadcastModal from './ComposeBroadcastModal';

const BroadcastList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [expandedDetail, setExpandedDetail] = useState(null);

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

    const handleSend = async (id) => {
        if (!confirm('Send this message to all recipients?')) return;
        try {
            const res = await fetch(`/api/messaging/broadcasts/${id}/send/`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (res.ok) fetchMessages();
            else {
                const err = await res.json();
                alert(err.detail || 'Failed to send.');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const toggleExpand = async (id) => {
        if (expandedId === id) {
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
    const totalRecipients = messages.reduce((s, m) => s + (m.recipient_count || 0), 0);

    if (loading) return <div>Loading broadcasts...</div>;

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Broadcasts</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Send messages to tenants and employees</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Compose
                </button>
            </header>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Sent</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{totalSent}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Drafts</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--accent-color)' }}>{totalDrafts}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--text-secondary)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Recipients</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{totalRecipients}</p>
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
                    <Mail size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
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
                                                ? 'color-mix(in srgb, var(--primary-color) 15%, transparent)'
                                                : 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                                            color: msg.is_sent ? 'var(--primary-color)' : 'var(--accent-color)',
                                        }}>
                                            {msg.is_sent ? <MailOpen size={20} /> : <Mail size={20} />}
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
                                                <p style={{ margin: 0 }}>
                                                    {msg.read_count}/{msg.recipient_count} read
                                                </p>
                                            </div>
                                        ) : (
                                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                onClick={(e) => { e.stopPropagation(); handleSend(msg.id); }}>
                                                <Send size={14} style={{ marginRight: '0.35rem' }} /> Send
                                            </button>
                                        )}
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && expandedDetail && expandedDetail.id === msg.id && (
                                    <div style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid color-mix(in srgb, var(--text-secondary) 25%, transparent)', paddingTop: 'var(--spacing-lg)' }}>
                                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: 'var(--spacing-lg)', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                                            {expandedDetail.body}
                                        </div>

                                        {expandedDetail.recipients && expandedDetail.recipients.length > 0 && (
                                            <div>
                                                <h4 style={{ margin: '0 0 var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    Recipients ({expandedDetail.recipients.length})
                                                </h4>
                                                <div style={{ display: 'grid', gap: '0.35rem' }}>
                                                    {expandedDetail.recipients.map(r => (
                                                        <div key={r.id} style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                                                            backgroundColor: 'color-mix(in srgb, var(--text-secondary) 8%, transparent)', fontSize: '0.85rem',
                                                        }}>
                                                            <span>
                                                                <strong>{r.recipient_name}</strong>
                                                                <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{r.recipient_email}</span>
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.75rem', fontWeight: 600,
                                                                color: r.is_read ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                            }}>
                                                                {r.is_read ? `Read ${formatDate(r.read_at)}` : 'Unread'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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
