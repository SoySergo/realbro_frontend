'use client';

import React, { useState } from 'react';
import { X, Phone, MessageCircle, Mail } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ContactFormProps {
    labels: Record<string, string>;
    onSubmit: (method: string, value: string) => void;
    onCancel: () => void;
    className?: string;
}

/**
 * Форма контакта по объекту (телефон, WhatsApp, email)
 */
export function ContactForm({ labels, onSubmit, onCancel, className }: ContactFormProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>('phone');
    const [value, setValue] = useState('');

    const methods = [
        { id: 'phone', icon: Phone, label: labels.phone },
        { id: 'whatsapp', icon: MessageCircle, label: labels.whatsapp },
        { id: 'email', icon: Mail, label: labels.email },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(selectedMethod, value.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'bg-card border border-border rounded-xl p-3 space-y-3 animate-fade-in',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text-primary">{labels.title}</h4>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded-full hover:bg-background-secondary transition-colors"
                >
                    <X className="w-4 h-4 text-text-tertiary" />
                </button>
            </div>

            {/* Выбор метода */}
            <div className="flex gap-2">
                {methods.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedMethod(id)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1',
                            'border',
                            selectedMethod === id
                                ? 'border-brand-primary bg-brand-primary-light text-brand-primary'
                                : 'border-border bg-background-secondary text-text-secondary hover:border-border-hover'
                        )}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Поле ввода */}
            <input
                type={selectedMethod === 'email' ? 'email' : 'tel'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={methods.find((m) => m.id === selectedMethod)?.label}
                className={cn(
                    'w-full px-3 py-2 rounded-lg',
                    'bg-background-secondary border border-border',
                    'text-sm text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:border-brand-primary/50 transition-colors'
                )}
                autoFocus
            />

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                    {labels.cancel}
                </button>
                <button
                    type="submit"
                    disabled={!value.trim()}
                    className={cn(
                        'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                        'bg-brand-primary text-white hover:bg-brand-primary-hover',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {labels.send}
                </button>
            </div>
        </form>
    );
}
