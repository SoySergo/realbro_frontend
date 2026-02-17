/**
 * Маппинг строковых ключей иконок с бекенда на компоненты Lucide
 * Бекенд присылает icon_type: string в AttributeDTO
 * Фронтенд рендерит через <DynamicIcon name={icon_type} />
 */
import {
    Bath,
    Bed,
    Ruler,
    Building2,
    Car,
    Waves,
    Wind,
    Flame,
    Snowflake,
    Sun,
    Wifi,
    ParkingCircle,
    TreePine,
    Dumbbell,
    ShieldCheck,
    DoorOpen,
    Sofa,
    Dog,
    Baby,
    Cigarette,
    Users,
    Clock,
    Calendar,
    Euro,
    Zap,
    Leaf,
    Thermometer,
    ArrowUpDown,
    Home,
    SquareStack,
    Eye,
    MapPin,
    HelpCircle,
    type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    // Характеристики
    bath: Bath,
    bed: Bed,
    ruler: Ruler,
    area: Ruler,
    floor: ArrowUpDown,
    floors: Building2,
    building: Building2,
    building2: Building2,
    rooms: DoorOpen,
    door: DoorOpen,
    
    // Удобства
    pool: Waves,
    parking: ParkingCircle,
    car: Car,
    garden: TreePine,
    tree: TreePine,
    gym: Dumbbell,
    wifi: Wifi,
    sofa: Sofa,
    furniture: Sofa,
    
    // Климат
    air_conditioning: Snowflake,
    snowflake: Snowflake,
    heating: Flame,
    flame: Flame,
    ventilation: Wind,
    wind: Wind,
    sun: Sun,
    terrace: Sun,
    
    // Безопасность
    security: ShieldCheck,
    shield: ShieldCheck,
    
    // Арендаторы
    pets: Dog,
    dog: Dog,
    children: Baby,
    baby: Baby,
    smoking: Cigarette,
    users: Users,
    couples: Users,
    
    // Время / Деньги
    clock: Clock,
    calendar: Calendar,
    euro: Euro,
    money: Euro,
    
    // Энергоэффективность
    energy: Zap,
    zap: Zap,
    leaf: Leaf,
    eco: Leaf,
    temperature: Thermometer,
    thermometer: Thermometer,
    
    // Общее
    home: Home,
    house: Home,
    stack: SquareStack,
    eye: Eye,
    view: Eye,
    location: MapPin,
    map_pin: MapPin,
};

export const FALLBACK_ICON: LucideIcon = HelpCircle;
