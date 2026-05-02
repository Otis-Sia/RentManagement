"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Plus, Search, Filter, MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HousesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/houses/')
            .then(res => res.json())
            .then(data => {
                setProperties(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredProperties = properties.filter(p => 
        p.house_number.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: properties.length,
        occupied: properties.filter(p => p.is_occupied).length,
        vacant: properties.filter(p => !p.is_occupied).length,
        occupancyRate: properties.length > 0 ? Math.round((properties.filter(p => p.is_occupied).length / properties.length) * 100) : 0
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Properties</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your entire real estate portfolio.</p>
                </div>
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm">
                    <Plus size={20} />
                    <span>Add New Property</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Properties</p>
                        <Home className="text-orange-500 bg-orange-50 p-2 rounded-lg" size={40} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Occupancy</p>
                        <div className="text-orange-500 bg-orange-50 p-2 rounded-lg flex items-center justify-center h-10 w-10">
                           <Users size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.occupancyRate}%</p>
                    <p className="text-xs text-slate-500 font-medium mt-2">{stats.occupied} Occupied / {stats.vacant} Vacant</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Monthly Revenue</p>
                        <div className="text-orange-500 bg-orange-50 p-2 rounded-lg flex items-center justify-center h-10 w-10">
                           <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0))}</p>
                    <p className="text-xs text-slate-500 font-medium mt-2">Potential monthly income</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 rounded-lg text-sm transition-all outline-none" 
                                placeholder="Search by address or house number..." 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">House Number</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specs</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rent</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProperties.map((property) => (
                                <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{property.house_number}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{property.address}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {property.bedrooms} Bed / {property.bathrooms} Bath
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                        {formatCurrency(property.monthly_rent)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                                            property.is_occupied 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                property.is_occupied ? 'bg-emerald-600' : 'bg-orange-600'
                                            }`}></span>
                                            {property.is_occupied ? 'Occupied' : 'Vacant'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/houses/${property.id}`} className="p-2 text-slate-500 hover:text-orange-500 transition-colors">
                                                <Eye size={20} />
                                            </Link>
                                            <button className="p-2 text-slate-500 hover:text-orange-500 transition-colors">
                                                <Edit size={20} />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Helper icons that were missing
function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
