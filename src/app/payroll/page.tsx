"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, Play, CheckCircle, Clock, 
    DollarSign, Users, Calendar, ArrowLeft 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayrollPage() {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('list');
    const [selectedRun, setSelectedRun] = useState<any>(null);

    useEffect(() => {
        fetch('/api/payroll/')
            .then(res => res.json())
            .then(data => {
                setRuns(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'APPROVED': return 'text-blue-600 bg-blue-50';
            case 'PROCESSING': return 'text-orange-600 bg-orange-50';
            case 'DRAFT': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Payroll Runs</h1>
                    <p className="text-gray-500">Process and manage employee payroll</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                    <Plus size={18} />
                    New Payroll Run
                </button>
            </header>

            <div className="grid grid-cols-1 gap-3">
                {runs.map(run => {
                    const styles = getStatusColor(run.status);
                    return (
                        <div key={run.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer"
                            onClick={() => { setSelectedRun(run); /* setActiveView('detail'); */ }}>
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${styles}`}>
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{run.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock size={10} /> {formatDate(run.period_start)} — {formatDate(run.period_end)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(run.total_net || 0)}</p>
                                <div className={`flex items-center justify-end gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} mt-1`}>
                                    {run.status === 'PAID' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {run.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {runs.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium">
                        No payroll runs yet.
                    </div>
                )}
            </div>
        </div>
    );
}
