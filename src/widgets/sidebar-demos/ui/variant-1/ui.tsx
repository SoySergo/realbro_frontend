'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Search,
  Heart,
  MessageCircle,
  User,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Languages,
  MapPin,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useDemoSidebar } from '../../model';

// Вариант 1: Классический чистый сайдбар
export function Variant1() {
  const t = useTranslations('sidebar');
  const tAuth = useTranslations('auth');
  const {
    isExpanded,
    setIsExpanded,
    queries,
    activeQueryId,
    setActiveQueryId,
    addQuery,
    removeQuery,
  } = useDemoSidebar();

  const navItems = [
    { icon: Search, label: t('search'), id: 'search' },
    { icon: Heart, label: t('favorites'), id: 'favorites' },
    { icon: MessageCircle, label: t('chat'), id: 'chat' },
    { icon: User, label: t('profile'), id: 'profile' },
  ];

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Логотип и кнопка свернуть */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="RealBro" width={28} height={28} />
          {isExpanded && (
            <span className="font-bold text-text-primary text-sm">
              RealBro
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-background-secondary text-text-secondary transition-colors"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Список поисковых запросов */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t('search')}
            </span>
            <button
              onClick={addQuery}
              className="p-1 rounded hover:bg-background-secondary text-brand-primary transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors group',
                  activeQueryId === query.id
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-primary hover:bg-background-secondary'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{query.title}</span>
                  {query.isNew && (
                    <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                      new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-tertiary">
                    {query.resultsCount}
                  </span>
                  {queries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(query.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-background-tertiary text-text-tertiary transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Свёрнутое состояние */}
      {!isExpanded && (
        <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1">
          <button
            onClick={addQuery}
            className="p-2 rounded-lg hover:bg-background-secondary text-brand-primary transition-colors"
          >
            <Plus size={18} />
          </button>
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                activeQueryId === query.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-secondary hover:bg-background-secondary'
              )}
            >
              <MapPin size={18} />
            </button>
          ))}
        </div>
      )}

      {/* Навигация */}
      <div className="border-t border-border px-3 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={18} />
            {isExpanded && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Переключатели темы и языка */}
      <div className="border-t border-border px-3 py-2 flex items-center gap-2 justify-center">
        <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
          <Sun size={16} />
        </button>
        <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
          <Languages size={16} />
        </button>
        {isExpanded && (
          <button className="ml-auto text-xs text-brand-primary hover:underline">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
