import * as React from "react";
import {
  Box, List, ListItemButton, ListItemText, Collapse, Typography, Skeleton, Stack
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { fetchRequirementsTree } from "../../../api/services/compliance";

export default function RequirementsTree({ versionId, onPick }) {
  const [tree, setTree] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [open, setOpen] = React.useState(() => new Set()); // expanded ids

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetchRequirementsTree({ versionId });
        if (!alive) return;
        const items = res?.data ?? res; // tolerate either shape
        setTree(Array.isArray(items) ? items : []);
        // expand all top-level by default
        const topIds = new Set((items || []).map(n => n.id));
        setOpen(topIds);
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [versionId]);

  const toggle = React.useCallback((id) => {
    setOpen(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  if (loading) return <TreeSkeleton />;
  if (error) return <Box p={2}><Typography color="error">Failed to load requirements.</Typography></Box>;
  if (!tree || tree.length === 0) return <Box p={2}><Typography>No requirements.</Typography></Box>;

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Requirements</Typography>
      <List dense disablePadding sx={{ mt: 1, maxHeight: 420, overflow: "auto" }}>
        {tree.map(node => (
          <Node key={node.id} node={node} open={open} onToggle={toggle} onPick={onPick} depth={0} />
        ))}
      </List>
    </Box>
  );
}

function Node({ node, open, onToggle, onPick, depth }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const expanded = open.has(node.id);

  const handleClick = (e) => {
    e.stopPropagation();
    onPick?.(node);
  };

  return (
    <Box>
      <ListItemButton
        onClick={() => hasChildren ? onToggle(node.id) : handleClick()}
        sx={{ pl: 1 + depth * 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          {hasChildren ? (expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />) : <Box width={18} />}
          <ListItemText
            primaryTypographyProps={{ variant: "body2" }}
            primary={`${node.code} — ${node.title}`}
            onClick={handleClick}
          />
        </Stack>
      </ListItemButton>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {node.children
              .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0))
              .map(ch => (
                <Node key={ch.id} node={ch} open={open} onToggle={onToggle} onPick={onPick} depth={depth + 1} />
              ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
}

function TreeSkeleton() {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Requirements</Typography>
      <Box sx={{ mt: 1 }}>
        {[...Array(8)].map((_, i) => <Skeleton key={i} height={22} />)}
      </Box>
    </Box>
  );
}
