import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Urgent Alerts Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg">
                        <span className="material-symbols-outlined">error</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">3 units have overdue rent</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80">Total outstanding: $4,250.00</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-red-700 dark:text-red-300 hover:underline">View Details</button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
                        <span className="material-symbols-outlined">plumbing</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Urgent: Plumbing request Unit 4B</p>
                        <p className="text-xs text-orange-600/80 dark:text-orange-400/80">Reported 45 mins ago</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-orange-700 dark:text-orange-300 hover:underline">Assign Tech</button>
                </div>
            </section>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Occupancy Rate', value: '94.2%', trend: '+2%', icon: 'location_city', color: 'emerald' },
                    { title: 'Monthly Revenue', value: '$45,200', trend: '+12%', icon: 'attach_money', color: 'emerald' },
                    { title: 'Pending Maintenance', value: '12', trend: '-5%', icon: 'handyman', color: 'slate', negative: true },
                    { title: 'Outstanding Arrears', value: '$3,400', trend: '+8%', icon: 'account_balance_wallet', color: 'rose', negative: true }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${
                                kpi.title === 'Occupancy Rate' ? 'bg-primary/10 text-primary' :
                                kpi.title === 'Monthly Revenue' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                kpi.title === 'Pending Maintenance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                            }`}>
                                <span className="material-symbols-outlined">{kpi.icon}</span>
                            </div>
                            <span className={`text-xs font-bold flex items-center gap-1 ${
                                kpi.negative && kpi.trend.startsWith('+') ? 'text-rose-500' : 
                                kpi.negative && kpi.trend.startsWith('-') ? 'text-emerald-500' : 
                                kpi.trend.startsWith('-') ? 'text-slate-400' : 'text-emerald-500'
                            }`}>
                                {kpi.trend.startsWith('+') || (kpi.negative && kpi.trend.startsWith('-')) ? 
                                    <span className="material-symbols-outlined text-sm">{kpi.negative && kpi.trend.startsWith('-') ? 'trending_down' : 'trending_up'}</span> : null}
                                {kpi.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.title}</h3>
                        <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white font-display">{kpi.value}</p>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section Prototype */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Revenue vs. Expenses</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly overview for the current year</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold py-1.5 px-3 focus:ring-0 text-slate-700 dark:text-slate-300 outline-none">
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                        </select>
                    </div>
                    
                    <div className="relative h-64 flex items-end justify-between gap-4 px-2">
                        {/* Sample Bar Chart Map */}
                        {[
                            { month: 'Jan', rev: '60%', exp: '40%' },
                            { month: 'Feb', rev: '75%', exp: '35%' },
                            { month: 'Mar', rev: '65%', exp: '50%' },
                            { month: 'Apr', rev: '90%', exp: '30%' },
                            { month: 'May', rev: '85%', exp: '45%' },
                            { month: 'Jun', rev: '80%', exp: '38%' }
                        ].map((data, idx) => (
                             <div key={idx} className="flex flex-col items-center flex-1 gap-2 h-full justify-end group">
                                <div className="flex w-full gap-1 items-end h-[85%] relative">
                                    <div className="bg-primary w-full rounded-t-sm transition-all duration-500 group-hover:bg-primary-hover" style={{height: data.rev}}></div>
                                    <div className="bg-primary/30 w-full rounded-t-sm transition-all duration-500 group-hover:bg-primary/50" style={{height: data.exp}}></div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{data.month}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary"></span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Total Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary/30"></span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Total Expenses</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Recent Activity</h3>
                        <button className="text-primary text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {/* Activity Item 1 */}
                        <div className="flex gap-4">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div className="absolute top-8 bottom-[-24px] left-4 w-px bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Rent Payment Received</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Unit 12A - Michael Chen</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">2 hours ago</p>
                            </div>
                        </div>

                        {/* Activity Item 2 */}
                        <div className="flex gap-4">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">contract</span>
                                </div>
                                <div className="absolute top-8 bottom-[-24px] left-4 w-px bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">New Lease Signed</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Unit 5C - Elena Rodriguez</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">5 hours ago</p>
                            </div>
                        </div>

                        {/* Activity Item 3 */}
                        <div className="flex gap-4">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">update</span>
                                </div>
                                <div className="absolute top-8 bottom-[-24px] left-4 w-px bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Updated</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Unit 8F - Status: In Progress</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Yesterday</p>
                            </div>
                        </div>

                        {/* Activity Item 4 */}
                        <div className="flex gap-4">
                            <div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">history</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">System Notification</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly backup completed</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Yesterday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Active Properties Preview */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Property Portfolio</h3>
                    <button className="bg-primary text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined text-lg">add</span> Add Property
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Units</th>
                                <th className="px-6 py-4">Occupancy</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBx9KoVJVdCamVnPbAHDJo-MmZ5PM8nz5PPY9fv_viEURi-RRmlSZJdytcMLZOVqgBjr11qkam9TLayFEAbqUQUfjrmaopNTL0qFa35eczmSzIN1aovKlggI0UnipZgyuG8Uh89eOS13wNQhYGo7uvpewJfEIROGuaXi-W7XxvTxRlKHJ1RPWUanyGq_JmZBfKYRLjgzHa-yr7C_cXia5RiufH8kUpGwrgEz_mRAIykP1WWWAl6YNEiXMMc9yFZBWp0KMikctnVcVDY')"}}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Willow Creek Apartments</p>
                                            <p className="text-xs text-slate-500">124 Willow Lane, Seattle</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">24 Units</td>
                                <td className="px-6 py-4">
                                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{width: '100%'}}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">100%</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">Stable</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                        <span className="material-symbols-outlined text-xl">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5_RiWSCOcSXsO9uEXnYfP3TXSQhBNfq6zQ31gOSb4OUG0Nbhv6Zen_BamsCc5RqoqF_2jx20gDL5BGztyCxFPylZiPd2o4AenwAbdEzOepAwWlWyfuFjFW32D779ucBO-mWciyYKDZiIIsKMbZLSPAxXIo6NEoZnLFHwr1dHS-Bw-TYrzDeR8Fuv-t14qGbuSZY0SmkHUxfGu1slX_Qkc2-K8o3FvF_lJ6OIm2oAqacCpqsPqyAHBUaow8t4WU-X6YS5tTBObRyZ3')"}}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Harbor View Heights</p>
                                            <p className="text-xs text-slate-500">89 Harbor Dr, Seattle</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">48 Units</td>
                                <td className="px-6 py-4">
                                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{width: '85%'}}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">85%</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Maintenance</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                        <span className="material-symbols-outlined text-xl">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
