import * as React from "react";
import { Box, Grid } from "@mui/material";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

// Components
import KpiTile from "../components/KpiTile.jsx";
import DonutLegendCard from "../components/DonutLegendCard.jsx";
import BarCard from "../components/BarCard.jsx";
import TrendCard from "../components/TrendCard.jsx";
import MiniListCard from "../components/MiniListCard.jsx";
import HeatmapCard from "../components/HeatmapCard.jsx";
import TabStrip from "../components/TabStrip.jsx";
import DataGridCard from "../components/DataGridCard.jsx";
import QuickActions from "../components/QuickActions.jsx";

// Icons
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ShieldIcon from "@mui/icons-material/Shield";
import EventIcon from "@mui/icons-material/Event";

// Data + aggregates
import {
  coverageByFramework,
  coverageMatrix,
  effectivenessTrend,
  riskBurndown,
} from "../mocks.js";
import { computeKpis, pickTopTasks, pickDueEvidence } from "../aggregate.js";
import { sampleEvidence } from "../../evidence/mocks";
import { sampleTasks } from "../../mywork/mocks";
import { sampleExceptions } from "../../exceptions/mocks";

export default function MainDashboard() {
  const theme = useTheme();
  const [params] = useSearchParams();
  const location = useLocation();
  const nav = useNavigate();

  const scopeQuery = React.useMemo(() => {
    const sc = params.get("scope");
    const ver = params.get("versions");
    const u = new URLSearchParams();
    if (sc) u.set("scope", sc);
    if (ver) u.set("versions", ver);
    const s = u.toString();
    return s ? `?${s}` : "";
  }, [location.key]);

  // KPIs
  const kpis = computeKpis();

  // Row 1: KPI tiles
  const tiles = [
    {
      icon: <WarningAmberIcon />,
      title: "Open risks",
      value: kpis.openRisks,
      hint: "5 high • 4 medium • 5 low",
      color: "error",
      onClick: () => nav(`/risk-view${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <WarningAmberIcon />,
      title: "Total assets",
      value: 180,
      hint: "Physical: 48 • Intangible: 34",
      color: "error",
      onClick: () => nav(`/assetgroups/manage${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <UploadFileIcon />,
      title: "Evidence due (30d)",
      value: kpis.evidenceDue30,
      hint: `${kpis.evidenceOverdue} overdue`,
      color: "warning",
      onClick: () => nav(`/evidence${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <ReportGmailerrorredIcon />,
      title: "Exceptions pending",
      value: kpis.exceptionsPending,
      hint: "Awaiting approval",
      color: "warning",
      onClick: () => nav(`/exceptions${scopeQuery}`),
      variant: "plain",
    },
    {
      icon: <FactCheckIcon />,
      title: "Attestations running",
      value: kpis.attestationsRunning,
      hint: "Avg completion 62%",
      color: "primary",
      onClick: () => nav(`/attestations${scopeQuery}`),
      variant: "plain",
    },
    // {
    //   icon: <ShieldIcon />,
    //   title: 'Controls pass rate',
    //   value: `${kpis.controlsPassRate}%`,
    //   progress: kpis.controlsPassRate,
    //   color: 'success',
    //   onClick: () => nav(`/controls${scopeQuery}`),
    //   variant: 'radial',
    // },
    // {
    //   icon: <EventIcon />,
    //   title: 'Provider reviews (30d)',
    //   value: kpis.providerReviews30,
    //   hint: 'Upcoming vendor reviews',
    //   color: 'info',
    //   onClick: () => nav(`/providers${scopeQuery}`),
    //   variant: 'plain',
    // },
  ];

  // Donut (controls status)
  const donutData = [
    { name: "Pass", value: 76 },
    { name: "Fail", value: 14 },
    { name: "N/A", value: 10 },
  ];

  // Lists
  const tasksList = pickTopTasks(6).map((t) => ({
    id: t.id,
    primary: t.title,
    secondary: `${t.objectType} ${t.objectCode} • ${t.assignee}`,
    metric: t.dueDate,
  }));
  const evidenceList = pickDueEvidence(6).map((e) => ({
    id: e.id,
    primary: e.title,
    secondary: `${e.objectType} ${e.objectCode} • due ${e.dueDate}`,
    metric: e.status,
  }));

  // Bottom tabs (DataGrids)
  const [tab, setTab] = React.useState("mywork");

  const myWorkColumns = [
    {
      field: "title",
      headerName: "Task",
      flex: 1,
      minWidth: 240,
      renderCell: (p) => p.row?.title ?? "",
    },
    {
      field: "object",
      headerName: "Object",
      width: 200,
      renderCell: (p) =>
        `${p.row?.objectType || ""} ${p.row?.objectCode || ""}`.trim(),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 200,
      renderCell: (p) => p.row?.assignee ?? "",
    },
    {
      field: "dueDate",
      headerName: "Due",
      width: 140,
      renderCell: (p) => p.row?.dueDate ?? "",
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (p) => p.row?.status ?? "",
    },
  ];
  const evidenceColumns = [
    {
      field: "title",
      headerName: "Request",
      flex: 1,
      minWidth: 240,
      renderCell: (p) => p.row?.title ?? "",
    },
    {
      field: "object",
      headerName: "Object",
      width: 200,
      renderCell: (p) =>
        `${p.row?.objectType || ""} ${p.row?.objectCode || ""}`.trim(),
    },
    {
      field: "requestedBy",
      headerName: "Requested by",
      width: 220,
      renderCell: (p) => p.row?.requestedBy ?? "",
    },
    {
      field: "dueDate",
      headerName: "Due",
      width: 140,
      renderCell: (p) => p.row?.dueDate ?? "",
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (p) => p.row?.status ?? "",
    },
  ];
  const exceptionsColumns = [
    {
      field: "code",
      headerName: "ID",
      width: 120,
      renderCell: (p) => p.row?.code ?? "",
    },
    {
      field: "title",
      headerName: "Exception",
      flex: 1,
      minWidth: 240,
      renderCell: (p) => p.row?.title ?? "",
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 220,
      renderCell: (p) => p.row?.owner ?? "",
    },
    {
      field: "impact",
      headerName: "Impact",
      width: 120,
      renderCell: (p) => p.row?.impact ?? "",
    },
    {
      field: "expires",
      headerName: "Expires",
      width: 140,
      renderCell: (p) => p.row?.expires ?? "",
    },
  ];

  const tabDefs = [
    {
      key: "mywork",
      label: "My Work",
      rows: sampleTasks,
      columns: myWorkColumns,
    },
    {
      key: "evidence",
      label: "Evidence",
      rows: sampleEvidence,
      columns: evidenceColumns,
    },
    {
      key: "exceptions",
      label: "Exceptions",
      rows: sampleExceptions,
      columns: exceptionsColumns,
    },
  ];

  return (
    <Box sx={{ p: 1 }}>

   
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", // <- min width per tile
        gap: 2, // same as Grid spacing={2}
        alignItems: "stretch",
      }}
    >
      {tiles.map((t, i) => (
        <Box key={i} sx={{ display: "flex" }}>
          <KpiTile {...t} sx={{ flex: 1 }} />
        </Box>
      ))}
      </Box>

      {/* Row 2: Donut + Coverage by framework */}
      {/* Row: Controls status (left) + Coverage by framework (right) */}
      <Grid container spacing={2} alignItems="stretch" sx={{ mt: 0.5, pt: 2 }}>
        <Grid item xs={12} md={6} size={6} sx={{ display: "flex" }}>
          <DonutLegendCard
            title="Controls status"
            data={donutData}
            sx={{ flex: 1 }}
            onSliceClick={(name) => {
              if (name === "Pass") nav(`/controls${scopeQuery}`);
              if (name === "Fail") nav(`/controls${scopeQuery}&q=status:fail`);
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} size={6} sx={{ display: "flex" }}>
          <BarCard
            title="Coverage by framework"
            series={coverageByFramework}
            layout="vertical"
            sx={{ flex: 1 }}
            onBarClick={(fw) =>
              nav(`/compliance${scopeQuery}&q=${encodeURIComponent(fw)}`)
            }
          />
        </Grid>
      </Grid>

      {/* Row 3: Trend + Quick actions */}
      <Grid container spacing={2} sx={{ mt: 3, minHeight: 350 }}>
        <Grid item xs={12} md={6} size={6} maxHeight={350}>
          <TrendCard
            title="Control effectiveness (stacked)"
            series={effectivenessTrend}
            range="90d"
            onRangeChange={() => {
              /* mock: no-op */
            }}
            sx={{ display: "flex" }}
          />
        </Grid>
        <Grid item xs={12} md={6} size={6} maxHeight={350}>
          {/* <QuickActions scopeQuery={scopeQuery} /> */}
          <MiniListCard
            title="Evidence due soon"
            items={evidenceList}
            onItemClick={(it) =>
              nav(`/evidence${scopeQuery}&q=${encodeURIComponent(it.primary)}`)
            }
            sx={{ maxHeight: 300 }}
          />
        </Grid>
      </Grid>

      {/* Row 4: Heatmap */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <HeatmapCard
            title="Annex A coverage heatmap"
            matrix={coverageMatrix}
          />
        </Grid>
      </Grid>

      {/* Bottom: Tabbed tables */}
      <Box sx={{ mt: 1.5 }}>
        <TabStrip
          value={tab}
          onChange={setTab}
          tabs={tabDefs.map((t) => ({ key: t.key, label: t.label }))}
        />
        <Box sx={{ mt: 1 }}>
          {tabDefs.map(
            (t) =>
              t.key === tab && (
                <DataGridCard
                  key={t.key}
                  title={t.label}
                  rows={t.rows}
                  columns={t.columns}
                />
              )
          )}
        </Box>
      </Box>
    </Box>
  );
}
