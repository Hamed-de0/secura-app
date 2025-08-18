// src/lib/query/keys.js
export const qk = {
  coverageSummary: (scope, versionIds) => [
    'coverage-summary',
    scope?.type, scope?.id,
    ...(Array.isArray(versionIds) ? [...versionIds].sort((a,b)=>a-b) : [])
  ],
  coverageVersion: (versionId, scope) => ['coverage-version', versionId, scope?.type, scope?.id],
  requirementEffective: (requirementId, scope) => ['requirement-effective', requirementId, scope?.type, scope?.id],
  effectiveControls: (scope) => ['effective-controls', scope?.type, scope?.id],
  effectiveControlsVerbose: (scope) => ['effective-controls-verbose', scope?.type, scope?.id],
};
