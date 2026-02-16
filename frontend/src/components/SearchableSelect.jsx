import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    labelKey = "label",
    valueKey = "id",
    required = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setFilteredOptions(
            options.filter(option =>
                option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, options, labelKey]);

    const handleSelect = (option) => {
        onChange({
            target: {
                name: name,
                value: option[valueKey]
            }
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    const selectedOption = options.find(opt => opt[valueKey] == value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--text-secondary-light)',
                    backgroundColor: 'var(--background-light)',
                    color: selectedOption ? 'var(--text-primary-light)' : 'var(--text-secondary-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none'
                }}
            >
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {selectedOption ? selectedOption[labelKey] : placeholder}
                </span>
                <ChevronDown size={16} color="var(--text-secondary-light)" />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--background-light)',
                    border: '1px solid var(--text-secondary-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-light)' }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.5rem 0.5rem 2rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--text-secondary-light)',
                                    backgroundColor: 'var(--background-light)', // explicitly set background
                                    color: 'var(--text-primary-light)', // explicitly set text color
                                    fontSize: '0.875rem'
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <div
                                key={option[valueKey]}
                                onClick={() => handleSelect(option)}
                                className="hover:bg-gray-100" // Tailwind not available, need style
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary-light)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                <span>{option[labelKey]}</span>
                                {option[valueKey] == value && <Check size={14} color="var(--primary-color)" />}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary-light)', fontSize: '0.875rem' }}>
                            No results found
                        </div>
                    )}
                </div>
            )}

            {/* Hidden select for form validation (basic) */}
            <select
                name={name}
                value={value}
                onChange={() => { }}
                required={required}
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, bottom: 0 }}
            >
                <option value="">Select...</option>
                {options.map(opt => (
                    <option key={opt[valueKey]} value={opt[valueKey]}>{opt[labelKey]}</option>
                ))}
            </select>
        </div>
    );
};

export default SearchableSelect;
