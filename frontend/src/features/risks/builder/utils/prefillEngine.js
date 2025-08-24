// Very light mock prefill (replace with server prefill later)
let autoId = 1;

export function runPrefillForPairs(pairs) {
  return pairs.map(({ scenario, scope }) => {
    const baseL = scenario.baseline?.likelihood ?? 2;
    const baseImp = { C:3, I:2, A:2, L:2, R:2, ...(scenario.baseline?.impacts || {}) };

    // modifiers based on scope hints
    let L = baseL;
    const imp = { ...baseImp };
    const rationale = [];

    const isInternet = scope.tags?.includes('internet');
    const isDB       = scope.tags?.includes('db') || /db/i.test(scope.label);
    const isPIIHigh  = scope.dataClass === 'PII-High';

    if (isInternet) { L = Math.min(5, L + 1); rationale.push('+1 L: Internet-facing'); }
    if (isDB)       { imp.C = Math.max(imp.C, 4); rationale.push('C→4: Data store'); }
    if (isPIIHigh)  { imp.C = Math.max(imp.C, 4); rationale.push('C→4: PII High'); }

    const maxImpact = Math.max(imp.C, imp.I, imp.A, imp.L, imp.R);
    const residual = L * maxImpact;
    let rag = 'Green';
    if (residual > 30) rag = 'Red';
    else if (residual > 20) rag = 'Amber';

    return {
      id: autoId++,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scopeRef: { type: scope.type, id: scope.id },
      scopeLabel: `${scope.type}:${scope.label}`,
      likelihood: L,
      impacts: imp,
      residual,
      rag,
      overAppetite: residual > 20,
      rationale,
      exists: false,           // flip to true if your dedupe check finds an existing context
      ownerId: null,
      nextReview: null,
    };
  });
}
