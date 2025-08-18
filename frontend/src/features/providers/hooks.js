import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import providersMock from '../../mock/providers.json';

export function useProvidersList() {
  return useMemo(() => {
    if (!MOCK_MODE) return { data: [], isLoading: false };
    const items = (providersMock.services || []).map(s => ({
      id: s.id, name: s.name, provider: s.provider
    }));
    return { data: items, isLoading: false };
  }, []);
}

export function useProviderDetail(serviceId) {
  return useMemo(() => {
    if (!MOCK_MODE || !serviceId) return { data: null, isLoading: false };
    const svc = (providersMock.services || []).find(s => s.id === Number(serviceId)) || null;
    return { data: svc, isLoading: false };
  }, [serviceId]);
}
