# Отладочная информация для MapDrawPolygon

## Проблемы и решения

### ✅ Исправлено: Перемещение точек не работало

**Причина**: Локальные переменные `isDragging` и `dragIndex` не сохранялись между вызовами обработчиков событий.

**Решение**: Использование `useRef` для хранения состояния drag-and-drop:
```typescript
const isDraggingRef = useRef(false);
const dragIndexRef = useRef<number | null>(null);
```

**Дополнительно**: Отключение `map.dragPan` во время перетаскивания точек.

### ✅ Исправлено: Кнопка "Редактировать" не работала для некоторых полигонов

**Причина**: Замыкание в `useCallback` захватывало старую версию массива `polygons`. Когда popup создавался, функция `handleEditPolygon` работала со старыми данными.

**Решение**: Использование функционального обновления состояния:
```typescript
const handleEditPolygon = useCallback((polygonId: string) => {
    setPolygons((currentPolygons) => {
        const polygon = currentPolygons.find((p) => p.id === polygonId);
        // ...работаем с актуальными данными
        return currentPolygons.filter((p) => p.id !== polygonId);
    });
}, [map]);
```

**Дополнительно**: Изменили `closeOnClick: false` в popup, чтобы клик по кнопке не закрывал popup раньше времени.

## Логи для отладки

При использовании компонента в консоли будут следующие логи:

### Перемещение точек
- `Started dragging point: <index>` - начало перетаскивания
- `Dragging point <index> to: <coordinates>` - процесс перетаскивания
- `Finished dragging point: <index>` - завершение перетаскивания

### Клик по полигону
- `Clicked on polygon layer, features: <count>` - клик на слой полигонов
- `Selected polygon ID: <id>` - ID выбранного полигона
- `Current polygons: [...]` - список всех полигонов в состоянии
- `Removing old popup` - удаление старого popup
- `Creating new popup at: <coordinates>` - создание нового popup

### Редактирование полигона
- `Edit button clicked for polygon: <id>` - клик на кнопку редактирования
- `handleEditPolygon called with ID: <id>` - вызов функции редактирования
- `Current polygons in setState: [...]` - актуальный список полигонов в setState
- `Found polygon, setting points: <count>` - найден полигон, установка точек
- `Editing polygon started successfully` - редактирование успешно начато
- **ИЛИ** `Polygon not found! ID: <id>` - полигон не найден (ошибка)

### Удаление полигона
- `Delete button clicked for polygon: <id>` - клик на кнопку удаления
- `Deleted polygon: <id>` - полигон удалён

## Проверка работоспособности

1. **Создайте 2-3 полигона**
2. **Проверьте перемещение точек**: откройте любой полигон на редактирование и попробуйте перетащить точки
3. **Проверьте редактирование**: кликните на каждый полигон и нажмите "Редактировать" - должно работать для всех
4. **Проверьте логи**: в консоли должны быть соответствующие сообщения

## Если возникают проблемы

### Кнопка не реагирует на клик
Проверьте в консоли:
- Есть ли лог `Clicked on polygon layer`?
- Есть ли лог `Edit button clicked`?
- Если есть `Edit button clicked` но нет `handleEditPolygon called` - проблема в передаче функции
- Если есть `Polygon not found` - проблема с ID или состоянием

### Точки не перемещаются
Проверьте в консоли:
- Есть ли лог `Started dragging point`?
- Есть ли логи `Dragging point ... to: ...` при движении мыши?
- Если нет - проблема с обработчиками событий

### Popup закрывается при клике
- Проверьте `closeOnClick: false` в настройках Popup
- Возможно события всплывают до карты
