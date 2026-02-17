import { memo } from 'react';
import { ICON_MAP, FALLBACK_ICON } from './icon-map';

interface DynamicIconProps {
    /** Ключ иконки с бекенда (icon_type из AttributeDTO) */
    name: string;
    /** Размер иконки в пикселях */
    size?: number;
    /** CSS-класс */
    className?: string;
}

/**
 * Компонент динамических иконок
 * Рендерит Lucide-иконку по строковому ключу с бекенда
 * При неизвестном ключе рендерит fallback-иконку (HelpCircle)
 */
export const DynamicIcon = memo(function DynamicIcon({ name, size = 18, className }: DynamicIconProps) {
    const IconComponent = ICON_MAP[name] || FALLBACK_ICON;
    return <IconComponent size={size} className={className} />;
});
