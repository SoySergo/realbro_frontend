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

// Вариант 3: Компактный минималистичный сайдбар
export function Variant3() {
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
    <div className="flex flex-col h-full bg-background">
      {/* Логотип */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Image src="/logo.svg" alt="RealBro" width={20} height={20} />
          {isExpanded && (
            <span className="font-bold text-text-primary text-xs">
              RealBro
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 rounded text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Поисковые запросы */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
              {t('search')}
            </span>
            <button
              onClick={addQuery}
              className="text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>
          <div className="space-y-px">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs transition-colors group',
                  activeQueryId === query.id
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-primary hover:bg-background-secondary'
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{query.title}</span>
                  {query.isNew && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-text-tertiary">
                    {query.resultsCount}
                  </span>
                  {queries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(query.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-secondary transition-all"
                    >
                      <X size={9} />
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
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-0.5">
          <button
            onClick={addQuery}
            className="p-1.5 rounded text-brand-primary hover:bg-background-secondary transition-colors"
          >
            <Plus size={14} />
          </button>
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeQueryId === query.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-tertiary hover:bg-background-secondary'
              )}
            >
              <MapPin size={14} />
            </button>
          ))}
        </div>
      )}

      {/* Навигация */}
      <div className="border-t border-border/50 px-2 py-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={13} />
            {isExpanded && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Переключатели */}
      <div className={cn(
        'border-t border-border/50 px-2 py-1.5 flex gap-1 justify-center',
        isExpanded ? 'flex-row items-center' : 'flex-col items-center'
      )}>
        <button className="p-1 rounded text-text-tertiary hover:text-text-secondary transition-colors">
          <Sun size={12} />
        </button>
        <button className="p-1 rounded text-text-tertiary hover:text-text-secondary transition-colors">
          <Languages size={12} />
        </button>
        {isExpanded && (
          <button className="ml-auto text-[10px] text-brand-primary">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
