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
  TextareaAutosize,
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
import TuneIcon from "@mui/icons-material/Tune";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { parseViewParam } from "../lib/views/urlParam";
import useTelemetry from "../lib/telemetry/useTelemetry";

export default function SavedViewBar({
  title,
  gridView,
  columnsList = [],
  presets = [],
}) {
  const {
    views,
    useView,
    saveCurrentAs,
    defaultViewId,
    setDefaultViewId,
    toShareableUrl,
    toShareParam,
    columnVisibilityModel,
    onColumnVisibilityModelChange,
    deleteView,
    renameView,
    snapshot,
    setColumnOrder,
    applySnapshot,
    resetFilters,
  } = gridView;

  const { track } = useTelemetry(); // dev-only console events

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const viewsMenuId = "views-menu";

  const [saveOpen, setSaveOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const [colsOpen, setColsOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [editing, setEditing] = React.useState({}); // id -> name

  const [presetsAnchor, setPresetsAnchor] = React.useState(null);
  const presetsMenuId = "presets-menu";

  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");

  const [srMessage, setSrMessage] = React.useState("");

  function copyLink() {
    try {
      const url = toShareableUrl();
      navigator.clipboard?.writeText(url);
      track("view.copy_link", { title, url_len: url.length });
      setSrMessage("Link copied to clipboard");
    } catch {
      setSrMessage("Unable to copy link");
    }
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
        <Typography variant="subtitle2">{title}</Typography>

        {/* Views menu */}
        <Button
          size="small"
          variant="outlined"
          aria-haspopup="menu"
          aria-controls={open ? viewsMenuId : undefined}
          aria-expanded={open ? "true" : undefined}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Views
        </Button>
        <Menu
          id={viewsMenuId}
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
        >
          {views.length === 0 && <MenuItem disabled>No saved views</MenuItem>}
          {views.map((v) => (
            <MenuItem
              key={v.id}
              onClick={() => {
                useView(v.id);
                setAnchorEl(null);
                track("view.apply", { id: v.id });
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>{v.name}</Typography>
                <IconButton
                  size="small"
                  aria-label={
                    defaultViewId === v.id
                      ? "Unset default view"
                      : "Set as default view"
                  }
                  aria-pressed={defaultViewId === v.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultViewId(v.id);
                    track("view.set_default", { id: v.id });
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
          onClick={() => {
            setDefaultViewId(null);
            track("view.reset_default");
          }}
        >
          Reset default
        </Button>
        <Tooltip title="Copy shareable link">
          <IconButton
            size="small"
            aria-label="Copy shareable link"
            onClick={copyLink}
          >
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
          aria-haspopup="dialog"
          onClick={() => setManageOpen(true)}
        >
          Manage
        </Button>

        <Tooltip title="Reset filters to defaults">
          <IconButton
            size="small"
            aria-label="Reset filters"
            onClick={() => {
              resetFilters();
              track("filters.reset");
              setSrMessage("Filters reset to defaults");
            }}
          >
            <FilterAltOffIcon />
          </IconButton>
        </Tooltip>

        {presets.length > 0 && (
          <>
            <Button
              size="small"
              variant="text"
              startIcon={<TuneIcon />}
              aria-haspopup="menu"
              aria-controls={presetsAnchor ? presetsMenuId : undefined}
              aria-expanded={presetsAnchor ? "true" : undefined}
              onClick={(e) => setPresetsAnchor(e.currentTarget)}
            >
              Presets
            </Button>
            <Menu
              id={presetsMenuId}
              anchorEl={presetsAnchor}
              open={!!presetsAnchor}
              onClose={() => setPresetsAnchor(null)}
            >
              {presets.map((p) => (
                <MenuItem
                  key={p.id}
                  onClick={() => {
                    applySnapshot(p.snapshot);
                    setPresetsAnchor(null);
                    track("preset.apply", { id: p.id });
                  }}
                >
                  {p.name}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        <Tooltip title="Export JSON snapshot">
          <IconButton
            size="small"
            aria-label="Export snapshot"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(
                  JSON.stringify(snapshot, null, 2)
                );
                track("view.export_json");
                setSrMessage("Snapshot JSON copied to clipboard");
              } catch {
                setSrMessage("Unable to copy snapshot");
              }
            }}
          >
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import JSON or ?v= param">
          <IconButton
            size="small"
            aria-label="Import view"
            onClick={() => setImportOpen(true)}
          >
            <FileUploadIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Save dialog */}
      <Dialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        aria-labelledby="save-dialog-title"
      >
        <DialogTitle id="save-dialog-title">Save current view</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ "aria-label": "Saved view name" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const id = saveCurrentAs(name || "View");
              setName("");
              setSaveOpen(false);
              track("view.save", { id });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Columns picker (with order controls) */}
      <Dialog
        open={colsOpen}
        onClose={() => setColsOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="columns-dialog-title"
        aria-describedby="columns-dialog-desc"
      >
        <DialogTitle id="columns-dialog-title">Columns</DialogTitle>
        <DialogContent dividers>
          <Typography id="columns-dialog-desc" variant="body2" sx={{ mb: 1 }}>
            Choose which columns are visible and adjust their order.
          </Typography>
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
                gridView.setColumnOrder(next);
                track("columns.reorder", { from, to, id });
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
                        onChange={(e) => {
                          onColumnVisibilityModelChange({
                            ...columnVisibilityModel,
                            [c.id]: e.target.checked,
                          });
                          track("columns.visibility", {
                            id: c.id,
                            visible: e.target.checked,
                          });
                        }}
                      />
                    }
                    label={c.label}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    aria-label={`Move ${c.label} up`}
                    disabled={upDisabled}
                    onClick={() => move(-1)}
                  >
                    <ArrowUpwardIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={`Move ${c.label} down`}
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
      <Dialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="manage-dialog-title"
      >
        <DialogTitle id="manage-dialog-title">Manage saved views</DialogTitle>
        <DialogContent dividers>
          <List dense>
            {views.length === 0 && (
              <ListItem>
                <ListItemText primary="No saved views yet" />
              </ListItem>
            )}
            {views.map((v) => (
              <ListItem
                key={v.id}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      aria-label={
                        defaultViewId === v.id
                          ? "Unset default view"
                          : "Set as default view"
                      }
                      aria-pressed={defaultViewId === v.id}
                      onClick={() => {
                        setDefaultViewId(v.id);
                        track("view.set_default", { id: v.id });
                      }}
                    >
                      {defaultViewId === v.id ? (
                        <StarIcon />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Delete view ${v.name}`}
                      onClick={() => {
                        deleteView(v.id);
                        track("view.delete", { id: v.id });
                        setSrMessage("View deleted");
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <TextField
                  size="small"
                  value={editing[v.id] ?? v.name}
                  onChange={(e) =>
                    setEditing({ ...editing, [v.id]: e.target.value })
                  }
                  onBlur={() => {
                    const name = (editing[v.id] ?? v.name).trim();
                    if (name && name !== v.name) {
                      renameView(v.id, name);
                      setSrMessage("View renamed");
                    }
                  }}
                  inputProps={{ "aria-label": `View name ${v.name}` }}
                  fullWidth
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import dialog */}
      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="import-dialog-title"
        aria-describedby="import-dialog-desc"
      >
        <DialogTitle id="import-dialog-title">Import view</DialogTitle>
        <DialogContent dividers>
          <Typography
            id="import-dialog-desc"
            variant="body2"
            sx={{ mb: 1 }}
          >
            Paste a JSON snapshot or a full URL containing <code>?v=</code> (or
            just the <code>v</code> value).
          </Typography>
          <TextareaAutosize
            aria-labelledby="import-dialog-desc"
            minRows={6}
            style={{ width: "100%" }}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              try {
                const text = importText.trim();
                let v = "";
                try {
                  const u = new URL(text);
                  v = u.searchParams.get("v") || "";
                } catch {}
                if (!v && text.startsWith("{")) {
                  const json = JSON.parse(text);
                  applySnapshot(json);
                } else {
                  const snap = parseViewParam(v || text);
                  if (snap) applySnapshot(snap);
                }
                setImportOpen(false);
                setImportText("");
                track("view.import");
                setSrMessage("View imported");
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn("Import failed", e);
                setSrMessage("Import failed");
              }
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Screen-reader live region (visually hidden) */}
      <Box
        component="span"
        role="status"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {srMessage}
      </Box>
    </Box>
  );
}
