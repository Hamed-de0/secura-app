import * as React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

/**
 * Requirements tree with search & single selection.
 * props:
 *  - requirements: [{ requirement_id, code, title, parent_id, sort_index, hits_count }]
 *  - selectedId: number | 0
 *  - onSelect: (id:number) => void
 *  - query: string
 */
export default function RequirementTree({ requirements = [], selectedId = 0, onSelect, query = "" }) {
  const q = (query || "").toLowerCase();

  const { roots, byId } = React.useMemo(() => {
    const map = new Map();
    const items = (requirements || []).map((r) => ({
      id: Number(r.requirement_id),
      code: r.code || "",
      title: r.title || "",
      parent: r.parent_id == null ? null : Number(r.parent_id),
      sort: Number.isFinite(r.sort_index) ? Number(r.sort_index) : null,
      hits: Number(r.hits_count || 0),
    }));
    items.forEach((n) => map.set(n.id, { ...n, children: [] }));
    const rootsArr = [];
    for (const n of map.values()) {
      if (n.parent && map.has(n.parent)) {
        map.get(n.parent).children.push(n);
      } else {
        rootsArr.push(n);
      }
    }
    const sorter = (a, b) => {
      if (a.sort != null && b.sort != null && a.sort !== b.sort) return a.sort - b.sort;
      const ac = String(a.code); const bc = String(b.code);
      return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: "base" });
    };
    const sortAll = (arr) => { arr.sort(sorter); arr.forEach((c) => sortAll(c.children)); };
    sortAll(rootsArr);
    return { roots: rootsArr, byId: map };
  }, [requirements]);

  // Filter tree by query → keep matches and their ancestors
  const { filteredRoots, expandedBySearch } = React.useMemo(() => {
    if (!q) return { filteredRoots: roots, expandedBySearch: new Set() };

    const matches = new Set();
    const addAncestors = (id) => {
      let cur = byId.get(id);
      while (cur && cur.parent) {
        matches.add(cur.parent);
        cur = byId.get(cur.parent);
      }
    };

    const filterNode = (node) => {
      const label = `${node.code} ${node.title}`.toLowerCase();
      const selfMatch = label.includes(q);
      const kids = node.children.map(filterNode).filter(Boolean);
      if (selfMatch || kids.length) {
        if (selfMatch) addAncestors(node.id);
        return { ...node, children: kids };
      }
      return null;
    };

    const fr = roots.map(filterNode).filter(Boolean);
    return { filteredRoots: fr, expandedBySearch: matches };
  }, [q, roots, byId]);

  // Expand state: keep user-controlled when no query; auto-expand matches when searching
  const [expanded, setExpanded] = React.useState([]);
  React.useEffect(() => {
    if (q) setExpanded(Array.from(new Set([...expanded, ...Array.from(expandedBySearch).map(String)])));
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveExpanded = q ? Array.from(expandedBySearch).map(String) : expanded;

  const selectedItems = selectedId ? [String(selectedId)] : [];

  const Label = ({ code, title, hits }) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {code}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        — {title}
      </Typography>
      {hits > 0 && <Chip size="small" color="success" variant="outlined" label={hits} />}
    </Stack>
  );

  const renderNode = (n) => (
    <TreeItem
      key={n.id}
      itemId={String(n.id)}
      label={<Label code={n.code} title={n.title} hits={n.hits} />}
    >
      {n.children.map(renderNode)}
    </TreeItem>
  );

  return (
    <Box sx={{ maxHeight: 360, overflow: "auto" }}>
      <SimpleTreeView
        expandedItems={effectiveExpanded}
        onExpandedItemsChange={(_, ids) => setExpanded(Array.isArray(ids) ? ids : [ids])}
        selectedItems={selectedItems}
        onSelectedItemsChange={(_, ids) => {
          const id = Array.isArray(ids) ? ids[0] : ids;
          if (id && onSelect) onSelect(Number(id));
        }}
      >
        {filteredRoots.map(renderNode)}
      </SimpleTreeView>
    </Box>
  );
}
