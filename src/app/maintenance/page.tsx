"use client";

import React, { useEffect, useState } from 'react';
import { 
    Plus, Search, Inbox, AlertCircle, 
    CheckCircle, Filter, 
    MapPin, Clock, Droplets, Snowflake, 
    Zap, Wrench, X, User, MessageSquare, Edit, Trash
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';

export default function MaintenancePage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        tenant_id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'GENERAL',
        status: 'OPEN'
    });
    const [editFormData, setEditFormData] = useState({
        tenant_id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'GENERAL',
        status: 'OPEN',
        cost: ''
    });

    const fetchRequests = () => {
        setLoading(true);
        fetch('/api/maintenance/')
            .then(res => res.json())
            .then(data => {
                setRequests(data);
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
        fetchRequests();
        fetchTenants();
    }, []);

    const handleView = (request: any) => {
        setCurrentRequestId(request.id);
        setEditFormData({
            tenant_id: request.tenant_id?.toString() || '',
            title: request.title || '',
            description: request.description || '',
            priority: request.priority || 'MEDIUM',
            category: request.category || 'GENERAL',
            status: request.status || 'OPEN',
            cost: request.cost?.toString() || ''
        });
        setIsDetailModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/maintenance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tenant_id: parseInt(formData.tenant_id)
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({
                    tenant_id: '',
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    category: 'GENERAL',
                    status: 'OPEN'
                });
                fetchRequests();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving the request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (request: any) => {
        setCurrentRequestId(request.id);
        setEditFormData({
            tenant_id: request.tenant_id?.toString() || '',
            title: request.title || '',
            description: request.description || '',
            priority: request.priority || 'MEDIUM',
            category: request.category || 'GENERAL',
            status: request.status || 'OPEN',
            cost: request.cost?.toString() || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentRequestId) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/maintenance/${currentRequestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    tenant_id: parseInt(editFormData.tenant_id),
                    cost: editFormData.cost ? parseFloat(editFormData.cost) : null
                })
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                setIsDetailModalOpen(false);
                fetchRequests();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while updating the request.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this maintenance request?')) return;
        try {
            const response = await fetch(`/api/maintenance/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchRequests();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the request.');
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                             r.description?.toLowerCase().includes(search.toLowerCase()) ||
                             r.tenants?.properties?.house_number.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const metrics = {
        open: requests.filter(r => r.status === 'OPEN').length,
        highPriority: requests.filter(r => r.priority === 'HIGH' || r.priority === 'EMERGENCY').length,
        inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
        resolved: requests.filter(r => r.status === 'COMPLETED').length
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'EMERGENCY': return 'bg-red-100 text-red-700';
            case 'HIGH': return 'bg-orange-100 text-orange-700';
            case 'MEDIUM': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toUpperCase()) {
            case 'PLUMBING': return <Droplets size={20} />;
            case 'HVAC': return <Snowflake size={20} />;
            case 'ELECTRICAL': return <Zap size={20} />;
            default: return <Wrench size={20} />;
        }
    };

    const selectedRequest = requests.find(r => r.id === currentRequestId);

    if (loading && requests.length === 0) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="flex-1 w-full px-6 py-8 lg:px-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Maintenance Requests</h1>
                    <p className="text-slate-500">Manage and track property repairs and service tickets.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={18} />
                        New Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard icon={<Inbox size={18} />} label="Open" value={metrics.open} />
                <MetricCard icon={<AlertCircle size={18} />} label="High Priority" value={metrics.highPriority} color="text-red-600 bg-red-50" />
                <MetricCard icon={<Engineering size={18} />} label="In Progress" value={metrics.inProgress} color="text-blue-600 bg-blue-50" />
                <MetricCard icon={<CheckCircle size={18} />} label="Resolved" value={metrics.resolved} color="text-green-600 bg-green-50" />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg w-full lg:w-auto">
                    {['All', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`flex-1 lg:flex-none px-4 py-2 text-sm font-bold rounded-md transition-all ${
                                statusFilter === s 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {s === 'All' ? 'All Requests' : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="Search by ticket ID, issue, or property..." 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shrink-0">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {filteredRequests.map((request) => (
                    <div 
                        key={request.id} 
                        onClick={() => handleView(request)}
                        className={`bg-white p-5 rounded-xl border-l-4 hover:shadow-md transition-shadow cursor-pointer group ${
                            request.status === 'COMPLETED' ? 'opacity-75' : ''
                        }`} 
                        style={{ borderLeftColor: request.priority === 'EMERGENCY' ? '#ef4444' : request.status === 'IN_PROGRESS' ? '#3b82f6' : '#e5e7eb' }}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg shrink-0 ${getPriorityStyles(request.priority)}`}>
                                    {getCategoryIcon(request.category)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-500">#{request.id.toString().slice(-8).toUpperCase()}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityStyles(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(request.status)}`}>
                                            {request.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className={`text-lg font-bold text-slate-900 group-hover:text-orange-500 transition-colors ${request.status === 'COMPLETED' ? 'line-through text-slate-500' : ''}`}>
                                        {request.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{request.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 ml-14 lg:ml-0 shrink-0">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> Location</span>
                                    <span className="text-sm font-medium text-slate-900">{request.tenants?.properties?.house_number || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> Submitted</span>
                                    <span className="text-sm font-medium text-slate-900">{formatDate(request.request_date)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(request); }}
                                        className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(request.id); }}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredRequests.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                    No maintenance requests found.
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                    Load More Requests
                </button>
            </div>

            <Modal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                title="Ticket Details & Resolution"
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{selectedRequest.title}</h3>
                                    <p className="text-sm text-slate-500">#{selectedRequest.id.toString().slice(-8).toUpperCase()}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityStyles(selectedRequest.priority)}`}>
                                    {selectedRequest.priority}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tenant</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><User size={12} /> {selectedRequest.tenants?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><MapPin size={12} /> House {selectedRequest.tenants?.properties?.house_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1">{getCategoryIcon(selectedRequest.category)} {selectedRequest.category}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><Clock size={12} /> {formatDate(selectedRequest.request_date)}</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Description</p>
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 italic">
                                    "{selectedRequest.description}"
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle size={16} className="text-orange-500" /> Resolution Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Status</label>
                                    <select 
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm"
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Repair Cost (KES)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm"
                                        value={editFormData.cost}
                                        onChange={(e) => setEditFormData({...editFormData, cost: e.target.value})}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-between items-center">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        handleEdit(selectedRequest);
                                    }}
                                    className="text-orange-500 text-xs font-bold hover:underline flex items-center gap-1"
                                >
                                    <Edit size={12} /> Edit Full Ticket
                                </button>
                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm"
                                    >
                                        Close
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-slate-200"
                                    >
                                        {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : null}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="New Maintenance Request"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SearchableSelect 
                        label="Tenant / Property"
                        placeholder="Search for a tenant..."
                        options={tenants.map(t => ({
                            id: t.id,
                            label: t.name,
                            subLabel: `House ${t.properties?.house_number}`
                        }))}
                        value={formData.tenant_id}
                        onChange={(val) => setFormData({...formData, tenant_id: val})}
                    />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Issue Title</label>
                        <input 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Leaking Faucet"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                        <select 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="GENERAL">General</option>
                            <option value="PLUMBING">Plumbing</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="HVAC">HVAC</option>
                            <option value="APPLIANCE">Appliance</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                        <select 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="EMERGENCY">Emergency</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Provide more details about the issue..."
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
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Maintenance Request"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <SearchableSelect 
                        label="Tenant / Property"
                        placeholder="Search for a tenant..."
                        options={tenants.map(t => ({
                            id: t.id,
                            label: t.name,
                            subLabel: `House ${t.properties?.house_number}`
                        }))}
                        value={editFormData.tenant_id}
                        onChange={(val) => setEditFormData({...editFormData, tenant_id: val})}
                    />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Issue Title</label>
                        <input 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.category}
                                onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                            >
                                <option value="GENERAL">General</option>
                                <option value="PLUMBING">Plumbing</option>
                                <option value="ELECTRICAL">Electrical</option>
                                <option value="HVAC">HVAC</option>
                                <option value="APPLIANCE">Appliance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.priority}
                                onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                            <select 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Repair Cost</label>
                            <input 
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                value={editFormData.cost}
                                onChange={(e) => setEditFormData({...editFormData, cost: e.target.value})}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
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
                            Update Ticket
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function MetricCard({ icon, label, value, color = "text-slate-500 bg-gray-50" }: any) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 duration-300">
            <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg inline-flex ${color}`}>
                {icon}
                <p className="text-sm font-bold uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function Engineering(props: any) {
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
      <path d="M2 12h5l2 3 3-6 3 6 2-3h5" />
    </svg>
  )
}
