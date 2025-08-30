// src/features/compliance/hooks.js
import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import coverageMock from '../../mock/coverage.json';

// (Optional use only if you want to keep mock mode alive in some places)
export function useVersionRequirements(versionId) {
  return useMemo(() => {
    if (!MOCK_MODE || !versionId) return { data: [], isLoading: false };
    const v = coverageMock.versions[String(versionId)];
    if (!v) return { data: [], isLoading: false };
    const rows = (v.requirements || []).map(r => ({
      requirement_id: r.requirement_id,
      code: r.code,
      title: r.title,
      score: r.score,
      hits_count: (r.hits || []).length,
      mapped_but_not_effective_count: (r.mapped_but_not_effective || []).length,
      status: r.status || 'unknown',
      breadcrumb: r.breadcrumb || '',
    }));
    return { data: rows, isLoading: false };
  }, [versionId]);
}
