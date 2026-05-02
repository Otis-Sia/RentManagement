import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Briefcase, Phone, Mail } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/payroll/employees/');
            const data = await res.json();
            setEmployees(data);
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'FULL_TIME': return 'var(--primary-color)';
            case 'PART_TIME': return 'var(--accent-color)';
            case 'CONTRACT': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    const totalMonthlyPayroll = employees.filter(e => e.is_active).reduce((sum, e) => sum + parseFloat(e.base_salary), 0);

    const filtered = employees.filter(emp => {
        const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && emp.is_active) || (filter === 'INACTIVE' && !emp.is_active) || emp.employment_type === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div>Loading employees...</div>;

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Payroll</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage employees and process payroll</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add Employee
                </button>
            </header>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Total Employees</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{employees.filter(e => e.is_active).length}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Monthly Payroll</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: 'var(--accent-color)' }}>{formatCurrency(totalMonthlyPayroll)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem' }} />
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)', backgroundColor: 'transparent', color: 'inherit', fontSize: '1rem', minWidth: '150px' }}>
                    <option value="ALL">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                </select>
            </div>

            {/* Employee List */}
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filtered.map(emp => {
                    const typeColor = getTypeColor(emp.employment_type);
                    return (
                        <div key={emp.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 auto', minWidth: '200px' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: `color-mix(in srgb, ${typeColor} 15%, transparent)`, color: typeColor, fontWeight: 700, fontSize: '1.1rem'
                                }}>
                                    {emp.first_name[0]}{emp.last_name[0]}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>
                                        {emp.full_name}
                                        {!emp.is_active && <span style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginLeft: '0.5rem' }}>Inactive</span>}
                                    </h4>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Briefcase size={14} /> {emp.job_title}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12} /> {emp.email}</span>
                                        {emp.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {emp.phone}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(emp.base_salary)}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span></p>
                                <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', backgroundColor: `color-mix(in srgb, ${typeColor} 15%, transparent)`, color: typeColor }}>
                                    {emp.employment_type_display}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No employees found. Add your first employee to get started.
                    </div>
                )}
            </div>

            <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdded={fetchEmployees} />
        </div>
    );
};

export default EmployeeList;
