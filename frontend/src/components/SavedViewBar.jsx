import * as React from 'react';
import { Box, Stack, Typography, Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, Divider, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

/**
 * Generic Saved View bar shown above lists/grids
 * Props:
 *  - title
 *  - gridView: object from useGridView()
 *  - columnsList?: [{ id, label }] to allow in-bar column toggling
 */
export default function SavedViewBar({ title, gridView, columnsList = [] }) {
  const { views, useView, saveCurrentAs, defaultViewId, setDefaultViewId, toShareableUrl, columnVisibilityModel, onColumnVisibilityModelChange } = gridView;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [saveOpen, setSaveOpen] = React.useState(false);
  const [name, setName] = React.useState('');

  const [colsOpen, setColsOpen] = React.useState(false);

  function copyLink() {
    const url = toShareableUrl();
    navigator.clipboard?.writeText(url);
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
        <Typography variant="subtitle2">{title}</Typography>

        {/* Views menu */}
        <Button size="small" variant="outlined" onClick={(e)=> setAnchorEl(e.currentTarget)}>Views</Button>
        <Menu anchorEl={anchorEl} open={open} onClose={()=> setAnchorEl(null)}>
          {views.length === 0 && <MenuItem disabled>No saved views</MenuItem>}
          {views.map(v => (
            <MenuItem key={v.id} onClick={()=> { useView(v.id); setAnchorEl(null); }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>{v.name}</Typography>
                <IconButton size="small" onClick={(e)=> { e.stopPropagation(); setDefaultViewId(v.id); }}>
                  {defaultViewId === v.id ? <StarIcon fontSize="small"/> : <StarBorderIcon fontSize="small"/>}
                </IconButton>
              </Stack>
            </MenuItem>
          ))}
        </Menu>

        <Button size="small" variant="outlined" startIcon={<SaveIcon/>} onClick={()=> setSaveOpen(true)}>Save as…</Button>
        <Button size="small" variant="outlined" startIcon={<RestartAltIcon/>} onClick={()=> setDefaultViewId(null)}>Reset default</Button>
        <Tooltip title="Copy shareable link">
          <IconButton size="small" onClick={copyLink}><LinkIcon/></IconButton>
        </Tooltip>

        {columnsList.length > 0 && (
          <Button size="small" variant="text" startIcon={<ViewColumnIcon/>} onClick={()=> setColsOpen(true)}>Columns</Button>
        )}
      </Stack>

      {/* Save dialog */}
      <Dialog open={saveOpen} onClose={()=> setSaveOpen(false)}>
        <DialogTitle>Save current view</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={name} onChange={(e)=> setName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setSaveOpen(false)}>Cancel</Button>
          <Button onClick={()=> { saveCurrentAs(name || 'View'); setName(''); setSaveOpen(false); }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Columns picker */}
      <Dialog open={colsOpen} onClose={()=> setColsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Columns</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {columnsList.map((c) => (
              <FormControlLabel key={c.id}
                control={<Checkbox size="small" checked={!!columnVisibilityModel[c.id]} onChange={(e)=> onColumnVisibilityModelChange({ ...columnVisibilityModel, [c.id]: e.target.checked })} />}
                label={c.label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setColsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}