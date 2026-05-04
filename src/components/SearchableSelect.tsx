"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
    id: string | number;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder: string;
    label?: string;
    required?: boolean;
}

export default function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    label,
    required = false 
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id.toString() === value.toString());

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 bg-slate-50 border ${isOpen ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200'} rounded-lg flex items-center justify-between cursor-pointer transition-all`}
            >
                <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <input 
                            autoFocus
                            type="text"
                            className="bg-transparent border-none outline-none text-sm w-full"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {searchTerm && (
                            <X 
                                size={14} 
                                className="text-slate-400 cursor-pointer hover:text-slate-600" 
                                onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                            />
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id.toString());
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-4 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                                        value.toString() === opt.id.toString() ? 'bg-orange-50' : ''
                                    }`}
                                >
                                    <div className={`text-sm font-bold ${value.toString() === opt.id.toString() ? 'text-orange-600' : 'text-slate-900'}`}>
                                        {opt.label}
                                    </div>
                                    {opt.subLabel && <div className="text-xs text-slate-500">{opt.subLabel}</div>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
