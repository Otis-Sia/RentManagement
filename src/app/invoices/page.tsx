"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, FileText, Send, 
    CheckCircle, Clock, AlertCircle, 
    Eye, Calendar, User, DollarSign, Edit, Trash
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Math.floor(Math.random() * 1000000)}`,
        tenant_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'SENT',
        subtotal: '',
        total: '',
        notes: ''
    });
    const [editFormData, setEditFormData] = useState({
        invoice_number: '',
        tenant_id: '',
        issue_date: '',
        due_date: '',
        status: 'SENT',
        subtotal: '',
        total: '',
        amount_paid: '',
        notes: ''
    });

    const fetchInvoices = () => {
        setLoading(true);
        fetch('/api/invoices/')
            .then(res => res.json())
            .then(data => {
                setInvoices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchTenants = () => {
        fetch('/api/tenants/')
            .then(res => res.json())
            .then(data => {
                setTenants(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchInvoices();
        fetchTenants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const subtotalVal = parseFloat(formData.subtotal);
            const response = await fetch('/api/invoices/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tenant_id: parseInt(formData.tenant_id),
                    subtotal: subtotalVal,
                    total: subtotalVal, // Assuming total = subtotal for simplicity here
                    amount_paid: 0
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({
                    invoice_number: `INV-${Math.floor(Math.random() * 1000000)}`,
                    tenant_id: '',
                    issue_date: new Date().toISOString().split('T')[0],
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'SENT',
                    subtotal: '',
                    total: '',
                    notes: ''
                });
                fetchInvoices();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving the invoice.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (inv: any) => {
        setCurrentInvoiceId(inv.id);
        setEditFormData({
            invoice_number: inv.invoice_number || '',
            tenant_id: inv.tenant_id?.toString() || '',
            issue_date: inv.issue_date || '',
            due_date: inv.due_date || '',
            status: inv.status || 'SENT',
            subtotal: inv.subtotal?.toString() || '',
            total: inv.total?.toString() || '',
            amount_paid: inv.amount_paid?.toString() || '0',
            notes: inv.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentInvoiceId) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/invoices/${currentInvoiceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    tenant_id: parseInt(editFormData.tenant_id),
                    subtotal: parseFloat(editFormData.subtotal),
                    total: parseFloat(editFormData.total),
                    amount_paid: parseFloat(editFormData.amount_paid)
                })
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                fetchInvoices();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while updating the invoice.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const response = await fetch(`/api/invoices/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchInvoices();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the invoice.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'SENT': case 'VIEWED': return 'text-blue-600 bg-blue-50';
            case 'DRAFT': return 'text-gray-600 bg-gray-50';
            case 'PARTIAL': return 'text-orange-600 bg-orange-50';
            case 'OVERDUE': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'SENT': return Send;
            case 'VIEWED': return Eye;
            case 'DRAFT': return Clock;
            case 'OVERDUE': return AlertCircle;
            default: return FileText;
        }
    };

    const totals = invoices.reduce((acc, inv) => {
        acc.total += parseFloat(inv.total || 0);
        acc.paid += parseFloat(inv.amount_paid || 0);
        acc.outstanding += (parseFloat(inv.total || 0) - parseFloat(inv.amount_paid || 0));
        return acc;
    }, { total: 0, paid: 0, outstanding: 0 });

    const filtered = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.tenants?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading && invoices.length === 0) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
                    <p className="text-gray-500">Create and manage client invoices</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Create Invoice
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Invoiced</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totals.total)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-green-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Collected</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totals.paid)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-red-500 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Outstanding</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(totals.outstanding)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                    <option value="ALL">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filtered.map(inv => {
                    const StatusIcon = getStatusIcon(inv.status);
                    const styles = getStatusColor(inv.status);
                    return (
                        <div key={inv.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${styles}`}>
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">#{inv.invoice_number}</h4>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <User size={12} /> {inv.tenants?.name || 'Unknown Client'}
                                    </p>
                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> Issued: {formatDate(inv.issue_date)}</span>
                                        <span className="flex items-center gap-1"><Calendar size={10} /> Due: {formatDate(inv.due_date)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                                    <div className={`flex items-center justify-end gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} mt-1`}>
                                        <StatusIcon size={12} />
                                        {inv.status}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(inv); }}
                                        className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No invoices found.
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Create New Invoice"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Invoice #</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.invoice_number}
                                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                            />
                        </div>
                        <SearchableSelect 
                            label="Tenant"
                            placeholder="Search for a tenant..."
                            options={tenants.map(t => ({
                                id: t.id,
                                label: t.name,
                                subLabel: `House ${t.properties?.house_number}`
                            }))}
                            value={formData.tenant_id}
                            onChange={(val) => setFormData({...formData, tenant_id: val})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Issue Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input 
                                required
                                type="number"
                                className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.subtotal}
                                onChange={(e) => setFormData({...formData, subtotal: e.target.value})}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                        <textarea 
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Optional notes..."
                        />
                    </div>
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
                            Create Invoice
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Invoice"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Invoice #</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.invoice_number}
                                onChange={(e) => setEditFormData({...editFormData, invoice_number: e.target.value})}
                            />
                        </div>
                        <SearchableSelect 
                            label="Tenant"
                            placeholder="Search for a tenant..."
                            options={tenants.map(t => ({
                                id: t.id,
                                label: t.name,
                                subLabel: `House ${t.properties?.house_number}`
                            }))}
                            value={editFormData.tenant_id}
                            onChange={(val) => setEditFormData({...editFormData, tenant_id: val})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Issue Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.issue_date}
                                onChange={(e) => setEditFormData({...editFormData, issue_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                            <input 
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.due_date}
                                onChange={(e) => setEditFormData({...editFormData, due_date: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Total Amount</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.total}
                                onChange={(e) => setEditFormData({...editFormData, total: e.target.value, subtotal: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Paid Amount</label>
                            <input 
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.amount_paid}
                                onChange={(e) => setEditFormData({...editFormData, amount_paid: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="SENT">Sent</option>
                                <option value="PAID">Paid</option>
                                <option value="PARTIAL">Partial</option>
                                <option value="OVERDUE">Overdue</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                        <textarea 
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.notes}
                            onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                        />
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
                            Update Invoice
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

