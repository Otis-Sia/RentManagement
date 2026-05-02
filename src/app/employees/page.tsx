"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Briefcase, Phone, Mail, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetch('/api/employees/')
            .then(res => res.json())
            .then(data => {
                setEmployees(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'FULL_TIME': return 'text-blue-600 bg-blue-50';
            case 'PART_TIME': return 'text-orange-600 bg-orange-50';
            case 'CONTRACT': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const totalMonthlyPayroll = employees.filter(e => e.is_active).reduce((sum, e) => sum + parseFloat(e.base_salary || 0), 0);

    const filtered = employees.filter(emp => {
        const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && emp.is_active) || (filter === 'INACTIVE' && !emp.is_active) || emp.employment_type === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-gray-500">Manage employees and process payroll</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    Add Employee
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Employees</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{employees.filter(e => e.is_active).length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-orange-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Monthly Payroll Estimate</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(totalMonthlyPayroll)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filtered.map(emp => {
                    const styles = getTypeColor(emp.employment_type);
                    return (
                        <div key={emp.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${styles}`}>
                                    {emp.name?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        {emp.name}
                                        {!emp.is_active && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Inactive</span>}
                                    </h4>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <Briefcase size={14} /> {emp.job_title}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Mail size={12} /> {emp.email}</span>
                                        {emp.phone && <span className="flex items-center gap-1"><Phone size={12} /> {emp.phone}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(emp.base_salary)}<span className="text-[10px] text-gray-400 font-normal uppercase"> / month</span></p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} mt-1`}>
                                    {emp.employment_type?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No employees found.
                    </div>
                )}
            </div>
        </div>
    );
}
