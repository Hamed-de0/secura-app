import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  TextareaAutosize
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LinkIcon from "@mui/icons-material/Link";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import TuneIcon from '@mui/icons-material/Tune';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

/**
 * Generic Saved View bar shown above lists/grids
 * Props:
 *  - title
 *  - gridView: object from useGridView()
 *  - columnsList?: [{ id, label }] to allow in-bar column toggling
 */
export default function SavedViewBar({ title, gridView, columnsList = [], presets = [] }) {
  const {
    views,
    useView,
    saveCurrentAs,
    defaultViewId,
    setDefaultViewId,
    toShareableUrl,
    columnVisibilityModel,
    onColumnVisibilityModelChange,
    deleteView,
    renameView,
    snapshot,
    setColumnOrder,
  } = gridView;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [saveOpen, setSaveOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const [colsOpen, setColsOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [editing, setEditing] = React.useState({}); // id -> name
  const [presetsAnchor, setPresetsAnchor] = React.useState(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');


  function copyLink() {
    const url = toShareableUrl();
    navigator.clipboard?.writeText(url);
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
        <Typography variant="subtitle2">{title}</Typography>

        {/* Views menu */}
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Views
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          {views.length === 0 && <MenuItem disabled>No saved views</MenuItem>}
          {views.map((v) => (
            <MenuItem
              key={v.id}
              onClick={() => {
                useView(v.id);
                setAnchorEl(null);
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>{v.name}</Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultViewId(v.id);
                  }}
                >
                  {defaultViewId === v.id ? (
                    <StarIcon fontSize="small" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Stack>
            </MenuItem>
          ))}
        </Menu>

        <Button
          size="small"
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={() => setSaveOpen(true)}
        >
          Save as…
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={() => setDefaultViewId(null)}
        >
          Reset default
        </Button>
        <Tooltip title="Copy shareable link">
          <IconButton size="small" onClick={copyLink}>
            <LinkIcon />
          </IconButton>
        </Tooltip>

        {columnsList.length > 0 && (
          <Button
            size="small"
            variant="text"
            startIcon={<ViewColumnIcon />}
            onClick={() => setColsOpen(true)}
          >
            Columns
          </Button>
        )}

        <Button
          size="small"
          variant="text"
          startIcon={<ManageSearchIcon />}
          onClick={() => setManageOpen(true)}
        >
          Manage
        </Button>

        
        {presets.length > 0 && (
          <>
            <Button size="small" variant="text" startIcon={<TuneIcon/>} onClick={(e)=> setPresetsAnchor(e.currentTarget)}>Presets</Button>
            <Menu anchorEl={presetsAnchor} open={!!presetsAnchor} onClose={()=> setPresetsAnchor(null)}>
              {presets.map(p => (
                <MenuItem key={p.id} onClick={()=> { applySnapshot(p.snapshot); setPresetsAnchor(null); }}>
                  {p.name}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        <Tooltip title="Export JSON snapshot">
          <IconButton size="small" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(snapshot, null, 2)); }}><FileDownloadIcon/></IconButton>
        </Tooltip>
        <Tooltip title="Import JSON or ?v= param">
          <IconButton size="small" onClick={() => setImportOpen(true)}><FileUploadIcon/></IconButton>
        </Tooltip>
      </Stack>

      {/* Save dialog */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)}>
        <DialogTitle>Save current view</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              saveCurrentAs(name || "View");
              setName("");
              setSaveOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Columns picker */}
      <Dialog
        open={colsOpen}
        onClose={() => setColsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Columns</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {columnsList.map((c, idx) => {
              const visible = !!columnVisibilityModel[c.id];
              const order =
                snapshot.columns?.order || columnsList.map((cc) => cc.id);
              const pos = order.indexOf(c.id);
              const upDisabled = pos <= 0;
              const downDisabled = pos === -1 || pos >= order.length - 1;
              const move = (delta) => {
                const next = [...order];
                const from = pos === -1 ? idx : pos;
                const to = Math.max(0, Math.min(next.length - 1, from + delta));
                const [id] = next.splice(from, 1);
                next.splice(to, 0, id);
                setColumnOrder(next);
              };
              return (
                <Stack
                  key={c.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={visible}
                        onChange={(e) =>
                          onColumnVisibilityModelChange({
                            ...columnVisibilityModel,
                            [c.id]: e.target.checked,
                          })
                        }
                      />
                    }
                    label={c.label}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    disabled={upDisabled}
                    onClick={() => move(-1)}
                  >
                    <ArrowUpwardIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={downDisabled}
                    onClick={() => move(1)}
                  >
                    <ArrowDownwardIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      
      {/* Manage views dialog */}
      <Dialog open={manageOpen} onClose={()=> setManageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage saved views</DialogTitle>
        <DialogContent dividers>
          <List dense>
            {views.length === 0 && <ListItem><ListItemText primary="No saved views yet"/></ListItem>}
            {views.map((v) => (
              <ListItem key={v.id} secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={()=> setDefaultViewId(v.id)}>{defaultViewId === v.id ? <StarIcon/> : <StarBorderIcon/>}</IconButton>
                  <IconButton size="small" color="error" onClick={()=> deleteView(v.id)}><DeleteIcon/></IconButton>
                </Stack>
              }>
                <TextField size="small" value={editing[v.id] ?? v.name}
                  onChange={(e)=> setEditing({ ...editing, [v.id]: e.target.value })}
                  onBlur={()=> { const name = (editing[v.id] ?? v.name).trim(); if (name && name !== v.name) renameView(v.id, name); }}
                  fullWidth />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setManageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={importOpen} onClose={()=> setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import view</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>Paste a JSON snapshot or a full URL containing <code>?v=</code> (or just the <code>v</code> value).</Typography>
          <TextareaAutosize minRows={6} style={{ width: '100%' }} value={importText} onChange={(e)=> setImportText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setImportOpen(false)}>Cancel</Button>
          <Button onClick={()=> {
            try {
              const text = importText.trim();
              // try URL with v=
              let v = '';
              try { const u = new URL(text); v = u.searchParams.get('v') || ''; } catch {}
              if (!v && text.startsWith('{')) {
                // raw JSON snapshot
                const json = JSON.parse(text);
                applySnapshot(json);
              } else {
                // try plain v param
                const { parseViewParam } = require('../lib/views/urlParam');
                const snap = parseViewParam(v || text);
                if (snap) applySnapshot(snap);
              }
              setImportOpen(false);
              setImportText('');
            } catch (e) {
              console.warn('Import failed', e);
            }
          }}>Import</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
