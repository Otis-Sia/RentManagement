"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Search, MapPin, Mail, Phone, Calendar, MoreVertical } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetch('/api/tenants/')
            .then(res => res.json())
            .then(data => {
                setTenants(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                             t.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || (filter === 'Active' && t.is_active) || (filter === 'Inactive' && !t.is_active);
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-500">
            <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
                <div className="flex items-center gap-4">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-sm text-sm">
                        <UserPlus size={18} />
                        <span className="hidden sm:inline">Add Tenant</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400" 
                            placeholder="Search tenants by name, email, or unit..." 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
                        {['All', 'Active', 'Inactive'].map((f) => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${
                                    filter === f 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white border border-gray-200 text-slate-600 hover:border-orange-500'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                                    <th className="px-6 py-4">Tenant</th>
                                    <th className="px-6 py-4">Assigned Unit</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Lease Dates</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    <span className="text-sm font-bold text-slate-500">{tenant.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{tenant.name}</p>
                                                    <p className="text-xs text-slate-500">Member since {new Date(tenant.created_at).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-orange-500" />
                                                <span className="font-medium text-slate-700 text-sm">
                                                    {tenant.properties?.house_number || 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-slate-600 flex items-center gap-1"><Mail size={12} /> {tenant.email}</p>
                                                <p className="text-slate-500 flex items-center gap-1"><Phone size={12} /> {tenant.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-700">{formatDate(tenant.lease_start)}</p>
                                                <p className="text-xs text-slate-500 text-nowrap">to {formatDate(tenant.lease_end)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                tenant.is_active 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {tenant.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-orange-500 transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
