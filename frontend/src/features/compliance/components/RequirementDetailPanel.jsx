import * as React from "react";
import { Box, Stack, Typography, Chip, Divider, LinearProgress } from "@mui/material";
import StatusChip from "../../../components/ui/StatusChip.jsx";

export default function RequirementDetailPanel({ loading, detail }) {
  if (loading) return <LinearProgress />;
  if (!detail) return <Typography variant="body2" color="text.secondary">No details.</Typography>;

  const hits = detail.hits || [];
  const gaps = detail.mapped_but_not_effective || [];

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <StatusChip value={detail.status} exception={detail.exception_applied} />
        <Chip size="small" label={`Score ${Math.round((detail.score ?? 0) * 100)}%`} />
      </Stack>

      <Divider />

      <Typography variant="subtitle2">Effective hits</Typography>
      {hits.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No effective controls at this scope.</Typography>
      ) : (
        <Stack spacing={1}>
          {hits.map((h, i) => (
            <Box key={i} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={`C-${h.control_id}`} />
                {h.assurance_status && <Chip size="small" variant="outlined" label={h.assurance_status} />}
                {h.inheritance_type && <Chip size="small" variant="outlined" label={h.inheritance_type} />}
                <Box sx={{ ml: "auto", fontSize: 12, opacity: 0.8 }}>{Math.round((h.contribution ?? 0) * 100)}%</Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Divider />

      <Typography variant="subtitle2">Mapped but not effective</Typography>
      {gaps.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No gaps.</Typography>
      ) : (
        <Stack spacing={1}>
          {gaps.map((g, i) => (
            <Box key={i} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={`C-${g.control_id}`} />
                <Typography variant="caption" color="text.secondary">not effective in scope</Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
