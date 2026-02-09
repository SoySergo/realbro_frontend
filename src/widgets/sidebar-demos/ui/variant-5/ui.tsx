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

// Вариант 5: Современный с закруглениями
export function Variant5() {
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
    <div className="flex flex-col h-full bg-background p-2">
      {/* Логотип */}
      <div className="flex items-center justify-between px-3 py-3 bg-background-secondary rounded-2xl mb-2">
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
          className="p-1.5 rounded-full bg-background hover:bg-background-tertiary text-text-secondary transition-colors"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Кнопка нового поиска */}
      {isExpanded && (
        <button
          onClick={addQuery}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-colors mb-2"
        >
          <Plus size={14} />
          {t('newSearch')}
        </button>
      )}

      {!isExpanded && (
        <div className="flex justify-center mb-2">
          <button
            onClick={addQuery}
            className="p-2.5 rounded-full bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Поисковые запросы */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {queries.map((query) => (
            <div
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer text-sm transition-all group',
                activeQueryId === query.id
                  ? 'bg-brand-primary-light text-brand-primary ring-1 ring-brand-primary/20'
                  : 'bg-background-secondary text-text-primary hover:bg-background-tertiary'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    'p-1.5 rounded-xl',
                    activeQueryId === query.id
                      ? 'bg-brand-primary/20'
                      : 'bg-background-tertiary'
                  )}
                >
                  <MapPin size={12} />
                </div>
                <div className="min-w-0">
                  <span className="truncate block text-sm">{query.title}</span>
                  <span className="text-[10px] text-text-tertiary">
                    {query.resultsCount} results
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {query.isNew && (
                  <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-medium">
                    new
                  </span>
                )}
                {queries.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuery(query.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-background text-text-tertiary transition-all"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Свёрнутое состояние */}
      {!isExpanded && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-2">
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'p-2.5 rounded-2xl transition-all',
                activeQueryId === query.id
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              )}
            >
              <MapPin size={16} />
            </button>
          ))}
        </div>
      )}

      {/* Навигация */}
      <div className="mt-2 bg-background-secondary rounded-2xl p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={16} />
            {isExpanded && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Переключатели */}
      <div className="mt-2 flex items-center gap-2 justify-center bg-background-secondary rounded-2xl p-2">
        <button className="p-2 rounded-xl hover:bg-background text-text-secondary transition-colors">
          <Sun size={15} />
        </button>
        <button className="p-2 rounded-xl hover:bg-background text-text-secondary transition-colors">
          <Languages size={15} />
        </button>
        {isExpanded && (
          <button className="ml-auto px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium hover:bg-brand-primary/20 transition-colors">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
