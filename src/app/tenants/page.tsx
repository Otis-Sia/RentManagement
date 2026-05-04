"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, User, Home, 
    Filter, MapPin, Phone, Mail,
    ChevronRight, ArrowUpRight, ArrowDownRight, Calendar, DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';
import { Edit, Trash } from 'lucide-react';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentTenantId, setCurrentTenantId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '0',
        deposit: '0',
        rent_due_day: '1',
        is_active: true,
        pay_initial_rent: true,
        pay_deposit: true
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '',
        deposit: '0',
        rent_due_day: '1',
        is_active: true
    });

    const fetchTenants = () => {
        setLoading(true);
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
    };

    const fetchProperties = () => {
        fetch('/api/houses/?vacant=true')
            .then(res => res.json())
            .then(data => {
                setProperties(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchTenants();
        fetchProperties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/tenants/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rent_amount: parseFloat(formData.rent_amount),
                    deposit: parseFloat(formData.deposit),
                    rent_due_day: parseInt(formData.rent_due_day),
                    property_id: formData.property_id ? parseInt(formData.property_id) : null,
                    // Pass these flags to the API if needed, or handle amount logic here
                    deposit: formData.pay_deposit ? parseFloat(formData.deposit) : 0,
                    initial_rent_paid: formData.pay_initial_rent // We'll use this in the API
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    property_id: '',
                    lease_start: '',
                    lease_end: '',
                    rent_amount: '0',
                    deposit: '0',
                    rent_due_day: '1',
                    is_active: true,
                    pay_initial_rent: true,
                    pay_deposit: true
                });
                fetchTenants();
                fetchProperties();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving the tenant.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (tenant: any) => {
        setCurrentTenantId(tenant.id);
        setEditFormData({
            name: tenant.name || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            property_id: tenant.property_id?.toString() || '',
            lease_start: tenant.lease_start || '',
            lease_end: tenant.lease_end || '',
            rent_amount: tenant.rent_amount?.toString() || '',
            deposit: tenant.deposit?.toString() || '0',
            rent_due_day: tenant.rent_due_day?.toString() || '1',
            is_active: tenant.is_active ?? true
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTenantId) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/tenants/${currentTenantId}`, {
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
                fetchTenants();
                fetchProperties();
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

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;
        try {
            const response = await fetch(`/api/tenants/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTenants();
                fetchProperties();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the tenant.');
        }
    };

    const filtered = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.properties?.house_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && t.is_active) || (statusFilter === 'INACTIVE' && !t.is_active);
        return matchesSearch && matchesStatus;
    });

    if (loading && tenants.length === 0) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
                    <p className="text-gray-500">Manage your property residents</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Add Tenant
                </button>
            </header>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or house..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="INACTIVE">Inactive Only</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(tenant => (
                    <Link 
                        key={tenant.id} 
                        href={`/tenants/${tenant.id}`}
                        className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.preventDefault(); handleEdit(tenant); }}
                                className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all"
                            >
                                <Edit size={14} />
                            </button>
                            <button 
                                onClick={(e) => { e.preventDefault(); handleDelete(tenant.id); }}
                                className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                            >
                                <Trash size={14} />
                            </button>
                            <div className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-orange-500">
                                <ChevronRight size={14} />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xl">
                                {tenant.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{tenant.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {tenant.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Home size={14} className="text-orange-500" />
                                <span className="font-medium text-slate-700">House {tenant.properties?.house_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone size={14} className="text-orange-500" />
                                <span>{tenant.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={14} className="text-orange-500" />
                                <span className="truncate">{tenant.email}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Monthly Rent</p>
                                <p className="text-lg font-black text-slate-900">{formatCurrency(tenant.rent_amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Due Date</p>
                                <p className="text-sm font-bold text-slate-700">Day {tenant.rent_due_day}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <User className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No tenants found matching your criteria.</p>
                </div>
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Add New Tenant"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input 
                                required
                                type="email"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+254..."
                            />
                        </div>
                    </div>
                    <SearchableSelect 
                        label="Assigned Property"
                        placeholder="Search for a vacant house..."
                        options={properties.map(p => ({
                            id: p.id,
                            label: `House ${p.house_number}`,
                            subLabel: `${p.address} - ${formatCurrency(p.price)}`
                        }))}
                        value={formData.property_id}
                        onChange={(val) => {
                            const prop = properties.find(p => p.id.toString() === val);
                            if (prop) {
                                setFormData({
                                    ...formData, 
                                    property_id: val,
                                    rent_amount: prop.price.toString(),
                                    deposit: prop.price.toString()
                                });
                            } else {
                                setFormData({...formData, property_id: val});
                            }
                        }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lease Start</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    required
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                    value={formData.lease_start}
                                    onChange={(e) => setFormData({...formData, lease_start: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lease End</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    required
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                    value={formData.lease_end}
                                    onChange={(e) => setFormData({...formData, lease_end: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Day</label>
                            <input 
                                required
                                type="number"
                                min="1"
                                max="31"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                                value={formData.rent_due_day}
                                onChange={(e) => setFormData({...formData, rent_due_day: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2 flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.pay_initial_rent}
                                        onChange={(e) => setFormData({...formData, pay_initial_rent: e.target.checked})}
                                    />
                                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">Initial Rent Paid</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.pay_deposit}
                                        onChange={(e) => setFormData({...formData, pay_deposit: e.target.checked})}
                                    />
                                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">Deposit Paid</span>
                            </label>
                        </div>
                    </div>
                    {formData.property_id && (
                        <div className="text-xs text-slate-500 italic px-2">
                            * Rent & Deposit set to {formatCurrency(parseFloat(formData.rent_amount))} based on property price.
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : null}
                            Save Tenant
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Tenant"
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
                    <SearchableSelect 
                        label="Assigned Property"
                        placeholder="Search for a house..."
                        options={properties.map(p => ({
                            id: p.id,
                            label: `House ${p.house_number}`,
                            subLabel: p.address
                        }))}
                        value={editFormData.property_id}
                        onChange={(val) => setEditFormData({...editFormData, property_id: val})}
                    />
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
                            id="edit_is_active"
                            checked={editFormData.is_active}
                            onChange={(e) => setEditFormData({...editFormData, is_active: e.target.checked})}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="edit_is_active" className="text-sm font-bold text-slate-700">Active Lease</label>
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

