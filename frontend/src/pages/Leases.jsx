import React from 'react';

const Leases = () => {
    return (
        <div className="flex-1 flex flex-col p-4 lg:p-8 w-full animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">Lease Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Overview of all active and pending lease agreements.</p>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-8 w-full sm:w-auto">
                    <a className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 font-bold text-sm" href="#">All Leases</a>
                    <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Active</a>
                    <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Expiring Soon</a>
                    <a className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Terminated</a>
                </div>
                
                <button className="flex items-center justify-center rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold px-4 hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Create New Lease</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Unit</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Tenant</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Dates</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Monthly Rent</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">Unit 402</span>
                                        <span className="text-xs text-slate-500">Skyline Tower</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">Alice Johnson</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 2023 - Oct 2024</td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">$2,400</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-primary-hover font-bold text-sm transition-colors">Renew Lease</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">Unit 105</span>
                                        <span className="text-xs text-slate-500">Oak Gardens</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">Robert Smith</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Jan 2023 - Jan 2024</td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">$1,850</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                        Expiring Soon
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-primary-hover font-bold text-sm transition-colors">Renew Lease</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">Unit 308</span>
                                        <span className="text-xs text-slate-500">The Atrium</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">Charlie Brown</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">May 2022 - May 2023</td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">$2,100</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                        Terminated
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 dark:text-slate-500 cursor-not-allowed font-bold text-sm">Archived</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">Unit 212</span>
                                        <span className="text-xs text-slate-500">Oak Gardens</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">Sarah Williams</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Dec 2023 - Dec 2024</td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">$1,950</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-primary-hover font-bold text-sm transition-colors">Renew Lease</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metrics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-2 font-sans">Total Leases</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">142</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +12% from last year
                    </p>
                </div>
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-2 font-sans">Expiring Soon</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">8</p>
                    <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        Next 30 days
                    </p>
                </div>
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 transition-transform hover:-translate-y-1 duration-300">
                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-2 font-sans">Revenue Target</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">$284.5k</p>
                    <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Monthly average
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Leases;
