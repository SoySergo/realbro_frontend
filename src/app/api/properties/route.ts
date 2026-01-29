import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/properties
 * Получить список объектов с пагинацией и фильтрами (mock)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Генерируем mock свойства
    const total = 1234;
    const totalPages = Math.ceil(total / limit);

    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = [
        'Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi',
        'Montjuïc', 'Sants', 'Les Corts', 'Horta-Guinardó',
    ];
    const streets = [
        'Passeig de Gràcia', 'Gran Via', 'Carrer de Aribau', 'Avenida Diagonal',
        'Carrer de Còrsega', 'Carrer del Consell de Cent', 'Carrer de Muntaner', 'Carrer de Mallorca',
    ];

    const imageBase = 'https://images.unsplash.com/photo-';
    const imageIds = [
        '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2',
        '1493809842364-78817add7ffb', '1484154218962-a197022b5858',
        '1574362848149-11496d93a7c7', '1515263487990-61b07816b324',
        '1522708323590-d24dbb6b0267', '1556228578-0d85b1a4d571',
    ];

    const properties = Array.from({ length: limit }, (_, i) => {
        const idx = (page - 1) * limit + i;
        const type = types[idx % types.length];
        const neighborhood = neighborhoods[idx % neighborhoods.length];
        const street = streets[idx % streets.length];

        let bedrooms = 1;
        if (type === 'apartment') bedrooms = (idx % 3) + 2;
        if (type === 'house') bedrooms = (idx % 4) + 3;
        if (type === 'penthouse') bedrooms = (idx % 3) + 3;

        let basePrice = 800;
        if (type === 'studio') basePrice = 600;
        if (type === 'apartment') basePrice = 1000;
        if (type === 'penthouse') basePrice = 2500;
        if (type === 'house') basePrice = 1800;

        const area = 40 + (bedrooms > 1 ? 40 : 0) + (idx * 7) % 80;
        const price = basePrice + (idx * 137) % 1000;

        const images = imageIds
            .slice(0, 4 + (idx % 4))
            .map((id) => `${imageBase}${id}?w=800&h=600&fit=crop&q=80`);

        return {
            id: `prop_${idx}`,
            title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : bedrooms + 'BR'} ${type}`,
            type,
            price,
            pricePerMeter: Math.round(price / area),
            bedrooms,
            bathrooms: (idx % 2) + 1,
            area,
            floor: (idx % 6) + 1,
            totalFloors: (idx % 4) + 5,
            address: `${street}, ${(idx * 13) % 200 + 1}`,
            city: 'Barcelona',
            province: 'Barcelona',
            coordinates: {
                lat: 41.3851 + ((idx * 0.001) % 0.04) - 0.02,
                lng: 2.1734 + ((idx * 0.0013) % 0.04) - 0.02,
            },
            description: `Представляем вашему вниманию эту великолепную недвижимость, расположенную в одном из самых востребованных районов Барселоны. Эта светлая и просторная квартира была недавно отремонтирована с использованием высококачественных материалов и готова к заселению.\n\nПросторная и светлая гостиная: Идеальное место для отдыха и приема гостей, с прямым выходом на большой балкон (или террасу), откуда открывается потрясающий вид на город (или море/горы). Гостиная оснащена современной мебелью и стильными элементами декора, создающими уютную атмосферу.\n\nСовременная кухня: Полностью оборудованная новой бытовой техникой премиум-класса (холодильник, духовка, посудомоечная машина, микроволновая печь). Стильный дизайн с функциональными шкафами и рабочей поверхностью из натурального камня. Здесь вы найдете все необходимое для приготовления изысканных блюд.\n\nУютные спальни: Две просторные спальни с двуспальными кроватями, встроенными шкафами и большими окнами, обеспечивающими естественное освещение. Главная спальня имеет собственную ванную команду для вашего удобства. Вторая спальня идеально подойдет для гостей или детей.\n\nРоскошные ванные комнаты: Две современные ванные комнаты, отделанные итальянской плиткой, с душевыми кабинами (или ванной) и качественной сантехникой. Подогрев полов добавит комфорта в холодное время года.\n\nКомфорт и удобства:\nКондиционер и автономное отопление для поддержания идеальной температуры круглый год.\nПаркетные полы из натурального дерева, придающие тепло и уют всей квартире.\nДвойные стеклопакеты для отличной звукоизоляции от городского шума.\nВидеодомофон и надежная входная дверь с системой против взлома.\nВысокоскоростной интернет проведен в каждую комнату.\n\nЗдание и инфраструктура:\nДом с лифтом и ухоженным подъездом, где регулярно проводится уборка.\nВозможность аренды (или покупки) парковочного места в подземном гараже под зданием.\nКладовая для хранения крупногабаритных вещей расположена на цокольном этаже.\nОбщая терраса на крыше с панорамным видом на Барселону для всех жильцов.\n\nРасположение:\nКвартира находится в шаговой доступности от метро (название станции) и автобусных остановок нескольких маршрутов.\nРядом расположены престижные школы, детские сады с международным обучением, современные супермаркеты, аптеки, зеленые парки и фитнес-центры с бассейнами.\nВсего в 15 минутах ходьбы от знаменитого пляжа Барселонеты.\n\nЭта недвижимость станет идеальным домом для семьи или пары, ценящих комфорт, стиль и удобное расположение в центре событий. Квартира полностью меблирована и укомплектована всем необходимым. Не упустите свой шанс жить в одном из лучших городов мира! Звоните прямо сейчас, чтобы договориться о просмотре в удобное для вас время. Мы также предлагаем онлайн-показ недвижимости для иностранных клиентов.`,
            descriptionOriginal: `We present to your attention this magnificent property located in one of the most sought-after areas of Barcelona. This bright and spacious apartment has been recently renovated using high-quality materials and is ready to move in.\n\nSpacious and bright living room: An ideal place for relaxing and receiving guests, with direct access to a large balcony (or terrace), offering a stunning view of the city (or sea/mountains). The living room is equipped with modern furniture and stylish decorative elements that create a cozy atmosphere.\n\nModern kitchen: Fully equipped with new premium appliances (refrigerator, oven, dishwasher, microwave). Stylish design with functional cabinets and natural stone worktop. Here you will find everything you need to prepare gourmet meals.\n\nCozy bedrooms: Two spacious bedrooms with double beds, built-in wardrobes and large windows providing natural light. The master bedroom has an en-suite bathroom for your convenience. The second bedroom is ideal for guests or children.`,
            features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'],
            images,
            isNew: idx % 5 === 0,
            isVerified: idx % 3 !== 0,
            nearbyTransport: {
                type: (['metro', 'train', 'bus'] as const)[idx % 3],
                name: ['Diagonal', 'Passeig de Gràcia', 'Lesseps', 'Fontana'][idx % 4],
                line: `L${(idx % 5) + 1}`,
                color: ['#EE352E', '#0066CC', '#FFC72C', '#339933', '#B51D13'][idx % 5],
                walkMinutes: (idx % 12) + 2,
            },
            author: {
                id: `agent_${idx % 5}`,
                name: ['Maria Garcia', 'José Martinez', 'Ana López', 'Carlos Rodríguez', 'Isabel Fernández'][idx % 5],
                avatar: `https://i.pravatar.cc/150?u=agent_${idx % 5}`,
                type: (['agent', 'owner', 'agency'] as const)[idx % 3],
                isVerified: idx % 3 !== 2,
            },
            createdAt: new Date(Date.now() - (idx * 3600000) % (7 * 86400000)).toISOString(),
            updatedAt: new Date(Date.now() - (idx * 1800000) % (3 * 86400000)).toISOString(),
        };
    });

    // Сортировка
    if (sortBy === 'price') {
        properties.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortBy === 'area') {
        properties.sort((a, b) => sortOrder === 'asc' ? a.area - b.area : b.area - a.area);
    }

    return NextResponse.json({
        data: properties,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    });
}
