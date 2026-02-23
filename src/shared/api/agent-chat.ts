'use client';

import type { AgentMessage, PropertyThread, AgentChatFilter, NearbyPlace } from '@/entities/agent-chat';
import { generateMockProperty } from './chat';

// === API функции ===

export async function getAgentChatData(): Promise<{
  messages: AgentMessage[];
  threads: PropertyThread[];
  filters: AgentChatFilter[];
}> {
  // Мок данные — имитация запроса к серверу
  await new Promise((r) => setTimeout(r, 300));
  
  const threads = generateMockThreads();
  const messages = generateMockMainMessages(threads);
  const filters = generateMockFilters();
  
  return { messages, threads, filters };
}

export async function sendAgentMessage(
  content: string, 
  threadId?: string
): Promise<AgentMessage> {
  // Мок ответ агента
  await new Promise((r) => setTimeout(r, 800));
  
  return {
    id: `msg_agent_${Date.now()}`,
    threadId,
    sender: 'agent',
    type: 'text',
    content: threadId 
      ? 'I can help you with this property. What would you like to know?'
      : 'I\'m searching for properties matching your criteria. Here are some options I found.',
    createdAt: new Date().toISOString(),
  };
}

// === Генераторы моков ===

function generateMockThreads(): PropertyThread[] {
  const threads: PropertyThread[] = [];
  
  for (let i = 0; i < 8; i++) {
    const property = generateMockProperty(i);
    const threadId = `thread_${i}`;
    
    threads.push({
      id: threadId,
      property,
      messages: generateThreadMessages(threadId, property.title),
      lastActivity: new Date(Date.now() - i * 3600000 * 2).toISOString(),
      reaction: i === 0 ? 'like' : i === 3 ? 'dislike' : undefined,
      isFavorite: i === 0 || i === 2,
      note: i === 1 ? 'Nice area, check parking availability' : undefined,
      unreadCount: i < 2 ? 1 : 0,
    });
  }
  
  return threads;
}

function generateThreadMessages(threadId: string, propertyTitle: string): AgentMessage[] {
  const now = Date.now();
  return [
    {
      id: `${threadId}_msg_1`,
      threadId,
      sender: 'agent',
      type: 'text',
      content: `I found this property for you: ${propertyTitle}. It matches your search criteria well.`,
      createdAt: new Date(now - 7200000).toISOString(),
    },
    {
      id: `${threadId}_msg_2`,
      threadId,
      sender: 'user',
      type: 'text',
      content: 'Looks interesting! Tell me more about the area.',
      createdAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: `${threadId}_msg_3`,
      threadId,
      sender: 'agent',
      type: 'text',
      content: 'This area has excellent transport connections, several supermarkets within walking distance, and a park nearby.',
      createdAt: new Date(now - 1800000).toISOString(),
    },
  ];
}

function generateMockMainMessages(threads: PropertyThread[]): AgentMessage[] {
  const messages: AgentMessage[] = [];
  const now = Date.now();
  
  // Системное сообщение
  messages.push({
    id: 'msg_system_1',
    sender: 'agent',
    type: 'system',
    content: 'AI Agent started monitoring your search filters',
    createdAt: new Date(now - 86400000).toISOString(),
  });

  // Статус сообщение
  messages.push({
    id: 'msg_status_1',
    sender: 'agent',
    type: 'status',
    content: 'Searching for properties matching "Barcelona center, 2+ rooms, up to 1500€/mo"',
    createdAt: new Date(now - 72000000).toISOString(),
  });

  // Объекты из тредов как property сообщения в основном чате
  threads.forEach((thread, i) => {
    messages.push({
      id: `msg_prop_${i}`,
      sender: 'agent',
      type: 'property',
      content: '',
      property: thread.property,
      metadata: {
        filterName: ['Barcelona center', 'Eixample area', 'Gothic Quarter'][i % 3],
        filterId: `filter_${i % 3}`,
      },
      createdAt: new Date(now - (threads.length - i) * 3600000).toISOString(),
      isNew: i < 2,
    });
  });

  // Текстовое сообщение от пользователя
  messages.push({
    id: 'msg_user_1',
    sender: 'user',
    type: 'text',
    content: 'Can you find something closer to the beach?',
    createdAt: new Date(now - 1800000).toISOString(),
  });

  // Ответ агента
  messages.push({
    id: 'msg_agent_reply_1',
    sender: 'agent',
    type: 'text',
    content: 'Sure! I\'ll expand the search to include Barceloneta and Vila Olímpica areas. I\'ll notify you when I find matching properties.',
    createdAt: new Date(now - 900000).toISOString(),
  });

  return messages;
}

function generateMockFilters(): AgentChatFilter[] {
  return [
    { id: 'filter_0', name: 'Barcelona center', count: 12 },
    { id: 'filter_1', name: 'Eixample area', count: 8 },
    { id: 'filter_2', name: 'Gothic Quarter', count: 5 },
  ];
}

export function generateMockNearbyPlaces(): NearbyPlace[] {
  return [
    { id: 'np_1', name: 'Diagonal', type: 'metro', distance: 200, walkMinutes: 3 },
    { id: 'np_2', name: 'Mercadona', type: 'supermarket', distance: 150, walkMinutes: 2 },
    { id: 'np_3', name: 'Parc de Joan Miró', type: 'park', distance: 400, walkMinutes: 5 },
    { id: 'np_4', name: 'Hospital Clínic', type: 'hospital', distance: 800, walkMinutes: 10 },
    { id: 'np_5', name: 'Escola Eixample', type: 'school', distance: 300, walkMinutes: 4 },
    { id: 'np_6', name: 'Bus V15', type: 'bus', distance: 100, walkMinutes: 1 },
  ];
}
