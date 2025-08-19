const NS = 'sv';

function k(scopeKey, name) { return `${NS}::${scopeKey}::${name}`; }

export default {
  list(scopeKey) {
    const raw = localStorage.getItem(k(scopeKey, 'views'));
    try { return JSON.parse(raw || '[]'); } catch { return []; }
  },
  save(scopeKey, { name, snapshot }) {
    const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const views = this.list(scopeKey);
    views.push({ id, name, snapshot, ts: Date.now() });
    localStorage.setItem(k(scopeKey, 'views'), JSON.stringify(views));
    return id;
  },
  update(scopeKey, id, patch) {
    const views = this.list(scopeKey);
    const idx = views.findIndex(v => v.id === id);
    if (idx === -1) return;
    views[idx] = { ...views[idx], ...patch, ts: views[idx].ts ?? Date.now() };
    localStorage.setItem(k(scopeKey, 'views'), JSON.stringify(views));
  },
  delete(scopeKey, id) {
    const views = this.list(scopeKey).filter(v => v.id !== id);
    localStorage.setItem(k(scopeKey, 'views'), JSON.stringify(views));
    const def = this.getDefaultId(scopeKey);
    if (def === id) this.setDefaultId(scopeKey, null);
  },
  getDefaultId(scopeKey) {
    return localStorage.getItem(k(scopeKey, 'default')) || null;
  },
  setDefaultId(scopeKey, idOrNull) {
    if (idOrNull) localStorage.setItem(k(scopeKey, 'default'), idOrNull);
    else localStorage.removeItem(k(scopeKey, 'default'));
  },
  get(scopeKey, id) {
    return this.list(scopeKey).find(v => v.id === id) || null;
  },
};
