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
  Sun,
  Languages,
  MapPin,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useDemoSidebar } from '../../model';

// Вариант 9: Разделённая навигация (иконки слева, контент справа)
export function Variant9() {
  const t = useTranslations('sidebar');
  const tAuth = useTranslations('auth');
  const {
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
    <div className="flex h-full">
      {/* Левая полоса навигации */}
      <div className="w-12 flex flex-col items-center bg-background-secondary border-r border-border py-3 gap-1 shrink-0">
        {/* Логотип */}
        <div className="mb-3">
          <Image src="/logo.svg" alt="RealBro" width={24} height={24} />
        </div>

        {/* Кнопка добавления */}
        <button
          onClick={addQuery}
          className="p-2 rounded-lg text-brand-primary hover:bg-background-tertiary transition-colors"
        >
          <Plus size={16} />
        </button>

        {/* Разделитель */}
        <div className="w-5 h-px bg-border my-1" />

        {/* Поиски в виде иконок */}
        {queries.map((query) => (
          <button
            key={query.id}
            onClick={() => setActiveQueryId(query.id)}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              activeQueryId === query.id
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-text-tertiary hover:bg-background-tertiary hover:text-text-secondary'
            )}
          >
            <MapPin size={16} />
            {query.isNew && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-primary rounded-full" />
            )}
          </button>
        ))}

        {/* Заполняющий блок */}
        <div className="flex-1" />

        {/* Навигация */}
        {navItems.map((item) => (
          <button
            key={item.id}
            className="p-2 rounded-lg text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
          >
            <item.icon size={16} />
          </button>
        ))}

        {/* Переключатели */}
        <div className="w-5 h-px bg-border my-1" />
        <button className="p-2 rounded-lg text-text-tertiary hover:bg-background-tertiary transition-colors">
          <Sun size={14} />
        </button>
        <button className="p-2 rounded-lg text-text-tertiary hover:bg-background-tertiary transition-colors">
          <Languages size={14} />
        </button>
      </div>

      {/* Правая панель контента */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Заголовок */}
        <div className="px-3 py-3 border-b border-border">
          <span className="font-bold text-text-primary text-sm">RealBro</span>
          <p className="text-[10px] text-text-tertiary mt-0.5">
            {queries.length} {t('search').toLowerCase()}
          </p>
        </div>

        {/* Список запросов */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-1.5">
            {queries.map((query) => (
              <div
                key={query.id}
                onClick={() => setActiveQueryId(query.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors group',
                  activeQueryId === query.id
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-primary hover:bg-background-secondary'
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm">{query.title}</span>
                    {query.isNew && (
                      <span className="text-[9px] bg-brand-primary text-white px-1 py-0.5 rounded">
                        new
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-tertiary">
                    {query.resultsCount} results
                  </span>
                </div>
                {queries.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuery(query.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-background-tertiary text-text-tertiary transition-all shrink-0"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка входа внизу */}
        <div className="px-3 py-2 border-t border-border">
          <button className="w-full py-1.5 text-xs text-brand-primary font-medium hover:bg-brand-primary/5 rounded-lg transition-colors">
            {tAuth('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
}
