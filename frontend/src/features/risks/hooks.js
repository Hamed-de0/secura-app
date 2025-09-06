import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import risksMock from '../../mock/risks.json';

export function useRisksAtScope(/* scope, versions */) {
  // For now, scope/versions are ignored in mock mode.
  return useMemo(() => {
    //if (!MOCK_MODE) return { data: [], isLoading: false };
    return { data: risksMock.risks || [], isLoading: false };
  }, []);
}

export function useRiskAppetite() {
  return useMemo(() => {
    //if (!MOCK_MODE) return { data: { target_level: 2 }, isLoading: false };
    return { data: risksMock.appetite || { target_level: 2 }, isLoading: false };
  }, []);
}
