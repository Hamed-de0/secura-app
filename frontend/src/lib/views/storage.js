import LocalStorageProvider from './providers/LocalStorageProvider';
// import HttpProvider from './providers/HttpProvider';

function selectProvider() {
  // Flip here later to HttpProvider when backend is ready
  return LocalStorageProvider;
}

export function listSavedViews(scopeKey) {
  return selectProvider().list(scopeKey);
}

export function saveView(scopeKey, { name, snapshot }) {
  return selectProvider().save(scopeKey, { name, snapshot });
}

export function updateView(scopeKey, id, patch) {
  return selectProvider().update(scopeKey, id, patch);
}

export function deleteViewById(scopeKey, id) {
  return selectProvider().delete(scopeKey, id);
}

export function getDefaultViewId(scopeKey) {
  return selectProvider().getDefaultId(scopeKey);
}

export function setDefaultView(scopeKey, idOrNull) {
  return selectProvider().setDefaultId(scopeKey, idOrNull);
}

export function loadViewById(scopeKey, id) {
  return selectProvider().get(scopeKey, id);
}

// Back-compat helper used by useGridView
export function getDefaultView(scopeKey) {
  const id = getDefaultViewId(scopeKey);
  if (!id) return null;
  const entry = loadViewById(scopeKey, id);
  return entry ? entry.snapshot : null;
}
