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

// Вариант 2: Плавающий стеклянный сайдбар
export function Variant2() {
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
    <div className="h-full p-2">
      <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50">
        {/* Логотип */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="RealBro" width={28} height={28} />
            {isExpanded && (
              <span className="font-bold text-text-primary text-sm tracking-tight">
                RealBro
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full hover:bg-background-secondary/60 text-text-secondary transition-all"
          >
            {isExpanded ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        </div>

        {/* Разделитель */}
        <div className="mx-4 h-px bg-border/50" />

        {/* Поисковые запросы */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-secondary">
                {t('search')}
              </span>
              <button
                onClick={addQuery}
                className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all"
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
                    'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all group',
                    activeQueryId === query.id
                      ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                      : 'text-text-primary hover:bg-background-secondary/60'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{query.title}</span>
                    {query.isNew && (
                      <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full font-medium">
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
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-background-tertiary text-text-tertiary transition-all"
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
          <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-2">
            <button
              onClick={addQuery}
              className="p-2 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all"
            >
              <Plus size={16} />
            </button>
            {queries.map((query) => (
              <button
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'p-2 rounded-full transition-all',
                  activeQueryId === query.id
                    ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                    : 'text-text-secondary hover:bg-background-secondary/60'
                )}
              >
                <MapPin size={16} />
              </button>
            ))}
          </div>
        )}

        {/* Навигация */}
        <div className="mx-4 h-px bg-border/50" />
        <div className="px-3 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-background-secondary/60 hover:text-text-primary transition-all',
                !isExpanded && 'justify-center'
              )}
            >
              <item.icon size={16} />
              {isExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Переключатели */}
        <div className="mx-4 h-px bg-border/50" />
        <div className={cn(
          'px-3 py-2.5 flex gap-2 justify-center',
          isExpanded ? 'flex-row items-center' : 'flex-col items-center'
        )}>
          <button className="p-2 rounded-full hover:bg-background-secondary/60 text-text-secondary transition-all">
            <Sun size={15} />
          </button>
          <button className="p-2 rounded-full hover:bg-background-secondary/60 text-text-secondary transition-all">
            <Languages size={15} />
          </button>
          {isExpanded && (
            <button className="ml-auto text-xs font-medium text-brand-primary hover:underline">
              {tAuth('signIn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
