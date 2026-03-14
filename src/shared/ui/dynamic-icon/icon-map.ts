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
    CalendarCheck,
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
    Compass,
    Layers,
    Briefcase,
    FileText,
    Accessibility,
    Moon,
    Tv,
    CookingPot,
    Microwave,
    UtensilsCrossed,
    Refrigerator,
    Warehouse,
    GraduationCap,
    Sparkles,
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
    balcony: Sun,
    window: Eye,
    storage: Warehouse,
    furnished: Sofa,
    
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
    desk: Ruler,
    tv: Tv,
    washing_machine: Waves,
    dishwasher: Waves,
    fridge: Refrigerator,
    oven: CookingPot,
    microwave: Microwave,
    kitchen: UtensilsCrossed,
    wardrobe: DoorOpen,
    
    // Климат
    air_conditioning: Snowflake,
    snowflake: Snowflake,
    heating: Flame,
    flame: Flame,
    ventilation: Wind,
    wind: Wind,
    sun: Sun,
    moon: Moon,
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
    graduation_cap: GraduationCap,
    
    // Время / Деньги
    clock: Clock,
    calendar: Calendar,
    calendar_check: CalendarCheck,
    euro: Euro,
    money: Euro,
    
    // Энергоэффективность
    energy: Zap,
    zap: Zap,
    leaf: Leaf,
    eco: Leaf,
    temperature: Thermometer,
    thermometer: Thermometer,
    energy_a: Zap,
    energy_b: Zap,
    energy_c: Zap,
    energy_d: Zap,
    energy_e: Zap,
    energy_f: Zap,
    energy_g: Zap,
    sparkles: Sparkles,
    
    // Навигация / ориентация
    compass: Compass,
    
    // Структура
    layers: Layers,
    elevator: ArrowUpDown,
    
    // Работа / документы
    briefcase: Briefcase,
    file_text: FileText,
    
    // Доступность
    accessibility: Accessibility,
    
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
