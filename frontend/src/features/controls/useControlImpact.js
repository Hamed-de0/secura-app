import { useMemo, useContext } from 'react';
import coverageMock from '../../mock/coverage.json';
import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';

/**
 * Build a per-version list of requirements impacted by the given control_id.
 * Returns: [{ version_id, code, items: [{ requirement_id, code, title, contribution, source, assurance_status }] }]
 */
export default function useControlImpact(controlId) {
  const { versions } = useContext(ScopeContext);

  return useMemo(() => {
    if (!controlId || !Array.isArray(versions) || versions.length === 0) return [];

    const out = [];
    for (const vId of versions) {
      const v = coverageMock.versions[String(vId)];
      if (!v?.requirements) continue;

      const items = [];
      for (const r of v.requirements) {
        const hits = (r.hits || []).filter(h => h.control_id === controlId);
        if (hits.length) {
          // If multiple hits exist, sum contribution and show the 'best' status/source (first is fine for mock).
          const contribution = hits.reduce((acc, h) => acc + (h.contribution || 0), 0);
          const { source, assurance_status } = hits[0];
          items.push({
            requirement_id: r.requirement_id,
            code: r.code,
            title: r.title,
            contribution,
            source,
            assurance_status,
          });
        }
      }

      if (items.length) {
        out.push({ version_id: vId, code: `v${vId}`, items });
      }
    }
    return out;
  }, [controlId, versions]);
}
