import { getJSON, buildSearchParams } from '../../api/httpClient';

export async function searchPersons({ q = '', limit = 20, offset = 0, enabled = true } = {}) {
  const url = 'persons/'; // trailing slash
  const searchParams = buildSearchParams({ q, limit, offset, enabled });
  const data = await getJSON(url, { searchParams });

  const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  return {
    total: Number(data?.total ?? items.length),
    items: items.map(p => ({
      id: p.id,
      displayName: p.display_name || [p.first_name, p.last_name].filter(Boolean).join(' '),
      initials: p.initials || deriveInitials(p.first_name, p.last_name),
      email: p.email || '',
      department: p.department || '',
      avatarUrl: p.avatar_url || '',
      enabled: p.enabled !== false,
    })),
  };
}

function deriveInitials(fn, ln) {
  const a = String(fn||'').trim()[0] || '';
  const b = String(ln||'').trim()[0] || '';
  return (a + b).toUpperCase();
}
