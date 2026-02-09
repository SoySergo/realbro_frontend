'use client';

import { useState, useCallback } from 'react';

// Тип поискового запроса для демо-сайдбара
export type DemoQuery = {
  id: string;
  title: string;
  resultsCount: number;
  isNew?: boolean;
};

// Хук локального состояния для одного экземпляра демо-сайдбара
export function useDemoSidebar(initialQueries?: DemoQuery[]) {
  const defaultQueries: DemoQuery[] = initialQueries || [
    { id: '1', title: 'Barcelona Centro', resultsCount: 1247 },
    { id: '2', title: 'Eixample', resultsCount: 892, isNew: true },
    { id: '3', title: 'Gràcia', resultsCount: 456 },
  ];

  const [isExpanded, setIsExpanded] = useState(true);
  const [queries, setQueries] = useState<DemoQuery[]>(defaultQueries);
  const [activeQueryId, setActiveQueryId] = useState<string>(
    defaultQueries[0]?.id || '1'
  );

  const addQuery = useCallback(() => {
    const newId = `q_${Date.now()}`;
    const num = queries.length + 1;
    setQueries((prev) => [
      ...prev,
      {
        id: newId,
        title: `Search ${num}`,
        resultsCount: Math.floor(Math.random() * 2000) + 100,
      },
    ]);
    setActiveQueryId(newId);
  }, [queries.length]);

  const removeQuery = useCallback(
    (id: string) => {
      setQueries((prev) => {
        const filtered = prev.filter((q) => q.id !== id);
        if (id === activeQueryId && filtered.length > 0) {
          setActiveQueryId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeQueryId]
  );

  return {
    isExpanded,
    setIsExpanded,
    queries,
    activeQueryId,
    setActiveQueryId,
    addQuery,
    removeQuery,
  };
}
