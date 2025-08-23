// Normalize list items for the RegisterGrid
export function adaptContextsToRegisterRows(items = []) {
  return items.map((it) => {
    const impacts = it.impacts || {};
    const impactOverall =
      typeof it.impactOverall === 'number'
        ? it.impactOverall
        : Math.max(0, ...Object.values(impacts));

    return {
      id: it.contextId,                           // DataGrid key
      scenario: it.scenarioTitle,
      scope: it.scopeName || it.scopeRef?.label || it.scope || '',
      L: it.likelihood ?? 0,
      I: impactOverall ?? 0,
      initial: it.initial ?? 0,
      residual: it.residual ?? 0,
      owner: it.owner ?? '—',
      status: it.status ?? '—',
      updated: it.updatedAt || '—',
    };
  });
}
