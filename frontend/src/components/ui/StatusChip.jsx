// components/ui/StatusChip.jsx (optional helper)
import * as React from "react";
import { Chip } from "@mui/material";

const MAP = {
  met:     { label: 'Met',     color: 'success' },
  partial: { label: 'Partial', color: 'warning' },
  gap:     { label: 'Gap',     color: 'error'   },
  unknown: { label: 'Unknown', color: 'default' },
};

export default function StatusChip({ value, ...rest }) {
  const k = String(value || 'unknown').toLowerCase();
  const m = MAP[k] || MAP.unknown;
  return <Chip size="small" label={m.label} color={m.color} {...rest} />;
}

// export default function StatusChip({ value, exception }) {
//   const color = value === "met" ? "success" : value === "partial" ? "warning" : value === "gap" ? "error" : "default";
//   return <Chip size="small" color={color} variant={exception ? "outlined" : "filled"} label={exception ? `${value}*` : value} />;
// }
