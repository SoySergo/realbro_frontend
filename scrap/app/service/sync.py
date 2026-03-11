from typing import Dict, Any, List

from scrap.app.repository.parser.idealista.page_details import IdealistaPageDetailsParser


class SyncService:
    """Сервис синхронизации данных объектов с бекендом."""

    def __init__(self):
        self._parser = IdealistaPageDetailsParser()

    def build_property_payload(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Формирование payload для отправки данных объекта на бекенд.

        Классифицирует данные look_tenants и отправляет их в правильные поля:
        - tenant_preferences: предпочтения арендаторов
        - tenants: текущие жильцы
        - characteristics: характеристики жилья (объединяются с основными)

        Args:
            page_data: Сырые данные объекта со страницы.

        Returns:
            Payload для отправки на бекенд.
        """
        raw_tenants: List[str] = page_data.get('look_tenants', [])
        classifications = self._parser.classify_look_tenants(raw_tenants)

        existing_characteristics: List[str] = page_data.get('characteristics', [])

        payload: Dict[str, Any] = {
            'external_id': page_data.get('external_id'),
            'title': page_data.get('title'),
            'description': page_data.get('description'),
            'price': page_data.get('price'),
            'address': page_data.get('address'),
            'building_info': page_data.get('building_info', []),
            'estate_info': page_data.get('estate_info', []),
            'energy_efficiency': page_data.get('energy_efficiency', []),
            'amenities': page_data.get('amenities', []),
        }

        # Объединяем характеристики из основного поля и из look_tenants
        payload['characteristics'] = existing_characteristics + classifications['characteristics']

        # Классифицированные данные из look_tenants
        payload['tenant_preferences'] = classifications['tenant_preferences']
        payload['tenants'] = classifications['tenants']

        return payload

    def sync_property(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Синхронизация одного объекта с бекендом.

        Args:
            page_data: Сырые данные объекта.

        Returns:
            Ответ от бекенда.
        """
        payload = self.build_property_payload(page_data)
        return payload
