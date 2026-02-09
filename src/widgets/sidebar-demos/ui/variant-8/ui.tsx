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

// Вариант 8: Элегантный контурный сайдбар
export function Variant8() {
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
    <div className="flex flex-col h-full bg-background px-3 py-3">
      {/* Логотип */}
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="RealBro" width={26} height={26} />
          {isExpanded && (
            <span className="font-semibold text-text-primary text-sm tracking-wide">
              RealBro
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded border border-border hover:border-border-hover text-text-secondary transition-colors"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Пунктирный разделитель */}
      <div className="border-t border-dashed border-border mb-3" />

      {/* Поисковые запросы */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs text-text-tertiary font-light tracking-widest uppercase">
              {t('search')}
            </span>
            <button
              onClick={addQuery}
              className="p-1 rounded border border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all group',
                  activeQueryId === query.id
                    ? 'border border-brand-primary text-brand-primary'
                    : 'border border-border text-text-primary hover:border-border-hover'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate font-light">{query.title}</span>
                  {query.isNew && (
                    <span className="text-[10px] border border-brand-primary text-brand-primary px-1.5 py-0.5 rounded-full font-light">
                      new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {query.resultsCount}
                  </span>
                  {queries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(query.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded border border-transparent hover:border-border text-text-tertiary transition-all"
                    >
                      <X size={10} />
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
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-2">
          <button
            onClick={addQuery}
            className="p-2 rounded border border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary transition-all"
          >
            <Plus size={14} />
          </button>
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'p-2 rounded transition-all',
                activeQueryId === query.id
                  ? 'border border-brand-primary text-brand-primary'
                  : 'border border-border text-text-secondary hover:border-border-hover'
              )}
            >
              <MapPin size={14} />
            </button>
          ))}
        </div>
      )}

      {/* Пунктирный разделитель */}
      <div className="border-t border-dashed border-border my-2" />

      {/* Навигация */}
      <div className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-all',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={15} />
            {isExpanded && <span className="font-light">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Пунктирный разделитель */}
      <div className="border-t border-dashed border-border my-2" />

      {/* Переключатели */}
      <div className={cn(
        'flex gap-2 justify-center',
        isExpanded ? 'flex-row items-center' : 'flex-col items-center'
      )}>
        <button className="p-1.5 rounded border border-border hover:border-border-hover text-text-secondary transition-colors">
          <Sun size={14} />
        </button>
        <button className="p-1.5 rounded border border-border hover:border-border-hover text-text-secondary transition-colors">
          <Languages size={14} />
        </button>
        {isExpanded && (
          <button className="ml-auto text-xs text-brand-primary font-light border border-brand-primary/30 px-2.5 py-1 rounded hover:border-brand-primary transition-colors">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
