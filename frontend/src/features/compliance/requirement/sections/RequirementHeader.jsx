import * as React from "react";
import { Stack, Typography, Chip, Tooltip, AvatarGroup, Avatar, Link } from "@mui/material";

const STATUS_COLOR = { met:"#2e7d32", partial:"#ed6c02", gap:"#d32f2f", unknown:"#9e9e9e" };

export default function RequirementHeader({ header, owners, statusSummary, scopeType, scopeId, onAssignOwner, onOpenExplorer }) {
  const total = (statusSummary?.met||0)+(statusSummary?.partial||0)+(statusSummary?.gap||0)+(statusSummary?.unknown||0);
  const dominant = ["met","partial","gap","unknown"].reduce((a,k)=> (statusSummary?.[k]||0)>(statusSummary?.[a]||0)?k:a, "unknown");

  return (
    <Stack spacing={0.5}>
      {header?.breadcrumbs?.length > 0 && (
        <Typography variant="overline" color="text.secondary">
          {header.breadcrumbs.join(" › ")}
        </Typography>
      )}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="h5">{header?.code} — {header?.title}</Typography>
        <Chip size="small" label={`${dominant.toUpperCase()} • ${total} ctx`} sx={{ bgcolor: STATUS_COLOR[dominant], color:"#fff" }} />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Scope: {scopeType ? `${scopeType}#${scopeId ?? "—"}` : "All scopes"}
        </Typography>
        <Link component="button" onClick={onOpenExplorer}>Open in Explorer</Link>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="overline" color="text.secondary">Owners</Typography>
        <AvatarGroup max={6} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 12 } }}>
          {(owners || []).map((o, idx) => (
            <Avatar key={`${o.scope_type}-${o.scope_id}-${o.user_id}-${idx}`} alt={o.name || `#${o.user_id}`}>
              {(o.name || String(o.user_id)).slice(0,2).toUpperCase()}
            </Avatar>
          ))}
        </AvatarGroup>
        <Link component="button" onClick={onAssignOwner}>Assign</Link>
      </Stack>
    </Stack>
  );
}
