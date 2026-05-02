import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const FinancialReports = () => {
    const [reportType, setReportType] = useState('pnl');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const fetchReport = (type, y, m) => {
        setLoading(true);
        fetch(`/api/finance/reports/?type=${type}&year=${y}&month=${m}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => { fetchReport(reportType, year, month); }, [reportType, year, month]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const tabStyle = (active) => ({
        padding: '0.625rem 1rem', background: 'none', border: 'none',
        borderBottom: active ? '2px solid var(--primary-color)' : '2px solid transparent',
        color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400, cursor: 'pointer', fontSize: '0.9rem'
    });

    if (loading) return <div>Loading financial reports...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Financial Reports</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Comprehensive financial statements and analysis</p>
            </header>

            {/* Report Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                <button onClick={() => setReportType('pnl')} style={tabStyle(reportType === 'pnl')}>Profit & Loss</button>
                <button onClick={() => setReportType('balance_sheet')} style={tabStyle(reportType === 'balance_sheet')}>Balance Sheet</button>
                <button onClick={() => setReportType('cash_flow')} style={tabStyle(reportType === 'cash_flow')}>Cash Flow</button>
                <button onClick={() => setReportType('tax_summary')} style={tabStyle(reportType === 'tax_summary')}>Tax Summary</button>
            </div>

            {/* Period Selector */}
            {reportType !== 'balance_sheet' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Calendar size={20} />
                    {reportType !== 'tax_summary' && (
                        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit' }}>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                    )}
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit' }}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            )}

            {/* Report Content */}
            {reportType === 'pnl' && data && <ProfitAndLoss data={data} />}
            {reportType === 'balance_sheet' && data && <BalanceSheet data={data} />}
            {reportType === 'cash_flow' && data && <CashFlow data={data} />}
            {reportType === 'tax_summary' && data && <TaxSummary data={data} />}
        </div>
    );
};

const ProfitAndLoss = ({ data }) => {
    const pieData = (data.expense_breakdown || []).filter(i => i.amount > 0).map(i => ({ name: i.category, value: i.amount }));

    return (
        <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Revenue</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(data.total_income)}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Expenses</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--danger-color)' }}>{formatCurrency(data.total_expenses)}</p>
                </div>
                <div className="card" style={{ borderLeft: `4px solid ${data.net_income >= 0 ? 'var(--primary-color)' : 'var(--danger-color)'}` }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Net Income</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: data.net_income >= 0 ? 'var(--primary-color)' : 'var(--danger-color)' }}>{formatCurrency(data.net_income)}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
                {/* Income Breakdown */}
                <div className="card">
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} color="var(--success-color)" /> Income Breakdown
                    </h3>
                    {(data.income_breakdown || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>{item.category}</span>
                            <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700 }}>
                        <span>Total Income</span><span style={{ color: 'var(--success-color)' }}>{formatCurrency(data.total_income)}</span>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="card">
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingDown size={20} color="var(--danger-color)" /> Expense Breakdown
                    </h3>
                    {(data.expense_breakdown || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>{item.category}</span>
                            <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700 }}>
                        <span>Total Expenses</span><span style={{ color: 'var(--danger-color)' }}>{formatCurrency(data.total_expenses)}</span>
                    </div>
                </div>
            </div>

            {/* Expense Chart */}
            {pieData.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                    <h3 style={{ marginTop: 0 }}>Expense Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => formatCurrency(v)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

const BalanceSheet = ({ data }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {/* Assets */}
        <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--success-color)' }}>Assets</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Bank Accounts</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.assets?.bank_balances)}</span>
            </div>
            {(data.assets?.bank_accounts || []).map((acc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0 0.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>{acc.name}</span><span>{formatCurrency(acc.balance)}</span>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Accounts Receivable (Rent)</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.assets?.accounts_receivable)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Invoice Receivable</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.assets?.invoice_receivable)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1.125rem', borderTop: '2px solid var(--border-color)', marginTop: '0.5rem' }}>
                <span>Total Assets</span><span style={{ color: 'var(--success-color)' }}>{formatCurrency(data.assets?.total)}</span>
            </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--danger-color)' }}>Liabilities</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Tenant Security Deposits</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.liabilities?.tenant_deposits)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, borderTop: '2px solid var(--border-color)', marginTop: '0.5rem' }}>
                <span>Total Liabilities</span><span style={{ color: 'var(--danger-color)' }}>{formatCurrency(data.liabilities?.total)}</span>
            </div>

            <h3 style={{ marginTop: 'var(--spacing-lg)', color: 'var(--primary-color)' }}>Owner's Equity</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Total Equity</span><span style={{ color: 'var(--primary-color)' }}>{formatCurrency(data.equity)}</span>
            </div>
        </div>
    </div>
);

const CashFlow = ({ data }) => (
    <div>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Inflow</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(data.operating?.total_inflow)}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Outflow</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--danger-color)' }}>{formatCurrency(data.operating?.total_outflow)}</p>
            </div>
            <div className="card" style={{ borderLeft: `4px solid ${(data.operating?.net || 0) >= 0 ? 'var(--primary-color)' : 'var(--danger-color)'}` }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Net Cash Flow</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{formatCurrency(data.operating?.net)}</p>
            </div>
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <div className="card">
                <h3 style={{ marginTop: 0, color: 'var(--success-color)' }}>Cash Inflows</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Rent Collections</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.operating?.cash_in_rent)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Other Income</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.operating?.cash_in_other)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700 }}>
                    <span>Total</span><span style={{ color: 'var(--success-color)' }}>{formatCurrency(data.operating?.total_inflow)}</span>
                </div>
            </div>
            <div className="card">
                <h3 style={{ marginTop: 0, color: 'var(--danger-color)' }}>Cash Outflows</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Maintenance</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.operating?.cash_out_maintenance)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Other Expenses</span><span style={{ fontWeight: 600 }}>{formatCurrency(data.operating?.cash_out_expenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700 }}>
                    <span>Total</span><span style={{ color: 'var(--danger-color)' }}>{formatCurrency(data.operating?.total_outflow)}</span>
                </div>
            </div>
        </div>

        {/* Chart */}
        {(data.trends || []).length > 0 && (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Cash Flow Trends (6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98133" name="Inflow" />
                        <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="#ef444433" name="Outflow" />
                        <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2} name="Net" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

const TaxSummary = ({ data }) => (
    <div>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Income</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(data.total_income)}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Deductible Expenses</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--accent-color)' }}>{formatCurrency(data.total_deductible_expenses)}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Taxable Income</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--primary-color)' }}>{formatCurrency(data.taxable_income)}</p>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            {/* Deductible Expenses */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Tax-Deductible Expenses</h3>
                {(data.deductible_breakdown || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span>{item.category}</span><span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700 }}>
                    <span>Total Deductible</span><span>{formatCurrency(data.total_deductible_expenses)}</span>
                </div>
            </div>

            {/* Income Summary */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Income Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Rent Income</span><span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{formatCurrency(data.rent_income)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Other Income</span><span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{formatCurrency(data.other_income)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>Non-Deductible Expenses</span><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(data.non_deductible_expenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1.125rem', borderTop: '2px solid var(--border-color)', marginTop: '0.5rem' }}>
                    <span>Taxable Income</span><span style={{ color: 'var(--primary-color)' }}>{formatCurrency(data.taxable_income)}</span>
                </div>
            </div>
        </div>

        {/* Monthly Income Chart */}
        {(data.monthly_income || []).length > 0 && (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Monthly Income Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.monthly_income}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="rent" fill="#2563eb" name="Rent" />
                        <Bar dataKey="other" fill="#10b981" name="Other" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

export default FinancialReports;
