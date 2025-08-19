import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import GridTable from '../../../components/GridTable.jsx';

export default function DataGridCard({ title, rows, columns }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
        <GridTable rows={rows} columns={columns} />
      </CardContent>
    </Card>
  );
}
