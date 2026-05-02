"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, FileText, Send, 
    CheckCircle, Clock, AlertCircle, 
    Eye, Calendar, User 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetch('/api/invoices/')
            .then(res => res.json())
            .then(data => {
                setInvoices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'SENT': case 'VIEWED': return 'text-blue-600 bg-blue-50';
            case 'DRAFT': return 'text-gray-600 bg-gray-50';
            case 'PARTIAL': return 'text-orange-600 bg-orange-50';
            case 'OVERDUE': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'SENT': return Send;
            case 'VIEWED': return Eye;
            case 'DRAFT': return Clock;
            case 'OVERDUE': return AlertCircle;
            default: return FileText;
        }
    };

    const totals = invoices.reduce((acc, inv) => {
        acc.total += parseFloat(inv.total || 0);
        acc.paid += parseFloat(inv.amount_paid || 0);
        acc.outstanding += parseFloat(inv.balance_due || 0);
        return acc;
    }, { total: 0, paid: 0, outstanding: 0 });

    const filtered = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.tenants?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
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
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-gray-500">Create and manage client invoices</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Create Invoice
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Invoiced</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totals.total)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-green-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Collected</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totals.paid)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-red-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Outstanding</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(totals.outstanding)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                    <option value="ALL">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filtered.map(inv => {
                    const StatusIcon = getStatusIcon(inv.status);
                    const styles = getStatusColor(inv.status);
                    return (
                        <div key={inv.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${styles}`}>
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">#{inv.invoice_number}</h4>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <User size={12} /> {inv.tenants?.name || 'Unknown Client'}
                                    </p>
                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> Issued: {formatDate(inv.issue_date)}</span>
                                        <span className="flex items-center gap-1"><Calendar size={10} /> Due: {formatDate(inv.due_date)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                                <div className={`flex items-center justify-end gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} mt-1`}>
                                    <StatusIcon size={12} />
                                    {inv.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No invoices found.
                    </div>
                )}
            </div>
        </div>
    );
}
