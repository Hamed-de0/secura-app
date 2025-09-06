import * as React from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack, Chip,
  Button, Tooltip, IconButton, LinearProgress, Divider
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RuleIcon from "@mui/icons-material/Rule";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import KpiTile from "../components/KpiTile.jsx";
import { getJSON } from "../../../api/httpClient.js"

import { DataGrid } from "@mui/x-data-grid";
import { useI18n } from '../../../store/i18n/I18nProvider.jsx';

/** ---------- Static MOCK (edit freely later) ---------- */
 const MOCK = {
  scopeChip: "org#1",
  asOf: "2025-09-05",
  kpis: {
    openRisks: { total: 14, detail: "5 high • 4 medium • 5 low" },
    coverageAvg: { pct: 0.68, delta30d: +0.03 },
    freshnessAvg: { pct: 0.66, delta30d: -0.01 },
    evidenceDue30d: { total: 3, overdue: 0 },
  },
  donuts: {
    controls: { title: "Controls status", pass: 76, fail: 14, na: 10 },
    soa: { title: "SoA applicability", applicable: 83, na: 12, unknown: 5 },
    risks: { title: "Risks mix", low: 45, medium: 32, high: 23 },
  },
  frameworks: [
    { code: "ISO 27001", coverage: 0.78 },
    { code: "SOC 2", coverage: 0.69 },
    { code: "PCI", coverage: 0.61 },
    { code: "NIST CSF", coverage: 0.57 },
  ],
  tasks: {
    evidence: [
      { id: 11, label: "Upload firewall change log (Aug)", sub: "Req A.8.8 • due 2025-09-05", status: "overdue" },
      { id: 12, label: "Access recertification report", sub: "Control AC-02 • due 2025-09-10", status: "pending" },
      { id: 13, label: "Key rotation logs", sub: "Control SC-12 • due 2025-09-25", status: "new" },
    ],
    exceptions: [
      { id: 21, label: "VPN split-tunnel", sub: "Awaiting approval", status: "pending" },
      { id: 22, label: "Legacy TLS allowed", sub: "Awaiting approval", status: "pending" },
    ],
    suggestions: 14,
  },
  table: [
    { id: 1, area: "Compliance", item: "Review GDPR Art.32 mappings", owner: "Security", due: "2025-09-10", cta: "Map" },
    { id: 2, area: "Evidence", item: "Upload SOC2 quarterly logs", owner: "Ops", due: "2025-09-12", cta: "Upload" },
    { id: 3, area: "Risk", item: "Close 'Phishing' treatment task", owner: "IT", due: "2025-09-18", cta: "Open" },
  ],
};
/** ---------- Small UI helpers (no new deps) ---------- */
const COLORS = { success: "#2e7d32", warning: "#ed6c02", error: "#d32f2f", grey: "#9e9e9e" };
const pct = (v) => Math.round((v ?? 0) * 100);


/** Donut with legend (CSS conic-gradient, no libs). values is array of {label, value, color}. */
function Donut({ title, values }) {
  const total = values.reduce((s, v) => s + v.value, 0) || 1;
  let acc = 0;
  const stops = values.map((v) => {
    const start = (acc / total) * 360;
    acc += v.value;
    const end = (acc / total) * 360;
    return `${v.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
          <Box sx={{
            width: 140, height: 140, borderRadius: "50%",
            backgroundImage: `conic-gradient(${stops})`,
            position: "relative"
          }}>
            <Box sx={{
              position: "absolute", inset: 12, borderRadius: "50%",
              bgcolor: (t) => t.palette.background.paper, display: "grid", placeItems: "center"
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{total}</Typography>
              <Typography variant="caption" color="text.secondary">total</Typography>
            </Box>
          </Box>
          <Stack spacing={1}>
            {values.map((v) => (
              <Stack key={v.label} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: v.color }} />
                <Typography variant="body2" sx={{ minWidth: 90 }}>{v.label} </Typography>
                {/* <Typography variant="caption" color="text.secondary">{v.value} ({pct(v.value / total)}%)</Typography> */}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">{pct(v)}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct(v)} sx={{ height: 10, borderRadius: 5 }} />
    </Stack>
  );
}

function ActionsRail({ data }) {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="overline">My tasks</Typography>
            <Tooltip title="Open My Work">
              <IconButton size="small"><OpenInNewIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {data.evidence.map((t) => (
              <Stack key={t.id} spacing={0.25}>
                <Typography variant="body2">{t.label}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">{t.sub}</Typography>
                  <Chip size="small" label={t.status} variant="outlined" />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="overline">Exceptions to approve</Typography>
            <IconButton size="small"><OpenInNewIcon fontSize="small" /></IconButton>
          </Stack>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {MOCK.tasks.exceptions.map((e) => (
              <Stack key={e.id} spacing={0.25}>
                <Typography variant="body2">{e.label}</Typography>
                <Typography variant="caption" color="text.secondary">{e.sub}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline">Unmapped suggestions</Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LinkIcon fontSize="small" />
              <Typography variant="body2">Awaiting review</Typography>
            </Stack>
            <Button size="small" variant="outlined">Review ({MOCK.tasks.suggestions})</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

/** ---------- Page ---------- */

export default function OverviewAlt() {
  const [ov, setOv] = React.useState(null);
  const { t } = useI18n();

 

  // Row 1: KPI tiles
  const tiles = [
    {
      icon: <WarningAmberIcon />,
      title: t('mainDashboard.openRisks'),
      value: 150, //kpis.openRisks,
      hint: t('mainDashboard.riskHintSample'),
      color: "error",
      onClick: () => nav(`/risk-view${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <RuleIcon />,
      title: t('mainDashboard.avgCoverage'),
      value: 180,
      hint: t('mainDashboard.coverageHintSample'),
      color: "error",
      onClick: () => nav(`/assetgroups/manage${scopeQuery ?? ''}`),
      variant: "plain",
    },
    {
      icon: <UploadFileIcon />,
      title: t('mainDashboard.evidenceDue30'),
      value: 10, //kpis.evidenceDue30,
      // hint: `${kpis?.evidenceOverdue} overdue`,
      hint: t('mainDashboard.overdueSample'),
      color: "warning",
      onClick: () => nav(`/evidence${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <ReportGmailerrorredIcon />,
      title: t('mainDashboard.actionPending'),
      value: 10, // kpis.exceptionsPending,
      hint: t('mainDashboard.awaitingApproval'),
      color: "warning",
      onClick: () => nav(`/exceptions${scopeQuery ?? ''}`),
      variant: "plain",
    },
    {
      icon: <FactCheckIcon />,
      title: t('mainDashboard.assetsMonitored'),
      value: 160, //kpis.attestationsRunning,
      hint: t('mainDashboard.criticalSample'),
      color: "primary",
      onClick: () => nav(`/attestations${scopeQuery ?? ''}`),
      variant: "plain",
    },
  
  ];

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getJSON("overview/summary");
        if (alive) setOv(data);
      } catch (e) {
        console.error("overview/summary failed", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Fallbacks to MOCK while loading
  const scopeChip = ov ? `${ov.scope_type}#${ov.scope_id}` : MOCK.scopeChip;
  const asOf = ov?.as_of?.slice(0,10) || MOCK.asOf;

  // Donuts (controls / SoA / risks)
  const donuts = ov ? {
    controls: { title: "Controls status",
      pass: ov.controls_status.controls_pass,
      fail: ov.controls_status.controls_fail,
      na:   ov.controls_status.controls_na },
    soa: { title: "SoA applicability",
      applicable: ov.soa_applicability.applicable_count,
      na: ov.soa_applicability.na_count,
      unknown: ov.soa_applicability.unknown_count },
    risks: { title: "Risks mix",
      low: ov.risks_mix.low,
      medium: ov.risks_mix.medium,
      high: ov.risks_mix.high }
  } : MOCK.donuts;

  // Coverage bars by framework (enabled only). backend returns % → UI expects 0..1
  const frameworks = ov
    ? ov.frameworks
        .filter(f => f.enabled)
        .map(f => ({ code: f.framework_code || f.framework_name, coverage: (f.coverage_pct || 0) / 100 }))
    : MOCK.frameworks;

  // KPIs for the top tiles (we’ll build them inline in render)
  const kpiVals = ov ? {
    openRisks: ov.kpis.open_risks,
    high: ov.kpis.high_count,
    med: ov.kpis.medium_count,
    low: ov.kpis.low_count,
    coverageAvg: (ov.kpis.avg_coverage_pct || 0) / 100, // convert %→0..1 if needed
    evidenceDue30: ov.kpis.evidence_due_30d,
    evidenceOverdue: ov.kpis.evidence_overdue,
    exceptionsPending: ov.kpis.exceptions_pending,
    assetsTotal: ov.kpis.assets_total,
    assetsCritical: ov.kpis.assets_critical,
  } : null;

// +  const tasks = MOCK.tasks; // keep your mock lists for now

  const rows = MOCK.table;
  

  const columns = [
    { field: "area", headerName: t('mainDashboard.area'), flex: 0.5 },
    { field: "item", headerName: t('mainDashboard.item'), flex: 1.4 },
    { field: "owner", headerName: t('mainDashboard.owner'), flex: 0.6 },
    { field: "due", headerName: t('mainDashboard.due'), flex: 0.6 },
    {
      field: "cta", headerName: "", flex: 0.6, sortable: false,
      renderCell: (p) => <Button size="small" variant="outlined">{p.value}</Button>
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Top utility bar (thin, NOT sticky; parent layout already has header) */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${t('mainDashboard.scope')}: ${scopeChip}`} size="small" />
          <Chip label={`${t('mainDashboard.asOf')}: ${asOf}`} size="small" variant="outlined" />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<CloudDownloadIcon />}>{t('mainDashboard.export')}</Button>
          <Button size="small" variant="contained" startIcon={<TaskAltIcon />}>{t('mainDashboard.startWorkflow')}</Button>
        </Stack>
      </Stack>

      {/* Top row: KPI tiles */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", // <- min width per tile
          gap: 2, // same as Grid spacing={2}
          alignItems: "stretch",
          mb: 2,
        }}
      >
              {(kpiVals ? [
        {
          icon: <WarningAmberIcon />,
          title: t('mainDashboard.openRisks'),
          value: kpiVals.openRisks,
          hint: `${kpiVals.high} ${t('mainDashboard.high')} • ${kpiVals.med} ${t('mainDashboard.medium')} • ${kpiVals.low} ${t('mainDashboard.low')}`,
          color: "error",
          variant: "plain",
        },
        {
          icon: <FactCheckIcon />,
          title: t('mainDashboard.totalAssets'),
          value: kpiVals.assetsTotal,
          hint: `${kpiVals.assetsCritical} ${t('mainDashboard.critical')}`,
          color: "primary",
          variant: "plain",
        },
        {
          icon: <UploadFileIcon />,
          title: t('mainDashboard.evidenceDue30'),
          value: kpiVals.evidenceDue30,
          hint: `${kpiVals.evidenceOverdue} ${t('mainDashboard.overdue')}`,
          color: "warning",
          variant: "plain",
        },
        {
          icon: <ReportGmailerrorredIcon />,
          title: t('mainDashboard.actionPending'),
          value: kpiVals.exceptionsPending,
          hint: t('mainDashboard.awaitingApproval'),
          color: "warning",
          variant: "plain",
        },
      ] : tiles).map((t, i) => (
        <Box key={i} sx={{ display: "flex" }}>
          <KpiTile {...t} sx={{ flex: 1 }} />
        </Box>
      ))}
      </Box>
      

      {/* Middle row: THREE DONUTS + Coverage bars + Actions rail */}
    
      <Grid container spacing={2} size={12} sx={{ mt: 0.5 }}>
        <Grid size={3}> 
          <Donut
            title={t('mainDashboard.controlsStatus')}
            values={[
              { label: t('mainDashboard.pass'), value: donuts.controls.pass, color: COLORS.success },
              { label: t('mainDashboard.fail'), value: donuts.controls.fail, color: COLORS.error },
              { label: t('mainDashboard.na'), value: donuts.controls.na, color: COLORS.grey },
            ]}
          />
        </Grid>
        <Grid  size={3}>
          <Donut
            title={t('mainDashboard.soaApplicability')}
            values={[
              { label: t('mainDashboard.applicable'), value: donuts.soa.applicable, color: COLORS.success },
              { label: t('mainDashboard.na'), value: donuts.soa.na, color: COLORS.grey },
              { label: t('mainDashboard.unknown'), value: donuts.soa.unknown, color: "#bdbdbd" },
            ]}
          />
        </Grid>
        <Grid  size={3}>
          <Donut
            title={t('mainDashboard.risksMix')}
            values={[
              { label: t('mainDashboard.low'), value: donuts.risks.low, color: "#4caf50" },
              { label: t('mainDashboard.medium'), value: donuts.risks.medium, color: "#ff9800" },
              { label: t('mainDashboard.high'), value: donuts.risks.high, color: "#f44336" },
            ]}
          />
        </Grid>

        <Grid  size={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" color="text.secondary">Coverage by framework</Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Copy deep link"><IconButton size="small"><LinkIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Open Compliance"><IconButton size="small"><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              </Stack>
              <Stack spacing={1.25}>
                {frameworks.map((f) => (
                  <BarRow key={f.code} label={f.code} value={f.coverage} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }} size={12}>
        <Grid size={6} sx={{ mt: 0.5 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" color="text.secondary">What needs attention</Typography>
                <Button size="small" variant="outlined" startIcon={<WarningAmberIcon />}>Risk Dashboard</Button>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1}>
                <Chip size="small" label="Evidence stale: 4" variant="outlined" />
                <Chip size="small" label="Unmapped: 3" variant="outlined" />
                <Chip size="small" label="Exceptions pending: 2" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <ActionsRail data={MOCK.tasks} />
        </Grid>
      </Grid>

      {/* Bottom table */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="overline" color="text.secondary">My work — this month</Typography>
            <Button size="small" startIcon={<OpenInNewIcon />}>Open My Work</Button>
          </Stack>
          <div style={{ width: "100%" }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              density="compact"
              hideFooterSelectedRowCount
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}

