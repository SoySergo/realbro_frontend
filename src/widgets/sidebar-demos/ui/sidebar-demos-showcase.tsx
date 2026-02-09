'use client';

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
import { DemoSidebarWrapper } from './demo-sidebar-wrapper';

// Конфигурация всех вариантов сайдбара
const variants = [
  {
    Component: Variant1,
    title: 'Classic Clean',
    description: 'Чистый классический дизайн с чёткой иерархией',
  },
  {
    Component: Variant2,
    title: 'Floating Glass',
    description: 'Стеклянный эффект с размытием и тенями',
  },
  {
    Component: Variant3,
    title: 'Compact Minimal',
    description: 'Компактный минимализм с мелким шрифтом',
  },
  {
    Component: Variant4,
    title: 'Dark Professional',
    description: 'Тёмный профессиональный с контрастными акцентами',
  },
  {
    Component: Variant5,
    title: 'Rounded Modern',
    description: 'Современный с большими закруглениями',
  },
  {
    Component: Variant6,
    title: 'Sidebar with Tabs',
    description: 'Табы вверху для переключения разделов',
  },
  {
    Component: Variant7,
    title: 'Gradient Accent',
    description: 'Градиентные акценты и разделители',
  },
  {
    Component: Variant8,
    title: 'Outlined Elegant',
    description: 'Элегантные контуры вместо заливок',
  },
  {
    Component: Variant9,
    title: 'Split Navigation',
    description: 'Разделённая навигация: иконки + контент',
  },
  {
    Component: Variant10,
    title: 'Ultra Minimal',
    description: 'Максимум пространства, минимум декора',
  },
];

// Главный компонент-витрина всех вариантов сайдбара
export function SidebarDemosShowcase() {
  return (
    <div className="flex flex-wrap gap-6 justify-center p-6">
      {variants.map(({ Component, title, description }, index) => (
        <DemoSidebarWrapper
          key={index}
          title={title}
          description={description}
          variantNumber={index + 1}
        >
          <Component />
        </DemoSidebarWrapper>
      ))}
    </div>
  );
}
