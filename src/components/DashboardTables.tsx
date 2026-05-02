"use client";

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-orange-100 text-orange-700',
    LATE: 'bg-red-100 text-red-700',
    FAILED: 'bg-gray-100 text-gray-700',
    SEVERE: 'bg-red-100 text-red-700',
    OPEN: 'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-green-100 text-green-700',
    EMERGENCY: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-orange-100 text-orange-700',
    LOW: 'bg-green-100 text-green-700'
};

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ').toLowerCase()}
    </span>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-bottom-2 border-gray-200">
        {children}
    </th>
);

const TableCell = ({ children, align = 'left' }: { children: React.ReactNode, align?: 'left' | 'center' | 'right' }) => (
    <td className={`px-4 py-3 text-sm text-gray-900 border-b border-gray-200 text-${align}`}>
        {children}
    </td>
);

interface DashboardTablesProps {
    data: any;
}

const DashboardTables = ({ data }: DashboardTablesProps) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 gap-6 mt-8">
            {/* Recent Payments */}
            {data.recent_payments && data.recent_payments.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Recent Payments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Tenant</TableHeader>
                                    <TableHeader>Property</TableHeader>
                                    <TableHeader>Amount</TableHeader>
                                    <TableHeader>Due Date</TableHeader>
                                    <TableHeader>Paid Date</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recent_payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            {payment.tenant_id ? (
                                                <Link href={`/tenants/${payment.tenant_id}`} className="text-orange-600 font-medium hover:underline">
                                                    {payment.tenant_name}
                                                </Link>
                                            ) : (
                                                payment.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payment.property_id ? (
                                                <Link href={`/houses/${payment.property_id}`} className="text-orange-600 font-medium hover:underline">
                                                    House {payment.property}
                                                </Link>
                                            ) : (
                                                payment.property
                                            )}
                                        </TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{formatDate(payment.date_due)}</TableCell>
                                        <TableCell>{payment.date_paid ? formatDate(payment.date_paid) : '-'}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.status} />
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upcoming Due Payments */}
            {data.upcoming_payments && data.upcoming_payments.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Upcoming Payments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Tenant</TableHeader>
                                    <TableHeader>Property</TableHeader>
                                    <TableHeader>Amount</TableHeader>
                                    <TableHeader>Due Date</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {data.upcoming_payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            {payment.tenant_id ? (
                                                <Link href={`/tenants/${payment.tenant_id}`} className="text-orange-600 font-medium hover:underline">
                                                    {payment.tenant_name}
                                                </Link>
                                            ) : (
                                                payment.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payment.property_id ? (
                                                <Link href={`/houses/${payment.property_id}`} className="text-orange-600 font-medium hover:underline">
                                                    House {payment.property}
                                                </Link>
                                            ) : (
                                                payment.property
                                            )}
                                        </TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{formatDate(payment.date_due)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.status} />
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Active Maintenance Requests */}
            {data.active_maintenance && data.active_maintenance.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        Active Maintenance
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <TableHeader>Title</TableHeader>
                                    <TableHeader>Tenant</TableHeader>
                                    <TableHeader>Property</TableHeader>
                                    <TableHeader>Priority</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Request Date</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {data.active_maintenance.map((request: any) => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>{request.title}</TableCell>
                                        <TableCell>
                                            {request.tenant_id ? (
                                                <Link href={`/tenants/${request.tenant_id}`} className="text-orange-600 font-medium hover:underline">
                                                    {request.tenant_name}
                                                </Link>
                                            ) : (
                                                request.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {request.property_id ? (
                                                <Link href={`/houses/${request.property_id}`} className="text-orange-600 font-medium hover:underline">
                                                    House {request.property}
                                                </Link>
                                            ) : (
                                                request.property
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={request.priority} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={request.status} />
                                        </TableCell>
                                        <TableCell>{formatDate(request.request_date)}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardTables;
