'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Bot, User, MapPin, Bed, Bath, Maximize, Heart, Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatV2Store } from '../../model/store';
import { QuickActionsBar } from '../quick-actions';
import { NoteForm } from '../note-form';
import { ContactForm } from '../contact-form';
import { MediaGalleryCollage } from '../media-gallery';
import type { QuickActionType, ThreadMessage } from '../../model/types';
import type { AgentV2Labels } from '../../model/types';

interface PropertyThreadProps {
    threadId: string;
    labels: AgentV2Labels;
    onBack: () => void;
    className?: string;
}

/**
 * Внутренний чат по конкретному объекту с AI агентом
 */
export function PropertyThread({ threadId, labels, onBack, className }: PropertyThreadProps) {
    const [inputText, setInputText] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const thread = useAgentChatV2Store((s) => s.threads[threadId]);
    const addThreadMessage = useAgentChatV2Store((s) => s.addThreadMessage);
    const toggleFavorite = useAgentChatV2Store((s) => s.toggleFavorite);
    const setSuitable = useAgentChatV2Store((s) => s.setSuitable);
    const setNote = useAgentChatV2Store((s) => s.setNote);

    // Автоскролл вниз при новых сообщениях
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [thread?.messages.length]);

    const handleSend = useCallback(() => {
        if (!inputText.trim()) return;
        addThreadMessage(threadId, {
            threadId,
            type: 'text',
            content: inputText.trim(),
            senderId: 'user',
        });
        setInputText('');

        // Имитация ответа агента
        setTimeout(() => {
            addThreadMessage(threadId, {
                threadId,
                type: 'agent-text',
                content: 'I\'ll look into that for you. Let me check the details...',
                senderId: 'agent',
            });
        }, 1200);
    }, [inputText, threadId, addThreadMessage]);

    const handleQuickAction = useCallback((action: QuickActionType) => {
        switch (action) {
            case 'describe':
                addThreadMessage(threadId, {
                    threadId,
                    type: 'text',
                    content: `📋 ${labels.quickActions.describe}`,
                    senderId: 'user',
                    metadata: { actionType: 'describe' },
                });
                // Имитация ответа агента с описанием
                setTimeout(() => {
                    if (thread?.property) {
                        addThreadMessage(threadId, {
                            threadId,
                            type: 'description',
                            content: thread.property.description || `${thread.property.title}\n\n${thread.property.address}\n${thread.property.rooms} rooms, ${thread.property.area}m², floor ${thread.property.floor}/${thread.property.total_floors}`,
                            senderId: 'agent',
                        });
                    }
                }, 800);
                break;

            case 'note':
                setShowNoteForm(true);
                setShowContactForm(false);
                break;

            case 'favorite':
                toggleFavorite(threadId);
                addThreadMessage(threadId, {
                    threadId,
                    type: 'action-result',
                    content: thread?.isFavorite
                        ? labels.property.removedFromFavorites
                        : labels.property.addedToFavorites,
                    senderId: 'agent',
                    metadata: { actionType: 'favorite' },
                });
                break;

            case 'suitable':
                setSuitable(threadId, true);
                addThreadMessage(threadId, {
                    threadId,
                    type: 'action-result',
                    content: labels.property.markedSuitable,
                    senderId: 'agent',
                    metadata: { actionType: 'suitable' },
                });
                break;

            case 'not-suitable':
                setSuitable(threadId, false);
                addThreadMessage(threadId, {
                    threadId,
                    type: 'action-result',
                    content: labels.property.markedNotSuitable,
                    senderId: 'agent',
                    metadata: { actionType: 'not-suitable' },
                });
                break;

            case 'nearby':
                addThreadMessage(threadId, {
                    threadId,
                    type: 'text',
                    content: `📍 ${labels.quickActions.nearby}`,
                    senderId: 'user',
                    metadata: { actionType: 'nearby' },
                });
                setTimeout(() => {
                    addThreadMessage(threadId, {
                        threadId,
                        type: 'nearby-map',
                        content: `${labels.property.nearbyPlaces}:\n🚇 ${labels.property.transport}: ${thread?.property.transport_station?.station_name || 'N/A'} (${thread?.property.transport_station?.walk_minutes || '?'} min)\n🛒 ${labels.property.shops}: 3 ${labels.property.shops.toLowerCase()}\n🌳 ${labels.property.parks}: 2 ${labels.property.parks.toLowerCase()}`,
                        senderId: 'agent',
                    });
                }, 1000);
                break;

            case 'contact':
                setShowContactForm(true);
                setShowNoteForm(false);
                break;
        }
    }, [threadId, thread, labels, addThreadMessage, toggleFavorite, setSuitable]);

    const handleSaveNote = useCallback((noteText: string) => {
        setNote(threadId, noteText);
        addThreadMessage(threadId, {
            threadId,
            type: 'note',
            content: noteText,
            senderId: 'user',
            metadata: { actionType: 'note', noteText },
        });
        addThreadMessage(threadId, {
            threadId,
            type: 'action-result',
            content: labels.noteForm.saved,
            senderId: 'agent',
        });
        setShowNoteForm(false);
    }, [threadId, labels, addThreadMessage, setNote]);

    const handleContact = useCallback((method: string, value: string) => {
        addThreadMessage(threadId, {
            threadId,
            type: 'text',
            content: `📞 ${method}: ${value}`,
            senderId: 'user',
            metadata: { actionType: 'contact', contactMethod: method as 'phone' | 'whatsapp' | 'email' },
        });
        setTimeout(() => {
            addThreadMessage(threadId, {
                threadId,
                type: 'action-result',
                content: labels.contactForm.sent,
                senderId: 'agent',
            });
        }, 500);
        setShowContactForm(false);
    }, [threadId, labels, addThreadMessage]);

    if (!thread) return null;

    const { property } = thread;

    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
            {/* Заголовок треда */}
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border bg-background shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.address}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-brand-primary">
                        {property.price.toLocaleString()} €
                    </span>
                    {thread.isFavorite && (
                        <Heart className="w-4 h-4 text-error fill-error" />
                    )}
                </div>
            </div>

            {/* Краткая информация об объекте */}
            <div className="px-3 py-2 border-b border-border bg-background-secondary shrink-0">
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                    {property.rooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" /> {property.rooms}
                        </span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" /> {property.bathrooms}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" /> {property.area} m²
                    </span>
                    {property.floor && (
                        <span className="text-text-tertiary">
                            {property.floor}/{property.total_floors}
                        </span>
                    )}
                </div>

                {/* Мини-галерея */}
                {property.images?.length > 0 && (
                    <div className="mt-2">
                        <MediaGalleryCollage
                            images={property.images}
                            maxVisible={4}
                            alt={property.title}
                            labels={{
                                showAll: labels.showAll,
                                photos: labels.photos,
                                closeGallery: labels.closeGallery,
                            }}
                            className="max-h-[120px]"
                        />
                    </div>
                )}
            </div>

            {/* Сообщения */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hide">
                {thread.messages.map((msg: ThreadMessage) => (
                    <ThreadMessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            {/* Форма заметки */}
            {showNoteForm && (
                <div className="px-3 py-2 border-t border-border">
                    <NoteForm
                        labels={labels.noteForm}
                        initialValue={thread.noteText}
                        onSave={handleSaveNote}
                        onCancel={() => setShowNoteForm(false)}
                    />
                </div>
            )}

            {/* Форма контакта */}
            {showContactForm && (
                <div className="px-3 py-2 border-t border-border">
                    <ContactForm
                        labels={labels.contactForm}
                        onSubmit={handleContact}
                        onCancel={() => setShowContactForm(false)}
                    />
                </div>
            )}

            {/* Быстрые действия */}
            <div className="border-t border-border bg-background shrink-0">
                <QuickActionsBar
                    labels={labels.quickActions}
                    onAction={handleQuickAction}
                />

                {/* Поле ввода */}
                <div className="flex items-center gap-2 px-3 py-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={labels.quickActions.describe + '...'}
                        className={cn(
                            'flex-1 px-3 py-2 rounded-xl text-sm',
                            'bg-background-secondary border border-border',
                            'text-text-primary placeholder:text-text-tertiary',
                            'focus:outline-none focus:border-brand-primary/50 transition-colors'
                        )}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            'p-2.5 rounded-xl transition-all',
                            inputText.trim()
                                ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                                : 'bg-background-secondary text-text-tertiary'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Пузырь сообщения в треде
 */
function ThreadMessageBubble({ message }: { message: ThreadMessage }) {
    const isAgent = message.senderId === 'agent';

    if (message.type === 'action-result') {
        return (
            <div className="flex justify-center py-1">
                <span className="text-xs text-text-tertiary bg-background-tertiary px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    if (message.type === 'note') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] bg-warning/10 border border-warning/20 rounded-2xl rounded-br-md px-4 py-2.5">
                    <p className="text-xs font-medium text-warning mb-1">📝 Note</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
                    <span className="text-[10px] text-text-tertiary mt-1 block text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        );
    }

    if (message.type === 'nearby-map') {
        return (
            <div className="flex justify-start">
                <div className="max-w-[85%] bg-background-secondary rounded-2xl rounded-bl-md px-4 py-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs font-medium text-brand-primary">AI Agent</span>
                    </div>
                    {/* Имитация мини-карты */}
                    <div className="bg-background-tertiary rounded-lg h-[120px] flex items-center justify-center border border-border">
                        <MapPin className="w-8 h-8 text-brand-primary/40" />
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
                    <span className="text-[10px] text-text-tertiary block">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex', isAgent ? 'justify-start' : 'justify-end')}>
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    isAgent
                        ? 'bg-background-secondary text-text-primary rounded-bl-md'
                        : 'bg-brand-primary text-white rounded-br-md'
                )}
            >
                {isAgent && (
                    <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="text-[10px] font-medium text-brand-primary">AI Agent</span>
                    </div>
                )}
                {!isAgent && message.senderId === 'user' && (
                    <div className="flex items-center gap-1.5 mb-1 justify-end">
                        <span className="text-[10px] font-medium text-white/70">You</span>
                        <User className="w-3.5 h-3.5 text-white/70" />
                    </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                <span
                    className={cn(
                        'text-[10px] mt-1 block',
                        isAgent ? 'text-text-tertiary' : 'text-white/70 text-right'
                    )}
                >
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
