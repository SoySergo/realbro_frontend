/**
 * Виджет сайдбара
 * По умолчанию экспортируем SidebarWrapper, который автоматически
 * показывает Desktop или Mobile версию в зависимости от размера экрана
 */

export { Sidebar as DesktopSidebar } from './Sidebar';
export { MobileSidebar } from './MobileSidebar';
export { BottomNavigation } from './BottomNavigation';
export { SidebarWrapper } from './SidebarWrapper';
export { SidebarWrapper as Sidebar } from './SidebarWrapper'; // Дефолтный экспорт как Sidebar
export { QueryItem } from './QueryItem';
export { QueriesSelect } from './QueriesSelect';
