import re
from typing import List, Dict, Any, Optional


class IdealistaPageDetailsParser:
    """Парсер страниц деталей объектов с Idealista."""

    def _parse_attributes(self, page_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Парсинг атрибутов объекта из сырых данных страницы."""
        attributes = {
            'characteristics': [],
            'amenities': [],
            'building_info': [],
            'estate_info': [],
            'energy_efficiency': [],
        }

        raw_chars = page_data.get('characteristics', [])
        if raw_chars:
            attributes['characteristics'] = raw_chars

        raw_amenities = page_data.get('amenities', [])
        if raw_amenities:
            attributes['amenities'] = raw_amenities

        raw_building = page_data.get('building_info', [])
        if raw_building:
            attributes['building_info'] = raw_building

        return attributes

    def _parse_look_tenants(self, page_data: Dict[str, Any]) -> List[str]:
        """Извлечение сырых данных look_tenants из страницы."""
        raw_tenants = page_data.get('look_tenants', [])
        if isinstance(raw_tenants, list):
            return raw_tenants
        return []

    def classify_look_tenants(self, raw_tenants: List[str]) -> dict:
        """Классификация сырых данных из look_tenants на 3 категории.

        Args:
            raw_tenants: Список сырых строк из поля look_tenants.

        Returns:
            Словарь с ключами:
            - tenant_preferences: предпочтения арендаторов (возраст, пол, тип)
            - tenants: информация о текущих жильцах
            - characteristics: характеристики жилья (размер, этаж)
        """
        classifications = {
            'tenant_preferences': [],
            'tenants': [],
            'characteristics': [],
        }

        PREFERENCE_PATTERNS = [
            r'alguien entre.*a[ñn]os',
            r'g[eé]nero',
            r'estancia m[ií]nima',
            r'estudiantes',
            r'parejas',
            r'profesionales',
            r'ya disponible',
            r'entre \d+ y \d+ a[ñn]os',
        ]

        TENANT_PATTERNS = [
            r'chicos y chicas',
            r'trabajan',
            r'propietario.*vive',
            r'ambiente.*casa',
        ]

        CHARACTERISTIC_PATTERNS = [
            r'habitaci[oó]n en',
            r'planta.*exterior',
            r'capacidad m[aá]xima',
            r'\d+\s*m[²2]',
            r'ascensor',
        ]

        for item in raw_tenants:
            if any(re.search(p, item, re.I) for p in PREFERENCE_PATTERNS):
                classifications['tenant_preferences'].append(item)
            elif any(re.search(p, item, re.I) for p in TENANT_PATTERNS):
                classifications['tenants'].append(item)
            elif any(re.search(p, item, re.I) for p in CHARACTERISTIC_PATTERNS):
                classifications['characteristics'].append(item)
            else:
                # По умолчанию — предпочтения арендаторов
                classifications['tenant_preferences'].append(item)

        return classifications

    def parse(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Полный парсинг данных страницы объекта.

        Args:
            page_data: Сырые данные страницы.

        Returns:
            Структурированные данные объекта с классифицированными атрибутами.
        """
        attributes = self._parse_attributes(page_data)

        raw_tenants = self._parse_look_tenants(page_data)
        classified = self.classify_look_tenants(raw_tenants)

        # Добавляем характеристики из look_tenants к основным характеристикам
        attributes['characteristics'] = (
            attributes.get('characteristics', []) + classified['characteristics']
        )

        return {
            **attributes,
            'tenant_preferences': classified['tenant_preferences'],
            'tenants': classified['tenants'],
        }
