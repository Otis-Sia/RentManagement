"use client";

import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Send, Mail, 
    Clock, Users, Building, Briefcase, 
    ChevronDown, ChevronUp, Phone, 
    CheckCircle, MessageCircle 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const WHATSAPP_GREEN = '#25D366';

export default function BroadcastsPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetch('/api/broadcasts/')
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filtered = messages.filter(msg => {
        const matchesSearch = msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.body?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || (filter === 'SENT' && msg.is_sent) || (filter === 'DRAFT' && !msg.is_sent);
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageCircle size={32} className="text-[#25D366]" />
                        WhatsApp Broadcasts
                    </h1>
                    <p className="text-gray-500">Send WhatsApp messages to tenants and employees</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Compose
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Broadcasts Sent</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{messages.filter(m => m.is_sent).length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-orange-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Drafts</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{messages.filter(m => !m.is_sent).length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-[#25D366] shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">WhatsApp Delivered</p>
                    <p className="text-3xl font-bold text-[#25D366] mt-1">
                        {messages.reduce((s, m) => s + (m.whatsapp_sent_count || 0), 0)}
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                    <option value="ALL">All Status</option>
                    <option value="SENT">Sent</option>
                    <option value="DRAFT">Drafts</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filtered.map(msg => (
                    <div key={msg.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.is_sent ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {msg.is_sent ? <MessageCircle size={20} /> : <Mail size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{msg.subject}</h4>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Users size={12} /> {msg.audience?.replace('_', ' ')}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {msg.is_sent ? formatDate(msg.sent_at) : 'Draft'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                {msg.is_sent ? (
                                    <>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366] bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <CheckCircle size={10} /> Sent
                                        </span>
                                        <span className="text-[10px] text-gray-400">{msg.whatsapp_sent_count || 0}/{msg.recipient_count || 0} via WhatsApp</span>
                                    </>
                                ) : (
                                    <button className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
                                        Resolve & Send
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 line-clamp-2 italic border-l-2 border-gray-200">
                            {msg.body}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No broadcasts found.
                    </div>
                )}
            </div>
        </div>
    );
}
