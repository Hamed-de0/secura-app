const BASE_URL = 'http://localhost:8000';

export async function fetchAssets() {
  const response = await fetch(`${BASE_URL}/assets`);
  return await response.json();
}