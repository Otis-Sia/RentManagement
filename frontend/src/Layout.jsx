import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, CreditCard, Wrench, FileText, Users, Menu, X, ArrowUpDown, Receipt, BarChart3, UserCheck, Wallet, Megaphone } from 'lucide-react';
import './index.css';

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/houses', label: 'Houses', icon: Home },
        { path: '/tenants', label: 'Tenants', icon: Users },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/transactions', label: 'Transactions', icon: ArrowUpDown },
        { path: '/invoices', label: 'Invoices', icon: Receipt },
        { path: '/financial-reports', label: 'Finance', icon: BarChart3 },
        { path: '/employees', label: 'Employees', icon: UserCheck },
        { path: '/payroll', label: 'Payroll', icon: Wallet },
        { path: '/broadcasts', label: 'Broadcasts', icon: Megaphone },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Scroll detection for retractable bottom nav
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show nav when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollYRef.current || currentScrollY < 50) {
                setIsBottomNavVisible(true);
            } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
                setIsBottomNavVisible(false);
            }

            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="layout-wrapper">
            {/* Mobile Header */}
            <header className="mobile-header">
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>RentManager</div>
                <button
                    className="mobile-menu-button"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Overlay Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
                    <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={toggleMobileMenu}
                                        className={`nav-link ${isActive ? 'active' : ''}`}
                                    >
                                        <Icon size={20} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar">
                <div className="sidebar-header">
                    <span>RentManager</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation - Retractable */}
            <nav className={`mobile-bottom-nav ${isBottomNavVisible ? 'visible' : 'hidden'}`}>
                {navItems.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Layout;
