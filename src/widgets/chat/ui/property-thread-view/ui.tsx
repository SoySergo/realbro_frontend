'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    ArrowLeft, MapPin, Phone, StickyNote, Send, Mic,
    Maximize, Bed, Bath, Train, Bus, ExternalLink,
    MessageCircle, Calendar, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useChatStore } from '@/features/chat-messages';
import type { ChatMessage, ContactInfo } from '@/entities/chat';
import type { PropertyChatCard } from '@/entities/property';
import { getImageUrl, getImageAlt } from '@/entities/property/model/card-types';

interface PropertyThreadLabels {
    back?: string;
    messagePlaceholder?: string;
    location?: string;
    contact?: string;
    note?: string;
    noteLabel?: string;
    newBadge?: string;
    loadingNearby?: string;
    askQuestion?: string;
    perMonth?: string;
    walkMin?: string;
    showOnMap?: string;
    expandMap?: string;
    showPhone?: string;
    writeWhatsapp?: string;
    writeEmail?: string;
    writeTelegram?: string;
    goToOwner?: string;
    noteTitle?: string;
    noteContent?: string;
    noteDate?: string;
    noteTime?: string;
    noteSave?: string;
    noteCancel?: string;
    discussed?: string;
    categories?: {
        transport?: string;
        shops?: string;
        restaurants?: string;
        parks?: string;
        schools?: string;
        healthcare?: string;
    };
}

interface PropertyThreadViewProps {
    propertyId: string;
    property: PropertyChatCard;
    onBack: () => void;
    labels?: PropertyThreadLabels;
    className?: string;
}

export function PropertyThreadView({
    propertyId,
    property,
    onBack,
    labels = {},
    className,
}: PropertyThreadViewProps) {
    const {
        propertyThreadMessages,
        sendThreadMessage,
        requestLocation,
        requestContact,
        addThreadNote,
    } = useChatStore();

    const [message, setMessage] = useState('');
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const threadMessages = propertyThreadMessages[propertyId] || [];
    const prevLengthRef = useRef(threadMessages.length);

    const {
        messagePlaceholder = 'Ask about this property...',
        location = 'Location',
        contact = 'Contact',
        note = 'Note',
        perMonth = '/mo',
        walkMin = 'min walk',
        showOnMap = 'Show on map',
        goToOwner = 'Go to owner',
        noteTitle = 'Add note',
        noteContent = 'Note text',
        noteDate = 'Date',
        noteTime = 'Time',
        noteSave = 'Save',
        noteCancel = 'Cancel',
    } = labels;

    // Прокрутка вниз при добавлении новых сообщений
    useEffect(() => {
        if (threadMessages.length > prevLengthRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevLengthRef.current = threadMessages.length;
    }, [threadMessages.length]);

    const handleSend = useCallback(() => {
        const trimmed = message.trim();
        if (!trimmed) return;
        setMessage('');
        sendThreadMessage(propertyId, trimmed);
        inputRef.current?.focus();
    }, [message, propertyId, sendThreadMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
    }, []);

    const hasContent = message.trim().length > 0;
    const images = property.images || [];

    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
            {/* Компактный заголовок с информацией об объекте */}
            <PropertyThreadHeader
                property={property}
                onBack={onBack}
                labels={{ perMonth, walkMin }}
            />

            {/* Список сообщений */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-3 scrollbar-hide">
                {/* Карточка объекта (первый элемент) */}
                <ThreadPropertyCard property={property} images={images} labels={{ perMonth, walkMin, newBadge }} />

                {/* Сообщения ветки */}
                {threadMessages.filter(m => m.type !== 'system').map((msg) => (
                    <ThreadMessageItem
                        key={msg.id}
                        message={msg}
                        property={property}
                        labels={labels}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Быстрые команды */}
            <div className="px-3 md:px-4 py-2 border-t border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <QuickActionButton
                        icon={MapPin}
                        label={location}
                        onClick={() => requestLocation(propertyId, showOnMap)}
                    />
                    <QuickActionButton
                        icon={Phone}
                        label={contact}
                        onClick={() => requestContact(propertyId, contact)}
                    />
                    <QuickActionButton
                        icon={StickyNote}
                        label={note}
                        onClick={() => setIsNoteOpen(true)}
                    />
                </div>
            </div>

            {/* Ввод сообщения */}
            <div className="flex items-end gap-2 p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
                <div className="flex-1 bg-background-secondary rounded-2xl relative min-h-[44px] flex items-center">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder={messagePlaceholder}
                        rows={1}
                        className={cn(
                            'w-full bg-transparent border-none px-4 py-3 text-sm',
                            'text-text-primary placeholder:text-text-tertiary',
                            'focus:outline-none resize-none max-h-32 min-h-[44px]',
                            'scrollbar-hide'
                        )}
                    />
                </div>

                {hasContent ? (
                    <button
                        type="button"
                        onClick={handleSend}
                        className={cn(
                            'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                            'bg-brand-primary text-white shadow-sm',
                            'hover:bg-brand-primary-hover transition-all duration-200 cursor-pointer'
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Модал заметки */}
            {isNoteOpen && (
                <NoteModal
                    onSave={(noteData) => {
                        addThreadNote(propertyId, noteData);
                        setIsNoteOpen(false);
                    }}
                    onClose={() => setIsNoteOpen(false)}
                    labels={{ noteTitle, noteContent, noteDate, noteTime, noteSave, noteCancel }}
                />
            )}
        </div>
    );
}

// === Sub-components ===

function PropertyThreadHeader({
    property,
    onBack,
    labels,
}: {
    property: PropertyChatCard;
    onBack: () => void;
    labels: { perMonth: string; walkMin: string };
}) {
    const images = property.images || [];
    const firstImage = images[0];

    return (
        <div className="flex items-center gap-3 px-3 md:px-4 h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
            <button
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-xl hover:bg-background-tertiary transition-colors cursor-pointer"
            >
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>

            {firstImage && (
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                    <img
                        src={getImageUrl(firstImage)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                    {property.title}
                </h3>
                <p className="text-xs text-text-tertiary truncate">
                    {property.price.toLocaleString()} €{labels.perMonth} · {property.area}m² · {property.address}
                </p>
            </div>
        </div>
    );
}

function ThreadPropertyCard({
    property,
    images,
    labels,
}: {
    property: PropertyChatCard;
    images: PropertyChatCard['images'];
    labels: { perMonth: string; walkMin: string; newBadge: string };
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIdx, setCurrentIdx] = useState(0);

    const scrollImages = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const w = el.clientWidth * 0.85;
        el.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const center = el.scrollLeft + (el.clientWidth / 2);
        const children = Array.from(el.children) as HTMLElement[];
        let closest = 0;
        let minDist = Infinity;
        children.forEach((child, i) => {
            const dist = Math.abs(center - (child.offsetLeft + child.offsetWidth / 2));
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        setCurrentIdx(closest);
    };

    const TransportIcon = property.transport_station?.type === 'bus' ? Bus : Train;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Карусель фото */}
            {images.length > 0 && (
                <div className="relative group">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x px-3 py-3"
                    >
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className="relative shrink-0 snap-center rounded-xl overflow-hidden w-[80%] aspect-4/3"
                            >
                                <img
                                    src={getImageUrl(img)}
                                    alt={getImageAlt(img, `${property.title} ${i + 1}`)}
                                    className="w-full h-full object-cover"
                                />
                                {i === 0 && property.is_new && (
                                    <span className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {labels.newBadge}
                                    </span>
                                )}
                                <span className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] px-2 py-0.5 rounded-full">
                                    {i + 1}/{images.length}
                                </span>
                            </div>
                        ))}
                    </div>
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => scrollImages('left')}
                                className={cn(
                                    'hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10',
                                    'w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center shadow-md',
                                    'opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
                                    currentIdx === 0 && 'pointer-events-none'
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollImages('right')}
                                className={cn(
                                    'hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10',
                                    'w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center shadow-md',
                                    'opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
                                    currentIdx === images.length - 1 && 'pointer-events-none'
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Детали */}
            <div className="p-4 space-y-2">
                <h3 className="text-base font-semibold text-text-primary">{property.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.address}
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-text-primary">
                        {property.price.toLocaleString()} €
                        <span className="text-sm font-normal text-text-tertiary">{labels.perMonth}</span>
                    </span>
                    {property.price_per_m2 && (
                        <span className="text-xs text-text-tertiary">{property.price_per_m2} €/m²</span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.area}m²
                    </span>
                    {property.rooms > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5" />
                            {property.rooms}
                        </span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Bath className="w-3.5 h-3.5" />
                            {property.bathrooms}
                        </span>
                    )}
                    {property.floor && (
                        <span>{property.floor}/{property.total_floors}</span>
                    )}
                </div>

                {property.transport_station && (
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <TransportIcon className="w-3.5 h-3.5" />
                        {property.transport_station.lines?.[0] && (
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: property.transport_station.lines[0].color }}
                            />
                        )}
                        <span>{property.transport_station.station_name}</span>
                        <span>· {property.transport_station.walk_minutes} {labels.walkMin}</span>
                    </div>
                )}

                {property.description && (
                    <p className="text-xs text-text-secondary line-clamp-3 pt-1">{property.description}</p>
                )}
            </div>
        </div>
    );
}

function QuickActionButton({
    icon: Icon,
    label,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full shrink-0',
                'bg-background-secondary hover:bg-background-tertiary',
                'text-xs font-medium text-text-primary',
                'transition-all duration-200 cursor-pointer',
                'active:scale-95'
            )}
        >
            <Icon className="w-3.5 h-3.5 text-brand-primary" />
            {label}
        </button>
    );
}

function ThreadMessageItem({
    message,
    property,
    labels,
}: {
    message: ChatMessage;
    property: PropertyChatCard;
    labels: PropertyThreadLabels;
}) {
    const isUser = message.senderId === 'current_user';

    // Специальные карточки
    if (message.type === 'ai-status') {
        if (message.content === 'location_map') {
            return <LocationMapCard property={property} labels={labels} />;
        }
        if (message.content === 'contact_card') {
            return <ContactCard property={property} labels={labels} />;
        }
        if (message.content === 'note') {
            return <NoteCard message={message} noteLabel={labels.noteLabel} />;
        }
    }

    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm',
                    isUser
                        ? 'bg-brand-primary text-white rounded-br-md'
                        : 'bg-background-secondary text-text-primary rounded-bl-md'
                )}
            >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div className={cn(
                    'text-[10px] mt-1',
                    isUser ? 'text-white/60 text-right' : 'text-text-tertiary'
                )}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

function LocationMapCard({
    property,
    labels,
}: {
    property: PropertyChatCard;
    labels: PropertyThreadLabels;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const defaultCategories = {
        transport: labels.categories?.transport || 'Transport',
        shops: labels.categories?.shops || 'Shops',
        restaurants: labels.categories?.restaurants || 'Restaurants',
        parks: labels.categories?.parks || 'Parks',
        schools: labels.categories?.schools || 'Schools',
        healthcare: labels.categories?.healthcare || 'Healthcare',
    };

    return (
        <>
            <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-sm">
                {/* Карта (статичный placeholder) */}
                <div className="relative h-40 bg-background-secondary flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-brand-primary" />
                    <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-text-primary">
                        {property.address}
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-background transition-colors"
                    >
                        <Maximize className="w-4 h-4 text-text-primary" />
                    </button>
                </div>

                {/* Категории */}
                <div className="p-3 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(defaultCategories).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer',
                                    'transition-all duration-200',
                                    activeCategory === key
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {activeCategory && (
                        <p className="text-xs text-text-tertiary">
                            {labels.loadingNearby || 'Loading nearby places...'}
                        </p>
                    )}
                </div>
            </div>

            {/* Полноэкранная карта */}
            {isExpanded && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col">
                    <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1.5 rounded-xl hover:bg-background-tertiary cursor-pointer"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-text-primary truncate">{property.title}</h3>
                            <p className="text-xs text-text-tertiary truncate">{property.address}</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-background-secondary flex items-center justify-center relative">
                        <MapPin className="w-12 h-12 text-brand-primary" />
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                            {Object.entries(defaultCategories).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-xs font-medium shadow-sm cursor-pointer',
                                        activeCategory === key
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-background text-text-secondary'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ContactCard({
    property,
    labels,
}: {
    property: PropertyChatCard;
    labels: PropertyThreadLabels;
}) {
    // Мок контактных данных
    const mockContact: ContactInfo = {
        phone: '+34 612 345 678',
        whatsapp: '+34 612 345 678',
        email: 'owner@example.com',
        telegram: '@owner_barcelona',
    };

    const {
        showPhone = 'Show phone',
        writeWhatsapp = 'WhatsApp',
        writeEmail = 'Email',
        writeTelegram = 'Telegram',
        goToOwner = 'Go to owner',
    } = labels;

    const contactItems = [
        { key: 'phone', icon: Phone, label: showPhone, value: mockContact.phone, href: `tel:${mockContact.phone}` },
        { key: 'whatsapp', icon: MessageCircle, label: writeWhatsapp, value: mockContact.whatsapp, href: `https://wa.me/${mockContact.whatsapp?.replace(/\D/g, '')}` },
        { key: 'email', icon: Send, label: writeEmail, value: mockContact.email, href: `mailto:${mockContact.email}` },
        { key: 'telegram', icon: Send, label: writeTelegram, value: mockContact.telegram, href: `https://t.me/${mockContact.telegram?.replace('@', '')}` },
    ].filter(item => item.value);

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-sm p-4 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-primary" />
                {labels.contact}
            </h4>

            <div className="space-y-2">
                {contactItems.map((item) => (
                    <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex items-center gap-3 p-2.5 rounded-xl',
                            'bg-background-secondary hover:bg-background-tertiary',
                            'transition-colors cursor-pointer group'
                        )}
                    >
                        <item.icon className="w-4 h-4 text-brand-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary">{item.label}</p>
                            <p className="text-[10px] text-text-tertiary truncate">{item.value}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>

            {contactItems.length === 0 && (
                <a
                    href="#"
                    className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        'bg-brand-primary/10 hover:bg-brand-primary/20',
                        'transition-colors cursor-pointer'
                    )}
                >
                    <ExternalLink className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-brand-primary">{goToOwner}</span>
                </a>
            )}
        </div>
    );
}

function NoteCard({ message, noteLabel }: { message: ChatMessage; noteLabel?: string }) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[85%] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl rounded-br-md p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <StickyNote className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{noteLabel || 'Note'}</span>
                </div>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{message.metadata?.noteContent}</p>
                {message.metadata?.noteDateTime && (
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                        <Calendar className="w-3 h-3" />
                        <span>{message.metadata.noteDateTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function NoteModal({
    onSave,
    onClose,
    labels,
}: {
    onSave: (note: { content: string; date: string; time: string }) => void;
    onClose: () => void;
    labels: {
        noteTitle: string;
        noteContent: string;
        noteDate: string;
        noteTime: string;
        noteSave: string;
        noteCancel: string;
    };
}) {
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    const handleSave = () => {
        if (!content.trim()) return;
        onSave({ content: content.trim(), date, time });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-5 space-y-4 border border-border shadow-2xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-primary">{labels.noteTitle}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-background-tertiary cursor-pointer">
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={labels.noteContent}
                    rows={3}
                    className={cn(
                        'w-full bg-background-secondary rounded-xl px-4 py-3 text-sm',
                        'text-text-primary placeholder:text-text-tertiary',
                        'focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
                        'resize-none border-none'
                    )}
                />

                <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-text-secondary">{labels.noteDate}</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-10 bg-background-secondary rounded-xl px-3 text-sm text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-text-secondary">{labels.noteTime}</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full h-10 bg-background-secondary rounded-xl px-3 text-sm text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {labels.noteCancel}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!content.trim()}
                        className="flex-1"
                    >
                        {labels.noteSave}
                    </Button>
                </div>
            </div>
        </div>
    );
}
