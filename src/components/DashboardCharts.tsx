"use client";

import React from 'react';
import { 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    BarChart, 
    Bar, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    danger: 'var(--danger-color)',
    warning: 'var(--accent-color)',
    info: '#3b82f6',
    purple: '#a855f7'
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    PAID: COLORS.success,
    PENDING: COLORS.warning,
    LATE: COLORS.warning,
    FAILED: COLORS.danger,
    SEVERE: COLORS.danger,
    DEFAULTED: COLORS.purple
};

const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
    OPEN: COLORS.danger,
    IN_PROGRESS: COLORS.warning,
    COMPLETED: COLORS.success,
    CANCELLED: '#6b7280'
};

interface DashboardChartsProps {
    data: any;
}

const DashboardCharts = ({ data }: DashboardChartsProps) => {
    if (!data) return null;

    const paymentStatusData = Object.entries(data.payment_status_distribution || {}).map(([status, count]) => ({
        name: status,
        value: count as number,
        color: PAYMENT_STATUS_COLORS[status] || '#6b7280'
    }));

    const maintenanceStatusData = Object.entries(data.maintenance_by_status || {}).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count: count as number,
        color: MAINTENANCE_STATUS_COLORS[status] || '#6b7280'
    }));

    const CurrencyTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-green-600">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Income Trend Chart */}
            {data.payment_trends && data.payment_trends.length > 0 && (
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">
                        Income Trend (Last 6 Months)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.payment_trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
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
                </div>
            )}

            {/* Payment Status Distribution */}
            {paymentStatusData.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Payment Status
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
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
                </div>
            )}

            {/* Maintenance Status Breakdown */}
            {maintenanceStatusData.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Maintenance Requests
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={maintenanceStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    fontSize={10}
                                />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {maintenanceStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Occupancy Rate */}
            {data.occupancy && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Property Occupancy
                    </h3>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-orange-500 leading-none">
                                {data.occupancy.rate}%
                            </div>
                            <p className="mt-2 text-gray-500">
                                Occupancy Rate
                            </p>
                        </div>
                        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${data.occupancy.rate}%` }} 
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
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
