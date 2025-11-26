import type { Property } from '../../model/types';

interface PropertyDetailsProps {
    property: Property;
    actions?: React.ReactNode;      // Слот для действий
    className?: string;
}

/**
 * PropertyDetails - Детальное отображение недвижимости
 * 
 * Презентационный компонент для страницы с полной информацией о недвижимости.
 * Заглушка для будущей реализации.
 */
export const PropertyDetails = ({
    property,
    actions,
    className = ''
}: PropertyDetailsProps) => {
    return (
        <div className={`property-details ${className}`}>
            <div className="property-details__header">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                {actions}
            </div>

            <div className="property-details__content">
                <p className="text-2xl font-bold">{property.price} €</p>
                <p className="text-muted-foreground">{property.address}, {property.city}</p>

                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                        <span className="text-sm text-muted-foreground">Площадь</span>
                        <p className="text-lg font-semibold">{property.area} m²</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Комнаты</span>
                        <p className="text-lg font-semibold">{property.bedrooms}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Ванные</span>
                        <p className="text-lg font-semibold">{property.bathrooms}</p>
                    </div>
                    {property.floor && (
                        <div>
                            <span className="text-sm text-muted-foreground">Этаж</span>
                            <p className="text-lg font-semibold">{property.floor}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Описание</h2>
                    <p>{property.description}</p>
                </div>

                {property.features.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Особенности</h2>
                        <div className="flex flex-wrap gap-2">
                            {property.features.map(feature => (
                                <span key={feature} className="px-3 py-1 bg-secondary rounded-full text-sm">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
