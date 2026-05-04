"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Home, User, DollarSign, 
    Wrench, Clock, CheckCircle, Plus, Pencil,
    MapPin, Ruler, Bed, Bath
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function HouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [house, setHouse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        house_number: '',
        address: '',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: '',
        monthly_rent: '',
        is_occupied: false
    });

    const fetchHouse = () => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/houses/${id}`)
            .then(res => res.json())
            .then(data => {
                setHouse(data);
                setEditFormData({
                    house_number: data.house_number || '',
                    address: data.address || '',
                    bedrooms: data.bedrooms || 1,
                    bathrooms: data.bathrooms || 1,
                    square_feet: data.square_feet?.toString() || '',
                    monthly_rent: data.monthly_rent?.toString() || '',
                    is_occupied: data.is_occupied || false
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchHouse();
    }, [id]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/houses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    bedrooms: parseInt(editFormData.bedrooms.toString()),
                    bathrooms: parseInt(editFormData.bathrooms.toString()),
                    square_feet: editFormData.square_feet ? parseInt(editFormData.square_feet) : null,
                    monthly_rent: parseFloat(editFormData.monthly_rent)
                })
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                fetchHouse();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while updating the house.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!house) return <div className="p-8 text-center text-gray-500">House not found</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-orange-600 font-semibold mb-6 hover:translate-x-[-4px] transition-transform"
            >
                <ArrowLeft size={18} />
                Back to Houses
            </button>

            {/* Property Hero */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-slate-900">House {house.house_number}</h1>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                            >
                                <Pencil size={20} />
                            </button>
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            <MapPin size={18} className="text-orange-500" />
                            {house.address || 'No address provided'}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                        house.is_occupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {house.is_occupied ? 'Occupied' : 'Vacant'}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                    <div className="p-6 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Monthly Rent</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(house.monthly_rent)}</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Bed size={12}/> Bedrooms</p>
                        <p className="text-2xl font-bold text-slate-900">{house.bedrooms || 0}</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Bath size={12}/> Bathrooms</p>
                        <p className="text-2xl font-bold text-slate-900">{house.bathrooms || 0}</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Ruler size={12}/> Area</p>
                        <p className="text-2xl font-bold text-slate-900">{house.square_feet || '—'} sqft</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Current Tenant */}
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-orange-500" size={24} />
                                Current Tenant
                            </h2>
                            {!house.current_tenant && (
                                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Plus size={16} />
                                    Add Tenant
                                </button>
                            )}
                        </div>
                        
                        {house.current_tenant ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Name</p>
                                    <Link href={`/tenants/${house.current_tenant.id}`} className="text-lg font-bold text-orange-600 hover:underline">
                                        {house.current_tenant.name}
                                    </Link>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Lease Period</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {formatDate(house.current_tenant.lease_start)} — {formatDate(house.current_tenant.lease_end)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Contact</p>
                                    <p className="text-slate-600 font-medium">{house.current_tenant.email} • {house.current_tenant.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No current tenant assigned.</p>
                            </div>
                        )}
                    </section>

                    {/* Payment History */}
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <DollarSign className="text-green-500" size={24} />
                                Payment History
                            </h2>
                            <button className="text-orange-600 text-sm font-bold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Due Date</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {house.payment_history?.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium">{p.payment_type}</td>
                                            <td className="px-6 py-4 text-sm font-bold">{formatCurrency(p.amount)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.date_due)}</td>
                                            <td className="px-6 py-4">
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
                            {!house.payment_history?.length && (
                                <p className="p-8 text-center text-gray-400 text-sm">No payment history available.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Maintenance Requests */}
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Wrench className="text-blue-500" size={24} />
                            Recent Maintenance
                        </h2>
                        <div className="space-y-4">
                            {house.maintenance_requests?.map((m: any) => (
                                <div key={m.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                            m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{m.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(m.request_date)}</span>
                                        {m.cost && <span className="font-bold text-slate-700">{formatCurrency(m.cost)}</span>}
                                    </div>
                                </div>
                            ))}
                            {!house.maintenance_requests?.length && (
                                <p className="text-center text-gray-400 text-sm py-4">No maintenance history.</p>
                            )}
                        </div>
                    </section>

                    {/* Tenant History */}
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Clock className="text-slate-400" size={24} />
                            Tenant History
                        </h2>
                        <div className="space-y-4">
                            {house.tenant_history?.map((h: any) => (
                                <div key={h.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                        {h.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <Link href={`/tenants/${h.id}`} className="text-sm font-bold text-slate-900 hover:text-orange-600 block">
                                            {h.name}
                                        </Link>
                                        <p className="text-[10px] text-gray-400">{formatDate(h.lease_start)} — {formatDate(h.lease_end)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit House Details"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">House Number</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.house_number}
                                onChange={(e) => setEditFormData({...editFormData, house_number: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Rent</label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.monthly_rent}
                                onChange={(e) => setEditFormData({...editFormData, monthly_rent: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                        <input 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.address}
                            onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Bedrooms</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.bedrooms}
                                onChange={(e) => setEditFormData({...editFormData, bedrooms: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Bathrooms</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.bathrooms}
                                onChange={(e) => setEditFormData({...editFormData, bathrooms: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Sq Ft</label>
                            <input 
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.square_feet}
                                onChange={(e) => setEditFormData({...editFormData, square_feet: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox"
                            id="is_occupied"
                            checked={editFormData.is_occupied}
                            onChange={(e) => setEditFormData({...editFormData, is_occupied: e.target.checked})}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_occupied" className="text-sm font-bold text-slate-700">Mark as Occupied</label>
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
                            Update House
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
