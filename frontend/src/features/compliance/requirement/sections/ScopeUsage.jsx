import * as React from "react";
import { Stack, Chip, Tooltip } from "@mui/material";

export default function ScopeUsage({ usage, active, onPick }) {
  const list = Array.isArray(usage) ? usage : [];
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {list.map(u => {
        const isActive = active?.scopeType === u.scope_type;
        return (
          <Tooltip key={u.scope_type} title={`Used in ${u.count} ${u.scope_type} context(s)`}>
            <Chip
              size="small"
              label={`${u.scope_type} • ${u.count}`}
              color={isActive ? "primary" : "default"}
              onClick={() => onPick(u.scope_type, active?.scopeId ?? null)}
            />
          </Tooltip>
        );
      })}
      {/* Clear filter */}
      <Chip size="small" label="All scopes" variant="outlined" onClick={() => onPick(null, null)} />
    </Stack>
  );
}
