// src/features/coverage/hooks.js
import { useQuery } from '@tanstack/react-query';
import http from '../../lib/api/http';
import { qk } from '../../lib/query/keys';
import { scopeParams, versionIdsParam } from '../../lib/api/params';

export function useCoverageSummary(scope, versionIds = []) {
  return useQuery({
    queryKey: qk.coverageSummary(scope, versionIds),
    queryFn: async () => {
      const { scope_type, scope_id } = scopeParams(scope);
      const version_ids = versionIdsParam(versionIds);
      const { data } = await http.get('/coverage/summary', { params: { scope_type, scope_id, version_ids } });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!scope?.type && scope?.id != null && (versionIds?.length > 0),
  });
}

export function useCoverageVersion(versionId, scope) {
  return useQuery({
    queryKey: qk.coverageVersion(versionId, scope),
    queryFn: async () => {
      const { scope_type, scope_id } = scopeParams(scope);
      const { data } = await http.get(`/coverage/framework_versions/${versionId}/effective`, { params: { scope_type, scope_id } });
      return data;
    },
    enabled: !!versionId && !!scope?.type && scope?.id != null,
  });
}

export function useRequirementEffective(requirementId, scope) {
  return useQuery({
    queryKey: qk.requirementEffective(requirementId, scope),
    queryFn: async () => {
      const { scope_type, scope_id } = scopeParams(scope);
      const { data } = await http.get(`/coverage/requirements/${requirementId}/effective`, { params: { scope_type, scope_id } });
      return data;
    },
    enabled: !!requirementId && !!scope?.type && scope?.id != null,
  });
}
