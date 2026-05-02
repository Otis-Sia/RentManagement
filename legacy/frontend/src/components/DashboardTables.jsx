import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';

const entityLinkStyle = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: 500
};

const STATUS_STYLES = {
    PAID: { backgroundColor: 'color-mix(in srgb, var(--success-color) 15%, transparent)', color: 'var(--success-color)' },
    PENDING: { backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)', color: 'var(--accent-color)' },
    LATE: { backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)', color: 'var(--danger-color)' },
    FAILED: { backgroundColor: 'color-mix(in srgb, #6b7280 15%, transparent)', color: '#6b7280' },
    SEVERE: { backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)', color: 'var(--danger-color)' },
    OPEN: { backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)', color: 'var(--danger-color)' },
    IN_PROGRESS: { backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)', color: 'var(--accent-color)' },
    COMPLETED: { backgroundColor: 'color-mix(in srgb, var(--success-color) 15%, transparent)', color: 'var(--success-color)' },
    EMERGENCY: { backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)', color: 'var(--danger-color)' },
    HIGH: { backgroundColor: 'color-mix(in srgb, #f97316 15%, transparent)', color: '#f97316' },
    MEDIUM: { backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)', color: 'var(--accent-color)' },
    LOW: { backgroundColor: 'color-mix(in srgb, var(--success-color) 15%, transparent)', color: 'var(--success-color)' }
};

const StatusBadge = ({ status }) => (
    <span style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        ...STATUS_STYLES[status]
    }}>
        {status.replace('_', ' ').toLowerCase()}
    </span>
);

const TableHeader = ({ children }) => (
    <th style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid var(--border-color)'
    }}>
        {children}
    </th>
);

const TableCell = ({ children, align = 'left' }) => (
    <td style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        textAlign: align,
        borderBottom: '1px solid var(--border-color)'
    }}>
        {children}
    </td>
);

const DashboardTables = ({ data }) => {
    if (!data) return null;



    return (
        <div style={{
            display: 'grid',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)'
        }}>
            {/* Recent Payments */}
            {data.recent_payments && data.recent_payments.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Recent Payments
                    </h3>
                    <div className="table-container">
                        <table>
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
                                {data.recent_payments.map((payment) => (
                                    <tr key={payment.id} style={{ transition: 'background-color 0.15s' }}>
                                        <TableCell>
                                            {payment.tenant_id ? (
                                                <Link to={`/tenants/${payment.tenant_id}`} style={entityLinkStyle}>
                                                    {payment.tenant_name}
                                                </Link>
                                            ) : (
                                                payment.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payment.property_id ? (
                                                <Link to={`/houses/${payment.property_id}`} style={entityLinkStyle}>
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
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Upcoming Payments
                    </h3>
                    <div className="table-container">
                        <table>
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
                                {data.upcoming_payments.map((payment) => (
                                    <tr key={payment.id} style={{ transition: 'background-color 0.15s' }}>
                                        <TableCell>
                                            {payment.tenant_id ? (
                                                <Link to={`/tenants/${payment.tenant_id}`} style={entityLinkStyle}>
                                                    {payment.tenant_name}
                                                </Link>
                                            ) : (
                                                payment.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payment.property_id ? (
                                                <Link to={`/houses/${payment.property_id}`} style={entityLinkStyle}>
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
                    <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1.125rem', fontWeight: 600 }}>
                        Active Maintenance
                    </h3>
                    <div className="table-container">
                        <table>
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
                                {data.active_maintenance.map((request) => (
                                    <tr key={request.id} style={{ transition: 'background-color 0.15s' }}>
                                        <TableCell>{request.title}</TableCell>
                                        <TableCell>
                                            {request.tenant_id ? (
                                                <Link to={`/tenants/${request.tenant_id}`} style={entityLinkStyle}>
                                                    {request.tenant_name}
                                                </Link>
                                            ) : (
                                                request.tenant_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {request.property_id ? (
                                                <Link to={`/houses/${request.property_id}`} style={entityLinkStyle}>
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
