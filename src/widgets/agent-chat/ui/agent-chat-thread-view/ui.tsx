'use client';

import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Heart, MapPin, Building2, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { useAgentChatStore } from '@/features/agent-chat';
import { 
  AgentMessageBubble, 
  QuickActionChips, 
  NoteForm, 
  ContactForm 
} from '@/entities/agent-chat';
import type { AgentChatLabels, QuickActionType } from '@/entities/agent-chat';
import { getImageUrl } from '@/entities/property';
import { generateMockNearbyPlaces } from '@/shared/api/agent-chat';

interface AgentChatThreadViewProps {
  labels: AgentChatLabels;
  className?: string;
}

export const AgentChatThreadView = memo(function AgentChatThreadView({
  labels,
  className,
}: AgentChatThreadViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const { 
    getActiveThread, 
    closeThread, 
    sendMessage, 
    toggleFavorite, 
    saveNote,
    markSuitable,
    isSending,
  } = useAgentChatStore();

  const thread = getActiveThread();

  // Автоскролл вниз
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [thread?.messages.length]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !thread) return;
    sendMessage(inputValue.trim(), thread.id);
    setInputValue('');
    inputRef.current?.focus();
  }, [inputValue, thread, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickAction = useCallback((action: QuickActionType) => {
    if (!thread) return;

    switch (action) {
      case 'description':
        // Агент отправляет описание
        sendMessage('', thread.id).then(() => {
          // Мок: добавляем описание как ответ агента
        });
        // Имитируем запрос описания
        useAgentChatStore.setState((state) => ({
          threads: state.threads.map((t) =>
            t.id === thread.id
              ? {
                  ...t,
                  messages: [...t.messages, {
                    id: `msg_desc_${Date.now()}`,
                    threadId: thread.id,
                    sender: 'agent' as const,
                    type: 'description' as const,
                    content: thread.property.description || `${thread.property.title} — ${thread.property.area}m², ${thread.property.rooms} rooms, floor ${thread.property.floor || 1}. ${thread.property.address}`,
                    createdAt: new Date().toISOString(),
                  }],
                }
              : t
          ),
        }));
        break;
      case 'makeNote':
        setShowNoteForm(true);
        setShowContactForm(false);
        break;
      case 'addFavorite':
        toggleFavorite(thread.id);
        break;
      case 'suitable':
        markSuitable(thread.id, true);
        break;
      case 'notSuitable':
        markSuitable(thread.id, false);
        break;
      case 'whatsNearby':
        // Мок: добавляем карту мест рядом
        {
          const places = generateMockNearbyPlaces();
          useAgentChatStore.setState((state) => ({
            threads: state.threads.map((t) =>
              t.id === thread.id
                ? {
                    ...t,
                    messages: [...t.messages, {
                      id: `msg_nearby_${Date.now()}`,
                      threadId: thread.id,
                      sender: 'agent' as const,
                      type: 'nearby-map' as const,
                      content: labels.messages.nearbyTitle,
                      metadata: { nearbyPlaces: places },
                      createdAt: new Date().toISOString(),
                    }],
                  }
                : t
            ),
          }));
        }
        break;
      case 'contact':
        setShowContactForm(true);
        setShowNoteForm(false);
        break;
    }
  }, [thread, sendMessage, toggleFavorite, markSuitable, labels.messages.nearbyTitle]);

  const handleSaveNote = useCallback((text: string) => {
    if (!thread) return;
    saveNote(thread.id, text);
    setShowNoteForm(false);
    // Добавляем системное сообщение в тред
    useAgentChatStore.setState((state) => ({
      threads: state.threads.map((t) =>
        t.id === thread.id
          ? {
              ...t,
              messages: [...t.messages, {
                id: `msg_note_${Date.now()}`,
                threadId: thread.id,
                sender: 'agent' as const,
                type: 'note' as const,
                content: `${labels.messages.noteTitle}: ${text}`,
                createdAt: new Date().toISOString(),
              }],
            }
          : t
      ),
    }));
  }, [thread, saveNote, labels.messages.noteTitle]);

  if (!thread) return null;

  const property = thread.property;
  const thumbnail = property.images[0];
  const thumbnailUrl = thumbnail ? getImageUrl(thumbnail) : '';
  const price = property.price?.toLocaleString('es-ES') ?? '0';

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Заголовок треда */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border bg-background shrink-0">
        <button
          onClick={closeThread}
          className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Превью объекта */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-background-tertiary">
          {thumbnailUrl && (
            <Image src={thumbnailUrl} alt={property.title} fill className="object-cover" sizes="40px" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-primary">{price}€</span>
            {thread.isFavorite && <Heart className="w-3.5 h-3.5 text-error fill-error" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            {property.rooms > 0 && (
              <span className="flex items-center gap-0.5">
                <Building2 className="w-3 h-3" />
                {property.rooms}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Maximize2 className="w-3 h-3" />
              {property.area}{labels.propertyCard.area}
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{property.address}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Список сообщений */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hide"
      >
        {thread.messages.map((msg) => {
          // Сообщение с nearby местами
          if (msg.type === 'nearby-map' && msg.metadata?.nearbyPlaces) {
            return (
              <div key={msg.id} className="space-y-1.5 animate-message-slide-in">
                <AgentMessageBubble message={{ ...msg, type: 'text', content: msg.content }} />
                <div className="ml-9 rounded-xl border border-border bg-background-secondary p-2.5 space-y-1.5">
                  {msg.metadata.nearbyPlaces.map((place) => (
                    <div key={place.id} className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
                      <span className="text-text-primary flex-1">{place.name}</span>
                      <span className="text-text-tertiary">{place.walkMinutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // Заметка
          if (msg.type === 'note') {
            return (
              <div key={msg.id} className="flex justify-center py-1 animate-message-slide-in">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs">
                  📝 {msg.content}
                </div>
              </div>
            );
          }

          return (
            <AgentMessageBubble key={msg.id} message={msg} />
          );
        })}

        {/* Форма заметки */}
        {showNoteForm && (
          <NoteForm
            onSave={handleSaveNote}
            onCancel={() => setShowNoteForm(false)}
            initialValue={thread.note}
            labels={labels.noteForm}
          />
        )}

        {/* Форма контактов */}
        {showContactForm && (
          <ContactForm
            contactInfo={{
              phone: '+34 612 345 678',
              whatsapp: '+34 612 345 678',
              email: 'agent@realbro.com',
            }}
            labels={labels.contactForm}
          />
        )}
      </div>

      {/* Быстрые действия */}
      <QuickActionChips
        onAction={handleQuickAction}
        isFavorite={thread.isFavorite}
        labels={labels.quickActions}
      />

      {/* Поле ввода */}
      <div className="px-3 pb-3 pt-1 border-t border-border bg-background shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.messages.placeholder}
            rows={1}
            className={cn(
              'flex-1 rounded-xl border border-border bg-background-secondary px-3 py-2 text-sm',
              'text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
              'resize-none transition-all duration-200',
              'max-h-24 overflow-y-auto'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
              'p-2.5 rounded-xl transition-colors cursor-pointer shrink-0',
              inputValue.trim() && !isSending
                ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                : 'bg-background-tertiary text-text-tertiary'
            )}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
