"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, User, Home, DollarSign, 
    Wrench, Clock, CheckCircle, Mail, 
    Phone, Calendar, Pencil, ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [tenant, setTenant] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '',
        deposit: '',
        rent_due_day: '',
        is_active: true
    });

    const fetchTenant = () => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/tenants/${id}`)
            .then(res => res.json())
            .then(data => {
                setTenant(data);
                setEditFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    property_id: data.property_id?.toString() || '',
                    lease_start: data.lease_start || '',
                    lease_end: data.lease_end || '',
                    rent_amount: data.rent_amount?.toString() || '',
                    deposit: data.deposit?.toString() || '',
                    rent_due_day: data.rent_due_day?.toString() || '1',
                    is_active: data.is_active ?? true
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchProperties = () => {
        fetch('/api/houses/?vacant=true')
            .then(res => res.json())
            .then(data => setProperties(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchTenant();
        fetchProperties();
    }, [id]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/tenants/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    property_id: editFormData.property_id ? parseInt(editFormData.property_id) : null,
                    rent_amount: parseFloat(editFormData.rent_amount),
                    deposit: parseFloat(editFormData.deposit),
                    rent_due_day: parseInt(editFormData.rent_due_day)
                })
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                fetchTenant();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while updating the tenant.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!tenant) return <div className="p-8 text-center text-gray-500">Tenant not found</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-orange-600 font-semibold mb-6 hover:translate-x-[-4px] transition-transform"
            >
                <ArrowLeft size={18} />
                Back to Tenants
            </button>

            {/* Tenant Hero */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-3xl font-black">
                            {tenant.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900">{tenant.name}</h1>
                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                >
                                    <Pencil size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-4 text-gray-500">
                                <span className="flex items-center gap-2"><Mail size={16} className="text-orange-500" /> {tenant.email}</span>
                                <span className="flex items-center gap-2"><Phone size={16} className="text-orange-500" /> {tenant.phone}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                        tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {tenant.is_active ? 'Active Lease' : 'Inactive'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><Home size={12}/> Current Property</p>
                        {tenant.property ? (
                            <Link href={`/houses/${tenant.property}`} className="group">
                                <p className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                                    House {tenant.house_number}
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1">{tenant.house_address}</p>
                            </Link>
                        ) : (
                            <p className="text-lg font-bold text-gray-400 italic">No active property</p>
                        )}
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><DollarSign size={12}/> Monthly Rent</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(tenant.rent_amount)}</p>
                        <p className="text-[10px] text-gray-400 font-bold">Due on day {tenant.rent_due_day} of each month</p>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={12}/> Lease Period</p>
                        <p className="text-lg font-bold text-slate-900">
                            {formatDate(tenant.lease_start)} — {formatDate(tenant.lease_end)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <DollarSign className="text-green-500" size={24} />
                            Payment Records
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tenant.payments?.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{p.payment_type}</p>
                                            <p className="text-[10px] text-gray-400">Due: {formatDate(p.date_due)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">{formatCurrency(p.amount)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!tenant.payments?.length && (
                            <p className="p-8 text-center text-gray-400 text-sm">No payment history found.</p>
                        )}
                    </div>
                </section>

                {/* Maintenance Requests */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Wrench className="text-blue-500" size={24} />
                        Service Requests
                    </h2>
                    <div className="space-y-4">
                        {tenant.maintenance_requests?.map((m: any) => (
                            <div key={m.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900">{m.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {m.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{m.description}</p>
                                <div className="flex items-center justify-between text-[10px] text-gray-400">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 font-bold text-slate-500 uppercase tracking-tighter">
                                            <Calendar size={10} /> {formatDate(m.request_date)}
                                        </span>
                                        <span className={`font-bold uppercase tracking-widest ${
                                            m.priority === 'EMERGENCY' ? 'text-red-500' : 'text-orange-500'
                                        }`}>{m.priority}</span>
                                    </div>
                                    {m.cost && <span className="text-slate-900 font-bold">{formatCurrency(m.cost)}</span>}
                                </div>
                            </div>
                        ))}
                        {!tenant.maintenance_requests?.length && (
                            <p className="text-center text-gray-400 text-sm py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                No maintenance history.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Tenant Details"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input 
                                required
                                type="email"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Assigned Property</label>
                        <select 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.property_id}
                            onChange={(e) => setEditFormData({...editFormData, property_id: e.target.value})}
                        >
                            <option value="">No Property Assigned</option>
                            {/* If tenant already has a property, show it in the list even if it's not vacant */}
                            {tenant.properties && (
                                <option value={tenant.properties.id}>{tenant.properties.house_number} (Current)</option>
                            )}
                            {properties.map(p => (
                                p.id !== tenant.properties?.id && (
                                    <option key={p.id} value={p.id}>{p.house_number} - {p.address}</option>
                                )
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lease Start</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.lease_start}
                                onChange={(e) => setEditFormData({...editFormData, lease_start: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lease End</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.lease_end}
                                onChange={(e) => setEditFormData({...editFormData, lease_end: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Rent</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.rent_amount}
                                onChange={(e) => setEditFormData({...editFormData, rent_amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Deposit</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.deposit}
                                onChange={(e) => setEditFormData({...editFormData, deposit: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Day</label>
                            <input 
                                required
                                type="number"
                                min="1"
                                max="31"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.rent_due_day}
                                onChange={(e) => setEditFormData({...editFormData, rent_due_day: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox"
                            id="is_active"
                            checked={editFormData.is_active}
                            onChange={(e) => setEditFormData({...editFormData, is_active: e.target.checked})}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-slate-700">Active Lease</label>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : null}
                            Update Tenant
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
