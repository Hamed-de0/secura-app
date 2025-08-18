import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function WeakestRequirementsTable({ versionDetail, limit = 10, loading }) {
  const rows = useMemo(() => {
    const reqs = versionDetail?.requirements ?? [];
    const sorted = [...reqs].sort((a,b) => (a.score ?? 0) - (b.score ?? 0));
    return sorted.slice(0, limit).map(r => ({
      id: r.requirement_id,
      code: r.code,
      title: r.title,
      score: r.score,
      hits: (r.hits ?? []).length,
    }));
  }, [versionDetail, limit]);

  const columns = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'title', headerName: 'Requirement', flex: 1, minWidth: 240 },
    { field: 'score', headerName: 'Score', width: 110, valueFormatter: ({ value }) => `${Math.round((value ?? 0)*100)}%` },
    { field: 'hits', headerName: 'Hits', width: 90 },
  ];

  return (
    <Box sx={{ height: 420, width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Weakest requirements</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableColumnMenu
        pageSizeOptions={[10]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </Box>
  );
}
