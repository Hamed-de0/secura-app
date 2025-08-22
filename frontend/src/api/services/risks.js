// src/api/services/risks.js
import { getJSON, buildSearchParams } from '../../api/httpClient';

/** Fetch “effective” risks for an asset. Keeps trailing slash. */
export async function fetchAssetEffectiveRisks(assetId, { days = 90 } = {}) {
  const url = `risks/assets/${assetId}/risks/`;
  const searchParams = buildSearchParams({ view: 'effective', days });
  const data = await getJSON(url, { searchParams });
  return Array.isArray(data) ? data : [];
}
