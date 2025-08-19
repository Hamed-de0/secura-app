import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Paper,
  Card,
  CardContent,
  CardHeader as MUICardHeader,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Button,
  Grid,
  Tabs,
  Tab,
  useTheme,
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  ShieldOutlined as ShieldIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
  Cloud as CloudIcon,
  Insights as InsightsIcon,
  PlayArrow as PlayIcon,
  ErrorOutline as ErrorIcon,
  Build as BuildIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// ---------------- Helpers ----------------
const pct = (x) => Math.round(((x || 0) * 1000)) / 10; // percent with 0.1 precision
async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// -------------- Sample fallback (if API not ready) --------------
const SAMPLE_COVERAGES = [
  {
    version_id: 1,
    scope_type: "entity",
    scope_id: 1,
    score: 0.31,
    requirements: [
      { requirement_id: 103, code: "4", title: "Context", score: 0.12, hits: [] },
      { requirement_id: 133, code: "9.1", title: "Monitoring", score: 0.43, hits: [] },
      { requirement_id: 201, code: "Annex A.5", title: "Policies", score: 0.38, hits: [] },
    ],
  },
  {
    version_id: 2,
    scope_type: "entity",
    scope_id: 1,
    score: 0.22,
    requirements: [
      { requirement_id: 501, code: "Art.32", title: "Security of processing", score: 0.28, hits: [] },
      { requirement_id: 510, code: "Art.30", title: "Records of processing", score: 0.1, hits: [] },
    ],
  },
];

const SAMPLE_EFFECTIVE = [
  { control_id: 96, source: "direct", assurance_status: "implemented", scope_type: "entity", scope_id: 1 },
  { control_id: 73, source: "provider", assurance_status: "evidenced", scope_type: "service", scope_id: 1, provider_service_id: 1, inheritance_type: "direct", responsibility: "shared", notes: "Backups via ACC-SSC" },
  { control_id: 3, source: "baseline", assurance_status: "planning", scope_type: "org_group", scope_id: 1 },
];

const VERSION_LABELS = {
  1: "ISO/IEC 27001:2022",
  2: "GDPR EU 2016/679",
  3: "DORA",
  4: "NIS2",
};

function statusChipColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "fresh" || s === "evidenced") return "success";
  if (s === "implemented") return "primary";
  if (s === "implementing") return "info";
  if (s === "planning") return "warning";
  return "default"; // mapped etc.
}

// palette for charts
const COLORS = ["#1976d2", "#9c27b0", "#2e7d32", "#ed6c02", "#e53935", "#00838f", "#5e35b1"];

export default function ISMSDashboard() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const [scopeType, setScopeType] = useState("entity");
  const [scopeId, setScopeId] = useState(1);
  const [versionIds, setVersionIds] = useState("1,2");

  const [loading, setLoading] = useState(false);
  const [coverages, setCoverages] = useState([]);
  const [effective, setEffective] = useState([]);
  const [error, setError] = useState(null);

  const parsedVersionIds = useMemo(
    () =>
      versionIds
        .split(",")
        .map((v) => parseInt(v.trim(), 10))
        .filter((n) => Number.isFinite(n)),
    [versionIds]
  );

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const covs = await Promise.all(
        parsedVersionIds.map((id) =>
          fetchJSON(`/coverage/framework_versions/${id}/effective?scope_type=${scopeType}&scope_id=${scopeId}`)
            .catch(() => SAMPLE_COVERAGES.find((c) => c.version_id === id))
        )
      );
      setCoverages(covs);
      const eff = await fetchJSON(`/controls/effective-controls?scope_type=${scopeType}&scope_id=${scopeId}`)
        .catch(() => SAMPLE_EFFECTIVE);
      setEffective(eff);
    } catch (e) {
      setError(e.message || "Failed to load data");
      setCoverages(SAMPLE_COVERAGES);
      setEffective(SAMPLE_EFFECTIVE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeType, scopeId, versionIds]);

  // ===== Derived UI data =====
  const overallAvg = useMemo(() => {
    if (!coverages.length) return 0;
    const sum = coverages.reduce((acc, c) => acc + (c.score || 0), 0);
    return sum / coverages.length;
  }, [coverages]);

  const coverageBars = useMemo(
    () =>
      coverages.map((c, idx) => ({
        name: VERSION_LABELS[c.version_id] || `Version ${c.version_id}`,
        score: Math.round(c.score * 1000) / 10,
        color: COLORS[idx % COLORS.length],
      })),
    [coverages]
  );

  const statusDist = useMemo(() => {
    const buckets = { fresh: 0, evidenced: 0, implemented: 0, implementing: 0, planning: 0, mapped: 0 };
    for (const e of effective) {
      const k = String(e.assurance_status || "").toLowerCase();
      if (buckets[k] !== undefined) buckets[k] += 1;
    }
    const entries = Object.entries(buckets).filter(([, v]) => v > 0);
    const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;
    return entries.map(([k, v], i) => ({ name: k, value: Math.round((v / total) * 1000) / 10, raw: v, color: COLORS[i % COLORS.length] }));
  }, [effective]);

  const providerItems = useMemo(() => effective.filter((e) => e.source === "provider"), [effective]);

  const weakest = useMemo(() => {
    const items = [];
    for (const c of coverages) {
      const label = VERSION_LABELS[c.version_id] || `Version ${c.version_id}`;
      for (const r of c.requirements || []) {
        items.push({ framework: label, version_id: c.version_id, code: r.code, title: r.title, score: r.score });
      }
    }
    return items.sort((a, b) => a.score - b.score).slice(0, 8);
  }, [coverages]);

  // mock trend until you wire a real endpoint later
  const trend = useMemo(
    () => new Array(6).fill(0).map((_, i) => ({ month: `M${i + 1}`, score: Math.round((overallAvg * (0.9 + Math.random() * 0.2)) * 1000) / 10 })),
    [overallAvg]
  );

  // ===== Layout =====
  return (
    <Box p={3} pt={0}>
      {/* HERO */}
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" mb={3} gap={2}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>ISMS / GRC Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">H&H Communication Lab GmbH — executive view</Typography>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="scope-type">Scope type</InputLabel>
            <Select labelId="scope-type" label="Scope type" value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
              <MenuItem value="entity">Entity</MenuItem>
              <MenuItem value="bu">Business Unit</MenuItem>
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="asset">Asset</MenuItem>
              <MenuItem value="asset_type">Asset Type</MenuItem>
              <MenuItem value="asset_group">Asset Group</MenuItem>
              <MenuItem value="tag">Tag</MenuItem>
              <MenuItem value="site">Site</MenuItem>
              <MenuItem value="org_group">Org Group</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" type="number" label="Scope ID" value={scopeId} onChange={(e) => setScopeId(parseInt(e.target.value || "0", 10))} sx={{ width: 140 }} />
          <TextField size="small" label="Version IDs (comma)" value={versionIds} onChange={(e) => setVersionIds(e.target.value)} sx={{ width: 220 }} />
          <Button variant="contained" onClick={loadData}>{loading ? "Refreshing…" : "Refresh"}</Button>
        </Stack>
      </Stack>

      {/* KPI STRIP */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <MUICardHeader titleTypographyProps={{ variant: "subtitle2" }} avatar={<ShieldIcon />} title="Overall coverage (avg)" />
            <CardContent>
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
                <Stack><Typography variant="h4" fontWeight={700}>{pct(overallAvg)}%</Typography><Typography variant="caption" color="text.secondary">across selected versions</Typography></Stack>
                <Box sx={{ width: 96 }}><LinearProgress variant="determinate" value={pct(overallAvg)} /></Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <MUICardHeader titleTypographyProps={{ variant: "subtitle2" }} avatar={<AssessmentIcon />} title="Weakest requirement" />
            <CardContent>
              {weakest[0] ? (
                <Stack><Typography variant="h4" fontWeight={700}>{pct(weakest[0].score)}%</Typography><Typography variant="caption" color="text.secondary">{weakest[0].framework} · {weakest[0].code}</Typography></Stack>
              ) : <Typography variant="body2" color="text.secondary">—</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <MUICardHeader titleTypographyProps={{ variant: "subtitle2" }} avatar={<InsightsIcon />} title="Controls status mix" />
            <CardContent>
              <Box height={96}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={26} outerRadius={44} paddingAngle={2}>
                      {statusDist.map((d, idx) => (<Cell key={idx} fill={d.color} />))}
                    </Pie>
                    <RechartsTooltip formatter={(v, n) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                {statusDist.map((d, idx) => (
                  <Chip key={idx} size="small" label={`${d.name}: ${d.raw}`} sx={{ bgcolor: `${d.color}22` }} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <MUICardHeader titleTypographyProps={{ variant: "subtitle2" }} avatar={<CloudIcon />} title="Inherited controls (providers)" />
            <CardContent>
              <Typography variant="h4" fontWeight={700}>{providerItems.length}</Typography>
              <Typography variant="caption" color="text.secondary">active from services</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CORE ROWS */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: 360 }}>
            <MUICardHeader title="Coverage by framework" avatar={<AssessmentIcon />} />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageBars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <RechartsTooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {coverageBars.map((d, i) => (<Cell key={i} fill={d.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: 360 }}>
            <MUICardHeader title="Weakest requirements" avatar={<GavelIcon />} />
            <CardContent sx={{ height: 300, overflow: "auto" }}>
              <Stack spacing={1.5}>
                {weakest.map((w, idx) => (
                  <Paper key={`${w.framework}-${w.code}-${idx}`} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{w.framework} · {w.code}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap title={w.title || "—"}>{w.title || "—"}</Typography>
                      </Box>
                      <Chip size="small" color={w.score > 0.6 ? "success" : w.score > 0.3 ? "warning" : "error"} label={`${pct(w.score)}%`} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECONDARY ROW */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: 340 }}>
            <MUICardHeader title="Coverage trend (last 6 months)" avatar={<TimelineIcon />} />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis hide domain={[0, 100]} />
                  <RechartsTooltip formatter={(v) => `${v}%`} />
                  <Line type="monotone" dataKey="score" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: 340 }}>
            <MUICardHeader title="Quick actions" avatar={<BuildIcon />} />
            <CardContent>
              <Stack spacing={1.25}>
                <Button size="small" variant="contained" startIcon={<PlayIcon />}>Improve weakest requirement</Button>
                <Button size="small" variant="outlined" startIcon={<CheckIcon />}>Review implemented controls</Button>
                <Button size="small" variant="outlined" startIcon={<CloudIcon />}>Provider posture summary</Button>
                <Button size="small" variant="text" startIcon={<AssessmentIcon />}>Open compliance view</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABS */}
      <Box mt={2}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Effective controls" />
          <Tab label="Provider inheritance" />
          <Tab label="Requirements detail" />
        </Tabs>
        <Divider />

        {tab === 0 && (
          <Box mt={2}>
            <div style={{ height: 440, width: "100%" }}>
              <DataGrid
                rows={effective.map((e, i) => ({ id: i + 1, ...e }))}
                columns={[
                  { field: "control_id", headerName: "Control", width: 110 },
                  { field: "source", headerName: "Source", width: 120, renderCell: (p) => <Chip size="small" label={p.value} variant="outlined" /> },
                  { field: "assurance_status", headerName: "Status", width: 150, renderCell: (p) => <Chip size="small" color={statusChipColor(p.value)} label={p.value} /> },
                  { field: "provider_service_id", headerName: "Provider", width: 180, renderCell: (p) => p.row.source === "provider" ? (<Stack direction="row" spacing={1} alignItems="center"><CloudIcon fontSize="small" /><Typography variant="caption">svc #{p.value}</Typography></Stack>) : (<Typography variant="caption" color="text.secondary">—</Typography>) },
                  { field: "inheritance_type", headerName: "Inheritance", width: 140, renderCell: (p) => <Typography variant="caption" color="text.secondary">{p.row.source === "provider" ? (p.value || "—") : "—"}</Typography> },
                  { field: "notes", headerName: "Notes", flex: 1, minWidth: 220, renderCell: (p)=> (<Typography variant="caption" color="text.secondary" noWrap>{p.value || ""}</Typography>) },
                ]}
                density="compact"
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              />
            </div>
          </Box>
        )}

        {tab === 1 && (
          <Box mt={2}>
            {providerItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No provider-derived controls at this scope.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {providerItems.map((p, i) => (
                  <Paper key={`${p.control_id}-${i}`} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CloudIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>Control #{p.control_id} from service #{p.provider_service_id}</Typography>
                          <Typography variant="caption" color="text.secondary">inheritance: {p.inheritance_type || "—"} · responsibility: {p.responsibility || "—"}</Typography>
                        </Box>
                      </Stack>
                      <Chip size="small" color={statusChipColor(p.assurance_status)} label={p.assurance_status} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box mt={2}>
            {coverages.map((c) => (
              <Card key={`reqs-${c.version_id}`} variant="outlined" sx={{ mb: 2 }}>
                <MUICardHeader title={`${VERSION_LABELS[c.version_id] || `Version ${c.version_id}`} — requirements`} />
                <CardContent>
                  <div style={{ height: 440, width: "100%" }}>
                    <DataGrid
                      rows={(c.requirements || []).slice().sort((a, b) => a.score - b.score).map((r) => ({ id: r.requirement_id, ...r }))}
                      columns={[
                        { field: "code", headerName: "Code", width: 140 },
                        { field: "title", headerName: "Title", flex: 1, minWidth: 320 },
                        { field: "score", headerName: "Score", width: 160, renderCell: (p) => (<Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}><Box sx={{ flexGrow: 1 }}><LinearProgress variant="determinate" value={pct(p.value)} /></Box><Typography variant="caption" sx={{ width: 44, textAlign: "right" }}>{pct(p.value)}%</Typography></Stack>) },
                      ]}
                      density="compact"
                      pageSizeOptions={[10, 25, 50]}
                      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {loading && (<Box mt={2}><LinearProgress /></Box>)}
      {error && (<Box mt={1}><Typography variant="caption" color="error">{String(error)}</Typography></Box>)}
    </Box>
  );
}
