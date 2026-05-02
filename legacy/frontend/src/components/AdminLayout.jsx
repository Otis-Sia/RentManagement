import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const location = useLocation();
    
    // Theme toggle state
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const isCurrentPage = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    }

    const navigation = [
        { name: 'Dashboard', path: '/', icon: 'dashboard' },
        { name: 'Properties', path: '/properties', icon: 'domain' },
        { name: 'Tenants', path: '/tenants', icon: 'group' },
        { name: 'Leases', path: '/leases', icon: 'description' },
        { name: 'Financials', path: '/finance', icon: 'payments' },
        { name: 'Maintenance', path: '/maintenance', icon: 'build' },
    ];

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20 transition-colors duration-300">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary rounded-lg p-1.5 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined block">apartment</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none font-display text-primary">RentFlow</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Admin Portal</p>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const active = isCurrentPage(item.path);
                        return (
                            <Link 
                                key={item.name}
                                to={item.path} 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    active 
                                        ? 'bg-primary text-white font-medium' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${active ? (item.icon === 'group' ? 'font-fill' : '') : ''}`}>{item.icon}</span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[22px]">settings</span>
                        <span className="text-sm">Settings</span>
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[22px]">logout</span>
                        <span className="text-sm">Logout</span>
                    </button>
                    
                    {/* User Profile Mini */}
                    <div className="mt-4 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaPI0Q28wa1I95ISnvTW6j4QVNTidqZHuMhdV5aRRg2M86AfQPfVkwFVhTsLA8cVSJTPV7cA4gVtp4WTDRCJ-GORlbbvek4rPvaT0zclln4wHQ6b9d_YXpVgCKdRL7pRzwy7Jiu7zjt62kF3KHNWvvsDlPvmg3BRNiA4Vkh-4tjLHUso0ucVQ415z0ilBn2K3InIjRdE8CLbat7L5_rZAfdtzMjr-ldU06Ms9cVNXsWWn20MvuSoWASNTMHE-E_C_RqW53LZDUPQ-9"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">Sarah J.</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                {/* Top Bar */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
                    <div className="relative w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input 
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500" 
                            placeholder="Search tenants, units, or tickets..." 
                            type="text"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" 
                            title="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <span className="material-symbols-outlined text-2xl">light_mode</span>
                            ) : (
                                <span className="material-symbols-outlined text-2xl">dark_mode</span>
                            )}
                        </button>
                        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </header>
                
                {/* Page Content */}
                <div className="flex-1 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
