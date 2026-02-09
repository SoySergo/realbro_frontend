'use client';

import { useState } from 'react';
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

// Вариант 6: Сайдбар с табами сверху
export function Variant6() {
  const t = useTranslations('sidebar');
  const tAuth = useTranslations('auth');
  const [activeTab, setActiveTab] = useState<'searches' | 'nav'>('searches');
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
      {/* Логотип */}
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

      {/* Табы */}
      {isExpanded && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('searches')}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-colors relative',
              activeTab === 'searches'
                ? 'text-brand-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t('search')}
            {activeTab === 'searches' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nav')}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-colors relative',
              activeTab === 'nav'
                ? 'text-brand-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t('settings')}
            {activeTab === 'nav' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Контент вкладки Searches */}
      {isExpanded && activeTab === 'searches' && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary font-medium">
              {queries.length} {t('search').toLowerCase()}
            </span>
            <button
              onClick={addQuery}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-medium hover:bg-brand-primary/20 transition-colors"
            >
              <Plus size={10} />
              {t('newSearch')}
            </button>
          </div>
          <div className="space-y-1.5">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors group',
                  activeQueryId === query.id
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    : 'text-text-primary hover:bg-background-secondary border border-transparent'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={14} className="shrink-0" />
                  <div className="min-w-0">
                    <span className="truncate block text-sm leading-tight">
                      {query.title}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      {query.resultsCount} results
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {query.isNew && (
                    <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                      new
                    </span>
                  )}
                  {queries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(query.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-background-tertiary text-text-tertiary transition-all"
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

      {/* Контент вкладки Navigation */}
      {isExpanded && activeTab === 'nav' && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Настройки внутри вкладки */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider block mb-2 px-3">
              {t('settings')}
            </span>
            <div className="flex items-center gap-2 px-3 py-2">
              <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
                <Sun size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
                <Languages size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Свёрнутое состояние */}
      {!isExpanded && (
        <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1">
          <button
            onClick={addQuery}
            className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
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
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-secondary hover:bg-background-secondary'
              )}
            >
              <MapPin size={16} />
            </button>
          ))}
          <div className="mt-auto flex flex-col items-center gap-1 border-t border-border pt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className="p-2 rounded-lg text-text-secondary hover:bg-background-secondary transition-colors"
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Нижняя панель */}
      <div className={cn(
        'border-t border-border px-3 py-2 flex justify-center gap-2',
        !isExpanded ? 'flex-col items-center' : 'flex-row items-center'
      )}>
        {!isExpanded && (
          <>
            <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
              <Sun size={14} />
            </button>
            <button className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary transition-colors">
              <Languages size={14} />
            </button>
          </>
        )}
        {isExpanded && (
          <button className="w-full py-2 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}
