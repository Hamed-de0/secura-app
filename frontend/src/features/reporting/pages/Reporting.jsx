import * as React from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress, Stack, Chip } from '@mui/material';

function Stat({ title, value, hint }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h4" sx={{ my: 1 }}>{value}</Typography>
        {hint && <Typography variant="body2" color="text.secondary">{hint}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function Reporting() {
  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><Stat title="Open risks" value="14" hint="5 high, 4 medium, 5 low" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Evidence due (30d)" value="9" hint="3 overdue" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Exceptions pending" value="6" hint="2 high impact" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Attestations running" value="3" hint="62% average completion" /></Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Control effectiveness (mock)</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip label="Pass 76%" color="success" variant="outlined" />
                <Chip label="Fail 14%" color="error" variant="outlined" />
                <Chip label="N/A 10%" variant="outlined" />
              </Stack>
              <LinearProgress sx={{ mt: 2 }} variant="determinate" value={76}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Audit readiness (mock)</Typography>
              <Typography variant="body2" color="text.secondary">Requirements satisfied: 132 / 180</Typography>
              <LinearProgress sx={{ mt: 2 }} variant="determinate" value={73}/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
