"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, DollarSign, Calendar, CheckCircle, 
    AlertCircle, Clock, Send, FileText 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetch('/api/payments/')
            .then(res => res.json())
            .then(data => {
                setPayments(data);
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
            case 'PENDING': return 'text-orange-600 bg-orange-50';
            case 'LATE': return 'text-red-600 bg-red-50';
            case 'FAILED': return 'text-red-600 bg-red-50';
            case 'SEVERE': return 'text-red-600 bg-red-50';
            case 'DEFAULTED': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'PENDING': return Clock;
            default: return AlertCircle;
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (activeTab === 'LATE' && !['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'].includes(payment.status)) return false;
        
        const matchesSearch = payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.tenants?.name && payment.tenants.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.tenants?.properties?.house_number && payment.tenants.properties.house_number.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

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
                    <h1 className="text-3xl font-bold">Payments</h1>
                    <p className="text-gray-500">Track rent and fee collections</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Record Payment
                </button>
            </header>

            <div className="flex gap-6 mb-6 border-b border-gray-200">
                <button
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'ALL' 
                        ? 'border-orange-500 text-orange-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('ALL')}
                >
                    All Payments
                </button>
                <button
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'LATE' 
                        ? 'border-red-500 text-red-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('LATE')}
                >
                    Arrears
                    {payments.filter(p => ['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'].includes(p.status)).length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {payments.filter(p => ['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'].includes(p.status)).length}
                        </span>
                    )}
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search payments, tenants, or houses..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'ALL' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="LATE">Late</option>
                        <option value="FAILED">Failed</option>
                        <option value="SEVERE">Severe</option>
                        <option value="DEFAULTED">Defaulted</option>
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPayments.map(payment => {
                    const StatusIcon = getStatusIcon(payment.status);
                    const statusStyles = getStatusColor(payment.status);

                    return (
                        <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusStyles}`}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{payment.payment_type}</h3>
                                    <div className="text-sm">
                                        <Link href={`/tenants/${payment.tenants?.id}`} className="text-orange-600 hover:underline">
                                            {payment.tenants?.name}
                                        </Link>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-gray-500">House {payment.tenants?.properties?.house_number || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Calendar size={12} /> Due: {formatDate(payment.date_due)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${statusStyles}`}>
                                    <StatusIcon size={14} />
                                    {payment.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                                {payment.status === 'PAID' ? (
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg text-sm font-semibold hover:bg-green-600 hover:text-white transition-all">
                                        <FileText size={16} />
                                        Receipt
                                    </button>
                                ) : (
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-green-500 border border-green-500 rounded-lg text-sm font-semibold hover:bg-green-500 hover:text-white transition-all">
                                        <Send size={16} />
                                        Request
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredPayments.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No payments found.
                    </div>
                )}
            </div>
        </div>
    );
}
