import React from 'react';

const Tenants = () => {
    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background-light/80 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tenants</h1>
                <div className="flex items-center gap-4">
                    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-sm shadow-primary/20 text-sm">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        <span className="hidden sm:inline">Add Tenant</span>
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-primary/5 dark:bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
                            placeholder="Search tenants by name, email, or unit..." 
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shrink-0">
                            All
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors shrink-0">
                            Active
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors shrink-0">
                            Pending
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors shrink-0">
                            Moved Out
                        </button>
                    </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4">Tenant</th>
                                    <th className="px-6 py-4">Assigned Unit</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Lease Dates</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {/* Tenant 1 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                <img alt="Sarah Jenkins" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnqwzuxsR92W3711EHSPkR4rMbzmPqW3nLKRRWDwgeOipmarnmuneZd5NmUcxTAHoCPvAT4TU47yp1zItYes6cSFESQyWjilADi995yeThdpGp9IMv-63LBfnBXjxW50ZyMt8K8XF3ufq5FW5x-CR_pylctnODcQ2W5bC1PmsmKpYgmBXYZKW5t2jhT-UvuLw_r9dDFsSBLyJ0v6K9ikK-bBo5QdzhMWVxs-108eBmtuR_5wcz2z-udCXBA1FvIlaH5hpFHmYzBZhh"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</p>
                                                <p className="text-xs text-slate-500">Member since 2022</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Willow Creek - Unit 4B</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-slate-600 dark:text-slate-300">sarah.j@example.com</p>
                                            <p className="text-slate-500">(555) 123-4567</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">Jan 01, 2024</p>
                                            <p className="text-xs text-slate-500">to Dec 31, 2024</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                
                                {/* Tenant 2 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                <img alt="Marcus Thompson" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYx339g5MeQMv7N2xrBWBdTy13HvZ4CjGk-IjQ-tqM-dh_d0eRxTGJyAJyHVAYnDBUyKpPFP5xmUaerOJgyYeFo1-0vMy_VOkjvqCTA78DlVXX5DDp75p2byJ_rOsEOzvYruT0jyuaDiBLWeyMoUzvdoXAOJpfVqcMzesgoHznlpa861uq_cMe5cAGZkpm0khpYzqZ2w0XpXxDzmLbYFB8OR9p4Sl7-nlK2hJIHeenC3qVcdWoJ-bH9VAPe8XjIftN8BXPFMKiG9H0"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Marcus Thompson</p>
                                                <p className="text-xs text-slate-500">Member since 2023</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">The Heights - Unit 102</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-slate-600 dark:text-slate-300">m.thompson@web.com</p>
                                            <p className="text-slate-500">(555) 987-6543</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">Mar 15, 2024</p>
                                            <p className="text-xs text-slate-500">to Mar 14, 2025</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                
                                {/* Tenant 3 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                <img alt="Emily Davis" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArxFKdulxEydex2Pg927_PoBirb3Jy1pxMCxQCWO_uKq7tP6fpRfDMfPjgFwgCp8fkL9_1umlUUKZA0IX2mu8gkhSL4JpAe1DQyEyM6e37REMJEzwY6hYJyryN6m2m7huUt6zOqsSXF-XyiHfETY-2QjZpb3iEkOe47GDQCWmCNxNOfBY8-Wfzvs2OTWFfUPSkCTlJINzjHfcTJOT7xxfuOFlwJxw6Nj6BJueSklU5AgDepUcomiXDvQxUAcJJRgvF7RGwM4q-HVJV"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Emily Davis</p>
                                                <p className="text-xs text-slate-500">Member since 2021</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Pinecrest - Studio B</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-slate-600 dark:text-slate-300">edavis@mail.com</p>
                                            <p className="text-slate-500">(555) 444-5566</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">Jun 01, 2022</p>
                                            <p className="text-xs text-slate-500">to May 31, 2023</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            Moved Out
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                
                                {/* Tenant 4 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                <img alt="David Miller" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQs9Ri7J6Vs2yW5Ujwdop0HotfSb87kl1jTUavbuiT2dn7_HbtDgkuVQlNrkt2nCU8gFKB8buAvoGt4DkXrWNaQ7vjAUTFIa-AjQ4unp2erquzMwnqP0JDqG78b-c8AusDdLrXK_PHRRp0QeUuKEKMZkKCjDKwLZI9Azg2JpU2y3PJAHtph0XDziW0JnyQqrEEvY-Ziv-JIXnXSVJicOQWeRJQIn_x7W2ej-Uham_whSBDBvJ0ogC69TvtPhEEjyqliB5DySyln0PG"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">David Miller</p>
                                                <p className="text-xs text-slate-500">Member since 2023</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Willow Creek - Unit 2A</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-slate-600 dark:text-slate-300">d.miller@outlook.com</p>
                                            <p className="text-slate-500">(555) 222-3333</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">Aug 01, 2023</p>
                                            <p className="text-xs text-slate-500">to Jul 31, 2024</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <p>Showing 1 to 4 of 24 tenants</p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors hover:text-slate-900 dark:hover:text-white" disabled>Previous</button>
                            <button className="px-3 py-1 bg-primary text-white font-bold rounded-lg shadow-sm border border-primary">1</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:text-slate-900 dark:hover:text-white">2</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:text-slate-900 dark:hover:text-white">3</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:text-slate-900 dark:hover:text-white">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tenants;
