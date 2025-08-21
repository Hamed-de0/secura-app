import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, TextField, InputAdornment, Button,
  IconButton, Chip, LinearProgress, Divider, MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useSearchParams } from "react-router-dom";

import RequirementTree from "../components/RequirementTree";
import { listFrameworkVersions } from "../../../api/services/frameworks";
import { listRequirements } from "../../../api/services/requirements";
import { listControls, getControl } from "../../../api/services/controls";
import { getRequirementMappings, saveRequirementMappings, createCrosswalkMapping, deleteCrosswalkMapping } from "../../../api/services/mappings";
import MappingDialog from "../components/MappingDialog";

// --- helpers ----------------------------------------------------------------
function sumWeights(items) {
  return items.reduce((s, x) => s + Number(x.weight || 0), 0);
}
function distinctById(arr) {
  const m = new Map();
  arr.forEach((x) => m.set(Number(x.control_id), x));
  return Array.from(m.values());
}

export default function MappingManager() {
  const [params, setParams] = useSearchParams();
  const qpVersion = Number(params.get("version") || 0);
  const qpReq = Number(params.get("req") || 0);

  // ---- top: framework versions ---------------------------------------------
  const [versions, setVersions] = useState([]);          // [{id, code, name, version_code}]
  const [versionId, setVersionId] = useState(qpVersion); // selected version
  const [loadingVersions, setLoadingVersions] = useState(true);

  const [allControls, setAllControls] = useState([]);
  const [allControlsLoading, setAllControlsLoading] = useState(false);

  // ---- Modal Window for edit/new ---------------------------------------------
  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [dlgMode, setDlgMode] = React.useState("create");
  const [dlgCtx, setDlgCtx] = React.useState({
    requirement: null,
    control: null,
    initial: null,
    obligationAtoms: [],
    remainingWeight: 100,
  });

  function openCreateDialog(control) {
    const req = requirements.find(r => r.requirement_id === reqId) || null;
    setDlgMode("create");
    setDlgCtx({
      requirement: req,
      control,
      initial: null,
      obligationAtoms: [],     // plug atoms list here when you have it
      remainingWeight: Math.max(0, 100 - totalWeight),
    });
    setDlgOpen(true);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingVersions(true);
      try {
        const list = await listFrameworkVersions();
        if (cancelled) return;
        setVersions(list);
        const initial = qpVersion && list.some(v => v.id === qpVersion)
          ? qpVersion
          : (list[0]?.id || 0);
        setVersionId(initial);
        setParams((p) => {
          const n = new URLSearchParams(p);
          if (initial) n.set("version", String(initial));
          else n.delete("version");
          if (qpReq) n.set("req", String(qpReq));
          return n;
        });
      } finally {
        if (!cancelled) setLoadingVersions(false);
      }
    })();

    (async () => {
      setAllControlsLoading(true);
      try {
        const BATCH = 500;
        let acc = [];
        let offset = 0;
        for (;;) {
          const page = await listControls({ limit: BATCH, offset, q: "", sort: 'id' });
          if (cancelled) return;
          acc = acc.concat(page.items);
          // stop when we have everything
          if (acc.length >= (page.total ?? acc.length) || page.items.length === 0) break;
          offset += BATCH;
        }
        setAllControls(acc);
        // initialize total; rows will be computed by the filter effect below
        setCatTotal(acc.length);
      } finally {
        if (!cancelled) setAllControlsLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---- left: requirements (by version) -------------------------------------
  const [rq, setRq] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [reqId, setReqId] = useState(qpReq || 0);

  useEffect(() => {
    if (!versionId) {
      setRequirements([]);
      setReqId(0);
      return;
    }
    let cancelled = false;
    setLoadingReqs(true);
    (async () => {
      const items = await listRequirements({ version_id: versionId, q: rq.trim() });
      if (cancelled) return;
      setRequirements(items);
      if (!items.some((r) => r.requirement_id === reqId)) {
        setReqId(items[0]?.requirement_id || 0);
      }
      setLoadingReqs(false);
    })();
    return () => { cancelled = true; };
  }, [versionId, rq]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep URL in sync when version or req changes
  useEffect(() => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (versionId) n.set("version", String(versionId)); else n.delete("version");
      if (reqId) n.set("req", String(reqId)); else n.delete("req");
      return n;
    });
  }, [versionId, reqId, setParams]);

  // ---- middle: mappings (read from crosswalks/requirements/:id) ------------
  const [serverSet, setServerSet] = useState([]); // [{control_id,weight,code?,title?}]
  const [draftSet, setDraftSet] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!reqId) {
      setServerSet([]);
      setDraftSet([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMap(true);
      try {
        const items = await getRequirementMappings({ requirement_id: reqId });
        // If your GET already includes control_code/title, getControl calls aren’t needed.
        const enriched = items.map((x) => ({
          ...x,
          code: x.code || x.control_code || `#${x.control_id}`,
          title: x.title || x.control_title || "",
        }));
        
        if (!cancelled) {
          setServerSet(enriched);
          setDraftSet(enriched);
        }
      } finally {
        if (!cancelled) setLoadingMap(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reqId]);

  const totalWeight = useMemo(() => sumWeights(draftSet), [draftSet]);
  const dirty = useMemo(() => JSON.stringify(draftSet) !== JSON.stringify(serverSet), [draftSet, serverSet]);
  const over = totalWeight > 100;

  // ---- right: controls catalog (server) ------------------------------------
  const [cq, setCq] = useState("");
  const [source, setSource] = useState("all");
  

  const [catPage, setCatPage] = useState({ page: 0, pageSize: 10 });
  const [catRows, setCatRows] = useState([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    // Filter in-memory by code OR title/name; case-insensitive
    const ql = (cq || "").toLowerCase();

    let items = allControls;

    if (ql.length >= 2) {
      items = items.filter(c => {
        const code = String(c.code || c.reference_code || "").toLowerCase();
        const name = String(c.title || c.control_title || c.title_en || "").toLowerCase();
        return code.includes(ql) || name.includes(ql);
      });
    }

    if (source !== "all") {
      items = items.filter(c => (c.source || "").toLowerCase() === source.toLowerCase());
    }

    // Update total & current page slice
    setCatTotal(items.length);
    const start = catPage.page * catPage.pageSize;
    const end = start + catPage.pageSize;
    setCatRows(items.slice(start, end));
  }, [allControls, cq, source, catPage.page, catPage.pageSize]);

  // useEffect(() => {
  //   let cancelled = false;
  //   (async () => {
  //     setCatLoading(true);
  //     try {
  //       const limit = catPage.pageSize;
  //       const offset = catPage.page * catPage.pageSize;
  //       const page = await listControls({ limit, offset, q: cq.length >= 2 ? cq : "" });
  //       const items = page.items.filter((i) => source === "all" || i.source === source);
  //       if (!cancelled) {
  //         setCatRows(items);
  //         setCatTotal(page.total);
  //       }
  //       // console.log(items.total,  items)
  //     } finally {
  //       if (!cancelled) setCatLoading(false);
  //     }
  //   })();
  //   return () => { cancelled = true; };
  // }, [catPage.page, catPage.pageSize, cq, source]);

  // ---- actions --------------------------------------------------------------
  function addControlToDraft(control) {
    const id = Number(control.control_id);
    if (draftSet.some((x) => x.control_id === id)) return;
    const remaining = Math.max(0, 100 - totalWeight);
    const weight = remaining > 0 ? remaining : 0;
    const next = distinctById([...draftSet, { control_id: id, weight, code: control.code, title: control.title }]);
    setDraftSet(next);
  }
  async function removeFromDraft(id) {
    console.log('id for delete', id, reqId);
    await deleteCrosswalkMapping({mapping_id: id}).catch(console.log);
    const fresh = await getRequirementMappings({requirement_id: reqId});
    setDraftSet(fresh);
    setServerSet(fresh);
    console.log('successfully deleted.')
    
    
  }
  function updateWeight(id, newWeight) {
    const w = Math.max(0, Math.min(100, Number(newWeight) || 0));
    setDraftSet(draftSet.map((x) => (x.control_id === id ? { ...x, weight: w } : x)));
  }
  async function saveDraft() {
    setSaving(true);
    try {
      const items = draftSet.map(({ control_id, weight }) => ({ control_id, weight }));
      const saved = await saveRequirementMappings({ version_id: versionId, requirement_id: reqId, items });
      const enriched = saved.map((x) => ({
        ...x,
        code: x.code || x.control_code || `#${x.control_id}`,
        title: x.title || x.control_title || "",
      }));
      setServerSet(enriched);
      setDraftSet(enriched);
    } finally {
      setSaving(false);
    }
  }

  // ---- columns --------------------------------------------------------------
  const mapColumns = [
    { field: "code", headerName: "Code", width: 110, renderCell: (p) => <span>{p.row.code}</span> },
    { field: "title", headerName: "Control", flex: 1, minWidth: 220, renderCell: (p) => <span>{p.row.title}</span> },
    {
      field: "weight",
      headerName: "Weight %",
      width: 130,
      renderCell: (p) => (
        <Chip
          size="small"
          label={`${p.row.weight}%`}
          onClick={() => {
            const req = requirements.find(r => r.requirement_id === reqId) || null;
            setDlgMode("edit");
            setDlgCtx({
              requirement: req,
              control: { control_id: p.row.control_id, code: p.row.code, title: p.row.title },
              initial: p.row,         // contains mapping_id, weight, relation_type, etc.
              obligationAtoms: [],    // supply if you have
              remainingWeight: Math.max(0, 100 - (totalWeight - (p.row.weight || 0))),
            });
            setDlgOpen(true);
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <IconButton size="small" onClick={() => removeFromDraft(p.row.mapping_id)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const catalogColumns = [
    { field: "code", headerName: "Code", width: 110, renderCell: (p) => <span>{p.row.code}</span> },
    { field: "title", headerName: "Control", flex: 1, minWidth: 220, renderCell: (p) => <span>{p.row.title}</span> },
    {
      field: "source",
      headerName: "Source",
      width: 110,
      renderCell: (p) => <Chip size="small" variant="outlined" label={p.row.source || "—"} />,
    },
    {
      field: "add",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <IconButton size="small" onClick={() => openCreateDialog(p.row)}>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // ---- render ---------------------------------------------------------------
  return (
    <Box sx={{ p: 2 }}>
      {/* Top toolbar: framework selection */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Requirements ↔ Controls Mapping</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            select
            size="small"
            label="Framework version"
            value={versionId || ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVersionId(v);
              setReqId(0); // force re-select from new requirements list
            }}
            sx={{ minWidth: 260 }}
          >
            {loadingVersions && <MenuItem disabled value="">Loading…</MenuItem>}
            {!loadingVersions && versions.length === 0 && <MenuItem disabled value="">No versions</MenuItem>}
            {versions.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.code ? `${v.code}${v.version_code ? ` ${v.version_code}` : ""}` : `Version ${v.id}`} — {v.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Search for requirements (filters the tree) */}
          <TextField
            size="small"
            placeholder="Search requirements…"
            value={rq}
            onChange={(e) => setRq(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280 }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* LEFT: Requirements Tree */}
        <Grid item xs={12} md={3} size={5} maxHeight={400} mb={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Requirements</Typography>
              {!versionId ? (
                <Typography variant="body2" color="text.secondary">Select a framework version to load requirements.</Typography>
              ) : loadingReqs ? (
                <LinearProgress />
              ) : (
                <RequirementTree
                  requirements={requirements}
                  selectedId={reqId}
                  onSelect={(id) => setReqId(id)}
                  query={rq}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* MIDDLE: Mappings editor */}
        <Grid item xs={12} md={5} size={7} maxHeight={350}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Mappings</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    color={sumWeights(draftSet) > 100 ? "error" : sumWeights(draftSet) === 100 ? "success" : "default"}
                    label={`Total: ${sumWeights(draftSet)}%`}
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    startIcon={<RestartAltIcon />}
                    disabled={!useMemo(() => JSON.stringify(draftSet) !== JSON.stringify(serverSet), [draftSet, serverSet])}
                    onClick={() => setDraftSet(serverSet)}
                  >
                    Reset
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={!useMemo(() => JSON.stringify(draftSet) !== JSON.stringify(serverSet), [draftSet, serverSet]) || sumWeights(draftSet) > 100 || !versionId || !reqId}
                    onClick={saveDraft}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>

              {loadingMap ? (
                <LinearProgress />
              ) : !reqId ? (
                <Typography variant="body2" color="text.secondary">Pick a requirement to edit mappings.</Typography>
              ) : (
                <Box sx={{ height: '100%' }}>
                  <DataGrid
                    rows={draftSet.map((x) => ({ id: x.control_id, ...x }))}
                    columns={mapColumns}
                    hideFooter
                    density="compact"
                    disableColumnMenu
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Controls catalog */}
        <Grid item xs={12} md={4} size={12} mt={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Controls catalog</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search controls…"
                  value={cq}
                  onChange={(e) => setCq(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  select
                  label="Source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  {["all", "ISO", "Internal", "BSI", "GDPR", "DORA", "Other"].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s === "all" ? "All" : s}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Divider sx={{ mb: 1 }} />

              <Box sx={{ height: 520 }}>
                <DataGrid
                  rows={catRows.map((x) => ({ id: x.control_id, ...x }))}
                  columns={catalogColumns}
                  density="compact"
                  disableColumnMenu
                  loading={allControlsLoading}
                  paginationMode="server"
                  rowCount={catTotal}
                  paginationModel={catPage}
                  onPaginationModelChange={setCatPage}
                  pageSizeOptions={[10, 25, 50]}
                  onRowDoubleClick={(p) => openCreateDialog(p.row)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <MappingDialog
        open={dlgOpen}
        mode={dlgMode}
        requirement={dlgCtx.requirement}
        control={dlgCtx.control}
        initial={dlgCtx.initial}
        obligationAtoms={dlgCtx.obligationAtoms}
        remainingWeight={dlgCtx.remainingWeight}
        onClose={() => setDlgOpen(false)}
        onSaved={async () => {
          setDlgOpen(false);
          // re-fetch mappings for the current requirement and refresh table
          const fresh = await getRequirementMappings({ requirement_id: reqId });
          // if your GET already has code/title, no need to enrich:
          setServerSet(fresh);
          setDraftSet(fresh);
        }}
      />
    </Box>
    
  );
}
