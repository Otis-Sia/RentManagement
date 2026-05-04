"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports/dashboard/')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">General Reports</h1>
                <p className="text-gray-500">Key metrics and summary of operations</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Income Statement Summary */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
                        <DollarSign className="text-green-500" size={24} />
                        Income Statement Summary
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 font-medium">Total Monthly Revenue</span>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(stats?.monthly_income)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 font-medium">Maintenance Expenses</span>
                            <span className="text-lg font-bold text-red-600">-{formatCurrency(stats?.maintenance_costs)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-lg font-black text-slate-900">Estimated Net Profit</span>
                            <span className="text-2xl font-black text-orange-600">
                                {formatCurrency((stats?.monthly_income || 0) - (stats?.maintenance_costs || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Collections Summary */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800 w-full text-left">
                        <Calendar className="text-blue-500" size={24} />
                        Outstanding Collections
                    </h3>
                    <div className="py-8">
                        <h2 className="text-5xl font-black text-red-600 mb-2">{formatCurrency(stats?.outstanding_balance)}</h2>
                        <p className="text-gray-500 font-medium">Total Unpaid Rent & Fees</p>
                    </div>
                    <Link href="/payments" className="mt-4 text-orange-600 font-bold hover:underline flex items-center gap-1 text-sm">
                        Go to Arrears Management <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Additional Quick stats can go here */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Occupancy Rate</p>
                            <p className="text-4xl font-black">{stats?.occupancy_rate || 0}%</p>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${stats?.occupancy_rate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Tenants</p>
                            <p className="text-4xl font-black">{stats?.total_tenants || 0}</p>
                            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase">Across all properties</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending Maintenance</p>
                            <p className="text-4xl font-black">{stats?.pending_maintenance || 0}</p>
                            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase">Requests requiring attention</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
