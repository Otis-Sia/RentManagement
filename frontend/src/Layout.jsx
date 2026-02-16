import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, CreditCard, Wrench, FileText, Users } from 'lucide-react';
import './index.css';

const Layout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/houses', label: 'Houses', icon: Home },
        { path: '/tenants', label: 'Tenants', icon: Users },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--surface-dark)',
                color: 'white',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>RentManager</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary-dark)',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: 'var(--spacing-xl)', backgroundColor: 'var(--background-light)', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
