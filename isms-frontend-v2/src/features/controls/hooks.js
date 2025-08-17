// src/features/controls/hooks.js
import { useQuery } from '@tanstack/react-query';
import http from '../../lib/api/http';
import { qk } from '../../lib/query/keys';
import { scopeParams } from '../../lib/api/params';

export function useEffectiveControls(scope) {
  return useQuery({
    queryKey: qk.effectiveControls(scope),
    queryFn: async () => {
      const { scope_type, scope_id } = scopeParams(scope);
      const { data } = await http.get('/controls/effective-controls', { params: { scope_type, scope_id } });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!scope?.type && scope?.id != null,
  });
}

// Optional debug/accordion
export function useEffectiveControlsVerbose(scope) {
  return useQuery({
    queryKey: qk.effectiveControlsVerbose(scope),
    queryFn: async () => {
      const { scope_type, scope_id } = scopeParams(scope);
      const { data } = await http.get('/controls/effective/verbose', { params: { scope_type, scope_id } });
      return data;
    },
    enabled: !!scope?.type && scope?.id != null,
  });
}
