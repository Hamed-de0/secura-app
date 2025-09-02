import * as React from "react";
import {
  List, ListItem, Divider, Stack, Chip, Typography, IconButton, Menu, MenuItem, Box
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const STATUS_COLOR = { draft:"#9e9e9e", submitted:"#9e9e9e", approved:"#2e7d32", active:"#2e7d32", rejected:"#d32f2f", withdrawn:"#9e9e9e", expired:"#d32f2f" };

export default function ExceptionsPanel({ exceptions, onAction, onComment }) {
  const items = Array.isArray(exceptions) ? exceptions : [];
  if (!items.length) return <Box sx={{ p:1 }}><em>No exceptions.</em></Box>;

  return (
    <List dense disablePadding>
      {items.map((ex, idx) => (
        <React.Fragment key={ex.id}>
          <Row ex={ex} onAction={onAction} onComment={onComment} />
          {idx < items.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}

function Row({ ex, onAction, onComment }) {
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const menuItems = getActionsForStatus(ex.status);

  return (
    <ListItem sx={{ py: 0.75 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
        {/* LEFT */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap title={ex.title || `Exception #${ex.id}`}>
            {ex.title || `Exception #${ex.id}`}
          </Typography>

          <Typography variant="caption" color="text.secondary" component="div">
            {fmt(ex.start_date)} → {fmt(ex.end_date)}
          </Typography>

          {ex.reason && (
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              title={ex.reason}
            >
              {ex.reason}
            </Typography>
          )}
        </Box>

        {/* RIGHT */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Chip size="small" label={ex.status} sx={{ bgcolor: STATUS_COLOR[ex.status] || "#9e9e9e", color:"#fff" }} />
          <IconButton size="small" onClick={(e)=>setAnchor(e.currentTarget)} aria-label="More">
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={open} onClose={()=>setAnchor(null)}>
            {menuItems.map(mi => (
              <MenuItem
                key={mi}
                onClick={() => { setAnchor(null); onAction?.(ex.id, mi); }}
              >
                {label(mi)}
              </MenuItem>
            ))}
            <MenuItem onClick={() => { setAnchor(null); onComment?.(ex.id); }}>
              Add comment…
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </ListItem>
  );
}

function getActionsForStatus(status) {
  switch ((status||"").toLowerCase()) {
    case "draft":     return ["submit", "withdraw"];
    case "submitted": return ["approve", "reject", "withdraw"];
    case "approved":  return ["withdraw"];
    case "active":    return ["withdraw"];
    case "rejected":  return ["submit"]; // allow re-submit after edits
    case "withdrawn": return ["submit"];
    default:          return [];
  }
}
function label(a){ return a.charAt(0).toUpperCase()+a.slice(1); }
function fmt(s){ return s ? String(s).slice(0,10) : "—"; }
