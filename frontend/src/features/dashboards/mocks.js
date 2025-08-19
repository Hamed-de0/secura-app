// Time-series + categorical mocks for the landing dashboard (no backend).
export const now = new Date();

// Helper: generate N weekly points with gentle variance
function series(base, n = 12, jitter = 6) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const v = Math.max(0, Math.min(100, Math.round(base + (Math.random() - 0.5) * jitter)));
    out.push({ date: d.toISOString().slice(0, 10), value: v });
  }
  return out;
}

// Charts
export const effectivenessTrend = {
  pass: series(76, 16, 10),
  fail: series(14, 16, 8),
  na: series(10, 16, 5),
};

export const riskBurndown = {
  high: series(6, 16, 3),
  medium: series(5, 16, 3),
  low: series(7, 16, 3),
};

// Bar: coverage by framework (illustrative)
export const coverageByFramework = [
  { name: 'ISO 27001', percent: 72 },
  { name: 'SOC 2', percent: 66 },
  { name: 'PCI', percent: 58 },
  { name: 'NIST CSF', percent: 61 },
];

// Heatmap: domain x status (toy values)
export const coverageMatrix = {
  columns: ['A.5', 'A.8', 'A.12', 'A.14', 'A.16'],
  rows: ['Covered', 'Partial', 'Missing'],
  // row-major values 0-100 for color intensity
  values: [
    [88, 76, 64, 70, 81],  // Covered
    [8,  16, 22, 18, 14],  // Partial
    [4,  8,  14, 12, 5],   // Missing
  ],
};
