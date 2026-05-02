"use client";

import React, { useEffect, useState } from 'react';
import { 
    Plus, Search, Inbox, AlertCircle, 
    Engineering, CheckCircle, Filter, 
    MapPin, Clock, Droplets, Snowflake, 
    Zap, Wrench 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MaintenancePage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
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
    }, []);

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

    if (loading) return (
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
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all shadow-sm">
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
                    <div key={request.id} className={`bg-white p-5 rounded-xl border-l-4 hover:shadow-md transition-shadow cursor-pointer group ${
                        request.status === 'COMPLETED' ? 'opacity-75' : ''
                    }`} style={{ borderLeftColor: request.priority === 'EMERGENCY' ? '#ef4444' : request.status === 'IN_PROGRESS' ? '#3b82f6' : '#e5e7eb' }}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg shrink-0 ${getPriorityStyles(request.priority)}`}>
                                    {getCategoryIcon(request.category)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-500">#{request.id.slice(0, 8).toUpperCase()}</span>
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 flex justify-center">
                <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                    Load More Requests
                </button>
            </div>
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
