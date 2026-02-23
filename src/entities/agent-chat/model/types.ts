import type { PropertyChatCard } from '@/entities/property';

// === Типы ИИ Агент Чат V2 ===

export type AgentChatView = 'main' | 'thread';

export type AgentMessageType =
  | 'text'
  | 'property'
  | 'description'
  | 'note'
  | 'note-form'
  | 'contact-form'
  | 'nearby-map'
  | 'system'
  | 'status';

export type AgentMessageSender = 'user' | 'agent';

export type PropertyReaction = 'like' | 'dislike' | 'report';

export type QuickActionType =
  | 'description'
  | 'makeNote'
  | 'addFavorite'
  | 'suitable'
  | 'notSuitable'
  | 'whatsNearby'
  | 'contact';

export interface AgentMessage {
  id: string;
  threadId?: string; // Если есть — сообщение принадлежит треду объекта
  sender: AgentMessageSender;
  type: AgentMessageType;
  content: string;
  property?: PropertyChatCard; // Для property сообщений
  replyTo?: {
    // Ответ на сообщение (свайп)
    messageId: string;
    preview: string;
    propertyTitle?: string;
  };
  metadata?: {
    noteText?: string;
    contactInfo?: {
      phone?: string;
      whatsapp?: string;
      email?: string;
    };
    nearbyPlaces?: NearbyPlace[];
    filterName?: string;
    filterId?: string;
  };
  createdAt: string;
  isNew?: boolean;
}

export interface NearbyPlace {
  id: string;
  name: string;
  type:
    | 'metro'
    | 'bus'
    | 'school'
    | 'hospital'
    | 'park'
    | 'supermarket'
    | 'restaurant';
  distance: number; // метры
  walkMinutes: number;
}

export interface PropertyThread {
  id: string;
  property: PropertyChatCard;
  messages: AgentMessage[];
  lastActivity: string;
  reaction?: PropertyReaction;
  isFavorite: boolean;
  note?: string;
  unreadCount: number;
}

export interface AgentChatFilter {
  id: string;
  name: string;
  count: number;
}

export interface AgentChatState {
  // Текущий вид
  currentView: AgentChatView;
  activeThreadId: string | null;

  // Основной чат — сообщения
  mainMessages: AgentMessage[];

  // Треды по объектам
  threads: PropertyThread[];

  // Фильтры
  dayFilter: string;
  selectedFilterIds: string[];
  availableFilters: AgentChatFilter[];

  // Настройки
  isOnlineMode: boolean;

  // UI состояние
  isLoading: boolean;
  isSending: boolean;
}

// Метки для карточки (передаются из переводов)
export interface AgentPropertyCardLabels {
  perMonth: string;
  rooms: string;
  area: string;
  floor: string;
  verified: string;
  new: string;
}

export interface AgentMediaGalleryLabels {
  morePhotos: string;
  allPhotos: string;
  photo: string;
  of: string;
  close: string;
}

export interface AgentActionLabels {
  like: string;
  dislike: string;
  report: string;
  reply: string;
}

export interface AgentNoteFormLabels {
  title: string;
  placeholder: string;
  save: string;
  cancel: string;
  saved: string;
}

export interface AgentContactFormLabels {
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  call: string;
  write: string;
  send: string;
}

export interface AgentChatLabels {
  title: string;
  subtitle: string;
  backToMain: string;
  propertyThreads: string;
  noThreads: string;
  mainChat: string;
  threadTitle: string;
  filters: Record<string, string>;
  settings: Record<string, string>;
  actions: AgentActionLabels;
  quickActions: Record<string, string>;
  noteForm: AgentNoteFormLabels;
  contactForm: AgentContactFormLabels;
  mediaGallery: AgentMediaGalleryLabels;
  messages: Record<string, string>;
  empty: Record<string, string>;
  findMe: string;
  objects: string;
  newObjects: string;
  propertyCard: AgentPropertyCardLabels;
}
