import React, { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, Wrench, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'var(--text-secondary-light)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{value}</h3>
            </div>
            <div style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color: color
            }}>
                <Icon size={24} />
            </div>
        </div>
        {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary-light)', margin: 0 }}>{subtitle}</p>}
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
        <div className="container">
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary-light)', margin: 0 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary-light)', marginTop: '0.5rem' }}>Overview of your property metrics</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-lg)'
            }}>
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
        </div>
    );
};

export default Dashboard;
