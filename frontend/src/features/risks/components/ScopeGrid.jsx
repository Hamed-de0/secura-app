import * as React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function ScopeGrid({ data }) {
  const theme = useTheme();

  const gridScopeColumns = React.useMemo(() => ([
      { field: 'scope', headerName: 'Scope', flex: 0.5, minWidth: 40 },
      { field: 'count',    headerName: 'Risks', flex: 0.25,align:'center', headerAlign:'center' },
      { field: 'controls',        headerName: 'Controls', flex: 0.25, align:'center', headerAlign:'center' },
    ]));
    
    
  return (
    <Box
        sx={{
        gridColumn: { xs: '1 / -1', md: 'span 2' },  // take 2 columns on md+, full width on mobile
        width: '100%',
        height: '100%'
        }}
    >
        <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
            rows={[
            {id: 1, scope: 'OrgGroup', count: 12, controls: 10},
            {id: 2, scope: 'Entity', count: 12, controls: 10},
            {id: 3, scope: 'Business Unit', count: 12, controls: 10},
            {id: 4, scope: 'Service', count: 12, controls: 10},
            {id: 5, scope: 'Type', count: 12, controls: 10},
            {id: 6, scope: 'Group', count: 12, controls: 10},
            {id: 7, scope: 'Tag', count: 12, controls: 10},
            {id: 8, scope: 'Asset', count: 12, controls: 10},
            ]}
            columns={gridScopeColumns}
            density="compact"
            disableColumnMenu
            //pageSizeOptions={[5, 10]}
            //initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        />
        </Box>
    </Box>
  );
}
