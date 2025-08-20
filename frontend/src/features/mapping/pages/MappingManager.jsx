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

import { listFrameworkVersions } from "../../../api/services/frameworks";
import { listRequirements } from "../../../api/services/requirements";
import { listControls, getControl } from "../../../api/services/controls";
import { getRequirementMappings, saveRequirementMappings } from "../../../api/services/mappings";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingVersions(true);
      try {
        const list = await listFrameworkVersions();
        if (cancelled) return;
        setVersions(list);
        // pick initial version: query param or first
        const initial = qpVersion && list.some(v => v.id === qpVersion)
          ? qpVersion
          : (list[0]?.id || 0);
        setVersionId(initial);
        // ensure URL reflects current version
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
      // If current reqId not in new list, select first
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
        
        if (!cancelled) {
          setServerSet(items);
          setDraftSet(items);
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

  // ---- right: controls catalog (unchanged; server-side list) ---------------
  const [cqRaw, setCqRaw] = useState("");
  const [cq, setCq] = useState("");
  const [source, setSource] = useState("all");
  useEffect(() => {
    const id = setTimeout(() => setCq(cqRaw.trim()), 400);
    return () => clearTimeout(id);
  }, [cqRaw]);

  const [catPage, setCatPage] = useState({ page: 0, pageSize: 10 });
  const [catRows, setCatRows] = useState([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCatLoading(true);
      try {
        const limit = catPage.pageSize;
        const offset = catPage.page * catPage.pageSize;
        const page = await listControls({ limit, offset, q: cq.length >= 2 ? cq : "" });
        const items = page.items.filter((i) => source === "all" || i.source === source);
        if (!cancelled) {
          setCatRows(items);
          setCatTotal(page.total);
        }
      } finally {
        if (!cancelled) setCatLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [catPage.page, catPage.pageSize, cq, source]);

  // ---- actions --------------------------------------------------------------
  function addControlToDraft(control) {
    const id = Number(control.control_id);
    if (draftSet.some((x) => x.control_id === id)) return;
    const remaining = Math.max(0, 100 - totalWeight);
    const weight = remaining > 0 ? remaining : 0;
    const next = distinctById([...draftSet, { control_id: id, weight, code: control.code, title: control.title }]);
    setDraftSet(next);
  }
  function removeFromDraft(id) {
    setDraftSet(draftSet.filter((x) => x.control_id !== id));
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
      // re-enrich after save
      const enriched = await Promise.all(
        saved.map(async (x) => {
          const c = await getControl(x.control_id).catch(() => null);
          return { ...x, code: c?.code ?? `#${x.control_id}`, title: c?.title ?? "" };
        })
      );
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
        <TextField
          size="small"
          type="number"
          inputProps={{ min: 0, max: 100, style: { textAlign: "right", width: 80 } }}
          value={p.row.weight}
          onChange={(e) => updateWeight(p.row.control_id, e.target.value)}
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
        <IconButton size="small" onClick={() => removeFromDraft(p.row.control_id)}>
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
        <IconButton size="small" onClick={() => addControlToDraft(p.row)}>
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
                console.log(versions);
              const v = Number(e.target.value);
              setVersionId(v);
              setReqId(0); // force re-select from new requirements list
            }}
            sx={{ minWidth: 260 }}
          >
            {() => console.log('loadingVersions', versions)}
            {loadingVersions && <MenuItem disabled value="">Loading…</MenuItem>}
            {!loadingVersions && versions.length === 0 && <MenuItem disabled value="">No versions</MenuItem>}
            {versions.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.code ? `${v.code}${v.version_code ? ` ${v.version_code}` : ""}` : `Version ${v.id}`} — {v.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* LEFT: Requirements */}
        <Grid item xs={12} md={3} size={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Requirements</Typography>
                <TextField
                  size="small"
                  placeholder="Search…"
                  value={rq}
                  onChange={(e) => setRq(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {!versionId ? (
                <Typography variant="body2" color="text.secondary">Select a framework version to load requirements.</Typography>
              ) : loadingReqs ? (
                <LinearProgress />
              ) : (
                <Box sx={{ maxHeight: 520, overflow: "auto" }}>
                  {requirements.map((r) => {
                    const active = r.requirement_id === reqId;
                    return (
                      <Box
                        key={r.requirement_id}
                        onClick={() => {
                            setReqId(r.requirement_id)
                        }}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: active ? "action.selected" : "transparent",
                          ":hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {r.title}
                        </Typography>
                        {r.hits_count > 0 && (
                          <Chip size="small" color="success" variant="outlined" sx={{ ml: 1 }} label={`effective ${r.hits_count}`} />
                        )}
                      </Box>
                    );
                  })}
                  {requirements.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No requirements found.</Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* MIDDLE: Mappings editor */}
        <Grid item xs={12} md={5} size={8}>
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
                    disabled={JSON.stringify(draftSet) === JSON.stringify(serverSet)}
                    onClick={() => setDraftSet(serverSet)}
                  >
                    Reset
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={JSON.stringify(draftSet) === JSON.stringify(serverSet) || sumWeights(draftSet) > 100 || !versionId || !reqId}
                    onClick={async () => {
                      await saveRequirementMappings({
                        version_id: versionId,
                        requirement_id: reqId,
                        items: draftSet.map(({ control_id, weight }) => ({ control_id, weight })),
                      });
                      // re-fetch server set after save
                      const fresh = await getRequirementMappings({ requirement_id: reqId });
                      const enriched = await Promise.all(
                        fresh.map(async (x) => {
                          const c = await getControl(x.control_id).catch(() => null);
                          return { ...x, code: c?.code ?? `#${x.control_id}`, title: c?.title ?? "" };
                        })
                      );
                      setServerSet(enriched);
                      setDraftSet(enriched);
                    }}
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
                <Box sx={{ height: 520 }}>
                  <DataGrid
                    rows={draftSet.map((x) => ({ id: x.control_id, ...x }))}
                    columns={[
                      { field: "code", headerName: "Code", width: 110, renderCell: (p) => <span>{p.row.code}</span> },
                      { field: "title", headerName: "Control", flex: 1, minWidth: 220, renderCell: (p) => <span>{p.row.title}</span> },
                      {
                        field: "weight",
                        headerName: "Weight %",
                        width: 130,
                        renderCell: (p) => (
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ min: 0, max: 100, style: { textAlign: "right", width: 80 } }}
                            value={p.row.weight}
                            onChange={(e) => {
                              const w = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                              setDraftSet(draftSet.map((x) => (x.control_id === p.row.control_id ? { ...x, weight: w } : x)));
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
                          <IconButton size="small" onClick={() => setDraftSet(draftSet.filter((x) => x.control_id !== p.row.control_id))}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        ),
                      },
                    ]}
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
        <Grid item xs={12} md={4} size={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Controls catalog</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search controls…"
                  value={cqRaw}
                  onChange={(e) => setCqRaw(e.target.value)}
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
                  sx={{ minWidth: 120 }}
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
                  columns={[
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
                        <IconButton size="small" onClick={() => addControlToDraft(p.row)}>
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      ),
                    },
                  ]}
                  density="compact"
                  disableColumnMenu
                  loading={catLoading}
                  paginationMode="server"
                  rowCount={catTotal}
                  paginationModel={catPage}
                  onPaginationModelChange={setCatPage}
                  pageSizeOptions={[10, 25, 50]}
                  onRowDoubleClick={(p) => addControlToDraft(p.row)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
