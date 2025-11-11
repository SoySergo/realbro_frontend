/**
 * Глобальная типизация для next-intl
 * Обеспечивает автокомплит и проверку типов для ключей переводов
 */

type Messages = typeof import('../messages/ru.json');

declare global {
    // Используем тип интерфейса вместо type alias для расширения
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntlMessages extends Messages { }
}
