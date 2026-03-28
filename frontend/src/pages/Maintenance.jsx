import React from 'react';

const Maintenance = () => {
    return (
        <div className="flex-1 w-full px-6 py-8 lg:px-12 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-slate-100">Maintenance Requests</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and track property repairs and service tickets.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-all shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined text-lg">add</span>
                        New Request
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-lg">inbox</span>
                        <p className="text-sm font-bold uppercase tracking-wider">Open</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">24</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
                        <span className="material-symbols-outlined text-lg">priority_high</span>
                        <p className="text-sm font-bold uppercase tracking-wider">High Priority</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">5</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-2">
                        <span className="material-symbols-outlined text-lg">engineering</span>
                        <p className="text-sm font-bold uppercase tracking-wider">In Progress</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">12</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-2">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <p className="text-sm font-bold uppercase tracking-wider">Resolved</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-display">156</p>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-md shadow-sm transition-colors">All Requests</button>
                    <button className="flex-1 lg:flex-none px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium rounded-md transition-colors">Open</button>
                    <button className="flex-1 lg:flex-none px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium rounded-md transition-colors">In Progress</button>
                    <button className="flex-1 lg:flex-none px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium rounded-md transition-colors">Closed</button>
                </div>
                
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                        placeholder="Search by ticket ID, issue, or property..." 
                        type="text"
                    />
                </div>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                    Filters
                </button>
            </div>

            {/* Tickets List */}
            <div className="flex flex-col gap-4">
                {/* Ticket Item 1 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-l-4 border-slate-200 dark:border-slate-800 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                                <span className="material-symbols-outlined">water_damage</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#REQ-4092</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 tracking-wider">Urgent</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tracking-wider">Open</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display group-hover:text-primary transition-colors">Leaking pipe under kitchen sink</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">Water is dripping rapidly from the P-trap when the faucet is running. Causing damage to cabinet base.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 ml-14 lg:ml-0 shrink-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Willow Creek, Unit 4B</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Submitted</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">2 hrs ago</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold" title="Unassigned">
                                    <span className="material-symbols-outlined text-[16px]">person_off</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticket Item 2 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-l-4 border-slate-200 dark:border-slate-800 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shrink-0">
                                <span className="material-symbols-outlined">ac_unit</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#REQ-4091</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 tracking-wider">Medium</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 tracking-wider">In Progress</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display group-hover:text-primary transition-colors">AC blowing warm air</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">The central AC has been running all day but the apartment is still 80 degrees.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 ml-14 lg:ml-0 shrink-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Skyline Towers, 1205</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Submitted</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Yesterday</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm" title="Assigned to Mike T.">
                                    MT
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticket Item 3 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-l-4 border-slate-200 dark:border-slate-800 border-l-emerald-500 hover:shadow-md transition-shadow cursor-pointer group opacity-75">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                                <span className="material-symbols-outlined">electrical_services</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#REQ-4088</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tracking-wider">Low</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 tracking-wider">Resolved</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 font-display line-through">Hallway light bulb burnt out</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">The light fixture outside our door in the main hallway needs a new bulb.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 ml-14 lg:ml-0 shrink-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Oakwood Ct, Hall B</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Resolved</span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Oct 22</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-sm" title="Resolved by Sam R.">
                                    SR
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-center">
                <button className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors">
                    Load More Requests
                </button>
            </div>
        </div>
    );
};

export default Maintenance;
