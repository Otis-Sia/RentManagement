"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Search, DollarSign, Calendar, CheckCircle, 
    AlertCircle, Clock, Send, FileText, Edit, Trash 
} from 'lucide-react';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';
import Receipt from '@/components/Receipt';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    splitRentPayment, 
    computePaymentStatus, 
    extractCoveredMonths, 
    calculateTenantBalance,
    type MonthSlot 
} from '@/lib/rentSplit';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('DATE_DESC');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    
    const getPreviewSlots = (tenantId: string, amount: string, datePaid: string, excludeId?: number) => {
        if (!tenantId || !amount || isNaN(parseFloat(amount))) return [];
        const tenant = tenants.find(t => t.id.toString() === tenantId);
        if (!tenant) return [];

        const otherPayments = payments.filter(p => 
            p.tenant_id.toString() === tenantId && 
            p.payment_type === 'RENT' && 
            p.id !== excludeId
        );
        const coveredMonths = extractCoveredMonths(otherPayments);

        return splitRentPayment(
            parseFloat(amount),
            datePaid,
            tenant.rent_amount,
            tenant.rent_due_day,
            tenant.lease_start,
            coveredMonths
        );
    };

    const [formData, setFormData] = useState({
        tenant_id: '',
        amount: '',
        payment_type: 'RENT',
        status: 'PAID',
        date_due: new Date().toISOString().split('T')[0],
        date_paid: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [editFormData, setEditFormData] = useState({
        tenant_id: '',
        amount: '',
        payment_type: 'RENT',
        status: 'PAID',
        date_due: '',
        date_paid: '',
        notes: ''
    });

    const fetchPayments = () => {
        setLoading(true);
        fetch('/api/payments/')
            .then(res => res.json())
            .then(data => {
                setPayments(data);
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
            .then(data => setTenants(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchPayments();
        fetchTenants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/payments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tenant_id: parseInt(formData.tenant_id),
                    amount: parseFloat(formData.amount)
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({
                    tenant_id: '',
                    amount: '',
                    payment_type: 'RENT',
                    status: 'PAID',
                    date_due: new Date().toISOString().split('T')[0],
                    date_paid: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                fetchPayments();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while recording the payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (payment: any) => {
        setCurrentPaymentId(payment.id);
        setEditFormData({
            tenant_id: payment.tenant_id?.toString() || '',
            amount: payment.amount?.toString() || '',
            payment_type: payment.payment_type || 'RENT',
            status: payment.status || 'PAID',
            date_due: payment.date_due || '',
            date_paid: payment.date_paid || '',
            notes: payment.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPaymentId) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/payments/${currentPaymentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    tenant_id: parseInt(editFormData.tenant_id),
                    amount: parseFloat(editFormData.amount)
                })
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                fetchPayments();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while updating the payment.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;
        try {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchPayments();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the payment.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'PENDING': return 'text-orange-600 bg-orange-50';
            case 'LATE': return 'text-red-600 bg-red-50';
            case 'PREPAID': return 'text-blue-600 bg-blue-50';
            case 'FAILED': return 'text-red-600 bg-red-50';
            case 'SEVERE': return 'text-red-600 bg-red-50';
            case 'DEFAULTED': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return CheckCircle;
            case 'PENDING': return Clock;
            default: return AlertCircle;
        }
    };

    const filteredPayments = payments
        .filter(payment => {
            // Show all recorded transactions in History
            const matchesSearch = payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.tenants?.name && payment.tenants.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (payment.tenants?.properties?.house_number && payment.tenants.properties.house_number.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'DATE_DESC') return new Date(b.date_paid || b.date_due).getTime() - new Date(a.date_paid || a.date_due).getTime();
            if (sortBy === 'DATE_ASC') return new Date(a.date_paid || a.date_due).getTime() - new Date(b.date_paid || b.date_due).getTime();
            if (sortBy === 'TENANT') return (a.tenants?.name || '').localeCompare(b.tenants?.name || '');
            if (sortBy === 'HOUSE') {
                const h1 = a.tenants?.properties?.house_number || '';
                const h2 = b.tenants?.properties?.house_number || '';
                return h1.localeCompare(h2, undefined, { numeric: true });
            }
            return 0;
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
                    <h1 className="text-3xl font-bold">Payments</h1>
                    <p className="text-gray-500">Track rent and fee collections</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Record Payment
                </button>
            </header>

            <div className="flex gap-6 mb-6 border-b border-gray-200">
                <button
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'ALL' 
                        ? 'border-orange-500 text-orange-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('ALL')}
                >
                    History
                </button>
                <button
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'BALANCE' 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('BALANCE')}
                >
                    Balances
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={activeTab === 'BALANCE' ? "Search tenants..." : "Search payments, tenants, or houses..."}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'ALL' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="LATE">Late</option>
                        <option value="FAILED">Failed</option>
                        <option value="SEVERE">Severe</option>
                        <option value="DEFAULTED">Defaulted</option>
                        <option value="PREPAID">Prepaid</option>
                    </select>
                )}
                {activeTab === 'ALL' && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        >
                            <option value="DATE_DESC">Newest First</option>
                            <option value="DATE_ASC">Oldest First</option>
                            <option value="TENANT">Tenant (A-Z)</option>
                            <option value="HOUSE">House Number</option>
                        </select>
                    </div>
                )}
            </div>

            {activeTab === 'BALANCE' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants
                        .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    t.properties?.house_number?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(tenant => {
                            const tenantPayments = payments.filter(p => p.tenant_id === tenant.id);
                            const balance = calculateTenantBalance(
                                tenant.rent_amount,
                                tenant.rent_due_day,
                                tenant.lease_start,
                                tenantPayments
                            );

                            return (
                                <div key={tenant.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{tenant.name}</h3>
                                            <p className="text-sm text-gray-500">House {tenant.properties?.house_number}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${balance.totalOwed > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {balance.totalOwed > 0 ? 'OWING' : 'UP TO DATE'}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Monthly Rent:</span>
                                            <span className="font-semibold">{formatCurrency(tenant.rent_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-t border-dashed border-gray-100 pt-3">
                                            <span className="text-gray-900 font-bold">Total Balance:</span>
                                            <span className={`text-lg font-black ${balance.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(balance.totalOwed)}
                                            </span>
                                        </div>
                                    </div>

                                    {balance.unpaidMonths.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unpaid Months</p>
                                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                {balance.unpaidMonths.map((m, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                                        <span className="font-medium">{m.label}</span>
                                                        <span className="text-red-500 font-bold">{formatCurrency(m.amountOwed)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    tenant_id: tenant.id.toString(),
                                                    amount: balance.totalOwed.toString(),
                                                    payment_type: 'RENT'
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                                        >
                                            Settle Balance
                                        </button>
                                        <Link 
                                            href={`/tenants/${tenant.id}`}
                                            className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-all"
                                        >
                                            Profile
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    {tenants.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                            No tenants found.
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                {filteredPayments.map(payment => {
                    const StatusIcon = getStatusIcon(payment.status);
                    const statusStyles = getStatusColor(payment.status);

                    return (
                        <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusStyles}`}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{payment.payment_type}</h3>
                                    <div className="text-sm">
                                        <Link href={`/tenants/${payment.tenants?.id}`} className="text-orange-600 hover:underline">
                                            {payment.tenants?.name}
                                        </Link>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-gray-500">House {payment.tenants?.properties?.house_number || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Calendar size={12} /> Due: {formatDate(payment.date_due)}
                                    </div>
                                </div>
                            </div>

                            {payment.payment_type === 'RENT' && payment.utilization_data?.length > 0 && (
                                <div className="flex-1 max-w-md hidden lg:block">
                                    <div className="flex flex-wrap gap-2">
                                        {payment.utilization_data.map((slot: any, idx: number) => (
                                            <div key={idx} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(slot.status)}`}>
                                                <span className="font-bold">{slot.month}</span>
                                                <span>{formatCurrency(slot.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${statusStyles}`}>
                                    <StatusIcon size={14} />
                                    {payment.status}
                                </div>
                            </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(payment)}
                                        className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(payment.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                                {(payment.status === 'PAID' || payment.status === 'PREPAID') ? (
                                    <button 
                                        onClick={() => {
                                            setSelectedPayment(payment);
                                            setIsReceiptModalOpen(true);
                                        }}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg text-sm font-semibold hover:bg-green-600 hover:text-white transition-all"
                                    >
                                        <FileText size={16} />
                                        Receipt
                                    </button>
                                ) : (
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-green-500 border border-green-500 rounded-lg text-sm font-semibold hover:bg-green-500 hover:text-white transition-all">
                                        <Send size={16} />
                                        Request
                                    </button>
                                )}
                            </div>
                        );
                    })}
                {filteredPayments.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No payments found.
                    </div>
                )}
            </div>
            )}

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Record New Payment"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SearchableSelect 
                        label="Tenant"
                        placeholder="Search for a tenant..."
                        options={tenants.map(t => ({
                            id: t.id,
                            label: t.name,
                            subLabel: `House ${t.properties?.house_number}`
                        }))}
                        value={formData.tenant_id}
                        onChange={(val) => {
                            const tenant = tenants.find(t => t.id.toString() === val);
                            if (tenant) {
                                const now = new Date();
                                const dueDate = new Date(now.getFullYear(), now.getMonth(), tenant.rent_due_day || 1);
                                const dueDateStr = dueDate.toISOString().split('T')[0];
                                const slots = getPreviewSlots(val, formData.amount || tenant.rent_amount?.toString(), formData.date_paid);
                                setFormData({
                                    ...formData, 
                                    tenant_id: val,
                                    date_due: dueDateStr,
                                    amount: tenant.rent_amount?.toString() || '',
                                    status: formData.payment_type === 'RENT' ? computePaymentStatus(slots) : 'PAID'
                                });
                            } else {
                                setFormData({...formData, tenant_id: val});
                            }
                        }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Payment Type</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.payment_type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    const slots = getPreviewSlots(formData.tenant_id, formData.amount, formData.date_paid);
                                    setFormData({
                                        ...formData, 
                                        payment_type: newType,
                                        status: newType === 'RENT' ? computePaymentStatus(slots) : 'PAID'
                                    });
                                }}
                            >
                                <option value="RENT">Rent</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="LATE_FEE">Late Fee</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                            <input 
                                required
                                readOnly
                                type="date"
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-not-allowed text-slate-600 font-medium transition-all"
                                value={formData.date_due}
                            />
                            <p className="text-[10px] text-slate-400 mt-1 italic">* Based on tenant's rent due day</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Payment Date</label>
                            <input 
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={formData.date_paid}
                                onChange={(e) => {
                                    const newPaid = e.target.value;
                                    const slots = getPreviewSlots(formData.tenant_id, formData.amount, newPaid);
                                    setFormData({
                                        ...formData, 
                                        date_paid: newPaid,
                                        status: formData.payment_type === 'RENT' ? computePaymentStatus(slots) : 'PAID'
                                    });
                                }}
                            />
                        </div>
                    </div>
                    {formData.payment_type !== 'RENT' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Status (Auto)</label>
                            <div className={`w-full px-4 py-2 rounded-lg font-bold border flex items-center gap-2 ${
                                formData.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                formData.status === 'LATE' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    formData.status === 'PAID' ? 'bg-green-500' :
                                    formData.status === 'LATE' ? 'bg-red-500' : 'bg-orange-500'
                                }`}></div>
                                {formData.status}
                            </div>
                        </div>
                    )}

                    {formData.payment_type === 'RENT' && formData.tenant_id && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Payment Split Preview</h4>
                            <div className="space-y-2">
                                {getPreviewSlots(formData.tenant_id, formData.amount, formData.date_paid).filter(s => s.amount > 0 || s.status === 'LATE').map((slot, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">{slot.label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(slot.status)}`}>
                                                {slot.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-slate-900 font-medium">{formatCurrency(slot.amount)}</div>
                                            {slot.amount < (tenants.find(t => t.id.toString() === formData.tenant_id)?.rent_amount || 0) && slot.amount > 0 && (
                                                <div className="text-[10px] text-red-500 font-bold">
                                                    Bal: {formatCurrency((tenants.find(t => t.id.toString() === formData.tenant_id)?.rent_amount || 0) - slot.amount)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {getPreviewSlots(formData.tenant_id, formData.amount, formData.date_paid).length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-2">Select a tenant and enter amount to see preview</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                        <textarea 
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Optional payment details..."
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
                            Record Payment
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Payment Record"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.amount}
                                onChange={(e) => {
                                    const newAmount = e.target.value;
                                    const slots = getPreviewSlots(editFormData.tenant_id, newAmount, editFormData.date_paid, currentPaymentId || undefined);
                                    setEditFormData({
                                        ...editFormData, 
                                        amount: newAmount,
                                        status: editFormData.payment_type === 'RENT' ? computePaymentStatus(slots) : editFormData.status
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Payment Type</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.payment_type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    const slots = getPreviewSlots(editFormData.tenant_id, editFormData.amount, editFormData.date_paid, currentPaymentId || undefined);
                                    setEditFormData({
                                        ...editFormData, 
                                        payment_type: newType,
                                        status: newType === 'RENT' ? computePaymentStatus(slots) : 'PAID'
                                    });
                                }}
                            >
                                <option value="RENT">Rent</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="LATE_FEE">Late Fee</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                            <input 
                                required
                                readOnly
                                type="date"
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-not-allowed text-slate-600 font-medium transition-all"
                                value={editFormData.date_due}
                            />
                        </div>
                        {editFormData.payment_type !== 'RENT' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Status (Auto)</label>
                                <div className={`w-full px-4 py-2 rounded-lg font-bold border flex items-center gap-2 ${
                                    editFormData.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                    editFormData.status === 'LATE' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-orange-50 text-orange-700 border-orange-200'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        editFormData.status === 'PAID' ? 'bg-green-500' :
                                        editFormData.status === 'LATE' ? 'bg-red-500' : 'bg-orange-500'
                                    }`}></div>
                                    {editFormData.status}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Payment Date</label>
                        <input 
                            type="date"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.date_paid}
                            onChange={(e) => {
                                const newPaid = e.target.value;
                                const slots = getPreviewSlots(editFormData.tenant_id, editFormData.amount, newPaid, currentPaymentId || undefined);
                                setEditFormData({
                                    ...editFormData, 
                                    date_paid: newPaid,
                                    status: editFormData.payment_type === 'RENT' ? computePaymentStatus(slots) : 'PAID'
                                });
                            }}
                        />
                    </div>

                    {editFormData.payment_type === 'RENT' && editFormData.tenant_id && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Payment Split Preview</h4>
                            <div className="space-y-2">
                                {getPreviewSlots(editFormData.tenant_id, editFormData.amount, editFormData.date_paid, currentPaymentId || undefined).filter(s => s.amount > 0 || s.status === 'LATE').map((slot, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">{slot.label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(slot.status)}`}>
                                                {slot.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-slate-900 font-medium">{formatCurrency(slot.amount)}</div>
                                            {slot.amount < (tenants.find(t => t.id.toString() === editFormData.tenant_id)?.rent_amount || 0) && slot.amount > 0 && (
                                                <div className="text-[10px] text-red-500 font-bold">
                                                    Bal: {formatCurrency((tenants.find(t => t.id.toString() === editFormData.tenant_id)?.rent_amount || 0) - slot.amount)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            Update Record
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Receipt Modal */}
            <Modal 
                isOpen={isReceiptModalOpen} 
                onClose={() => setIsReceiptModalOpen(false)} 
                title="Payment Receipt"
                maxWidth="2xl"
            >
                {selectedPayment && (
                    <Receipt 
                        payment={selectedPayment}
                        tenant={selectedPayment.tenants}
                        balance={calculateTenantBalance(
                            selectedPayment.tenants?.rent_amount || 0,
                            selectedPayment.tenants?.rent_due_day || 1,
                            selectedPayment.tenants?.lease_start || new Date().toISOString(),
                            payments.filter(p => p.tenant_id === selectedPayment.tenant_id)
                        )}
                    />
                )}
            </Modal>
        </div>
    );
}
