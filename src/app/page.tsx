"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, Wrench, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardTables from '@/components/DashboardTables';

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="card stat-card">
        <div className="stat-card-header flex items-start justify-between gap-2">
            <div>
                <p className="stat-title text-gray-500 text-sm">{title}</p>
                <h3 className="stat-value text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className="stat-icon-wrapper w-11 h-11 rounded-lg flex items-center justify-center" style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color: color
            }}>
                <Icon size={24} />
            </div>
        </div>
        {subtitle && <p className="stat-subtitle mt-2 text-gray-500 text-xs">{subtitle}</p>}
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState<any>({
        monthly_income: 0,
        outstanding_balance: 0,
        maintenance_costs: 0,
        net_cash_flow: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports/dashboard/')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch dashboard stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <header className="dashboard-header flex justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-500">Overview of your property metrics</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Monthly Income"
                    value={formatCurrency(stats.monthly_income)}
                    icon={DollarSign}
                    color="#10b981"
                    subtitle="Revenue collected this month"
                />
                <StatCard
                    title="Outstanding Balance"
                    value={formatCurrency(stats.outstanding_balance)}
                    icon={AlertCircle}
                    color="#ef4444"
                    subtitle="Pending or late payments"
                />
                <StatCard
                    title="Maintenance Costs"
                    value={formatCurrency(stats.maintenance_costs)}
                    icon={Wrench}
                    color="#f59e0b"
                    subtitle="Total completed work orders"
                />
                <StatCard
                    title="Net Cash Flow"
                    value={formatCurrency(stats.net_cash_flow)}
                    icon={TrendingUp}
                    color="#e68119"
                    subtitle="Income minus maintenance"
                />
            </div>

            <DashboardCharts data={stats} />
            <DashboardTables data={stats} />
        </div>
    );
}
