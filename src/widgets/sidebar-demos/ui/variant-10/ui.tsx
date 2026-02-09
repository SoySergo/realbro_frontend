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

// Вариант 10: Ультра-минималистичный сайдбар
export function Variant10() {
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
      {/* Логотип с максимальными отступами */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="RealBro" width={24} height={24} />
          {isExpanded && (
            <span className="font-medium text-text-primary text-sm tracking-tight">
              RealBro
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Поисковые запросы */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-text-tertiary">
              {t('search')}
            </span>
            <button
              onClick={addQuery}
              className="text-text-tertiary hover:text-brand-primary transition-colors"
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
                  'flex items-center justify-between py-2.5 cursor-pointer text-sm transition-colors group',
                  activeQueryId === query.id
                    ? 'text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin
                    size={14}
                    className={cn(
                      'shrink-0 transition-colors',
                      activeQueryId === query.id
                        ? 'text-brand-primary'
                        : 'text-text-tertiary'
                    )}
                  />
                  <span className="truncate">{query.title}</span>
                  {query.isNew && (
                    <span className="w-1 h-1 rounded-full bg-brand-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <X size={11} />
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
        <div className="flex-1 overflow-y-auto py-4 flex flex-col items-center gap-3">
          <button
            onClick={addQuery}
            className="text-text-tertiary hover:text-brand-primary transition-colors"
          >
            <Plus size={18} />
          </button>
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'transition-colors relative',
                activeQueryId === query.id
                  ? 'text-brand-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <MapPin size={18} />
              {query.isNew && (
                <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Навигация */}
      <div className="px-5 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full py-2.5 text-sm text-text-tertiary hover:text-text-primary transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={16} />
            {isExpanded && (
              <span className="font-light">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Переключатели */}
      <div className="px-5 py-4 flex items-center gap-3 justify-center">
        <button className="text-text-tertiary hover:text-text-secondary transition-colors">
          <Sun size={15} />
        </button>
        <button className="text-text-tertiary hover:text-text-secondary transition-colors">
          <Languages size={15} />
        </button>
        {isExpanded && (
          <button className="ml-auto text-xs text-text-tertiary hover:text-brand-primary transition-colors">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
