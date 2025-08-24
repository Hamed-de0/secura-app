// Minimal mock data (replace with real fetch later)
export const SCENARIOS = [
  { id: 26, title: 'Credential stuffing on login', baseline: { likelihood: 2, impacts: { C:3, I:2, A:1, L:1, R:2 } } },
  { id: 44, title: 'Lack of responsibilities for information security', baseline: { likelihood: 2, impacts: { C:1, I:2, A:1, L:2, R:1 } } },
  { id: 72, title: 'Malware distribution via uncontrolled downloads', baseline: { likelihood: 3, impacts: { C:3, I:3, A:2, L:2, R:2 } } },
];

export const SCOPES = [
  { id: 17, type: 'asset', label: 'Alpha TextLab Dev', tags: ['internet'], dataClass: 'PII-High' },
  { id: 18, type: 'asset', label: 'Payroll DB', tags: ['db'], dataClass: 'PII-High' },
  { id: 19, type: 'asset', label: 'Intranet App', tags: [], dataClass: 'Internal' },
  { id: 8,  type: 'asset_type', label: 'Web Application', tags: ['internet'] },
  { id: 9,  type: 'asset_type', label: 'Database', tags: ['db'] },
  { id: 4,  type: 'group', label: 'Customer-Facing Services' },
  { id: 2,  type: 'entity', label: 'EU GmbH' },
  { id: 1,  type: 'provider', label: 'Okta IdP' },
];

export const OWNERS = [
  { id: 101, name: 'Alice' },
  { id: 102, name: 'Bob' },
  { id: 103, name: 'Security Team' },
];
