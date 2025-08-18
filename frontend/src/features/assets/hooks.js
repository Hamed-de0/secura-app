import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import data from '../../mock/assets_effective.json';

export function useAssetEffective(scope) {
  return useMemo(() => {
    if (!MOCK_MODE || !scope?.type || scope?.id == null) return { data: null, isLoading: false };
    const key = `${scope.type}:${scope.id}`;
    const entry = data[key] || null;
    return { data: entry, isLoading: false };
  }, [scope?.type, scope?.id]);
}
