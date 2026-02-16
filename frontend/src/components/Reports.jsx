import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports/dashboard/')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching reports:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Financial Reports</h1>
                <p style={{ color: 'var(--text-secondary-light)', marginTop: '0.5rem' }}>Detailed financial overview</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} /> Income Statement
                    </h3>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--text-secondary-light)' }}>
                            <span>Total Revenue</span>
                            <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{formatCurrency(stats?.monthly_income)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--text-secondary-light)' }}>
                            <span>Maintenance Expenses</span>
                            <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>-{formatCurrency(stats?.maintenance_costs)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', marginTop: '0.5rem', fontSize: '1.125rem' }}>
                            <strong>Net Income</strong>
                            <strong style={{ color: 'var(--primary-color)' }}>{formatCurrency((stats?.monthly_income || 0) - (stats?.maintenance_costs || 0))}</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> Outstanding Collections
                    </h3>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '3rem', margin: '1rem 0', color: 'var(--danger-color)' }}>{formatCurrency(stats?.outstanding_balance)}</h2>
                        <p style={{ color: 'var(--text-secondary-light)' }}>Total Unpaid Rent & Fees</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
