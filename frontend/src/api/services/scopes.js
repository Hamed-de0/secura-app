// src/api/services/scopes.js
import { getJSON, buildSearchParams } from '../../api/httpClient';

// Tweak URLs to your backend. Keep trailing slashes.
const ENDPOINTS = {
  asset:       'assets/',
  asset_type:  'asset-types/',
  asset_group: 'asset-groups/',
  asset_tag:   'asset-tags/',
  sites:       'org/sites/',
  entity:      'org/entities/',
  bu:          'org/business-units/',
  services:    'org/services/',
  org_group:   'org/groups/',
};

async function fetchOne(kind, { q = '', limit = 500, offset = 0 } = {}) {
  const url = ENDPOINTS[kind];
  if (!url) return [];
  const searchParams = buildSearchParams({ q, limit, offset });
  const data = await getJSON(url, { searchParams });
  const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  return items.map(x => ({
    id: x.id,
    type: kind,                                   // <- key used by StepSelect tabs
    label: x.label || x.name || x.title || `${kind} #${x.id}`,
    raw: x,
  }));
}

// Fetch all scope catalogs you want available in the builder
export async function fetchScopeCatalog() {
  const kinds = Object.keys(ENDPOINTS);
  const results = await Promise.allSettled(kinds.map(k => fetchOne(k)));
  const merged = [];
  results.forEach((r, i) => { if (r.status === 'fulfilled') merged.push(...r.value); });
  return merged;
}
