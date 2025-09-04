import * as React from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, Chip,
  Button, Tooltip, IconButton, LinearProgress, Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
// Icons (all MUI)
import FrameworkTile from "../components/FrameworkTile";
import { getJSON } from "../../../api/httpClient";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import BoltIcon from "@mui/icons-material/Bolt";
import RuleIcon from "@mui/icons-material/Rule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import InsightsIcon from "@mui/icons-material/Insights";
import FactCheckIcon from "@mui/icons-material/FactCheck";

// --- toggle when you’re ready to hit backend (keeps MOCK by default)
const ENABLE_LIVE = false;

// --- adapters (accept different backend shapes safely)
function toNumber(n, d = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : d;
}

function mapFrameworkRow(row = {}) {
  // Accepts either framework_version list rows or rollup rows
  const coverage = toNumber(row.coverage_pct ?? row.coverage ?? 0);
  const fresh    = toNumber(row.evidence_fresh_pct ?? row.freshness ?? 0);
  const effReq   = toNumber(row.effective_requirements ?? row.effReq ?? 0);
  const totalReq = toNumber(row.requirements_total ?? row.totalReq ?? 0);
  const ctrlImpl = toNumber(row.controls_implemented ?? row.controlsImpl ?? 0);
  const ctrlTot  = toNumber(row.controls_total ?? row.totalControls ?? 0);
  const enabled  = row.enabled ?? true;

  return {
    enabled,
    version_id: row.version_id ?? row.id,
    code: row.framework_code ?? row.code ?? row.framework ?? "",
    name: row.framework_name ?? row.name ?? "",
    coverage,                    // 0..1 expected by UI
    freshness: fresh,            // 0..1 expected by UI
    status: row.status ?? (fresh < 0.8 ? "Attention" : "Healthy"),
    effReq: effReq,
    totalReq: totalReq,
    controlsImpl: ctrlImpl,
    totalControls: ctrlTot,
    topGaps: row.top_gaps ?? [],
  };
}

async function fetchFrameworkTiles({ versionId, scope }) {
  // STEP 1 placeholder: when you give the endpoint, fill it here.
  // Example (commented until endpoint is confirmed):
  // const list = await getJSON("framework_versions", { params: { offset: 0, limit: 50, sort_by: "framework_name", sort_dir: "asc" }});
  // const rows = Array.isArray(list) ? list : (list.items || list.results || []);
  // return rows.map(mapFrameworkRow);
  return []; // no-op until we switch ENABLE_LIVE
}



// ---- Static mock data (investor demo) ----
const MOCK = {
  context: { versionLabel: "All frameworks", scopeChips: ["org#1"] },
  kpis: {
    frameworks: 4,
    requirements: { total: 462, effective: 303, mapped: 352 },
    avgCoverage: 0.68, // 68%
    avgFreshness: 0.66, // 66%
    deltaCoverage: +0.03, // +3% since last 30d
    deltaFreshness: -0.01, // -1% since last 30d
  },
  frameworks: [
    {
      enabled: true,
      version_id: 1,
      code: "ISO27001",
      name: "ISO/IEC 27001:2022",
      coverage: 0.77,
      freshness: 0.64,
      status: "Attention",
      effReq: 72,
      totalReq: 93,
      controlsImpl: 58,
      totalControls: 93,
      topGaps: ["A.8.16", "A.5.13"],
    },
    {
      enabled: true,
      version_id: 1,
      code: "GDPR",
      name: "General Data Protection Regulation",
      coverage: 0.56,
      freshness: 0.60,
      status: "Attention",
      effReq: 55,
      totalReq: 99,
      controlsImpl: 47,
      totalControls: 93,
      topGaps: ["Art. 32", "Art. 30"],
    },
    {
      enabled: true,
      version_id: 1,
      code: "DORA",
      name: "Digital Operational Resilience Act",
      coverage: 0.65,
      freshness: 0.71,
      status: "Healthy",
      effReq: 78,
      totalReq: 120,
      controlsImpl: 61,
      totalControls: 93,
      topGaps: ["ICT 12", "Gov 03"],
    },
    {
      enabled: false,
      version_id: 1,
      code: "BSI",
      name: "BSI Grundschutz",
      coverage: 0.73,
      freshness: 0.69,
      status: "Attention",
      effReq: 98,
      totalReq: 150,
      controlsImpl: 70,
      totalControls: 93,
      topGaps: ["INF.2", "OPS.1.1"],
    },
  ],
  actNow: {
    gaps: [
      { id: 1, label: "GDPR — Art.32", reason: "Encryption/logging partial", cta: "Fix" },
      { id: 2, label: "ISO — A.8.16", reason: "Monitoring evidence stale", cta: "Add Evidence" },
      { id: 3, label: "DORA — ICT 12", reason: "Mapping missing", cta: "Map" },
    ],
    evidenceDue: [
      { id: 11, label: "A.5.1 Policy review", due: "2025-09-30", scope: "org#1" },
      { id: 12, label: "A.8.12 Log retention", due: "2025-09-25", scope: "site#3" },
    ],
    suggestions: { unmapped: 14 },
  },
};


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


// --- Header (sticky) — leaves KPI section unchanged -------------------------
function HeaderBar({ versionLabel = "All frameworks", scopeChips = ["org#1"] }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: (t) => t.palette.background.paper,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        py: 1,
        px: 1,
        mb: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Compliance — All frameworks
          </Typography>
          <Chip label={versionLabel} size="small" />
          <Stack direction="row" spacing={1}>
            {scopeChips.map((c) => (
              <Chip key={c} label={c} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" startIcon={<RuleIcon />}>As of: 2025-09-01</Button>
          <Button size="small" startIcon={<CloudDownloadIcon />}>Export</Button>
          <Button size="small" variant="contained" startIcon={<WarningAmberIcon />}>
            Auto-Fix Preview
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function Bar({ value, threshold = 0.7, title }) {
  const pct = Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
  const tickLeft = `${Math.round(threshold * 100)}%`;
  return (
    <Box sx={{ position: "relative" }}>
      <Tooltip title={title || `${pct}%`}>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
      </Tooltip>
      <Box
        sx={{
          position: "absolute", top: -2, left: tickLeft, width: 2, height: 12,
          bgcolor: (t) => t.palette.divider, borderRadius: 1, transform: "translateX(-1px)"
        }}
      />
    </Box>
  );
}


function pct(n) {
  const v = Math.max(0, Math.min(1, Number(n ?? 0)));
  return Math.round(v * 100);
}

function fmt(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
}

export default function ComplianceDashboardMulti() {
  // const { context, kpis, frameworks, actNow } = MOCK;
  const { context, actNow } = MOCK;
  const theme = useTheme();

  const [kpis, setKpis] = React.useState(MOCK.kpis);
  const [frameworks, setFrameworks] = React.useState(MOCK.frameworks);
  const [loading, setLoading] = React.useState(false);

  // STEP 1: frameworks list (safe no-op until ENABLE_LIVE = true)
  React.useEffect(() => {
    if (!ENABLE_LIVE) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const tiles = await fetchFrameworkTiles({ /* versionId, scope */ });
        if (alive && tiles?.length) setFrameworks(tiles);
        // (Optional later) setKpis(...) from another endpoint
      } catch (e) {
        console.warn("Dashboard live fetch failed, using MOCK.", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // STEP 2: map frameworks to rows for summary table
  const rows = frameworks.map((f, i) => ({
    id: i + 1,
    framework: `${f.code}`,
    name: f.name,
    version: f.code === "ISO27001" ? "2022" : f.code === "GDPR" ? "2016/679" : f.code === "DORA" ? "EU 2022/2554" : "-",
    coveragePct: Math.round(f.coverage * 100),
    freshnessPct: Math.round(f.freshness * 100),
    effReq: f.effReq,
    mapped: f.controlsImpl,
    total: f.totalControls,
    status: f.status,
  }));

  const columns = [
    { field: "framework", headerName: "Framework", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1.2 },
    { field: "version", headerName: "Version", flex: 0.5 },
    {
      field: "coveragePct", headerName: "Coverage", flex: 0.6,
      renderCell: (p) => <Stack direction="row" spacing={1} alignItems="center"><Bar value={(p.value ?? 0) / 100} /><Typography variant="caption" sx={{ ml: 1 }}>{p.value}%</Typography></Stack>
    },
    {
      field: "freshnessPct", headerName: "Freshness", flex: 0.6,
      renderCell: (p) => <Stack direction="row" spacing={1} alignItems="center"><Bar value={(p.value ?? 0) / 100} threshold={0.8} /><Typography variant="caption" sx={{ ml: 1 }}>{p.value}%</Typography></Stack>
    },
    { field: "effReq", headerName: "Eff.", flex: 0.35 },
    { field: "mapped", headerName: "Controls", flex: 0.45 },
    { field: "total", headerName: "Total", flex: 0.35 },
    {
      field: "actions", headerName: "Actions", sortable: false, flex: 0.8,
      renderCell: () => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined">Open</Button>
          <Button size="small" variant="outlined">Map</Button>
        </Stack>
      )
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Sticky header */}
      <HeaderBar />
      
      {/* Top colorful KPI cards */}
       <Grid container spacing={2} sx={{ mb: 2 }} size={12}>
         <Grid    size={3}>
           {topCard(
            {
              label: "Frameworks",
              value: `${kpis.frameworks}`,
              hint: "Active in scope",
              icon: LibraryBooksIcon,
              color: "secondary",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Requirements",
              value: `${fmt(kpis.requirements.total)}`,
              hint: `Eff.: ${fmt(kpis.requirements.effective)} · Map.: ${fmt(kpis.requirements.mapped)}`,
              icon: AssignmentTurnedInIcon,
              color: "success",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Avg. Coverage",
              value: `${pct(kpis.avgCoverage)}%`,
              hint: "Avg across frameworks",
              icon: InsightsIcon,
              color: "info",
            },
            theme
          )}
        </Grid>
        <Grid    size={3}>
          {topCard(
            {
              label: "Avg. Freshness",
              value: `${pct(kpis.avgFreshness)}%`,
              hint: "Evidence within policy",
              icon: FactCheckIcon,
              color: "warning",
            },
            theme
          )}
        </Grid>
      </Grid>

      {/* Main grid: tiles + rail */}
      <Grid container spacing={2} size={12}>
        <Grid   size={12}>
          <Grid container spacing={2} size={12}>
            {frameworks.map((fx) => (
              <Grid key={fx.code} size={6}>
                <FrameworkTile fx={fx} />
              </Grid>
            ))}
          </Grid>

          {/* Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary">Framework summary</Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Copy deep link"><IconButton size="small"><LinkIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Open full report"><IconButton size="small"><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <div style={{ width: "100%" }}>
                <DataGrid
                  autoHeight
                  density="compact"
                  rows={rows}
                  columns={columns}
                  hideFooterSelectedRowCount
                  initialState={{
                    sorting: { sortModel: [{ field: "freshnessPct", sort: "asc" }] }
                  }}
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        
      </Grid>
    </Box>
  );
}

