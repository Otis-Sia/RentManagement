import React from 'react';

const Finance = () => {
    return (
        <div className="flex-1 w-full px-6 py-8 lg:px-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-slate-100">Finance & Reporting</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your portfolio's financial health and performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-lg hidden sm:block">picture_as_pdf</span>
                        Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary dark:text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-lg hidden sm:block">csv</span>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_month</span>
                    <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary appearance-none outline-none transition-colors">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>Year to Date</option>
                        <option>Custom Range</option>
                    </select>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">domain</span>
                    <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary appearance-none outline-none transition-colors">
                        <option>All Properties</option>
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Storage</option>
                    </select>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">payments</span>
                    <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary appearance-none outline-none transition-colors">
                        <option>All Payment Methods</option>
                        <option>Bank Transfer</option>
                        <option>Credit Card</option>
                        <option>Cash</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-6xl text-primary">account_balance</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
                    <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold font-display">$45,280.00</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                        <p className="text-emerald-600 dark:text-emerald-500 text-sm font-bold">+12.5% vs last month</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-6xl text-red-500">priority_high</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Outstanding Arrears</p>
                    <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold font-display">$1,200.00</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-red-500 text-sm">trending_down</span>
                        <p className="text-red-600 dark:text-red-500 text-sm font-bold">-5.0% improvement</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-6xl text-primary">schedule</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Upcoming Payments</p>
                    <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold font-display">$8,450.00</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">event</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Due within 7 days</p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">Recent Transactions</h3>
                    <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Tenant</th>
                                <th className="px-6 py-4 font-bold">Property</th>
                                <th className="px-6 py-4 font-bold">Method</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Transaction 1 */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Oct 24, 2023</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">JS</div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Jordan Smith</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">Maplewood Apts, #402</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">account_balance</span>
                                        <span className="text-sm font-medium">Bank Transfer</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">$1,450.00</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">Completed</span>
                                </td>
                            </tr>
                            
                            {/* Transaction 2 */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Oct 23, 2023</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">EB</div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Elena Brooks</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">Sunset Villas, #12</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">credit_card</span>
                                        <span className="text-sm font-medium">Credit Card</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">$2,100.00</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">Completed</span>
                                </td>
                            </tr>
                            
                            {/* Transaction 3 */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Oct 22, 2023</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">ML</div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Marcus Lee</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">Urban Lofts, Unit B</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">account_balance</span>
                                        <span className="text-sm font-medium">Bank Transfer</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">$1,850.00</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">Pending</span>
                                </td>
                            </tr>
                            
                            {/* Transaction 4 */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Oct 20, 2023</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">SR</div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Sarah Reed</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">Greenway Estates</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-lg">account_balance</span>
                                        <span className="text-sm font-medium">Direct Deposit</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">$3,200.00</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">Failed</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Showing 4 of 128 transactions</p>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition-colors" disabled>
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
