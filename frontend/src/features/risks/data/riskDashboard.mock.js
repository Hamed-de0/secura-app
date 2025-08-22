// Static demo data used across the dashboard
export const MOCK = {
  totals: { scenarios: 226, contexts: 157, scopes: 38, assets: 24 },

  severity: { Low: 150, Medium: 0, High: 7, Critical: 0 },

  evidence: { ok: 86, warn: 12, overdue: 6 },

  review: { onTrack: 19, dueSoon: 3, overdue: 2, scorePct: 76 },

  // Heatmap matrix: rows = impact 5→1, columns = likelihood 1→5
  heatmap: [
    [3, 6, 8, 12, 19], // impact = 5
    [2, 4, 6, 9, 13],
    [1, 2, 4, 4, 16],
    [0, 1, 2, 3, 6],
    [0, 1, 2, 3, 4],   // impact = 1
  ],

  trend: [42, 44, 46, 45, 47, 49, 48, 50, 51, 49, 52, 54],

  rows: [
    { id: 1, scenario: 'System failure due to configuration change issues', scope: 'Asset',      L: 2, I: 4, initial: 60, residual: 20, owner: 'Unassigned', status: 'Open',        updated: 'today' },
    { id: 2, scenario: 'Remote espionage exploiting password tables',       scope: 'Asset Type', L: 1, I: 5, initial: 50, residual: 25, owner: 'Security',   status: 'Open',        updated: '2 days' },
    { id: 3, scenario: 'Drive-by exploits via third-party widgets',         scope: 'Group',      L: 3, I: 3, initial: 45, residual: 18, owner: 'AppSec',     status: 'Mitigating',  updated: '5 days' },
    { id: 4, scenario: 'Insider data exfiltration',                         scope: 'Asset',      L: 2, I: 5, initial: 70, residual: 30, owner: 'CISO',       status: 'Open',        updated: '8 days' },
  ],
};
