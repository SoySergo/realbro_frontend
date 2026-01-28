'use client';

import { DesktopSidebar } from '../desktop-sidebar';
import { MobileSidebar } from '../mobile-sidebar';
import { useAutosave } from '@/widgets/sidebar/model';

/**
 * SidebarWrapper - рендерит обе версии, скрывая нужную через CSS
 * Desktop версия скрыта на мобильных (< 768px)
 * Mobile версия скрыта на десктопе (>= 768px)
 */
export function SidebarWrapper() {
    // Автосохранение, Ctrl+S, предупреждение при закрытии
    useAutosave();

    return (
        <>
            {/* Desktop версия - видна только на md и выше */}
            <div className="hidden md:block z-101">
                <DesktopSidebar />
            </div>

            {/* Mobile версия - видна только на экранах меньше md */}
            <div className="block md:hidden ">
                <MobileSidebar />
            </div>
        </>
    );
}
