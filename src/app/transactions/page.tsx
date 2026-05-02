"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, ArrowUpRight, ArrowDownLeft, 
    Wallet, Building2, Filter, Calendar 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        fetch('/api/transactions/')
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'INCOME': return 'text-green-600 bg-green-50';
            case 'EXPENSE': return 'text-red-600 bg-red-50';
            default: return 'text-orange-600 bg-orange-50';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INCOME': return ArrowDownLeft;
            case 'EXPENSE': return ArrowUpRight;
            default: return Wallet;
        }
    };

    const totals = transactions.reduce((acc, t) => {
        const amt = parseFloat(t.amount || 0);
        if (t.transaction_type === 'INCOME') acc.income += amt;
        if (t.transaction_type === 'EXPENSE') acc.expense += amt;
        return acc;
    }, { income: 0, expense: 0 });

    const filtered = transactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.payee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || t.transaction_type === typeFilter;
        return matchesSearch && matchesType;
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
                    <h1 className="text-3xl font-bold">Income & Expenses</h1>
                    <p className="text-gray-500">Track all financial transactions</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Add Transaction
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-green-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Income</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totals.income)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-red-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(totals.expense)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-orange-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Net Position</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(totals.income - totals.expense)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                    <option value="ALL">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="TRANSFER">Transfer</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filtered.map(txn => {
                    const TypeIcon = getTypeIcon(txn.transaction_type);
                    const styles = getTypeColor(txn.transaction_type);
                    return (
                        <div key={txn.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${styles}`}>
                                    <TypeIcon size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{txn.description}</h4>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(txn.transaction_date)}</span>
                                        {txn.category_name && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">{txn.category_name}</span>}
                                        {txn.payee && <span>Payee: {txn.payee}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${styles.split(' ')[0]}`}>
                                    {txn.transaction_type === 'EXPENSE' ? '-' : '+'}{formatCurrency(txn.amount)}
                                </p>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{txn.status}</span>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
