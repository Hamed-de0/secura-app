import * as React from 'react';
import { Box, Stack, TextField, InputAdornment, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { DataGrid } from '@mui/x-data-grid';
import { fetchRiskContexts } from '../../../api/services/risks';
import { adaptContextsToRegisterRows } from '../../../api/adapters/risks';
import OwnerPicker from './OwnerPicker';

const SORT_MAP = { residual: 'residual', updatedAt: 'updated_at', id: 'id', likelihood:'likelihood' };

export default function RiskContextsGrid({
  columns,
  height = 560,
  pageSize = 10,
  defaultSort = { field: 'updatedAt', sort: 'desc' },
  compactToolbar = false,
  orderMenuItems = [],
  filters,
  onFiltersChange,
  onRowClick,
  detailsMode = 'lazy', // 'eager' | 'lazy'
}) {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  // const { detailsMode = 'eager' } = props; // 'eager' | 'lazy'

  const [model, setModel] = React.useState({ page: 0, pageSize });
  const [sortModel, setSortModel] = React.useState([defaultSort]);

  // fetch
  React.useEffect(() => {
    let alive = true;
    if (detailsMode !== 'eager') return;
    if (!rows?.length) return;
    (async () => {
      setLoading(true);
      try {
        const sort  = SORT_MAP[sortModel[0]?.field] || 'updated_at';
        const sort_dir = sortModel[0]?.sort === 'asc' ? 'asc' : 'desc';

        const res = await fetchRiskContexts({
          offset: model.page * model.pageSize,
          limit: model.pageSize,
          sort, sort_dir,
          scope: filters?.scope ?? 'all',
          status: filters?.status ?? 'all',
          domain: filters?.domain ?? 'all',
          days: filters?.days ?? 90,
          search: filters?.search ?? '',
          over_appetite: !!filters?.overAppetite,
        });

        if (!alive) return;
        setTotal(res?.total ?? 0);
        setRows(adaptContextsToRegisterRows(res?.items || []));
      } finally {
        if (alive) setLoading(false);
        console.log('RiskContextsGrid: loaded', { alive, total, rows }); // DEBUG
      }
    })();
    return () => { alive = false; };
  }, [detailsMode, rows, /* filters, model.page, model.pageSize, sortModel */]);

  // compact toolbar state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <Box>
      {compactToolbar && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <TextField
            size="small"
            placeholder="Search…"
            value={filters?.search || ''}
            onChange={(e)=> onFiltersChange?.({ ...filters, search: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 220 }}
          />
          <Chip
            size="small"
            label="Over-Appetite"
            color={filters?.overAppetite ? 'error' : 'default'}
            variant={filters?.overAppetite ? 'filled' : 'outlined'}
            onClick={()=> onFiltersChange?.({ ...filters, overAppetite: !filters?.overAppetite })}
          />
          <Box sx={{ flex: 1 }} />
          {!!orderMenuItems.length && (
            <>
              <IconButton size="small" onClick={(e)=>setAnchorEl(e.currentTarget)}><SortIcon /></IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={()=>setAnchorEl(null)}>
                {orderMenuItems.map((opt, idx)=>(
                  <MenuItem
                    key={idx}
                    onClick={()=>{
                      setSortModel([opt.sort]); setAnchorEl(null);
                    }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      )}

      <Box sx={{ height }}>
        <DataGrid
          rows={rows}
          getRowId={(r)=>r.id}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={total}
          paginationModel={model}
          onPaginationModelChange={setModel}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(sm)=> setSortModel(sm.length ? sm : [defaultSort])}
          disableColumnMenu
          density="compact"
          onRowClick={(p)=> onRowClick?.(p.row)}
        />
      </Box>
    </Box>
  );
}
