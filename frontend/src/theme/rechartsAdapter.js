// src/theme/rechartsAdapter.js
// Returns a small palette for charts, derived from MUI theme.
export function makeChartColors(theme) {
  const t = theme;
  return {
    axisColor:   t.palette.text.secondary,
    gridColor:   t.palette.mode === 'dark' ? '#2a3140' : '#E5E7EB',
    riskHigh:    t.palette.graph?.riskHigh    || t.palette.error.main,
    riskMed:     t.palette.graph?.riskMed     || t.palette.warning.main,
    riskLow:     t.palette.graph?.riskLow     || t.palette.success.main,
    neutral:     t.palette.graph?.neutral     || t.palette.text.disabled,
    ok:          t.palette.graph?.ok          || t.palette.success.main,
    warn:        t.palette.graph?.warn        || t.palette.warning.main,
  };
}
