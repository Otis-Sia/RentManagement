import React from 'react';

const Login = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            <div className="flex h-full grow flex-col">
                <header className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-20 z-10">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-2xl">domain</span>
                        </div>
                        <h2 className="font-display text-xl font-bold leading-tight tracking-tight">RentFlow</h2>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="flex w-full max-w-[1000px] overflow-hidden rounded-xl bg-white dark:bg-slate-900/40 shadow-2xl border border-slate-200 dark:border-slate-800 min-h-[600px] animate-in slide-in-from-bottom-8 duration-500">
                        {/* Left Background Image Side */}
                        <div className="hidden w-1/2 lg:block relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-background-dark/80 mix-blend-multiply z-10"></div>
                            <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
                                <h1 className="font-display text-4xl font-bold mb-4">Elevate your property management</h1>
                                <p className="text-slate-200 text-lg">Streamline leases, maintenance, and payments with the world's most intuitive rental platform.</p>
                            </div>
                            <img alt="Modern luxury apartment building exterior" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIJs8wNpOUesHowF2poziDm4vrkY9Q52bTmlKX1YncqCkrlEXxJq8DhDsul6M6W1VxO81hrnr19jccF6RswBG51xJ3NmGazUQlZ7ERvJKGuNFMo6lcKBYLNPo9Nr3g2yDmn0su815aw6-ZkFSvRfDQSfDwn4ykoAc1IExxb9QjHeguBVEKtnLAYNbJXvGxR5D9iqC1NzIAPEEwBm6H7WVbpWtmgQ63YGItVR4m_2ljje1kl9cyxIe9uMbhHbpOirCiLMr9BZMcMk-2"/>
                        </div>
                        
                        {/* Right Login Form Side */}
                        <div className="flex w-full flex-col p-8 md:p-12 lg:w-1/2 justify-center">
                            <div className="mb-10 text-center lg:text-left">
                                <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome Back</h2>
                                <p className="text-slate-500 dark:text-slate-400">Please enter your credentials to access your dashboard.</p>
                            </div>
                            
                            <form className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        Email Address
                                    </label>
                                    <input 
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                                        placeholder="admin@rentflow.com" 
                                        type="email"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">lock</span>
                                            Password
                                        </label>
                                        <a href="#" className="text-primary text-xs font-bold hover:underline">Forgot Password?</a>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 pr-12 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                                            placeholder="••••••••" 
                                            type="password"
                                        />
                                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" type="button">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary bg-transparent size-4 cursor-pointer" id="remember" type="checkbox"/>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
                                </div>
                                
                                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20" type="button">
                                    <span className="material-symbols-outlined">login</span>
                                    Sign In
                                </button>
                                
                                <div className="relative my-4 flex items-center py-2">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                    <span className="mx-4 flex-shrink text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Or continue with</span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" type="button">
                                        <span className="text-sm font-semibold">Google</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" type="button">
                                        <span className="text-sm font-semibold">Apple</span>
                                    </button>
                                </div>
                            </form>
                            
                            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                Don't have an account? 
                                <a className="text-primary font-bold hover:underline ml-1" href="#">Start your free trial</a>
                            </p>
                        </div>
                    </div>
                </main>
                
                <footer className="p-6 text-center text-xs text-slate-500 dark:text-slate-600">
                    <p>© 2024 RentFlow Management Solutions. All rights reserved.</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Login;
