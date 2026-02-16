import React, { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, Wrench, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import DashboardCharts from './DashboardCharts';
import DashboardTables from './DashboardTables';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card stat-card">
        <div className="stat-card-header">
            <div>
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className="stat-icon-wrapper" style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color: color
            }}>
                <Icon size={24} />
            </div>
        </div>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        monthly_income: 0,
        outstanding_balance: 0,
        maintenance_costs: 0,
        net_cash_flow: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determine the base URL dynamically or fallback to localhost
        const API_BASE = '/api';

        fetch(`${API_BASE}/reports/dashboard/`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch dashboard stats:', err);
                setStats({
                    monthly_income: 0,
                    outstanding_balance: 0,
                    maintenance_costs: 0,
                    net_cash_flow: 0
                });
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="container dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Overview of your property metrics</p>
            </header>

            <div className="dashboard-grid">
                <StatCard
                    title="Monthly Income"
                    value={formatCurrency(stats.monthly_income)}
                    icon={DollarSign}
                    color="var(--success-color)"
                    subtitle="Revenue collected this month"
                />
                <StatCard
                    title="Outstanding Balance"
                    value={formatCurrency(stats.outstanding_balance)}
                    icon={AlertCircle}
                    color="var(--danger-color)"
                    subtitle="Pending or late payments"
                />
                <StatCard
                    title="Maintenance Costs"
                    value={formatCurrency(stats.maintenance_costs)}
                    icon={Wrench}
                    color="var(--accent-color)"
                    subtitle="Total completed work orders"
                />
                <StatCard
                    title="Net Cash Flow"
                    value={formatCurrency(stats.net_cash_flow)}
                    icon={TrendingUp}
                    color="var(--primary-color)"
                    subtitle="Income minus maintenance"
                />
            </div>

            <DashboardCharts data={stats} />
            <DashboardTables data={stats} />
        </div>
    );
};

export default Dashboard;
