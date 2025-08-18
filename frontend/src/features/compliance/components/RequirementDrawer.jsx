import React from 'react';
import { Drawer, Box, Typography, Stack, Chip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getSourceChipProps, getAssuranceChipProps } from '../../../theme/chips';

export default function RequirementDrawer({ open, onClose, requirement }) {
  const theme = useTheme();
  if (!open || !requirement) return null;
  const hits = requirement.hits || [];
  const gaps = requirement.mapped_but_not_effective || [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx:{ width: 420 } }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          {requirement.code} — {requirement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Score: {Math.round((requirement.score ?? 0)*100)}%
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Effective hits</Typography>
        {hits.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No effective controls.</Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {hits.map((h, idx) => (
              <Box key={idx} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={h.source} {...getSourceChipProps(h.source, theme)} />
                  <Chip size="small" label={h.assurance_status} {...getAssuranceChipProps(h.assurance_status, theme)} />
                  <Typography variant="caption" color="text.secondary">control #{h.control_id}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  weight_share {(h.weight_share ?? 0).toFixed(2)} · contribution {(h.contribution ?? 0).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Mapped but not effective</Typography>
        {gaps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">None</Typography>
        ) : (
          <Stack spacing={1}>
            {gaps.map((g, idx) => (
              <Box key={idx} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2">control #{g.control_id}</Typography>
                <Typography variant="caption" color="text.secondary">{g.reason}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
