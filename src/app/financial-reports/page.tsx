"use client";

import React, { useEffect, useState } from 'react';
import { 
    Download, FileText, Calendar, 
    Building, CreditCard, TrendingUp, 
    AlertCircle, Clock, ChevronLeft, 
    ChevronRight, Wallet 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30');

    useEffect(() => {
        fetch(`/api/finance?range=${range}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [range]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="flex-1 w-full px-6 py-8 lg:px-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Finance & Reporting</h1>
                    <p className="text-slate-500">Track your portfolio's financial health and performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all shadow-sm">
                        <FileText size={18} />
                        Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-100 transition-all shadow-sm">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 appearance-none outline-none transition-colors"
                    >
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Year to Date</option>
                    </select>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 appearance-none outline-none transition-colors">
                        <option>All Properties</option>
                    </select>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 appearance-none outline-none transition-colors">
                        <option>All Payment Methods</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard 
                    label="Total Revenue" 
                    value={formatCurrency(data.totalRevenue)} 
                    icon={<Wallet size={48} />} 
                    trend="+12.5% vs last month"
                    trendUp={true}
                />
                <SummaryCard 
                    label="Outstanding Arrears" 
                    value={formatCurrency(data.totalArrears)} 
                    icon={<AlertCircle size={48} />} 
                    trend="-5.0% improvement"
                    trendUp={true}
                    color="text-red-500"
                />
                <SummaryCard 
                    label="Upcoming Payments" 
                    value={formatCurrency(data.totalUpcoming)} 
                    icon={<Clock size={48} />} 
                    trend="Due within 7 days"
                    trendUp={null}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-slate-900 font-display">Recent Transactions</h3>
                    <button className="text-orange-600 text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Tenant</th>
                                <th className="px-6 py-4 font-bold">Property</th>
                                <th className="px-6 py-4 font-bold">Method</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.recentTransactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                {t.tenant_name?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{t.tenant_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">House {t.property}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                            <CreditCard size={16} />
                                            {t.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(t.amount)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm font-medium text-slate-500">Showing {data.recentTransactions.length} transactions</p>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 text-slate-600 transition-colors" disabled>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-slate-600 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon, trend, trendUp, color = "text-orange-500" }: any) {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 ${color}`}>
                {icon}
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
            <p className="text-slate-900 text-3xl font-bold font-display">{value}</p>
            <div className="flex items-center gap-1 mt-1">
                {trendUp !== null && (
                    <TrendingUp className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`} size={14} />
                )}
                <p className={`text-sm font-bold ${trendUp === null ? 'text-slate-500' : trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trend}
                </p>
            </div>
        </div>
    );
}
