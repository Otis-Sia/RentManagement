import React from 'react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

// Color palette matching the design system
const COLORS = {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    danger: 'var(--danger-color)',
    warning: 'var(--accent-color)',
    info: '#3b82f6',
    purple: '#a855f7'
};

const PAYMENT_STATUS_COLORS = {
    PAID: COLORS.success,
    PENDING: COLORS.warning,
    LATE: COLORS.danger,
    FAILED: '#6b7280'
};

const MAINTENANCE_STATUS_COLORS = {
    OPEN: COLORS.danger,
    IN_PROGRESS: COLORS.warning,
    COMPLETED: COLORS.success,
    CANCELLED: '#6b7280'
};

const DashboardCharts = ({ data }) => {
    if (!data) return null;

    // Transform payment status data for pie chart
    const paymentStatusData = Object.entries(data.payment_status_distribution || {}).map(([status, count]) => ({
        name: status,
        value: count,
        color: PAYMENT_STATUS_COLORS[status] || '#6b7280'
    }));

    // Transform maintenance status data for bar chart
    const maintenanceStatusData = Object.entries(data.maintenance_by_status || {}).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count: count,
        color: MAINTENANCE_STATUS_COLORS[status] || '#6b7280'
    }));

    // Custom tooltip for currency values
    const CurrencyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'var(--surface-color)',
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary-light)' }}>{label}</p>
                    <p style={{ margin: '4px 0 0 0', color: COLORS.success }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)'
        }}>
            {/* Income Trend Chart */}
            {data.payment_trends && data.payment_trends.length > 0 && (
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Income Trend (Last 6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.payment_trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="month"
                                stroke="var(--text-secondary-light)"
                                style={{ fontSize: '0.875rem' }}
                            />
                            <YAxis
                                stroke="var(--text-secondary-light)"
                                style={{ fontSize: '0.875rem' }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip content={<CurrencyTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke={COLORS.success}
                                strokeWidth={3}
                                dot={{ fill: COLORS.success, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Payment Status Distribution */}
            {paymentStatusData.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Payment Status
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Maintenance Status Breakdown */}
            {maintenanceStatusData.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Maintenance Requests
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={maintenanceStatusData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-secondary-light)"
                                style={{ fontSize: '0.75rem' }}
                            />
                            <YAxis stroke="var(--text-secondary-light)" style={{ fontSize: '0.875rem' }} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {maintenanceStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Occupancy Rate */}
            {data.occupancy && (
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Property Occupancy
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: COLORS.primary,
                                lineHeight: 1
                            }}>
                                {data.occupancy.rate}%
                            </div>
                            <p style={{ margin: 'var(--spacing-sm) 0 0 0', color: 'var(--text-secondary-light)' }}>
                                Occupancy Rate
                            </p>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '20px',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${data.occupancy.rate}%`,
                                height: '100%',
                                backgroundColor: COLORS.primary,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary-light)'
                        }}>
                            <span>Occupied: {data.occupancy.occupied}</span>
                            <span>Total: {data.occupancy.total}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCharts;
