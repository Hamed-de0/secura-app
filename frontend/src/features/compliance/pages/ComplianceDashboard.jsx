// src/pages/compliance/ComplianceDashboard.jsx
import * as React from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, Chip, Button, Tooltip as MuiTooltip,
  Divider, Skeleton, Link as MuiLink
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink, useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  fetchComplianceSummary,
  fetchActiveFrameworks,
  fetchStaleEvidence,
  fetchRequirementsStatusPage,
} from "../../../api/services/compliance";
import { adaptSummaryToKpis, adaptStatusPage } from "../../../api/adapters/compliance";
import { DEFAULT_SCOPE } from "../../../app/constants";
import CoverageHeatmap from "../components/CoverageHeatmap.jsx";
import RightPanelDrawer from "../../../components/rightpanel/RightPanelDrawer.jsx";
import RequirementDetailPanel from "../components/RequirementDetailPanel.jsx";
import RequirementsTree from "../components/RequirementsTree.jsx";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import InsightsIcon from "@mui/icons-material/Insights";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {alpha, useTheme } from "@mui/material/styles";  

// Recharts (keep as-is; we already use it)
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";

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

// Color tokens
const TOKENS = {
  success: "#2e7d32",
  warning: "#ed6c02",
  error:   "#d32f2f",
  grey:    "#9e9e9e",
};


function pct(n) {
  const v = Math.max(0, Math.min(1, Number(n ?? 0)));
  return Math.round(v * 100);
}

const fmtPct = (n) => (n == null ? "—" : `${Math.round(n)}%`);

function fmt(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
}
// Sticky header: shows framework id/code/version and active scope
function HeaderBar({ versionId, scopeType, scopeId, activations, kpi }) {
  // try to resolve friendly labels from activations list
  const fx = React.useMemo(() => {
    if (!Array.isArray(activations)) return null;
    return activations.find(
      (a) => Number(a.id ?? a.version_id) === Number(versionId)
    );
  }, [activations, versionId]);

  const code   = fx?.code ?? fx?.framework_code ?? `v${versionId}`;
  const label  = fx?.name ?? fx?.framework_name ?? "Framework";
  const vlabel = fx?.version_label ?? fx?.framework_version_label ?? "";

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: (t) => t.palette.background.paper,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        py: 1,
        mb: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Compliance — {code} {vlabel && <Typography component="span" variant="subtitle2" sx={{ ml: 0.5, color: "text.secondary" }}>{vlabel}</Typography>}
          </Typography>
          <Chip label={`${label}`} size="small" variant="outlined" />
          <Chip label={`${scopeType}#${scopeId}`} size="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Last computed: {kpi?.lastComputedAt ? new Date(kpi.lastComputedAt).toLocaleString() : "—"}
        </Typography>
      </Stack>
    </Box>
  );
}

function topCard({ label, value, hint, icon: Icon, color }, theme) {
  const main = theme.palette[color]?.main || theme.palette.primary.main;
  const dark = theme.palette[color]?.dark || main;
  const fg = theme.palette.getContrastText(main);
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${main} 0%, ${dark} 100%)`,
        color: fg,
        overflow: "hidden",
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: "12px",
              bgcolor: alpha("#000", 0.15),
              display: "inline-flex",
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>
              {value}
            </Typography>
            {hint ? (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {hint}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


export default function ComplianceDashboard() {
  const { versionId: routeVersion } = useParams();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // URL state
  const versionId = Number(routeVersion || sp.get("version_id") || 1);
  const scopeType = sp.get("scope_type") || DEFAULT_SCOPE.scopeType || "org";
  const scopeId   = Number(sp.get("scope_id") || DEFAULT_SCOPE.scopeId || 1);

  // Right panel state
  const [panel, setPanel] = React.useState({ open:false, mode:null, payload:null, title:'' });
  const openPanel  = (mode, payload, title) => setPanel({ open:true, mode, payload, title });
  const closePanel = () => setPanel(p => ({ ...p, open:false }));

  // Data state
  const [kpi, setKpi] = React.useState(null);
  const [activations, setActivations] = React.useState([]);
  const [evi, setEvi] = React.useState({ expired_count: 0, expiring_soon_count: 0 });
  const [trend, setTrend] = React.useState([]);
  const [slice, setSlice] = React.useState(null); // { scopeType, scopeId, status }
  const [rows, setRows] = React.useState([]);
  const [rowsLoading, setRowsLoading] = React.useState(false);

  // Load page data
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

      // (Trend optional – keep empty if not provided)
      setTrend([]);
    })();
    return () => { ignore = true; };
  }, [versionId, scopeType, scopeId]);

  // Heatmap → list fetch
  const handleHeatmapCell = React.useCallback((cell) => {
    // cell = { scopeType, scopeId, status }
    setSlice(cell);
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!slice || !versionId) return;
      setRowsLoading(true);
      try {
        const resp = await fetchRequirementsStatusPage({
          versionId,
          scopeType: slice.scopeType ?? scopeType,
          scopeId:   slice.scopeId   ?? scopeId,
          status: slice.status,            // e.g. "met" or "gap,partial"
          page: 1,
          size: 50,
          sortBy: "code",
          sortDir: "asc",
        });
        const { items } = adaptStatusPage(resp);
        if (alive) setRows(items || []);
      } catch (e) {
        console.error("coverage list error", e);
        if (alive) setRows([]);
      } finally {
        if (alive) setRowsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slice, versionId, scopeType, scopeId]);

  // DataGrid columns
  const cols = React.useMemo(() => [
    { field: "code", headerName: "Code", width: 120 },
    { field: "title", headerName: "Requirement", flex: 1, minWidth: 240 },
    { field: "scope_type", headerName: "Scope", width: 120,
      valueGetter: () => scopeType },
    { field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <StatusChip value={p.row?.status} /> },
    { field: "score", headerName: "Score", width: 110,
      valueFormatter: ({ value }) => `${Math.round((value ?? 0) * 100)}%` },
  ], [scopeType]);

  // Row click → open drawer with detail panel
  const handleRowClick = React.useCallback(({ row }) => {
    const requirementId = row.id ?? row.requirement_id;
    openPanel(
      "requirement",
      {
        requirementId,
        code: row.code,
        title: row.title,
        versionId,
        scopeType,
        scopeId,
      },
      `Requirement ${row.code || requirementId || ""}`
    );
  }, [versionId, scopeType, scopeId]);

    // From tree → open same drawer (current scope)
  const handlePickRequirementFromTree = React.useCallback((node) => {
    openPanel(
      "requirement",
      {
        requirementId: node.id,
        code: node.code,
        title: node.title,
        versionId,
        scopeType,
        scopeId,
      },
      `Requirement ${node.code}`
    );
  }, [versionId, scopeType, scopeId]);

  

  const drillToExplorer = (status) => {

    navigate(`/compliance/versions/${versionId}?scope_type=${scopeType}&scope_id=${scopeId}&status=${status}`);
  };

  const drillToRequirement = (requirementId, opts = {}) => {
    const params = new URLSearchParams();
    params.set("version_id", String(versionId));
    if (scopeType) params.set("scope_type", scopeType);
    if (scopeId != null) params.set("scope_id", String(scopeId));
    if (opts.tab) params.set("tab", opts.tab);            // optional (e.g., 'evidence')
    if (Array.isArray(opts.kinds)) opts.kinds.forEach(k => params.append("kinds", k)); // optional for timeline
    navigate(`/compliance/requirement/${requirementId}?${params.toString()}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Sticky header (framework  scope  timestamp) */}
      <HeaderBar
        versionId={versionId}
        scopeType={scopeType}
        scopeId={scopeId}
        activations={activations}
        kpi={kpi}
      />

      {/* Top colorful KPI cards */}
       <Grid container spacing={2} sx={{ mb: 2 }} size={12}>
         <Grid    size={3}>
           {topCard(
            {
              label: "Requirements",
              value: `${kpi?.total ?? 0}`,
              hint: `${kpi?.applicable ?? 0} Applicable`,
              icon: LibraryBooksIcon,
              color: "secondary",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Controls",
              value: `${kpi?.met ?? 0}`,
              hint: `Partial: ${fmt(kpi?.partial ?? 0)} · Gap: ${fmt(kpi?.gap ?? 0)} · Unknown: ${fmt(kpi?.unknown ?? 0)}`,
              icon: AssignmentTurnedInIcon,
              color: "success",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Coverage",
              value: `${kpi ? fmtPct(kpi.coveragePctNoEx) : 0}`,
              hint: `Converage (incl. exceptions): ${kpi ? fmtPct(kpi.coveragePct) : 0}`,
              icon: InsightsIcon,
              color: "info",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Evidence",
              value: `${pct(0)}%`,
              hint: "Evidence within policy",
              icon: FactCheckIcon,
              color: "warning",
            },
            theme
          )}
        </Grid>
      </Grid>

      {/* Main layout */}
      {/* Main layout — Row 1: Heatmap  Requirements tree */}
      <Grid container spacing={2} size={12}>
        <Grid size={5}>
          <Card>
            <CardContent>
              
              <Box sx={{ mt: 1 }}>
                <CoverageHeatmap
                  versionId={Number(versionId)}
                  onCellClick={handleHeatmapCell}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={7}>
          <Card>
            <CardContent>
              <RequirementsTree
                versionId={Number(versionId)}
                onPick={handlePickRequirementFromTree}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Slice table (from heatmap), Trend, Evidence/Exceptions */}
      <Grid container spacing={2} sx={{ mt: 2 }} size={12}>
        <Grid size={8}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  {slice ? `Requirements — ${slice.scopeType || scopeType} • ${slice.status}` : "Requirements"}
                </Typography>
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
                  loading={rowsLoading}
                  columns={cols}
                  density="compact"
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  pageSizeOptions={[10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  getRowId={(r) => r.id ?? `${r.code}-${r.title}`}
                  onRowClick={handleRowClick}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">30/30-Day Coverage Trend</Typography>
              <Box sx={{ mt: 1 }}>
                <CoverageTrend trend={trend} kpi={kpi} />
              </Box>
            </CardContent>
          </Card>
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

      {/* Right Panel */}
      <RightPanelDrawer
        open={panel.open}
        onClose={closePanel}
        title={panel.title}
        initialWidth={560}
      >
        {renderPanelContent(panel, { versionId, scopeType, scopeId, navigate })}
      </RightPanelDrawer>
    </Box>
  );
}

// ---------------- Components ----------------

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

// Right panel router
function renderPanelContent(panel, ctx) {
  if (!panel?.open) return null;
  switch (panel.mode) {
    case "requirement": {
      const p = panel.payload || {};
      return (
        <RequirementDetailPanel
          requirementId={p.requirementId}
          versionId={p.versionId ?? ctx.versionId}
          scopeType={p.scopeType ?? ctx.scopeType}
          scopeId={p.scopeId ?? ctx.scopeId}
          onOpenExplorer={() =>
            ctx.navigate(`/compliance/requirement/${p.requirementId}`)
          }
          headerFallback={{ code: p.code, title: p.title }}
        />
      );
    }
    case "evidence-bucket":
      return <Typography variant="body2">Evidence bucket (coming soon)</Typography>;
    default:
      return null;
  }
}
