// components/ui/StatusChip.jsx (optional helper)
import * as React from "react";
import { Chip } from "@mui/material";
export default function StatusChip({ value, exception }) {
  const color = value === "met" ? "success" : value === "partial" ? "warning" : value === "gap" ? "error" : "default";
  return <Chip size="small" color={color} variant={exception ? "outlined" : "filled"} label={exception ? `${value}*` : value} />;
}
