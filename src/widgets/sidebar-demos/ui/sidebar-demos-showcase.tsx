'use client';

import { useState } from 'react';
import { Variant1 } from './variant-1/ui';
import { Variant2 } from './variant-2/ui';
import { Variant3 } from './variant-3/ui';
import { Variant4 } from './variant-4/ui';
import { Variant5 } from './variant-5/ui';
import { Variant6 } from './variant-6/ui';
import { Variant7 } from './variant-7/ui';
import { Variant8 } from './variant-8/ui';
import { Variant9 } from './variant-9/ui';
import { Variant10 } from './variant-10/ui';

const variants = [
  { Component: Variant1, title: 'Classic Clean', description: 'Чистый классический дизайн' },
  { Component: Variant2, title: 'Floating Glass', description: 'Стеклянный эффект с размытием' },
  { Component: Variant3, title: 'Compact Minimal', description: 'Компактный минимализм' },
  { Component: Variant4, title: 'Dark Professional', description: 'Тёмный профессиональный' },
  { Component: Variant5, title: 'Rounded Modern', description: 'Современный с закруглениями' },
  { Component: Variant6, title: 'Sidebar with Tabs', description: 'Табы для разделов' },
  { Component: Variant7, title: 'Gradient Accent', description: 'Градиентные акценты' },
  { Component: Variant8, title: 'Outlined Elegant', description: 'Элегантные контуры' },
  { Component: Variant9, title: 'Split Navigation', description: 'Разделённая навигация' },
  { Component: Variant10, title: 'Ultra Minimal', description: 'Максимум пространства' },
];

export function SidebarDemosShowcase() {
  const [activeVariant, setActiveVariant] = useState(0);
  const ActiveComponent = variants[activeVariant].Component;

  return (
    <div className="flex h-full">
      {/* Sidebar preview */}
      <div className="shrink-0 h-full border-r border-border overflow-visible relative mr-3">
        <ActiveComponent />
      </div>

      {/* Variant selector buttons */}
      <div className="flex-1 overflow-y-auto p-8">
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          Выберите вариант сайдбара
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Нажмите на кнопку — сайдбар слева обновится. Сворачивайте/разворачивайте стрелкой.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {variants.map(({ title, description }, index) => (
            <button
              key={index}
              onClick={() => setActiveVariant(index)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                activeVariant === index
                  ? 'border-brand-primary bg-brand-primary/5 shadow-md'
                  : 'border-border hover:border-text-tertiary hover:bg-background-secondary'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    activeVariant === index
                      ? 'bg-brand-primary text-white'
                      : 'bg-background-secondary text-text-secondary'
                  }`}
                >
                  #{index + 1}
                </span>
              </div>
              <div className="font-medium text-sm text-text-primary mt-1">{title}</div>
              <div className="text-xs text-text-secondary mt-0.5">{description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
