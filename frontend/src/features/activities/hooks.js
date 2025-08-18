import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import data from '../../mock/activities.json';

export function useActivities(scope, filters) {
  return useMemo(() => {
    if (!MOCK_MODE) return { data: [], isLoading: false };
    const list = data.events || [];
    const sKey = scope ? `${scope.type}:${scope.id}` : null;

    const withinScope = (ev) => {
      if (!sKey) return true;
      // simple startsWith-style match: exact match or same entity for mock
      return ev.scope === sKey;
    };

    const match = (ev) => {
      if (filters?.types?.length && !filters.types.includes(ev.type)) return false;
      if (filters?.q) {
        const needle = filters.q.toLowerCase();
        const blob = JSON.stringify(ev).toLowerCase();
        if (!blob.includes(needle)) return false;
      }
      return true;
    };

    const filtered = list.filter(ev => withinScope(ev) && match(ev))
      .sort((a,b) => new Date(b.ts) - new Date(a.ts));

    return { data: filtered, isLoading: false };
  }, [scope?.type, scope?.id, JSON.stringify(filters || {})]);
}
