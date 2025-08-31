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

import { adaptSummaryToKpis, adaptStatusPage } from "../../../api/adapters/compliance";
import { DEFAULT_SCOPE } from "../../../app/constants";
import FrameworkTabs from "../components/FrameworkTabs";

import { useContext, useEffect } from "react";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
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

  
  // Data state
  const [kpi, setKpi] = React.useState(null);
  const [activations, setActivations] = React.useState([]);
  const [evi, setEvi] = React.useState({ expired_count: 0, expiring_soon_count: 0 });
  const [gaps, setGaps] = React.useState([]);
  const [heatmapRows, setHeatmapRows] = React.useState([]); // Q2
  const [trend, setTrend] = React.useState([]);             // Q3/Q4 (graceful empty)

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



  // when context version changes, ensure path matches it
  

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
                <CoverageHeatmap
                  rows={heatmapRows}
                  onCellClick={(row, column) => {
                    if (!column) return;
                    // deep-link with status + optional future scope row
                    drillToExplorer(column);
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Bottom: Top gaps table */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary">Top gaps (lowest scores)</Typography>
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
                  rows={gaps}
                  columns={gapCols}
                  density="compact"
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  pageSizeOptions={[5]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  getRowId={(r) => `${r.id || r.code}-${r.title}`}
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
                <Chip label={`Expired: ${evi.expired_count}`} sx={{ bgcolor: TOKENS.error, color: "#fff" }} />
                <Chip label={`Expiring (30d): ${evi.expiring_soon_count}`} sx={{ bgcolor: TOKENS.warning, color: "#fff" }} />
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

// Q1: Framework tabs as pills
// function FrameworkTabs({ activations, activeVersionId, onPick }) {
//   const options = (activations || []).map((a) => ({
//     id: a.version_id,
//     label: `${a.framework_name}${a.version_label ? ` ${a.version_label}` : ""}`,
//     active: !!a.is_active_now,
//   }));

//   if (!options.length) {
//     return (
//       <Card sx={{ mb: 2 }}>
//         <CardContent>
//           <Typography variant="body2" color="text.secondary">
//             No active frameworks at this scope. Configure under{" "}
//             <MuiLink component={RouterLink} to="/policies/framework-activation">Policies → Framework Activation</MuiLink>.
//           </Typography>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card sx={{ mb: 2 }}>
//       <CardContent sx={{ py: 1.5 }}>
//         <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
//           <Typography variant="overline" color="text.secondary" sx={{ mr: 1 }}>Frameworks</Typography>
//           <ToggleButtonGroup
//             value={activeVersionId}
//             exclusive
//             size="small"
//             onChange={(_, v) => v && onPick(v)}
//           >
//             {options.map((o) => (
//               <ToggleButton key={o.id} value={o.id} sx={{ textTransform: "none" }}>
//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <span>{o.label}</span>
//                   {o.active && <Chip size="small" color="primary" label="Active" />}
//                 </Stack>
//               </ToggleButton>
//             ))}
//           </ToggleButtonGroup>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }


// Q2: Heatmap (simple, dependency-free, click to drill)
function CoverageHeatmap({ rows, onCellClick }) {
  const columns = [
    { key: "met", label: "Met", color: TOKENS.success },
    { key: "partial", label: "Partial", color: TOKENS.warning },
    { key: "gap", label: "Gap", color: TOKENS.error },
    { key: "unknown", label: "Unknown", color: TOKENS.grey },
  ];

  if (!rows || !rows.length) {
    return <Typography variant="caption" color="text.secondary">No breakdown available for heatmap.</Typography>;
  }

  return (
    <Box sx={{ borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
      {/* header */}
      <Stack direction="row" sx={{ bgcolor: "background.default", px: 1.5, py: 1 }}>
        <Box sx={{ width: 180, fontSize: 12, color: "text.secondary" }}>Scope</Box>
        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
          {columns.map((c) => (
            <Box key={c.key} sx={{ flex: 1, fontSize: 12, color: "text.secondary" }}>{c.label}</Box>
          ))}
        </Stack>
      </Stack>
      <Divider />
      {/* rows */}
      <Stack>
        {rows.map((r, idx) => (
          <Stack key={`${r.scope}-${idx}`} direction="row" alignItems="center" sx={{ px: 1.5, py: 1 }}>
            <Box sx={{ width: 180, fontSize: 14 }}>{r.scope}</Box>
            <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
              {columns.map((c) => (
                <Tooltip key={c.key} title={`${c.label}: ${r[c.key] ?? 0}`} placement="top">
                  <Box
                    role="button"
                    onClick={() => onCellClick?.(r, c.key)}
                    sx={{
                      flex: 1,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: c.color,
                      opacity: (r[c.key] ?? 0) === 0 ? 0.18 : 0.9,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {r[c.key] ?? 0}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// Q3/Q4: Trend (line chart with graceful empty state)
// Uses current KPI to render a single point if no history exists.
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


// import * as React from "react";
// import {
//   Box, Grid, Card, CardContent, Typography, Stack, Chip, Button, Alert, LinearProgress
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { Link as RouterLink, useSearchParams, useParams, useNavigate } from "react-router-dom";

// import {
//   fetchComplianceSummary,
//   fetchActiveFrameworks,
//   fetchStaleEvidence,
//   fetchRequirementsStatusPage
// } from "../../../api/services/compliance";

// import { adaptSummaryToKpis, adaptStatusPage } from "../../../api/adapters/compliance";
// import StatusChip from "../../../components/ui/StatusChip.jsx";
// import { DEFAULT_SCOPE } from "../../../app/constants.js";

// export default function ComplianceDashboard() {
//   const navigate = useNavigate();
//   const { versionId: routeVersion } = useParams();
//   const [sp] = useSearchParams();

//   // --- Resolve scope from URL or defaults
//   const scopeType = sp.get("scope_type") || DEFAULT_SCOPE.scopeType || "org";
//   const scopeId = Number(sp.get("scope_id") || DEFAULT_SCOPE.scopeId || 1);

//   // If versionId is not provided, we’ll discover it from active frameworks
//   const urlVersionId = (() => {
//     const v = Number(routeVersion || sp.get("version_id"));
//     return Number.isFinite(v) && v > 0 ? v : null;
//   })();

//   // --- UI state
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   const [resolvedVersionId, setResolvedVersionId] = React.useState(urlVersionId);
//   const [kpi, setKpi] = React.useState(null);
//   const [activations, setActivations] = React.useState([]);
//   const [evi, setEvi] = React.useState({ expired_count: 0, expiring_soon_count: 0 });
//   const [gaps, setGaps] = React.useState([]);

//   // helper: derive a usable version id from activations payload
//   const pickVersionId = React.useCallback((items) => {
//     if (!Array.isArray(items) || items.length === 0) return null;
//     const first = items[0];
//     return (
//       first?.version_id ??
//       first?.framework_version_id ??
//       first?.latest_version_id ??
//       null
//     );
//   }, []);

//   // Keep URL in sync once we resolve a version (nice to have)
//   React.useEffect(() => {
//     if (!resolvedVersionId) return;
//     const params = new URLSearchParams(sp);
//     params.set("scope_type", scopeType);
//     params.set("scope_id", String(scopeId));
//     params.set("version_id", String(resolvedVersionId));
//     // Avoid pushing a new entry if nothing changed
//     const newSearch = `?${params.toString()}`;
//     if (newSearch !== `?${sp.toString()}`) {
//       navigate({ search: newSearch }, { replace: true });
//     }
//   }, [resolvedVersionId, scopeType, scopeId]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Main loader: fetch activations → decide version → then load summary/evidence/gaps
//   React.useEffect(() => {
//     let abort = new AbortController();
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // 1) Get active frameworks for scope
//         const af = await fetchActiveFrameworks({ scopeType, scopeId, signal: abort.signal }).catch((e) => {
//           // Not fatal for the whole page; we’ll keep going
//           console.error("active frameworks error:", e);
//           return { items: [] };
//         });
//         const items = af?.items || af || [];
//         setActivations(items);

//         // 2) Decide which version to use (URL wins, otherwise derive)
//         let vId = urlVersionId;
//         if (!vId) vId = pickVersionId(items);
//         if (!vId) {
//           throw new Error(
//             "No framework version available for this scope. Add a framework activation policy or provide ?version_id=… in the URL."
//           );
//         }
//         setResolvedVersionId(vId);

//         // 3) Load summary (requires version_id), evidence, top gaps
//         const [summary, ev, page] = await Promise.all([
//           fetchComplianceSummary({ versionId: vId, scopeType, scopeId, signal: abort.signal }),
//           fetchStaleEvidence({ withinDays: 30, scopeType, scopeId, page: 1, size: 5, signal: abort.signal }),
//           fetchRequirementsStatusPage({
//             versionId: vId,
//             scopeType,
//             scopeId,
//             status: "gap,partial",
//             sortBy: "score",
//             sortDir: "asc",
//             page: 1,
//             size: 5,
//             signal: abort.signal
//           })
//         ]);

//         setKpi(adaptSummaryToKpis(summary));
//         setEvi({
//           expired_count: ev?.expired_count || 0,
//           expiring_soon_count: ev?.expiring_soon_count || 0
//         });
//         setGaps(adaptStatusPage(page).items || []);
//       } catch (e) {
//         console.error(e);
//         setError(e?.message || "Failed to load compliance data.");
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => {
//       abort.abort();
//     };
//   }, [scopeType, scopeId, urlVersionId, pickVersionId]);

//   const Stat = ({ label, value, hint }) => (
//     <Card>
//       <CardContent>
//         <Typography variant="overline" color="text.secondary">{label}</Typography>
//         <Typography variant="h5">{value ?? "—"}</Typography>
//         {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
//       </CardContent>
//     </Card>
//   );

//   const gapCols = [
//     { field: "code", headerName: "Code", width: 120 },
//     { field: "title", headerName: "Requirement", flex: 1, minWidth: 240 },
//     {
//       field: "status",
//       headerName: "Status",
//       width: 120,
//       renderCell: (p) => <StatusChip value={p.row.status} exception={p.row.exception_applied} />
//     },
//     {
//       field: "score",
//       headerName: "Score",
//       width: 110,
//       valueFormatter: ({ value }) => `${Math.round((value ?? 0) * 100)}%`
//     }
//   ];

//   return (
//     <Box sx={{ p: 2 }}>
//       {loading && <LinearProgress sx={{ mb: 2 }} />}
//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* KPI strip */}
//       <Grid container spacing={2} sx={{ mb: 1 }}>
//         <Grid item xs={12} sm={4}>
//           <Stat
//             label="Coverage %"
//             value={kpi ? `${kpi.coveragePct}%` : "—"}
//             hint="Includes exceptions"
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <Stat
//             label="No-exception coverage"
//             value={kpi ? `${kpi.coveragePctNoEx}%` : "—"}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <Card>
//             <CardContent>
//               <Typography variant="overline" color="text.secondary">Status</Typography>
//               <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
//                 <Chip label={`Met ${kpi?.met ?? 0}`} color="success" size="small" />
//                 <Chip label={`Partial ${kpi?.partial ?? 0}`} color="warning" size="small" />
//                 <Chip label={`Gaps ${kpi?.gap ?? 0}`} color="error" size="small" />
//                 <Chip label={`Unknown ${kpi?.unknown ?? 0}`} size="small" />
//               </Stack>
//               <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
//                 Last computed: {kpi?.lastComputedAt ? new Date(kpi.lastComputedAt).toLocaleString() : "—"}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Activations + Evidence */}
//       <Grid container spacing={2}>
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="subtitle2" sx={{ mb: 1 }}>Active frameworks at scope</Typography>
//               <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
//                 {activations.length === 0 ? (
//                   <Typography variant="body2" color="text.secondary">None</Typography>
//                 ) : (
//                   activations.map((a, idx) => (
//                     <Chip
//                       key={`${a.version_id || a.framework_version_id || a.latest_version_id || idx}-${a.policy_id || idx}`}
//                       label={`${a.framework_name} ${a.version_label || ""}`.trim()}
//                       color={a.is_active_now ? "primary" : "default"}
//                       size="small"
//                     />
//                   ))
//                 )}
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="subtitle2" sx={{ mb: 1 }}>Evidence freshness</Typography>
//               <Stack direction="row" spacing={2}>
//                 <Chip label={`Expired: ${evi.expired_count}`} color="error" />
//                 <Chip label={`Expiring (30d): ${evi.expiring_soon_count}`} color="warning" />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Top gaps/partials */}
//         <Grid item xs={12}>
//           <Card>
//             <CardContent>
//               <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
//                 <Typography variant="subtitle2">Top gaps (lowest scores)</Typography>
//                 <Button
//                   component={RouterLink}
//                   to={`/compliance/versions/${resolvedVersionId || ""}?scope_type=${scopeType}&scope_id=${scopeId}`}
//                   size="small"
//                   variant="outlined"
//                   disabled={!resolvedVersionId}
//                 >
//                   Open Explorer
//                 </Button>
//               </Stack>
//               <Box sx={{ height: 360 }}>
//                 <DataGrid
//                   rows={gaps}
//                   columns={gapCols}
//                   getRowId={(r) => r.id || `${r.code}-${r.requirement_id || r.title}`}
//                   density="compact"
//                   disableColumnMenu
//                   hideFooterSelectedRowCount
//                   pageSizeOptions={[5]}
//                   initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
//                 />
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
