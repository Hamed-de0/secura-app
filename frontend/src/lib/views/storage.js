function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function defaultKey(key) { return `${key}::default`; }

export function listSavedViews(key) {
  return read(`views:${key}`);
}

export function saveView(key, { name, snapshot }) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const entry = { id, name, snapshot, createdAt: new Date().toISOString() };
  const all = listSavedViews(key);
  write(`views:${key}`, [entry, ...all]);
  return id;
}

export function deleteView(key, id) {
  const all = listSavedViews(key).filter((v) => v.id !== id);
  write(`views:${key}`, all);
}

export function getDefaultView(key) {
  try {
    const id = localStorage.getItem(defaultKey(key));
    if (!id) return null;
    return listSavedViews(key).find((v) => v.id === id)?.snapshot || null;
  } catch {
    return null;
  }
}

export function setDefaultView(key, idOrNull) {
  if (!idOrNull) return localStorage.removeItem(defaultKey(key));
  try { localStorage.setItem(defaultKey(key), idOrNull); } catch {}
}

export function getDefaultViewId(key) {
  try { return localStorage.getItem(defaultKey(key)); } catch { return null; }
}