import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import RiskHeatmap from '../../riskScenarios/RiskHeatmap.jsx';

export default function RiskHeatmapPanel() {
  return (
    <Card>
      <CardHeader title="Risk heatmap" subheader="Likelihood × Impact" />
      <CardContent>
        <RiskHeatmap />
      </CardContent>
    </Card>
  );
}
