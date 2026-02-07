'use client';

import { useState, useCallback } from 'react';
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    MoreHorizontal,
    Copy,
    StickyNote,
    Flag,
    FileDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { NoteModal, saveNote, getNote, type NoteModalTranslations } from './note-modal';
import { useToast } from '@/shared/ui/toast';
import { PropertyCompareMenuItem } from '@/features/comparison';
import type { Property } from '@/entities/property';

// ============================================================================
// Типы
// ============================================================================

export interface PropertyActionsMenuTranslations {
    like: string;
    liked: string;
    dislike: string;
    disliked: string;
    share: string;
    copyLink: string;
    linkCopied: string;
    addNote: string;
    editNote: string;
    noteSaved: string;
    downloadPdf: string;
    report: string;
    more: string;
    noteModal: NoteModalTranslations;
}

interface PropertyActionsMenuProps {
    propertyId: string;
    propertyTitle?: string;
    property?: Property;
    translations: PropertyActionsMenuTranslations;
    isLiked?: boolean;
    isDisliked?: boolean;
    hasNote?: boolean;
    onLike?: (propertyId: string, isLiked: boolean) => void;
    onDislike?: (propertyId: string, isDisliked: boolean) => void;
    onShare?: (propertyId: string) => void;
    onReport?: (propertyId: string) => void;
    onDownloadPdf?: (propertyId: string) => void;
    className?: string;
    variant?: 'inline' | 'compact' | 'full' | 'mediaActions';
}

// ============================================================================
// Локальное хранилище лайков/дизлайков
// ============================================================================

const STORAGE_KEY = 'realbro_property_reactions';

interface StoredReactions {
    [propertyId: string]: {
        liked: boolean;
        disliked: boolean;
        updatedAt: string;
    };
}

function getStoredReactions(): StoredReactions {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveReaction(propertyId: string, liked: boolean, disliked: boolean): void {
    if (typeof window === 'undefined') return;
    try {
        const reactions = getStoredReactions();
        reactions[propertyId] = {
            liked,
            disliked,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
    } catch {
        console.error('[Reactions] Failed to save reaction');
    }
}

export function getReaction(propertyId: string): { liked: boolean; disliked: boolean } {
    const reactions = getStoredReactions();
    return reactions[propertyId] || { liked: false, disliked: false };
}

// ============================================================================
// Компонент
// ============================================================================

export function PropertyActionsMenu({
    propertyId,
    propertyTitle,
    property,
    translations,
    isLiked: initialIsLiked,
    isDisliked: initialIsDisliked,
    hasNote: initialHasNote,
    onLike,
    onDislike,
    onShare,
    onReport,
    onDownloadPdf,
    className,
    variant = 'inline',
}: PropertyActionsMenuProps) {
    const t = translations;
    const { showToast } = useToast();
    
    // Состояние
    const [isLiked, setIsLiked] = useState(() => initialIsLiked ?? getReaction(propertyId).liked);
    const [isDisliked, setIsDisliked] = useState(() => initialIsDisliked ?? getReaction(propertyId).disliked);
    const [hasNote, setHasNote] = useState(() => initialHasNote ?? !!getNote(propertyId));
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    
    // Анимации
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [dislikeAnimating, setDislikeAnimating] = useState(false);

    // Обработчики
    const handleLike = useCallback(() => {
        const newLiked = !isLiked;
        const newDisliked = newLiked ? false : isDisliked;
        
        setIsLiked(newLiked);
        setIsDisliked(newDisliked);
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 300);
        
        saveReaction(propertyId, newLiked, newDisliked);
        onLike?.(propertyId, newLiked);
        
        if (newLiked) {
            showToast(t.liked, 'success');
        }
    }, [isLiked, isDisliked, propertyId, onLike, showToast, t.liked]);

    const handleDislike = useCallback(() => {
        const newDisliked = !isDisliked;
        const newLiked = newDisliked ? false : isLiked;
        
        setIsDisliked(newDisliked);
        setIsLiked(newLiked);
        setDislikeAnimating(true);
        setTimeout(() => setDislikeAnimating(false), 300);
        
        saveReaction(propertyId, newLiked, newDisliked);
        onDislike?.(propertyId, newDisliked);
        
        if (newDisliked) {
            showToast(t.disliked, 'info');
        }
    }, [isLiked, isDisliked, propertyId, onDislike, showToast, t.disliked]);

    const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
        // Clipboard API
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                // Fallback ниже
            }
        }
        // Fallback для старых браузеров и HTTP
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch {
            return false;
        }
    }, []);

    const handleShare = useCallback(async () => {
        const url = window.location.href;

        // Пробуем нативный share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: propertyTitle || document.title,
                    url,
                });
                onShare?.(propertyId);
                return;
            } catch {
                // Пользователь отменил или ошибка - fallback на копирование
            }
        }

        // Fallback: копирование в буфер
        const copied = await copyToClipboard(url);
        if (copied) {
            showToast(t.linkCopied, 'success');
            onShare?.(propertyId);
        } else {
            showToast(t.linkCopied, 'error');
        }
    }, [propertyId, propertyTitle, onShare, showToast, t.linkCopied, copyToClipboard]);

    const handleCopyLink = useCallback(async () => {
        const copied = await copyToClipboard(window.location.href);
        if (copied) {
            showToast(t.linkCopied, 'success');
        } else {
            showToast(t.linkCopied, 'error');
        }
    }, [showToast, t.linkCopied, copyToClipboard]);

    const handleOpenNote = useCallback(() => {
        const existingNote = getNote(propertyId) || '';
        setCurrentNote(existingNote);
        setIsNoteModalOpen(true);
    }, [propertyId]);

    const handleSaveNote = useCallback((note: string) => {
        saveNote(propertyId, note);
        setHasNote(!!note.trim());
        if (note.trim()) {
            showToast(t.noteSaved, 'success');
        }
    }, [propertyId, showToast, t.noteSaved]);

    const handleReport = useCallback(() => {
        onReport?.(propertyId);
    }, [propertyId, onReport]);

    const handleDownloadPdf = useCallback(() => {
        onDownloadPdf?.(propertyId);
    }, [propertyId, onDownloadPdf]);

    // Стили для кнопок
    const buttonBase = cn(
        'p-2 rounded-full transition-all duration-200',
        'hover:bg-muted active:scale-90'
    );

    // Рендер в зависимости от варианта
    if (variant === 'compact') {
        return (
            <>
                <div className={cn('flex items-center gap-1', className)}>
                    {/* Лайк */}
                    <button
                        onClick={handleLike}
                        className={cn(
                            buttonBase,
                            isLiked ? 'text-success' : 'text-muted-foreground hover:text-foreground'
                        )}
                        title={isLiked ? t.liked : t.like}
                    >
                        <ThumbsUp className={cn(
                            'w-5 h-5 transition-transform',
                            isLiked && 'fill-current',
                            likeAnimating && 'scale-125'
                        )} />
                    </button>
                    
                    {/* Дизлайк */}
                    <button
                        onClick={handleDislike}
                        className={cn(
                            buttonBase,
                            isDisliked ? 'text-error' : 'text-muted-foreground hover:text-foreground'
                        )}
                        title={isDisliked ? t.disliked : t.dislike}
                    >
                        <ThumbsDown className={cn(
                            'w-5 h-5 transition-transform',
                            isDisliked && 'fill-current',
                            dislikeAnimating && 'scale-125'
                        )} />
                    </button>

                    {/* Меню */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(buttonBase, 'text-muted-foreground hover:text-foreground')}
                                title={t.more}
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {property && (
                                <>
                                    <PropertyCompareMenuItem property={property} />
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <Copy className="w-4 h-4 mr-2" />
                                {t.copyLink}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleOpenNote}>
                                <StickyNote className={cn('w-4 h-4 mr-2', hasNote && 'text-warning')} />
                                {hasNote ? t.editNote : t.addNote}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDownloadPdf}>
                                <FileDown className="w-4 h-4 mr-2" />
                                {t.downloadPdf}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleReport} className="text-error focus:text-error">
                                <Flag className="w-4 h-4 mr-2" />
                                {t.report}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <NoteModal
                    isOpen={isNoteModalOpen}
                    onClose={() => setIsNoteModalOpen(false)}
                    onSave={handleSaveNote}
                    initialNote={currentNote}
                    propertyTitle={propertyTitle}
                    translations={t.noteModal}
        />
            </>
        );
    }

    // mediaActions вариант - только PDF, поделиться, пожаловаться (без лайков)
    if (variant === 'mediaActions') {
        return (
            <div className={cn('flex items-center gap-1', className)}>
                {/* Поделиться */}
                <button
                    onClick={handleShare}
                    className={cn(
                        buttonBase,
                        'text-muted-foreground hover:text-foreground'
                    )}
                    title={t.share}
                >
                    <Share2 className="w-5 h-5" />
                </button>

                {/* PDF */}
                <button
                    onClick={handleDownloadPdf}
                    className={cn(
                        buttonBase,
                        'text-muted-foreground hover:text-foreground'
                    )}
                    title={t.downloadPdf}
                >
                    <FileDown className="w-5 h-5" />
                </button>

                {/* Пожаловаться */}
                <button
                    onClick={handleReport}
                    className={cn(
                        buttonBase,
                        'text-muted-foreground hover:text-error hover:bg-error/10'
                    )}
                    title={t.report}
                >
                    <Flag className="w-5 h-5" />
                </button>
            </div>
        );
    }

    // Inline и Full вариант
    return (
        <>
            <div className={cn(
                'flex items-center',
                variant === 'full' ? 'gap-3' : 'gap-1',
                className
            )}>
                {/* Лайк */}
                <button
                    onClick={handleLike}
                    className={cn(
                        buttonBase,
                        variant === 'full' && 'flex items-center gap-2 px-3',
                        isLiked ? 'text-success' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={isLiked ? t.liked : t.like}
                >
                    <ThumbsUp className={cn(
                        'w-5 h-5 transition-transform',
                        isLiked && 'fill-current',
                        likeAnimating && 'scale-125'
                    )} />
                    {variant === 'full' && <span className="text-sm">{isLiked ? t.liked : t.like}</span>}
                </button>
                
                {/* Дизлайк */}
                <button
                    onClick={handleDislike}
                    className={cn(
                        buttonBase,
                        variant === 'full' && 'flex items-center gap-2 px-3',
                        isDisliked ? 'text-error' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={isDisliked ? t.disliked : t.dislike}
                >
                    <ThumbsDown className={cn(
                        'w-5 h-5 transition-transform',
                        isDisliked && 'fill-current',
                        dislikeAnimating && 'scale-125'
                    )} />
                    {variant === 'full' && <span className="text-sm">{isDisliked ? t.disliked : t.dislike}</span>}
                </button>

                {/* Поделиться */}
                <button
                    onClick={handleShare}
                    className={cn(
                        buttonBase,
                        variant === 'full' && 'flex items-center gap-2 px-3',
                        'text-muted-foreground hover:text-foreground'
                    )}
                    title={t.share}
                >
                    <Share2 className="w-5 h-5" />
                    {variant === 'full' && <span className="text-sm">{t.share}</span>}
                </button>

                {/* Заметка */}
                <button
                    onClick={handleOpenNote}
                    className={cn(
                        buttonBase,
                        variant === 'full' && 'flex items-center gap-2 px-3',
                        hasNote ? 'text-warning' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={hasNote ? t.editNote : t.addNote}
                >
                    <StickyNote className={cn('w-5 h-5', hasNote && 'fill-current')} />
                    {variant === 'full' && <span className="text-sm">{hasNote ? t.editNote : t.addNote}</span>}
                </button>

                {/* Меню (только для inline) */}
                {variant === 'inline' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(buttonBase, 'text-muted-foreground hover:text-foreground')}
                                title={t.more}
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <Copy className="w-4 h-4 mr-2" />
                                {t.copyLink}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadPdf}>
                                <FileDown className="w-4 h-4 mr-2" />
                                {t.downloadPdf}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleReport} className="text-error focus:text-error">
                                <Flag className="w-4 h-4 mr-2" />
                                {t.report}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                initialNote={currentNote}
                propertyTitle={propertyTitle}
                translations={t.noteModal}
            />
        </>
    );
}
