"use client";

import React from 'react';
import { 
    Mail, Lock, 
    Eye, LogIn, Globe, 
    Apple, Building, LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans flex flex-col">
            <header className="px-6 py-6 md:px-10 lg:px-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <Building size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">RentFlow</h2>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 flex overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Left Side: Branding */}
                    <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 to-slate-900/90 z-10"></div>
                        <div className="relative z-20 p-12 flex flex-col justify-end h-full">
                            <h1 className="text-5xl font-black text-white mb-6 leading-tight">Elevate your property management</h1>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed">
                                Streamline leases, maintenance, and payments with the world's most intuitive rental platform.
                            </p>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1545324418-f1d3ac597347?auto=format&fit=crop&q=80&w=1000" 
                            alt="Modern architecture" 
                            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110 hover:scale-100 transition-transform duration-10000"
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 font-medium">Enter your credentials to access your portal.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail size={16} className="text-orange-500" />
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    placeholder="admin@rentflow.com"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Lock size={16} className="text-orange-500" />
                                        Password
                                    </label>
                                    <button type="button" className="text-xs font-bold text-orange-600 hover:underline">Forgot Password?</button>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        placeholder="••••••••"
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="remember" className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer" />
                                <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer select-none">Remember me for 30 days</label>
                            </div>

                            <Link 
                                href="/"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-orange-200 transition-all active:scale-[0.98] text-lg"
                            >
                                <LogIn size={20} />
                                Sign In
                            </Link>

                            <div className="relative py-4 flex items-center">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or continue with</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700 text-sm">
                                    <Globe size={18} /> Google
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700 text-sm">
                                    <Apple size={18} /> Apple
                                </button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
                            Don't have an account? <button className="text-orange-600 font-black hover:underline">Start free trial</button>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <p>© 2024 RentFlow Management Solutions. All rights reserved.</p>
                <div className="mt-2 flex justify-center gap-6">
                    <button className="hover:text-orange-500 transition-colors">Privacy</button>
                    <button className="hover:text-orange-500 transition-colors">Terms</button>
                    <button className="hover:text-orange-500 transition-colors">Support</button>
                </div>
            </footer>
        </div>
    );
}
