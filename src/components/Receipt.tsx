import React from 'react';
import { Printer, Download, CheckCircle2, Building2, User, Home, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MonthSlot } from '@/lib/rentSplit';

interface ReceiptProps {
    payment: any;
    tenant: any;
    balance: {
        totalOwed: number;
        unpaidMonths: any[];
    };
    onPrint?: () => void;
}

export default function Receipt({ payment, tenant, balance, onPrint }: ReceiptProps) {
    if (!payment || !tenant) return null;

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <div className="bg-white p-0 md:p-4 max-w-2xl mx-auto receipt-container">
            <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-xl print:shadow-none print:border-0">
                {/* Header */}
                <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-orange-500 p-2 rounded-xl">
                                    <Building2 size={24} className="text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter">RENT<span className="text-orange-500">FLOW</span></span>
                            </div>
                            <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Payment Receipt</h1>
                            <p className="text-slate-400 font-medium">No. RCP-{payment.id?.toString().padStart(6, '0')}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="text-xl font-bold">{formatDate(payment.date_paid || new Date().toISOString())}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 md:p-12 space-y-10 bg-white">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <User size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Received From</span>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{tenant.name}</p>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Home size={14} />
                                    <span className="font-semibold text-sm">House {tenant.properties?.house_number}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 md:text-right">
                            <div className="flex items-center gap-3 text-slate-400 md:justify-end">
                                <CreditCard size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Payment Method</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{payment.payment_method || 'CASH'}</p>
                        </div>
                    </div>

                    {/* Amount Card */}
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-1 text-center md:text-left">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Amount</p>
                            <p className="text-4xl font-black text-slate-900">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-black uppercase tracking-tight">
                            <CheckCircle2 size={18} />
                            Payment {payment.status}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar size={16} />
                            Payment Breakdown
                        </h3>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-slate-600">Month / Service</th>
                                        <th className="px-6 py-4 text-right font-bold text-slate-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payment.payment_type === 'RENT' && payment.utilization_data?.length > 0 ? (
                                        payment.utilization_data.map((slot: MonthSlot, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-700">{slot.label}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(slot.amount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-slate-700">{payment.payment_type}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(payment.amount)}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-900 text-white font-black">
                                    <tr>
                                        <td className="px-6 py-4 uppercase tracking-tighter">Total Paid</td>
                                        <td className="px-6 py-4 text-right text-xl">{formatCurrency(payment.amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Arrears Summary */}
                    {balance.totalOwed > 0 && (
                        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-red-700 font-black uppercase tracking-tight flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    Outstanding Balances
                                </h3>
                                <span className="text-red-800 text-2xl font-black">{formatCurrency(balance.totalOwed)}</span>
                            </div>
                            <div className="space-y-2">
                                {balance.unpaidMonths.map((m, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/60 px-4 py-2 rounded-xl border border-red-100 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                m.type === 'RENT' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {m.type}
                                            </span>
                                            <span className="font-bold text-slate-700">{m.label.replace(` (${m.type})`, '').replace(` (${m.type.toLowerCase()})`, '')}</span>
                                        </div>
                                        <span className="text-red-600 font-black">{formatCurrency(m.amountOwed)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-10 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Thank you for your payment!</p>
                        <p className="text-slate-300 text-[10px]">RentFlow Management System • Verified Transaction</p>
                    </div>
                </div>
            </div>

            {/* Actions (Hidden on Print) */}
            <div className="mt-8 flex justify-center gap-4 print:hidden">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                    <Printer size={18} />
                    Print Receipt
                </button>
                <button className="flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-100 px-8 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95">
                    <Download size={18} />
                    PDF
                </button>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-container, .receipt-container * {
                        visibility: visible;
                    }
                    .receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
