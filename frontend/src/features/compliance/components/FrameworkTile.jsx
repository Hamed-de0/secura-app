import {
  Box, Grid, Card, CardContent, Typography, Stack, Chip,
  Button, Tooltip, IconButton, LinearProgress, Divider
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
// Icons (all MUI)

const statusChip = (s) => {
  const v = String(s || "").toLowerCase();
  if (v.includes("healthy")) return { label: "Healthy", bg: COLORS.success };
  if (v.includes("attention")) return { label: "Attention", bg: COLORS.warning };
  return { label: String(s || "Unknown"), bg: COLORS.grey };
};
const COLORS = {
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  grey: "#9e9e9e",
  barBg: (t) => t.palette.action.hover,
};

function Bar({ value, threshold = 0.7, title }) {
  const pct = Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
  const tickLeft = `${Math.round(threshold * 100)}%`;
  return (
    <Box sx={{ position: "relative" }}>
      <Tooltip title={title || `${pct}%`}>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
      </Tooltip>
      <Box
        sx={{
          position: "absolute", top: -2, left: tickLeft, width: 2, height: 12,
          bgcolor: (t) => t.palette.divider, borderRadius: 1, transform: "translateX(-1px)"
        }}
      />
    </Box>
  );
}

export default function FrameworkTile({ fx }) {
  const chip = statusChip(fx.status);
  const isDisabled = fx?.enabled === false;
  return (
    <Card
    sx={{
        position: 'relative',
        bgcolor: (t) => isDisabled ? t.palette.action.disabledBackground : undefined,
        opacity: isDisabled ? 0.6 : 1,
      }}>
      <CardContent sx={{ pointerEvents: isDisabled ? 'none' : 'auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{fx.code}</Typography>
              {/* <Chip
                label={chip.label}
                size="small"
                sx={{ bgcolor: chip.bg, color: "#fff", fontWeight: 700 }}
              /> */}
              {isDisabled ? (
                <Chip label="Disabled" size="small"
                  sx={{ bgcolor: (t)=>t.palette.grey[400], color: "#fff", fontWeight: 700 }} />
              ) : (
                <Chip label={chip.label} size="small"
                  sx={{ bgcolor: chip.bg, color: "#fff", fontWeight: 700 }} />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">{fx.name}</Typography>
          </Stack>
          
         <Stack direction="row" spacing={1}>
           <Button
            disabled={isDisabled}
            component={RouterLink}
            to={`/compliance/versions/${fx.version_id}`}
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
          >
            Open Explorer
          </Button>
          <Button
            disabled={isDisabled}
            component={RouterLink}
            to={`/mapping?framework=${encodeURIComponent(fx.code)}`}
            variant="outlined"
            size="small"
            startIcon={<LinkIcon />}
          >
            Manage mappings
          </Button>
        </Stack>
        </Stack>

        <Stack spacing={1.25} sx={{ my: 1 }}>
          <Stack>
            <Typography variant="caption" color="text.secondary">Coverage</Typography>
            <Bar value={fx.coverage} threshold={0.7} />
          </Stack>
          <Stack>
            <Typography variant="caption" color="text.secondary">Evidence freshness</Typography>
            <Bar value={fx.freshness} threshold={0.8} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Requirements: {fx.effReq}/{fx.totalReq} (effective) • Controls: {fx.controlsImpl}/{fx.totalControls} (implemented)
          </Typography>
        </Stack>

        {!!fx.topGaps?.length && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {fx.topGaps.map((g) => (
              <Chip key={g} label={g} size="small" sx={{ bgcolor: (t) => t.palette.action.hover }} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
