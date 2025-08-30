import * as React from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { fetchRequirementsTree } from "../../../api/services/compliance";

export default function RequirementTreePanel({ versionId, selected, onSelect }) {
  const [tree, setTree] = React.useState([]);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const nodes = await fetchRequirementsTree({ versionId });
        if (alive) setTree(nodes || []);
      } catch (e) { console.error(e); }
    })();
    return () => { alive = false; }
  }, [versionId]);

  const filterMatch = (node) => {
    if (!q) return true;
    const label = `${node.code || ""} ${node.title || ""}`.toLowerCase();
    if (label.includes(q.toLowerCase())) return true;
    return (node.children || []).some(filterMatch);
  };

  const render = (node) => {
    if (!filterMatch(node)) return null;
    const label = `${node.code || ""} ${node.title || ""}`.trim();
    return (
      <TreeItem key={node.id} nodeId={String(node.id)} label={label} onClick={() => onSelect?.(node.id)}>
        {(node.children || []).map(render)}
      </TreeItem>
    );
  };

  return (
    <Box sx={{ width: 320, borderRight: 1, borderColor: "divider", p: 1, display: "flex", flexDirection: "column", gap: 1, height: "calc(100vh - 96px)" }}>
      <Typography variant="subtitle2">Requirements</Typography>
      <TextField
        size="small" placeholder="Filter tree…" value={q} onChange={(e) => setQ(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />
      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon/>}
          defaultExpandIcon={<ChevronRightIcon/>}
          selected={selected ? [String(selected)] : []}
        >
          {tree.map(render)}
        </TreeView>
      </Box>
    </Box>
  );
}
