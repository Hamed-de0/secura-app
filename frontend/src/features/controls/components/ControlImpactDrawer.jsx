import React from 'react';
import { Drawer, Box, Typography, Stack, Chip, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import useControlImpact from '../useControlImpact';
import { getSourceChipProps, getAssuranceChipProps } from '../../../theme/chips';

export default function ControlImpactDrawer({ open, onClose, control }) {
  const theme = useTheme();
  const impact = useControlImpact(control?.control_id);

  if (!open || !control) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx:{ width: 520 } }}>
      <Box sx={{ p: 2, pt:10 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          {control.code || `Control #${control.control_id}`} — {control.title || ''}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {control.source && <Chip size="small" label={control.source} {...getSourceChipProps(control.source, theme)} />}
          {control.assurance_status && <Chip size="small" label={control.assurance_status} {...getAssuranceChipProps(control.assurance_status, theme)} />}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Impacted requirements (by selected version)</Typography>

        {impact.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            This control doesn’t contribute to any selected version (in mock data).
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {impact.map(block => (
              <Box key={block.version_id} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{block.code}</Typography>
                  <Button size="small" component={RouterLink} to={`/compliance/versions/${block.version_id}`}>
                    Open in Compliance
                  </Button>
                </Stack>
                <Stack spacing={0.75}>
                  {block.items.map(it => (
                    <Box key={it.requirement_id} sx={{ display:'flex', alignItems:'baseline', gap: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 96 }}>{it.code}</Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>{it.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        contrib {Math.round((it.contribution || 0) * 100)}%
                      </Typography>
                      <Chip size="small" label={it.source} {...getSourceChipProps(it.source, theme)} />
                      <Chip size="small" label={it.assurance_status} {...getAssuranceChipProps(it.assurance_status, theme)} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
