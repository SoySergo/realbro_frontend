import type { Property } from '../../model/types';

interface PropertyCardProps {
    property: Property;
    actions?: React.ReactNode;      // Слот для действий (избранное, сравнить, поделиться)
    gallery?: React.ReactNode;      // Слот для галереи фото
    footer?: React.ReactNode;       // Слот для дополнительной информации
    className?: string;
}

/**
 * PropertyCard - Презентационный компонент для отображения карточки недвижимости
 * 
 * Компонент находится в Entity слое, так как только отображает данные сущности Property.
 * Интерактивные элементы (кнопки, галереи) передаются через slots.
 * 
 * @example
 * // В feature или widget:
 * <PropertyCard 
 *   property={property}
 *   gallery={<PropertyGallery photos={property.images} />}
 *   actions={
 *     <>
 *       <FavoriteButton propertyId={property.id} />
 *       <CompareButton propertyId={property.id} />
 *     </>
 *   }
 * />
 */
export const PropertyCard = ({
    property,
    actions,
    gallery,
    footer,
    className = ''
}: PropertyCardProps) => {
    return (
        <div className={`property-card relative ${className}`}>
            {/* Галерея (или дефолтное изображение) */}
            <div className="property-card__gallery">
                {gallery || (
                    property.images[0] && (
                        <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                        />
                    )
                )}
            </div>

            {/* Действия в правом верхнем углу */}
            {actions && (
                <div className="absolute top-2 right-2 flex gap-2">
                    {actions}
                </div>
            )}

            {/* Основная информация */}
            <div className="p-4">
                <h3 className="text-lg font-semibold">{property.title}</h3>
                <p className="text-xl font-bold text-primary">{property.price} €</p>
                <p className="text-sm text-muted-foreground">{property.address}</p>

                <div className="flex gap-4 mt-2 text-sm">
                    <span>{property.area} m²</span>
                    <span>{property.bedrooms} комнат</span>
                    {property.floor && <span>{property.floor} этаж</span>}
                </div>
            </div>

            {/* Дополнительная информация */}
            {footer && (
                <div className="property-card__footer">
                    {footer}
                </div>
            )}
        </div>
    );
};
