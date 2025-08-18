// src/theme/chips.js
// Map domain states to Chip props so the whole app stays consistent.
export function getSourceChipProps(source, theme) {
  switch (source) {
    case 'direct':    return { color: 'primary', variant: 'filled' };
    case 'provider':  return { color: 'info',    variant: 'filled' };
    case 'baseline':  return { color: 'default', variant: 'outlined',
      sx: { borderColor: theme.palette.divider } };
    default:          return { color: 'default', variant: 'outlined' };
  }
}

export function getAssuranceChipProps(status, theme) {
  switch ((status || '').toLowerCase()) {
    case 'planning':     return { color: 'warning', variant: 'outlined' };
    case 'implemented':  return { color: 'info',    variant: 'filled'   };
    case 'verified':     return { color: 'success', variant: 'outlined' };
    case 'evidenced':    return { color: 'success', variant: 'filled'   };
    default:             return { color: 'default', variant: 'outlined' };
  }
}
