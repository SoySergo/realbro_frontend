'use client';

import { Sidebar as DesktopSidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';

/**
 * SidebarWrapper - рендерит обе версии, скрывая нужную через CSS
 * Desktop версия скрыта на мобильных (< 768px)
 * Mobile версия скрыта на десктопе (>= 768px)
 */
export function SidebarWrapper() {
    return (
        <>
            {/* Desktop версия - видна только на md и выше */}
            <div className="hidden md:block z-101">
                <DesktopSidebar />
            </div>

            {/* Mobile версия - видна только на экранах меньше md */}
            <div className="block md:hidden z-101">
                <MobileSidebar />
            </div>
        </>
    );
}
