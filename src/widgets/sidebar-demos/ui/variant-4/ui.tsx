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

// Вариант 4: Тёмный профессиональный сайдбар
export function Variant4() {
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
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Логотип */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="RealBro" width={30} height={30} />
          {isExpanded && (
            <span className="font-extrabold text-sm tracking-tight">
              RealBro
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Кнопка нового поиска */}
      {isExpanded && (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={addQuery}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            <Plus size={14} />
            {t('newSearch')}
          </button>
        </div>
      )}

      {/* Поисковые запросы */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all group',
                  activeQueryId === query.id
                    ? 'bg-sidebar-accent text-brand-primary font-medium'
                    : 'hover:bg-sidebar-accent/50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{query.title}</span>
                  {query.isNew && (
                    <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded font-bold">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs opacity-60 font-mono">
                    {query.resultsCount}
                  </span>
                  {queries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(query.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-sidebar-accent transition-all"
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
            className="p-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
          >
            <Plus size={16} />
          </button>
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => setActiveQueryId(query.id)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                activeQueryId === query.id
                  ? 'bg-sidebar-accent text-brand-primary'
                  : 'hover:bg-sidebar-accent/50'
              )}
            >
              <MapPin size={16} />
            </button>
          ))}
        </div>
      )}

      {/* Навигация */}
      <div className="border-t border-sidebar-border px-3 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <item.icon size={18} />
            {isExpanded && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Переключатели */}
      <div className="border-t border-sidebar-border px-3 py-3 flex items-center gap-2 justify-center">
        <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Sun size={16} />
        </button>
        <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Languages size={16} />
        </button>
        {isExpanded && (
          <button className="ml-auto text-xs font-semibold text-brand-primary hover:underline">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
