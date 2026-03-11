import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from scrap.app.repository.parser.idealista.page_details import IdealistaPageDetailsParser
from scrap.app.service.sync import SyncService


def test_classify_look_tenants_preferences():
    """Проверка классификации предпочтений арендаторов."""
    parser = IdealistaPageDetailsParser()
    raw_tenants = [
        'Alguien entre 18 y 99 años',
        'El género da igual',
        'Estancia mínima de 1 mes',
        'Ya disponible',
    ]
    result = parser.classify_look_tenants(raw_tenants)

    assert len(result['tenant_preferences']) == 4
    assert len(result['tenants']) == 0
    assert len(result['characteristics']) == 0
    print('test_classify_look_tenants_preferences PASSED')


def test_classify_look_tenants_tenants():
    """Проверка классификации данных о текущих жильцах."""
    parser = IdealistaPageDetailsParser()
    raw_tenants = [
        'Chicos y chicas',
        'Trabajan',
        'El propietario/a vive en la casa',
        'Ambiente de la casa: amistoso, suelen tener visitas',
    ]
    result = parser.classify_look_tenants(raw_tenants)

    assert len(result['tenant_preferences']) == 0
    assert len(result['tenants']) == 4
    assert len(result['characteristics']) == 0
    print('test_classify_look_tenants_tenants PASSED')


def test_classify_look_tenants_characteristics():
    """Проверка классификации характеристик жилья."""
    parser = IdealistaPageDetailsParser()
    raw_tenants = [
        'Habitación en chalet de 80 m²',
        'Planta 1ª exterior con ascensor',
        'Capacidad máxima 3 personas',
    ]
    result = parser.classify_look_tenants(raw_tenants)

    assert len(result['tenant_preferences']) == 0
    assert len(result['tenants']) == 0
    assert len(result['characteristics']) == 3
    print('test_classify_look_tenants_characteristics PASSED')


def test_classify_look_tenants_mixed():
    """Проверка классификации смешанных данных из реального примера."""
    parser = IdealistaPageDetailsParser()
    raw_tenants = [
        'Alguien entre 18 y 99 años',
        'El género da igual',
        'Estancia mínima de 1 mes',
        'Ya disponible',
        'Habitación en chalet de 80 m²',
        'Planta 1ª exterior con ascensor',
        'Capacidad máxima 3 personas',
        'Conexión a internet',
        'Cocina equipada: nevera, horno, microondas',
        'Chicos y chicas',
        'Entre 1 y 99 años',
        'Trabajan',
        'El propietario/a vive en la casa',
        'Ambiente de la casa: amistoso, suelen tener visitas',
    ]
    result = parser.classify_look_tenants(raw_tenants)

    assert len(result['tenant_preferences']) > 0, 'Должны быть предпочтения арендаторов'
    assert len(result['tenants']) > 0, 'Должны быть данные о жильцах'
    assert len(result['characteristics']) > 0, 'Должны быть характеристики жилья'
    print(f'tenant_preferences: {result["tenant_preferences"]}')
    print(f'tenants: {result["tenants"]}')
    print(f'characteristics: {result["characteristics"]}')
    print('test_classify_look_tenants_mixed PASSED')


def test_classify_empty_list():
    """Проверка обработки пустого списка."""
    parser = IdealistaPageDetailsParser()
    result = parser.classify_look_tenants([])

    assert result == {
        'tenant_preferences': [],
        'tenants': [],
        'characteristics': [],
    }
    print('test_classify_empty_list PASSED')


def test_sync_service_payload():
    """Проверка формирования payload в SyncService."""
    service = SyncService()
    page_data = {
        'external_id': '12345',
        'title': 'Habitación en Barcelona',
        'price': 600,
        'characteristics': ['3 habitaciones', '1 baño'],
        'amenities': ['Armarios empotrados', 'Lavadora'],
        'look_tenants': [
            'Alguien entre 18 y 99 años',
            'El género da igual',
            'Habitación en chalet de 80 m²',
            'Chicos y chicas',
            'Trabajan',
        ],
    }
    payload = service.build_property_payload(page_data)

    # Характеристики объединяются
    assert '3 habitaciones' in payload['characteristics']
    assert 'Habitación en chalet de 80 m²' in payload['characteristics']

    # Предпочтения арендаторов
    assert 'Alguien entre 18 y 99 años' in payload['tenant_preferences']
    assert 'El género da igual' in payload['tenant_preferences']

    # Текущие жильцы
    assert 'Chicos y chicas' in payload['tenants']
    assert 'Trabajan' in payload['tenants']

    # look_tenants не должен быть в payload напрямую
    assert 'look_tenants' not in payload
    print('test_sync_service_payload PASSED')


if __name__ == '__main__':
    test_classify_look_tenants_preferences()
    test_classify_look_tenants_tenants()
    test_classify_look_tenants_characteristics()
    test_classify_look_tenants_mixed()
    test_classify_empty_list()
    test_sync_service_payload()
    print('\nAll tests PASSED!')
