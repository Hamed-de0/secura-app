import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer, Box, Tabs, Tab, TextField, IconButton, Typography,
  List, ListItemButton, ListItemText, Divider, Stack, Button
} from '@mui/material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { DataGrid } from '@mui/x-data-grid';
import { searchObligationAtoms,  getRequirementObligations } from '../../../api/services/obligations';
import { getControlCrosswalk } from '../../../api/services/mappings';

export default function ComplianceDrawer({
  open,
  onClose,
  versionId,
  requirementId,      // array of IDs for fallback aggregation (optional but recommended)
  controls,            // full controls catalog [{id, code, title, ...}]
  allMappingsLoader,   // async () => Promise<array> (uses getAllVersionMappings; injected from MappingManager)
  onPickObligation,    // function(obligation) -> void (to prefill MappingDialog)
  reverseData          // optional { byControlMap, refresh() } if already preloaded
}) {
  const [tab, setTab] = useState(0);

  // --- Obligations tab state
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [atoms, setAtoms] = useState([]);

  useEffect(() => {
    if (!open || tab !== 0) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (!requirementId) { setAtoms([]); return; }
        const res = await getRequirementObligations(requirementId, q);
        if (!cancelled) setAtoms(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, tab, q, requirementId]);

  // --- Reverse Crosswalk tab state
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState('');
  const [selectedControlId, setSelectedControlId] = useState(null);
  const [rows, setRows] = useState([]);

  const columns = useMemo(() => ([
    { field: 'requirement_code', headerName: 'Req', width: 120, valueGetter: p => p.row.requirement_code || p.row.framework_requirement_code },
    { field: 'requirement_title', headerName: 'Requirement Title', flex: 1, minWidth: 260, valueGetter: p => p.row.requirement_title || p.row.framework_requirement_title },
    { field: 'relation_type', headerName: 'Relation', width: 120 },
    { field: 'weight', headerName: 'Weight', width: 100 },
  ]), []);

  

  // Load requirements for the selected control using mappings.js
    useEffect(() => {
    if (!open || tab !== 1 || !selectedControlId) return;
    let cancelled = false;
    (async () => {
        setRevLoading(true);
        setRevError('');
        try {
        const data = await getControlCrosswalk({ control_id: Number(selectedControlId) });
        if (!cancelled) setRows(data);
        } catch (e) {
        if (!cancelled) setRevError('Could not load reverse crosswalk for this control.');
        } finally {
        if (!cancelled) setRevLoading(false);
        }
    })();
    return () => { cancelled = true; };
    }, [open, tab, selectedControlId]);    

    const filteredRows = rows.map((m, idx) => ({
        id: m.mapping_id || `${selectedControlId}-${m.framework_requirement_id}-${idx}`,
        ...m
    }));

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<ManageSearchIcon />} iconPosition="start" label="Obligations" />
          <Tab icon={<SwapHorizIcon />} iconPosition="start" label="Reverse Crosswalk" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search obligation atoms..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Loading…' : `${atoms.length} matches`}
            </Typography>
            <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'auto', maxHeight: '70vh' }}>
              {atoms.map(a => (
                <ListItemButton key={a.id} onClick={() => {
                    // console.log(a);
                    onPickObligation?.(a)
                    }}>
                  <ListItemText
                    primary={a.code ? `${a.code} — ${a.title}` : a.title}
                    secondary={a.description}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Tip: click an item to prefill the Mapping dialog’s “Obligation Atom”.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                select
                fullWidth
                size="small"
                label="Select control"
                SelectProps={{ native: true }}
                value={selectedControlId || ''}
                onChange={e => setSelectedControlId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value=""></option>
                {controls.map(c => (
                  <option key={`${c.code}—${c.id}`} value={c.id}>
                    {(c.code ? `${c.code} — ` : '') + (c.title || c.name)}
                  </option>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={() => setSelectedControlId(s => (s ? Number(s) : s))} // re-trigger effect
                disabled={revLoading || !selectedControlId}
                >
                Refresh
              </Button>
            </Stack>

            {revError && <Typography color="error">{revError}</Typography>}

            <Box sx={{ flex: 1, minHeight: 300 }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                disableRowSelectionOnClick
                loading={revLoading}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 }}}}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
