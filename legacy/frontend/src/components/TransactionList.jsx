import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Wallet, Building2, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddTransactionModal from './AddTransactionModal';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/finance/transactions/').then(r => r.json()),
            fetch('/api/finance/accounts/').then(r => r.json()),
            fetch('/api/finance/categories/').then(r => r.json()),
        ]).then(([txns, accts, cats]) => {
            setTransactions(txns);
            setAccounts(accts);
            setCategories(cats);
            setLoading(false);
        }).catch(err => {
            console.error('Error:', err);
            setLoading(false);
        });
    }, []);

    const handleAdded = () => {
        fetch('/api/finance/transactions/').then(r => r.json()).then(setTransactions);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'INCOME': return 'var(--success-color)';
            case 'EXPENSE': return 'var(--danger-color)';
            case 'TRANSFER': return 'var(--primary-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'INCOME': return ArrowDownLeft;
            case 'EXPENSE': return ArrowUpRight;
            default: return Wallet;
        }
    };

    const totals = transactions.reduce((acc, t) => {
        if (t.transaction_type === 'INCOME') acc.income += parseFloat(t.amount);
        if (t.transaction_type === 'EXPENSE') acc.expense += parseFloat(t.amount);
        return acc;
    }, { income: 0, expense: 0 });

    const filtered = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.payee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || t.transaction_type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (loading) return <div>Loading transactions...</div>;

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Income & Expenses</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Track all financial transactions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add Transaction
                </button>
            </header>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Income</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--success-color)' }}>{formatCurrency(totals.income)}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Expenses</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--danger-color)' }}>{formatCurrency(totals.expense)}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Net</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--primary-color)' }}>{formatCurrency(totals.income - totals.expense)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem', minWidth: '150px' }}
                >
                    <option value="ALL">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="TRANSFER">Transfer</option>
                </select>
            </div>

            {/* Linked Accounts */}
            {accounts.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={20} /> Linked Accounts
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
                        {accounts.map(acc => (
                            <div key={acc.id} className="card" style={{ minWidth: '200px', flex: '0 0 auto' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>{acc.name}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.25rem 0' }}>{acc.account_type_display}</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: parseFloat(acc.balance) >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>{formatCurrency(acc.balance)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transaction List */}
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filtered.map(txn => {
                    const TypeIcon = getTypeIcon(txn.transaction_type);
                    const color = getTypeColor(txn.transaction_type);
                    return (
                        <div key={txn.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 auto', minWidth: '200px' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color
                                }}>
                                    <TypeIcon size={22} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{txn.description}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                        <span>{formatDate(txn.date)}</span>
                                        {txn.category_name && <span style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 15%, transparent)', padding: '0.125rem 0.5rem', borderRadius: '9999px', color: 'var(--primary-color)' }}>{txn.category_name}</span>}
                                        {txn.payee && <span>{txn.payee}</span>}
                                        {txn.bank_account_name && <span>{txn.bank_account_name}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color }}>
                                    {txn.transaction_type === 'EXPENSE' ? '-' : '+'}{formatCurrency(txn.amount)}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{txn.status}</span>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No transactions found. Add your first transaction to get started.
                    </div>
                )}
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdded={handleAdded}
                accounts={accounts}
                categories={categories}
            />
        </div>
    );
};

export default TransactionList;
