export function adaptContextsToRegisterRows(items = []) {
  return items.map((it) => {
    const impacts = it.impacts || {};
    const maxImpact = Math.max(0, ...Object.values(impacts));
    return {
      id: it.contextId,
      scenario: it.scenarioTitle,
      scope: it.scopeName || it.scopeRef?.label || it.scopeDisplay || it.scope || '',
      L: it.likelihood ?? 0,
      I: maxImpact,
      initial: it.initial ?? 0,
      residual: it.residual ?? 0,
      owner: it.owner ?? '—',
      status: it.status ?? '—',
      updated: it.lastUpdated || it.updatedAt || '—',
    };
  });
}
