// src/pages/compliance/ComplianceDashboard.jsx
import * as React from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, Chip, Button, Tooltip,
  Divider, Skeleton, ToggleButtonGroup, ToggleButton, Link as MuiLink
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink, useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  fetchComplianceSummary,
  fetchActiveFrameworks,
  fetchStaleEvidence,
  fetchRequirementsStatusPage,
  
  // (optional future) fetchComplianceSummaryHistory
} from "../../../api/services/compliance";

// Recharts (alias Tooltip to avoid clash with MUI Tooltip)
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";

import { adaptSummaryToKpis, adaptStatusPage, adaptCoverageList } from "../../../api/adapters/compliance";
import { DEFAULT_SCOPE } from "../../../app/constants";
import FrameworkTabs from "../components/FrameworkTabs";

import { useContext, useEffect } from "react";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import CoverageHeatmap from "../components/CoverageHeatmap.jsx";
import RightPanelDrawer from "../../../components/rightpanel/RightPanelDrawer.jsx";

// import { useNavigate } from "react-router-dom";
// import { fetchCoverageRollup } from "../../../api/services/compliance.js";

// --- Fallback chip if you don't have a StatusChip component ---
const StatusChip = ({ value, exception }) => {
  const map = {
    met: { label: exception ? "met (exc)" : "met", color: "success" },
    partial: { label: "partial", color: "warning" },
    gap: { label: "gap", color: "error" },
    unknown: { label: "unknown", color: "default" },
  };
  const v = (value || "unknown").toLowerCase();
  const m = map[v] || map.unknown;
  return <Chip size="small" label={m.label} color={m.color} variant="filled" />;
};

// Color tokens (Q5)
const TOKENS = {
  success: "#2e7d32",
  warning: "#ed6c02",
  error:   "#d32f2f",
  grey:    "#9e9e9e",
};

// Small helper to format %
const fmtPct = (n) => (n == null ? "—" : `${Math.round(n)}%`);

// ---------------------------------
//  Main Page
// ---------------------------------
export default function ComplianceDashboard() {
  const { versionId: routeVersion } = useParams();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const versionId = Number(routeVersion || sp.get("version_id") || 1);
  const scopeType = sp.get("scope_type") || DEFAULT_SCOPE.scopeType || "org";
  const scopeId   = Number(sp.get("scope_id") || DEFAULT_SCOPE.scopeId || 1);

  // const { versionId, setVersionId, scope } = useContext(ScopeContext);
  const [panel, setPanel] = React.useState({ open:false, mode:null, payload:null, title:'' });
  const openPanel = (mode, payload, title) => setPanel({ open:true, mode, payload, title });
  const closePanel = () => setPanel(p => ({ ...p, open:false }));
  
  // Data state
  const [kpi, setKpi] = React.useState(null);
  const [activations, setActivations] = React.useState([]);
  const [evi, setEvi] = React.useState({ expired_count: 0, expiring_soon_count: 0 });
  const [gaps, setGaps] = React.useState([]);
  const [heatmapRows, setHeatmapRows] = React.useState([]); // Q2
  const [trend, setTrend] = React.useState([]);             // Q3/Q4 (graceful empty)

  // NEW: slice + rows state
  const [slice, setSlice] = React.useState(null); // { scopeType, status }
  const [rows, setRows] = React.useState([]);
  const [rowsLoading, setRowsLoading] = React.useState(false);

  // Load data
  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const s = await fetchComplianceSummary({ versionId, scopeType, scopeId });
        if (!ignore) setKpi(adaptSummaryToKpis(s));
      } catch (e) {
        console.error("summary", e);
        if (!ignore) setKpi(null);
      }

      try {
        const af = await fetchActiveFrameworks({ scopeType, scopeId });
        if (!ignore) setActivations(af.items || []);
      } catch (e) {
        console.error("active frameworks", e);
        if (!ignore) setActivations([]);
      }

      try {
        const ev = await fetchStaleEvidence({ withinDays: 30, scopeType, scopeId, page: 1, size: 5 });
        if (!ignore) setEvi({
          expired_count: ev?.expired_count || 0,
          expiring_soon_count: ev?.expiring_soon_count || 0
        });
      } catch (e) {
        console.error("evidence", e);
        if (!ignore) setEvi({ expired_count: 0, expiring_soon_count: 0 });
      }

      try {
        // Top gaps
        const page = await fetchRequirementsStatusPage({
          versionId, scopeType, scopeId,
          status: "gap,partial",
          sortBy: "score", sortDir: "asc",
          page: 1, size: 5,
        });
        if (!ignore) setGaps(adaptStatusPage(page).items || []);
      } catch (e) {
        console.error("gaps", e);
        if (!ignore) setGaps([]);
      }

      try {
        // Build a lightweight heatmap from a larger page snapshot (until a dedicated endpoint exists)
        const hp = await fetchRequirementsStatusPage({
          versionId, scopeType, scopeId,
          status: "met,partial,gap,unknown",
          sortBy: "code",
          sortDir: "asc",
          page: 1,
          size: 400, // enough to get a representative slice
        });
        if (!ignore) {
          const items = adaptStatusPage(hp).items || [];
          // If backend doesn’t send a per-item scope name, we’ll group into a single “Current Scope” row.
          // If you have a field like row.scope_name or row.asset_group, replace the key below.
          const rows = groupIntoHeatmap(items);
          setHeatmapRows(rows);
        }
      } catch (e) {
        console.error("heatmap page", e);
        if (!ignore) setHeatmapRows([]);
      }

      // (Optional) Load trend when backend provides it.
      // try {
      //   const hist = await fetchComplianceSummaryHistory({ versionId, scopeType, scopeId, last: 30 });
      //   if (!ignore) setTrend(hist.items || []);
      // } catch {
      //   if (!ignore) setTrend([]);
      // }
    })();
    return () => { ignore = true; };
  }, [versionId, scopeType, scopeId]);

  const handleHeatmapCell = React.useCallback((cell) => {
    console.log("heatmap cell click", cell);
    // cell = { scopeType, status }
    setSlice(cell);
    // OPTIONAL: scroll to table or set a chip showing active slice
  }, []);

  // when context version changes, ensure path matches it
  // Fetch list when slice changes
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!slice || !versionId) return;
      setRowsLoading(true);
      try {
        const resp = await fetchRequirementsStatusPage({
          versionId,
          scopeType: slice.scopeType,
          scopeId: slice.scopeId,
          status: slice.status,            // e.g. "met" or "gap,partial"
          page: 1,
          size: 50,
          sortBy: "code",
          sortDir: "asc",
        });
        const { items } = adaptStatusPage(resp);
        console.log("coverage list resp", items);
        if (alive) setRows(items);
      } catch (e) {
        console.error("coverage list error", e);
        if (alive) setRows([]);
      } finally {
        if (alive) setRowsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slice, versionId]);

  const onRowClick = React.useCallback((params) => {
    // e.g. openRequirementDrawer(params.row)
    // (keep whatever you already wired for the RightPanel)
    console.log("row click", params);
    // openPanel("requirement", { versionId, ...params.row }, `Requirement ${params.row.code || params.row.id || ""}`);
  }, []);
  // Q1: Framework tabs (pills)
  const handlePickFramework = (pickedVersionId) => {
    // reflect in URL (keep scope params)
    const next = new URLSearchParams(sp);
    next.set("version_id", String(pickedVersionId));
    setSp(next, { replace: true });
    // if route path contains :versionId, keep it synced:
    if (routeVersion) navigate(`/compliance/dashboard/${pickedVersionId}?scope_type=${scopeType}&scope_id=${scopeId}`, { replace: true });
  };

  // KPI quick drill
  const drillToExplorer = (status) => {
    navigate(`/compliance/versions/${versionId}?scope_type=${scopeType}&scope_id=${scopeId}&status=${status}`);
  };

  // Top Gaps table
  const gapCols = [
    { field: "code", headerName: "Code", width: 120 },
    { field: "title", headerName: "Requirement", flex: 1, minWidth: 240 },
    { field: "scope", headerName: "Scope", width: 140, valueGetter: (p) => p?.row?.scope || scopeType },
    { field: "status", headerName: "Status", width: 120, renderCell: (p) => <StatusChip value={p.row?.status} exception={p.row?.exception_applied} /> },
    { field: "score", headerName: "Score", width: 110, valueFormatter: ({ value }) => `${Math.round((value ?? 0) * 100)}%` },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      renderCell: (p) => (
        <Button
          size="small"
          variant="outlined"
          component={RouterLink}
          to={`/tickets/new?source=requirement&code=${encodeURIComponent(p.row.code || "")}`}
        >
          Create ticket
        </Button>
      ),
    },
  ];

  const cols = React.useMemo(() => [
    { field: "code", headerName: "Code", width: 120 },
    { field: "title", headerName: "Requirement", flex: 1, minWidth: 240 },
    { field: "scope_type", headerName: "Scope", width: 120,
      valueGetter: (p) => scopeType },
    { field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <StatusChip value={p.row?.status} /> },
    { field: "score", headerName: "Score", width: 110,
      valueFormatter: ({ value }) => `${Math.round((value ?? 0) * 100)}%` },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Compliance Dashboard</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Last computed: {kpi?.lastComputedAt ? new Date(kpi.lastComputedAt).toLocaleString() : "—"}
          </Typography>
          <Button size="small" variant="contained" color="primary" disabled>
            Compute Now
          </Button>
        </Stack>
      </Stack>

      {/* Q1: Framework tabs row (pills) */}
      <FrameworkTabs />
      {/* <FrameworkTabs
        activations={activations}
        activeVersionId={versionId}
        onPick={handlePickFramework}
      /> */}

      {/* KPI strip (Q4 layout: 4 cards) */}
      <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Coverage %" hint="Includes exceptions"
                   value={kpi ? fmtPct(kpi.coveragePct) : null}
                   onClick={() => drillToExplorer("met,partial,gap,unknown")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Coverage (no exceptions)"
                   value={kpi ? fmtPct(kpi.coveragePctNoEx) : null}
                   onClick={() => drillToExplorer("met,partial,gap,unknown")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Met" value={kpi?.met ?? null}
                   tone="success"
                   onClick={() => drillToExplorer("met")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Gaps" value={kpi?.gap ?? null}
                   tone="error"
                   onClick={() => drillToExplorer("gap")}
          />
        </Grid>
      </Grid>

      {/* Main: Heatmap (8 cols) + Right column (Evidence + Exceptions) */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Heatmap</Typography>
              <Box sx={{ mt: 1 }}>
                {/* <CoverageHeatmap
                  onCellClick={({ scopeType, status }) => {
                    // Deep-link to explorer view with defaults (scope_id=1 if your backend requires it)
                    navigate(`/compliance/versions/${versionId}?scope_type=${scopeType}&scope_id=1&status=${status}`);
                  }}
                /> */}
                <CoverageHeatmap 
                versionId={Number(versionId)} 
                onCellClick={handleHeatmapCell}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Bottom: Top gaps table */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary">Top gaps Scope {scopeType}</Typography>
                <Button
                  component={RouterLink}
                  to={`/compliance/versions/${versionId}?scope_type=${scopeType}&scope_id=${scopeId}`}
                  size="small"
                  variant="outlined"
                >
                  Open Explorer
                </Button>
              </Stack>
              <Box sx={{ height: 360 }}>
                <DataGrid
                  rows={rows}
                  columns={cols}
                  density="compact"
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  pageSizeOptions={[5]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  getRowId={(r) => `${r.id || r.code}-${r.title}`}
                  onRowClick={({ row }) => {
                    openPanel("requirement", { versionId, ...row }, `Requirement ${row.code || row.id || ""}`);
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Coverage trend */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">30/30-Day Coverage Trend</Typography>
              <Box sx={{ mt: 1 }}>
                <CoverageTrend trend={trend} kpi={kpi} />
              </Box>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Evidence</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip
                  label={`Expired: ${evi.expired_count}`}
                  onClick={() => openPanel('evidence-bucket', { bucket: 'expired' }, 'Evidence • Expired')}
                />
                <Chip
                  label={`Expiring (30d): ${evi.expiring_soon_count}`}
                  onClick={() => openPanel('evidence-bucket', { bucket: 'expiring_soon' }, 'Evidence • Expiring Soon')}
                />
              </Stack>
              {(!evi.expired_count && !evi.expiring_soon_count) && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  All good. Keep evidence fresh to maintain coverage.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Exceptions (from KPI) */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" color="text.secondary">Exceptions</Typography>
                <MuiLink component={RouterLink} to={`/compliance/versions/${versionId}?scope_type=${scopeType}&scope_id=${scopeId}&status=met`} underline="hover">
                  View in Explorer
                </MuiLink>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Met by exception: <strong>{kpi?.metByException ?? 0}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <RightPanelDrawer
        open={panel.open}
        onClose={closePanel}
        title={panel.title}
        initialWidth={560}
      >
        {renderPanelContent(panel)}
      </RightPanelDrawer>
    </Box>
  );
}

// ---------------------------------
//  Components
// ---------------------------------

function KpiCard({ label, value, hint, tone, onClick }) {
  const clickable = Boolean(onClick);
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: clickable ? "pointer" : "default",
        "&:hover": clickable ? { boxShadow: 6 } : undefined,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ mt: 0.5, color: tone ? TOKENS[tone] : "inherit" }}>
          {value != null ? value : <Skeleton width={72} />}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function CoverageTrend({ trend, kpi }) {
  const data = (trend && trend.length ? trend : (kpi ? [{
    ts: kpi.lastComputedAt,
    coverage: kpi.coveragePct,
    coverage_no_ex: kpi.coveragePctNoEx,
  }] : [])).map(d => ({
    name: d.ts ? new Date(d.ts).toLocaleDateString() : "",
    a: d.coverage ?? 0,
    b: d.coverage_no_ex ?? 0,
  }));

  if (!data.length) {
    return <Typography variant="caption" color="text.secondary">No trend data yet.</Typography>;
  }

  return (
    <Box sx={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={30} />
          <RechartsTooltip formatter={(v) => `${Math.round(v)}%`} />
          <Line type="monotone" dataKey="a" stroke="#2e7d32" dot={false} name="Coverage" />
          <Line type="monotone" dataKey="b" stroke="#9e9e9e" dot={false} name="Coverage (excl. exc.)" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}



// ---------------------------------
//  Helpers
// ---------------------------------
function RequirementDetailMini({ payload }) {
  if (!payload) return null;
  const { code, title, status, score, versionId } = payload;

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Requirement</Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>{code || "—"}</Typography>
      {title && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {typeof status !== "undefined" && <StatusChip value={status} />}
        {typeof score !== "undefined" && (
          <Chip size="small" label={`Score ${Math.round((score ?? 0) * 100)}%`} />
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>What’s next?</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          variant="contained"
          size="small"
          component={RouterLink}
          to={`/compliance/versions/${versionId || ""}`}
        >
          Open Explorer
        </Button>
        <Button variant="outlined" size="small" disabled>
          View Evidence (soon)
        </Button>
        <Button variant="outlined" size="small" disabled>
          Lifecycle (soon)
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Tip: we’ll wire this to real detail (lifecycle + evidence) next—this stub just shows the row you clicked.
      </Typography>
    </Box>
  );
}

function renderPanelContent(panel) {
  if (!panel?.open) return null;
  switch (panel.mode) {
    case "requirement":
      return <RequirementDetailMini payload={panel.payload} />;
    case "slice-list":
      return <Typography variant="body2">Slice list (coming soon)</Typography>;
    case "evidence-bucket":
      return <Typography variant="body2">Evidence bucket (coming soon)</Typography>;
    default:
      return null;
  }
}



// Build a minimal heatmap dataset.
// If per-item scope is unavailable, return a single "Current scope" row.
function groupIntoHeatmap(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  // Try to detect a scope-like field
  const scopeKey = ["scope_name", "asset_group", "asset_type", "scope"]
    .find(k => items.some(i => i[k]));
  if (!scopeKey) {
    // Single row from counts
    const counts = { met: 0, partial: 0, gap: 0, unknown: 0 };
    items.forEach(i => {
      const s = (i.status || "unknown").toLowerCase();
      if (counts[s] == null) counts.unknown += 1;
      else counts[s] += 1;
    });
    return [{ scope: "Current Scope", ...counts }];
  }

  // Group by detected scopeKey
  const map = new Map();
  for (const i of items) {
    const key = i[scopeKey] || "—";
    if (!map.has(key)) map.set(key, { met: 0, partial: 0, gap: 0, unknown: 0 });
    const s = (i.status || "unknown").toLowerCase();
    const row = map.get(key);
    if (row[s] == null) row.unknown += 1;
    else row[s] += 1;
  }

  return Array.from(map.entries()).map(([scope, counts]) => ({ scope, ...counts }));
}

