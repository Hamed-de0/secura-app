// ky client
import { getJSON, buildSearchParams } from '../httpClient';

async function tryPaths(paths, searchParams) {
  let lastErr;
  for (const p of paths) {
    try {
      // trailing slash required by your client
      const url = p.endsWith('/') ? p : `${p}/`;
      return await getJSON(url, { searchParams });
    } catch (e) {
      lastErr = e;
      // try next path
    }
  }
  throw lastErr;
}

/**
 * Search obligation atoms.
 * Tries common endpoint shapes; adjust the array if your backend differs.
 * Supports server-side search via `?search=...` (or falls back to returning all).
 */
export async function searchObligationAtoms(rId=0, query = '', limit = 25) {
    const candidates = [
        `obligations/framework_requirements/${rId}`,
        // 'obligation_atoms',
        // 'compliance/obligation-atoms',
        // 'compliance/atoms',
    ];

    // 1) Try with ?q= (matches your httpClient’s helpers)
    const p1 = buildSearchParams({ q: query || undefined, limit });
    try {
        const d1 = await tryPaths(candidates, p1);
        return normalize(d1);
    } catch (_) {}

    // 2) Fallback: ?search= (common alt key)
    const p2 = buildSearchParams({ limit });
    if (query) p2.set('search', query);
    const d2 = await tryPaths(candidates, p2);
    return normalize(d2);
    }

    function normalize(data) {
    const arr = Array.isArray(data) ? data : data?.results || [];
    return arr.map(o => ({
        id: o.id ?? o.atom_id ?? o.pk,
        code: o.code ?? o.reference_code ?? null,
        title: o.title ?? o.name ?? '',
        description: o.description ?? '',
    }));
}

// Requirement-scoped atoms: GET /obligations/framework_requirements/:id/
export async function getRequirementObligations(frameworkRequirementId, query = '') {
  const url = `obligations/framework_requirements/${frameworkRequirementId}/`; // trailing slash
  const data = await getJSON(url); // backend returns an array

  // normalize + client-side filter
  const items = (Array.isArray(data) ? data : []).map(o => ({
    id: o.id,
    code: o.atom_key,                 // e.g., "A1"
    title: o.obligation_text,         // main sentence
    description: [
      o.role ? `role: ${o.role}` : null,
      o.condition ? `if: ${o.condition}` : null,
      o.outcome ? `outcome: ${o.outcome}` : null,
      o.citation || null,
    ].filter(Boolean).join(' • '),
    _raw: o,
  }));

  if (!query) return items;

  const q = query.toLowerCase();
  return items.filter(x =>
    (x.code && x.code.toLowerCase().includes(q)) ||
    (x.title && x.title.toLowerCase().includes(q)) ||
    (x.description && x.description.toLowerCase().includes(q))
  );
}
