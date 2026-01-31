import { Property } from '../../model/types';
import { TransportStation } from '../property-address-transport/transport-stations';

export interface LocationPOI {
    id: string;
    name: string;
    type: string;
    distance: string; // e.g. "100 м", "1.2 км"
    category?: string;
    // Enhanced OSM Data
    address?: string;
    openingHours?: string;
    phone?: string;
    website?: string;
    rating?: number;
    priceLevel?: 1 | 2 | 3 | 4;
    cuisine?: string;
}

export const mockNearbyProperties: Property[] = [
    {
        id: 'nearby-1',
        title: 'Уютная квартира в центре',
        price: 1200,


        area: 45,
        rooms: 2,
        bathrooms: 1,
        floor: 2,
        totalFloors: 5,
        address: 'Carrer de València, 200',
        city: 'Barcelona',
        type: 'apartment',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        createdAt: new Date(),
        updatedAt: new Date(),
        amenities: [],
        features: [],
        description: '',
        coordinates: { lat: 41.390205, lng: 2.154007 },
        author: {
             id: 'agent-1',
             name: 'Juan Perez',
             avatar: 'https://i.pravatar.cc/150?u=agent-1',
             type: 'agent',
             isVerified: true
        }
    },
    {
        id: 'nearby-2',
        title: 'Стильный лофт',
        price: 1500,


        area: 60,
        rooms: 2,
        bathrooms: 1,
        floor: 1,
        totalFloors: 4,
        address: 'Carrer d\'Aragó, 250',
        city: 'Barcelona',
        type: 'apartment',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
        createdAt: new Date(),
        updatedAt: new Date(),
        amenities: [],
        features: [],
        description: '',
        coordinates: { lat: 41.392205, lng: 2.164007 },
        author: {
             id: 'agent-2',
             name: 'Maria Garcia',
             avatar: 'https://i.pravatar.cc/150?u=agent-2',
             type: 'agent',
             isVerified: true
        }
    },
     {
        id: 'nearby-3',
        title: 'Просторная трешка',
        price: 2100,


        area: 95,
        rooms: 4,
        bathrooms: 2,
        floor: 3,
        totalFloors: 6,
        address: 'Carrer de Balmes, 100',
        city: 'Barcelona',
        type: 'apartment',
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
        createdAt: new Date(),
        updatedAt: new Date(),
        amenities: [],
        features: [],
        description: '',
        coordinates: { lat: 41.392205, lng: 2.154007 },
        author: {
             id: 'owner-1',
             name: 'Carlos Ruiz',
             avatar: 'https://i.pravatar.cc/150?u=owner-1',
             type: 'owner',
             isVerified: true
        }
    },
    {
        id: 'nearby-4',
        title: 'Уютная студия у моря',
        price: 950,
        area: 35,
        rooms: 1,
        bathrooms: 1,
        floor: 4,
        totalFloors: 6,
        address: 'Carrer de la Marina, 150',
        city: 'Barcelona',
        type: 'studio',
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'],
        createdAt: new Date(),
        updatedAt: new Date(),
        amenities: [],
        features: [],
        description: '',
        coordinates: { lat: 41.394205, lng: 2.184007 },
        author: {
             id: 'agent-3',
             name: 'Elena Costa',
             avatar: 'https://i.pravatar.cc/150?u=agent-3',
             type: 'agent',
             isVerified: true
        }
    }
];

export const mockMedical: LocationPOI[] = [
    { 
        id: 'm1', 
        name: 'Hospital Clínic', 
        type: 'Hospital', 
        distance: '500 м',
        address: 'Carrer de Villarroel, 170',
        openingHours: '24h',
        website: 'hospitalclinic.org',
        rating: 4.8
    },
    { 
        id: 'm2', 
        name: 'Farmàcia 24h', 
        type: 'Pharmacy', 
        distance: '100 м',
        address: 'Carrer d\'Aragó, 200',
        openingHours: 'Open 24 hours',
        phone: '+34 934 532 233'
    },
    { 
        id: 'm3', 
        name: 'CAP Eixample', 
        type: 'Clinic', 
        distance: '300 м',
        address: 'Carrer de Rosselló, 161',
        openingHours: '08:00 - 20:00',
        rating: 4.2
    },
    { 
        id: 'm4', 
        name: 'Dental Clinic BCN', 
        type: 'Dentist', 
        distance: '450 м',
        address: 'Carrer de Balmes, 150',
        openingHours: '09:00 - 19:00',
        website: 'dentalclinicbcn.com',
        rating: 4.9
    },
];

export const mockSchools: LocationPOI[] = [
    { 
        id: 's1', 
        name: 'Escola Pia Balmes', 
        type: 'School', 
        distance: '200 м',
        address: 'Carrer de Balmes, 208',
        rating: 4.5,
        website: 'balmes.escolapia.cat'
    },
    { 
        id: 's2', 
        name: 'Universitat de Barcelona', 
        type: 'University', 
        distance: '600 м',
        address: 'Gran Via de les Corts Catalanes, 585',
        rating: 4.7,
        website: 'ub.edu'
    },
    { 
        id: 's3', 
        name: 'Llar d\'Infants Patufet', 
        type: 'Kindergarten', 
        distance: '350 м',
        address: 'Carrer de Pau Claris, 150',
        openingHours: '07:30 - 18:00',
        rating: 4.8
    },
];

export const mockGroceries: LocationPOI[] = [
    { 
        id: 'sh1', 
        name: 'Mercadona', 
        type: 'Supermarket', 
        distance: '150 м',
        address: 'Carrer de València, 180',
        openingHours: '09:00 - 21:00',
        rating: 4.3
    },
    { 
        id: 'sh4', 
        name: 'Frutería Pepe', 
        type: 'Grocery', 
        distance: '50 м',
        address: 'Carrer del Consell de Cent, 300',
        openingHours: '08:00 - 20:30',
        rating: 4.8
    },
    { 
        id: 'sh5', 
        name: 'Fornet de Barri', 
        type: 'Bakery', 
        distance: '100 м',
        address: 'Carrer de València, 190',
        openingHours: '07:00 - 21:00',
        rating: 4.5
    }
];

export const mockShopping: LocationPOI[] = [
    { 
        id: 'sh2', 
        name: 'El Corte Inglés', 
        type: 'Department Store', 
        distance: '800 м',
        address: 'Plaça de Catalunya, 14',
        openingHours: '09:30 - 21:00',
        rating: 4.6,
        website: 'elcorteingles.es'
    },
    { 
        id: 'sh3', 
        name: 'Zara', 
        type: 'Clothing', 
        distance: '600 м',
        address: 'Passeig de Gràcia, 16',
        openingHours: '10:00 - 21:00',
        rating: 4.4
    },
    { 
        id: 'sh6', 
        name: 'Llibres i més', 
        type: 'Bookstore', 
        distance: '350 м',
        address: 'Carrer d\'Aragó, 220',
        openingHours: '10:00 - 20:00',
        rating: 4.7
    },
    { 
        id: 'sh7', 
        name: 'Floristeria Green', 
        type: 'Florist', 
        distance: '550 м',
        address: 'Carrer de Balmes, 160',
        openingHours: '09:00 - 19:00', 
        rating: 4.6
    }
];

export const mockRestaurants: LocationPOI[] = [
    { 
        id: 'res1', 
        name: 'El Glop', 
        type: 'Restaurant', 
        distance: '120 м', 
        category: 'restaurants',
        cuisine: 'Catalan',
        priceLevel: 2,
        rating: 4.5,
        address: 'Carrer de Casp, 21',
        openingHours: '13:00 - 00:00'
    },
    { 
        id: 'res2', 
        name: 'Vinitus', 
        type: 'Tapas Bar', 
        distance: '300 м',
        category: 'restaurants',
        cuisine: 'Tapas',
        priceLevel: 2,
        rating: 4.7,
        address: 'Carrer del Consell de Cent, 333',
        openingHours: '11:30 - 01:00'
    },
    { 
        id: 'res3', 
        name: 'Café de l\'Opera', 
        type: 'Cafe', 
        distance: '900 м',
        category: 'restaurants',
        cuisine: 'Cafe',
        priceLevel: 1,
        rating: 4.4,
        address: 'La Rambla, 74',
        openingHours: '09:00 - 02:00'
    },
    { 
        id: 'res4', 
        name: 'Paradiso', 
        type: 'Bar', 
        distance: '1.5 км',
        category: 'restaurants',
        cuisine: 'Cocktail Bar',
        priceLevel: 3,
        rating: 4.8,
        address: 'Carrer de Rera Palau, 4',
        openingHours: '17:00 - 02:30'
    },
];

export const mockBeauty: LocationPOI[] = [
    { 
        id: 'b1', 
        name: 'Hair Salon Style', 
        type: 'Hairdresser', 
        distance: '200 м',
        address: 'Carrer de Balmes, 120',
        rating: 4.6,
        openingHours: '10:00 - 20:00'
    },
    { 
        id: 'b2', 
        name: 'Nails & Spa', 
        type: 'Spa', 
        distance: '400 м',
        address: 'Carrer de València, 250',
        rating: 4.4,
        website: 'nailsandspa.com'
    },
    { 
        id: 'b3', 
        name: 'Barber Shop BCN', 
        type: 'Barber', 
        distance: '550 м',
        address: 'Carrer d\'Enric Granados, 30',
        rating: 4.9,
        openingHours: '09:30 - 20:00'
    },
];

export const mockAttractions: LocationPOI[] = [
    { 
        id: 'a1', 
        name: 'Casa Batlló', 
        type: 'Landmark', 
        distance: '400 м',
        address: 'Passeig de Gràcia, 43',
        rating: 4.8,
        website: 'casabatllo.es',
        openingHours: '09:00 - 20:00'
    },
    { 
        id: 'a2', 
        name: 'La Pedrera', 
        type: 'Landmark', 
        distance: '600 м',
        address: 'Passeig de Gràcia, 92',
        rating: 4.7,
        website: 'lapedrera.com',
        openingHours: '09:00 - 20:30'
    },
    { 
        id: 'a3', 
        name: 'Sagrada Família', 
        type: 'Monument', 
        distance: '1.8 км',
        address: 'Carrer de Mallorca, 401',
        rating: 4.9,
        website: 'sagradafamilia.org',
        openingHours: '09:00 - 18:00'
    },
];

export const mockEntertainment: LocationPOI[] = [
    { 
        id: 'ent1', 
        name: 'Cinema Comedia', 
        type: 'Cinema', 
        distance: '400 м',
        address: 'Passeig de Gràcia, 13',
        rating: 4.4,
        website: 'cinemacomedia.com'
    },
    { 
        id: 'ent2', 
        name: 'Galeria Joan Prats', 
        type: 'Art Gallery', 
        distance: '300 м',
        address: 'Carrer de Balmes, 54',
        rating: 4.7,
        openingHours: '11:00 - 20:00'
    },
    { 
        id: 'ent3', 
        name: 'Jamboree Jazz', 
        type: 'Jazz Club', 
        distance: '1.4 км',
        address: 'Plaça Reial, 17',
        rating: 4.5,
        openingHours: '19:00 - 05:00'
    },
    { 
        id: 'ent4', 
        name: 'Dance Center BCN', 
        type: 'Dance Studio', 
        distance: '650 м',
        address: 'Carrer de Casp, 30',
        rating: 4.8,
        openingHours: '10:00 - 22:00'
    }
];

export const mockSports: LocationPOI[] = [
     { 
        id: 'sp1', 
        name: 'Gym DiR', 
        type: 'Gym', 
        distance: '300 м',
        address: 'Gran Via de les Corts Catalanes, 600',
        rating: 4.2,
        openingHours: '06:30 - 23:00'
    },
    { 
        id: 'sp2', 
        name: 'Fight Club BCN', 
        type: 'Boxing Club', 
        distance: '450 м',
        address: 'Carrer de Balmes, 85',
        rating: 4.8,
        openingHours: '07:00 - 22:00'
    },
    { 
        id: 'sp3', 
        name: 'Outdoor Fitness Park', 
        type: 'Outdoor Workout', 
        distance: '600 м',
        address: 'Parc de Joan Miró',
        rating: 4.3,
        openingHours: '24h'
    }
];

export const mockRecreation: LocationPOI[] = [
    { 
        id: 'r1', 
        name: 'Parc de la Ciutadella', 
        type: 'Park', 
        distance: '1.2 км',
        address: 'Passeig de Picasso, 21',
        rating: 4.6,
        openingHours: '10:00 - 22:30'
    },
];

export const mockTransportStations: TransportStation[] = [
    {
        id: 't1',
        name: 'Passeig de Gràcia',
        lines: [
            { id: 'l2', type: 'metro', name: 'L2', color: '#9F55A8', destination: 'Badalona Pompeu Fabra' },
            { id: 'l3', type: 'metro', name: 'L3', color: '#27A638', destination: 'Trinitat Nova' },
            { id: 'l4', type: 'metro', name: 'L4', color: '#FAB800', destination: 'La Pau' },
        ],
        distance: 5,
        isWalk: true
    },
    {
        id: 't2',
         name: 'Diagonal',
        lines: [
            { id: 'l3', type: 'metro', name: 'L3', color: '#27A638', destination: 'Zona Universitària' },
            { id: 'l5', type: 'metro', name: 'L5', color: '#0055A4', destination: 'Cornellà Centre' },
        ],
        distance: 8,
        isWalk: true
    }
];
