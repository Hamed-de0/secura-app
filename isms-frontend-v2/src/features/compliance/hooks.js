import { useMemo } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import coverageMock from '../../mock/coverage.json';

// Derive “requirements list with mapping counts” from the mock version
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
      mapped_count: (r.hits || []).length + (r.mapped_but_not_effective || []).length
    }));
    return { data: rows, isLoading: false };
  }, [versionId]);
}

// Return a single requirement detail (hits + gaps) from the mock
export function useRequirementDetail(versionId, requirementId) {
  return useMemo(() => {
    if (!MOCK_MODE || !versionId || !requirementId) return { data: null, isLoading: false };
    const v = coverageMock.versions[String(versionId)];
    const r = (v?.requirements || []).find(x => x.requirement_id === Number(requirementId));
    return { data: r || null, isLoading: false };
  }, [versionId, requirementId]);
}
