import React from 'react';
import { Drawer, Box, Typography, Stack, Chip, Divider, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { getSourceChipProps, getAssuranceChipProps } from '../../../theme/chips';
import controlsMock from '../../../mock/controls.json';

export default function RequirementDrawer({ open, onClose, requirement }) {
  const theme = useTheme();
  if (!open || !requirement) return null;

  const hits = requirement.hits || [];
  const gaps = requirement.mapped_but_not_effective || [];

  const idToCode = React.useMemo(() => {
    const list = controlsMock?.effective_controls || [];
    const m = new Map(list.map(c => [c.control_id, c.code]));
    return m;
  }, []);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 520, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {requirement.code} — {requirement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Score: {Math.round((requirement.score ?? 0) * 100)}%
        </Typography>

        {/* NEW: deep-link to Mapping Manager with this requirement preselected */}
        <Button
          variant="contained"
          size="small"
          component={RouterLink}
          to={`/mapping?req=${encodeURIComponent(requirement.requirement_id)}`}
          sx={{ mb: 2 }}
        >
          Assign controls
        </Button>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Effective hits</Typography>
        {hits.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No effective controls.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {hits.map((h, idx) => (
              <Box key={idx} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={h.source} {...getSourceChipProps(h.source, theme)} />
                  <Chip size="small" label={h.assurance_status} {...getAssuranceChipProps(h.assurance_status, theme)} />
                  <Typography variant="caption" color="text.secondary">
                    {idToCode.get(h.control_id) || `#${h.control_id}`}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 'auto' }}>
                    <RouterLink to={`/controls?q=${encodeURIComponent(idToCode.get(h.control_id) || h.control_id)}`}>
                      Open in Controls
                    </RouterLink>
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  weight_share {(h.weight_share ?? 0).toFixed(2)} · contribution {(h.contribution ?? 0).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Mapped but not effective</Typography>
        {gaps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No gaps.</Typography>
        ) : (
          <Stack spacing={1}>
            {gaps.map((g, idx) => (
              <Box key={idx} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {idToCode.get(g.control_id) || `#${g.control_id}`}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 'auto' }}>
                    <RouterLink to={`/controls?q=${encodeURIComponent(idToCode.get(g.control_id) || g.control_id)}`}>
                      Open in Controls
                    </RouterLink>
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">{g.reason}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
