import React from 'react';

const Properties = () => {
    return (
        <div className="p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">Properties</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your entire real estate portfolio.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Add New Property</span>
                </button>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Properties</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">apartment</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">124</p>
                    <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span> +3 this month
                    </p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Units</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">meeting_room</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">850</p>
                    <p className="text-xs text-slate-500 font-medium mt-2">92% Occupancy rate</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Portfolio Value</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">payments</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white font-display">$12.5M</p>
                    <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span> 4.2% annual growth
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-t-xl border border-slate-200 dark:border-slate-800 border-b-0">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary rounded-lg text-sm transition-all outline-none text-slate-900 dark:text-slate-100" 
                            placeholder="Search by address or owner..." 
                            type="text"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Status: Occupied <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Status: Vacant <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Status: Maintenance <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-sm">filter_list</span> More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner / Manager</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Units</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {/* Row 1 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5QtQ3eqwJHoSUDEK8GCk7mEa_6dfnL1AlOFGUhhHGt8wGPH6Qf5WbmdToJZAjcWwiAkbaoz_zBRa3LVVghfrlI2FdGjDzafIxKFj7WytTH09pjFlWZnOCcMB0X9Bx3lp-HBqmual8Q_YP7YBl8pmA9GkGhlSCPKy2Ru1bOexMyCANEFc7fa_FBYdZyVX7NfbyqhJQmkQeC3Uwl8QCMX_8ebP0eh2yFh3jittvMKeMCgfpcnWDXecfmfhJEeDBmCjrOyJzxkgRbc-0')"}}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Pinecrest Heights</span>
                                            <span className="text-xs text-slate-500">123 Pine St, San Francisco, CA</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-white">Sarah Jenkins</span>
                                        <span className="text-xs text-slate-500">Property Manager</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">24 Total</span>
                                        <span className="text-xs text-emerald-600 font-medium">0 Vacant</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-tight">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Stable
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="View Details"><span className="material-symbols-outlined text-xl">visibility</span></button>
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-xl">edit_note</span></button>
                                        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Remove"><span className="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALehKfmQTj8UCm58GgZyZaHNvga-gBiy1qMYL_4ohkkkrLsjiJWycvNB9XYulwTJjvexIGzKNRL2MMgfEs6zac0idlOysqqtZ0BuCBgeWwNiKH8sr2sXxNoBDmc1DS8TIeQHedL0ZHLxst6LNvWTwRlmRYRozO0ssJrog_RR52LKjCEtJtiVS88Mx5volMjuJZFEOlPj4gL7aA4em_GzLdV77yo_1X7INiyTKRQiYRRKmdzxuskyRdXU91FzCvdyWxozgfeKKQ6f96')"}}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Skyline Towers</span>
                                            <span className="text-xs text-slate-500">455 Market Blvd, Austin, TX</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-white">Marcus Chen</span>
                                        <span className="text-xs text-slate-500">Regional Director</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">150 Total</span>
                                        <span className="text-xs text-amber-600 font-medium">12 Vacant</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-tight">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> At Risk
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="View Details"><span className="material-symbols-outlined text-xl">visibility</span></button>
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-xl">edit_note</span></button>
                                        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Remove"><span className="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 3 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEOLToHrEp9-UMfVvQVTARlvMYZfUjKWRAgtA-rv8yfbuX_XHhU_coB1rwDJDRcdRObmMVUWVHUnF_QSNZXx_hkcF-wOmPKhzc0eIIRBu13J6GWVTHks7CEhI_GyY0Q06ERzN_4P4oumrJkOIp98IAx1PVXBOzM1wlXJGoT-SCTPvoGKXtfCdncyFUy1Z1cXvzAwh-5M9g4YkqJQV7WTJThTX566qVFnAGZHOA7Fo_6_3hZjWy06D4I-xT2kToxc8cLp-0bD7ihyO7')"}}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Oakwood Court</span>
                                            <span className="text-xs text-slate-500">892 Oak Ln, Seattle, WA</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-white">Sarah Jenkins</span>
                                        <span className="text-xs text-slate-500">Property Manager</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">8 Total</span>
                                        <span className="text-xs text-slate-500 font-medium">1 Maintenance</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-tight">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Stable
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="View Details"><span className="material-symbols-outlined text-xl">visibility</span></button>
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-xl">edit_note</span></button>
                                        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Remove"><span className="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 4 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjp3Nzcb2Mzm-viBPVUSYefqQXXoA3oEsrbC0Hl7rozHJJ7ubr0TIAaxmIE2X8ceqzpokYzE2sHW86Rfjcvai8C_9VLj7fx5OaKbXILB-x7JJgAyKd199PEOWW8NrCh3MowVx7oEuRkDSt534c5J1CUG6tfN-mCfxgRo1cmViOvHyj60oFFgFyUb7ARBmF6qgfUyd_E6BSjvmRm0-v2-0LvBeOrRst9cdm_XqgMczZEjS8N5QOu9Iq7mYatoKrFAJKwkqRla5bdfO3')"}}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">West End Villas</span>
                                            <span className="text-xs text-slate-500">101 Ocean View Dr, Miami, FL</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-white">Elena Rodriguez</span>
                                        <span className="text-xs text-slate-500">Asset Manager</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">42 Total</span>
                                        <span className="text-xs text-emerald-600 font-medium">2 Vacant</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-tight">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Stable
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="View Details"><span className="material-symbols-outlined text-xl">visibility</span></button>
                                        <button className="p-2 text-slate-500 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-xl">edit_note</span></button>
                                        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Remove"><span className="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Showing 1 to 4 of 124 results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300" disabled>Previous</button>
                        <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold border border-primary">1</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">2</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">3</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Properties;
