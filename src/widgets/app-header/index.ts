/**
 * Widget: AppHeader — общий хедер приложения
 *
 * Содержит кнопку-гамбургер, лого и динамический слот для контента страниц.
 * HeaderSlot — компонент-портал для рендера контента страниц в хедере.
 */
export { AppHeader } from './ui';
export { HeaderSlot, useHeaderSlotCleanup } from './header-slot';
export { useHeaderSlotStore } from './model';
