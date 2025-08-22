import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import GaugeSemi from '../charts/GaugeSemi';

function LegendDot({ color, label, val }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width:10, height:10, bgcolor: color, borderRadius:'50%' }} />
      <Typography variant="caption">{label}</Typography>
      <Typography variant="caption" color="text.secondary">{val}</Typography>
    </Stack>
  );
}

export default function ReviewSLACard({ data }) {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2">Review SLA</Typography>
        <GaugeSemi value={data?.scorePct} max={100} bar={theme.palette.success.main}
                   track={theme.palette.mode==='dark'?'#23324d':'#e4e9f4'} />
        <Stack direction="row" justifyContent="space-around" sx={{ mt: -1 }}>
          <LegendDot color={theme.palette.success.main} label="On Track" val={data?.onTrack} />
          <LegendDot color={theme.palette.warning.main} label="Due"      val={data?.dueSoon} />
          <LegendDot color={theme.palette.error.main}   label="Overdue"  val={data?.overdue} />
        </Stack>
      </CardContent>
    </Card>
  );
}
