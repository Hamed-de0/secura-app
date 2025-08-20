import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";

import data from "../../../mock/compliance_multi_dashboard.json";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsightsIcon from "@mui/icons-material/Insights";
import FactCheckIcon from "@mui/icons-material/FactCheck";

import SecurityIcon from "@mui/icons-material/Security";
import GavelIcon from "@mui/icons-material/Gavel";
import BoltIcon from "@mui/icons-material/Bolt";
import FlagIcon from "@mui/icons-material/Flag";

function pct(n) {
  const v = Math.max(0, Math.min(1, Number(n ?? 0)));
  return Math.round(v * 100);
}

function fmt(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
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

function frameworkIcon(code) {
  const key = String(code || "").toUpperCase();
  if (key.includes("ISO")) return <SecurityIcon fontSize="small" />;
  if (key.includes("GDPR")) return <GavelIcon fontSize="small" />;
  if (key.includes("DORA")) return <BoltIcon fontSize="small" />;
  if (key.includes("BSI")) return <FlagIcon fontSize="small" />;
  return <SecurityIcon fontSize="small" />;
}

function FrameworkCard({ f, warnFreshPct }) {
  const coverage = pct(f.coverage_pct);
  const freshness = pct(f.evidence_fresh_pct);
  const warn = (freshness / 100) < warnFreshPct;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {frameworkIcon(f.code)}
            <Typography variant="subtitle1">
              {f.code} — {f.name}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={warn ? "Attention" : "Healthy"}
            color={warn ? "warning" : "success"}
            variant="outlined"
          />
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Coverage: {coverage}%
        </Typography>
        <LinearProgress variant="determinate" value={coverage} sx={{ mb: 1 }} />

        <Typography variant="caption" color="text.secondary">
          Evidence freshness: {freshness}%
        </Typography>
        <LinearProgress variant="determinate" value={freshness} sx={{ mb: 1.5 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Typography variant="body2">
            Requirements: {fmt(f.effective_requirements)}/{fmt(f.requirements_total)}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              (effective)
            </Typography>
          </Typography>
          <Typography variant="body2">
            Controls: {fmt(f.controls_implemented)}/{fmt(f.controls_total)}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              (implemented)
            </Typography>
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={`/compliance/versions/${f.version_id ?? f.id}`}
            variant="outlined"
            size="small"
          >
            Open Explorer
          </Button>
          <Button
            component={RouterLink}
            to={`/mapping?framework=${encodeURIComponent(f.code)}`}
            variant="outlined"
            size="small"
          >
            Manage mappings
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ComplianceDashboardMulti() {
  const theme = useTheme();
  const frameworks = data.frameworks || [];
  const warnFreshPct = Number(data.thresholds?.freshness_warn_pct ?? 0.7);

  // Aggregates
  const totalReqs = frameworks.reduce((s, f) => s + Number(f.requirements_total || 0), 0);
  const totalEffReqs = frameworks.reduce((s, f) => s + Number(f.effective_requirements || 0), 0);
  const totalMappedReqs = frameworks.reduce((s, f) => s + Number(f.mapped_requirements || 0), 0);
  const avgCoverage =
    frameworks.length === 0
      ? 0
      : frameworks.reduce((s, f) => s + Number(f.coverage_pct || 0), 0) / frameworks.length;
  const avgFreshness =
    frameworks.length === 0
      ? 0
      : frameworks.reduce((s, f) => s + Number(f.evidence_fresh_pct || 0), 0) / frameworks.length;

  const rows = frameworks.map((f) => ({
    id: f.id,
    code: f.code,
    name: f.name,
    version_code: f.version_code || f.code,
    coverage_pct: pct(f.coverage_pct),
    effective: Number(f.effective_requirements || 0),
    mapped: Number(f.mapped_requirements || 0),
    total: Number(f.requirements_total || 0),
    controls_impl: Number(f.controls_implemented || 0),
    controls_total: Number(f.controls_total || 0),
    fresh_pct: pct(f.evidence_fresh_pct),
    explorer_path: `/compliance/versions/${f.version_id ?? f.id}`,
    mapping_path: `/mapping?framework=${encodeURIComponent(f.code)}`,
  }));

  const columns = [
    { field: "code", headerName: "Framework", width: 140, renderCell: (p) => <span>{p.row.code}</span> },
    { field: "name", headerName: "Name", flex: 1, minWidth: 200, renderCell: (p) => <span>{p.row.name}</span> },
    { field: "version_code", headerName: "Version", width: 140, renderCell: (p) => <span>{p.row.version_code}</span> },
    {
      field: "coverage_pct",
      headerName: "Coverage",
      width: 130,
      renderCell: (p) => (
        <Stack sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">{p.row.coverage_pct}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={p.row.coverage_pct} />
        </Stack>
      ),
    },
    { field: "effective", headerName: "Eff.", width: 90, type: "number", renderCell: (p) => <span>{fmt(p.row.effective)}</span> },
    { field: "mapped", headerName: "Map.", width: 90, type: "number", renderCell: (p) => <span>{fmt(p.row.mapped)}</span> },
    { field: "total", headerName: "Total", width: 90, type: "number", renderCell: (p) => <span>{fmt(p.row.total)}</span> },
    {
      field: "fresh_pct",
      headerName: "Freshness",
      width: 140,
      renderCell: (p) => {
        const warn = (p.row.fresh_pct / 100) < warnFreshPct;
        return (
          <Stack sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption">{p.row.fresh_pct}%</Typography>
              <Chip
                size="small"
                label={warn ? "Attention" : "Healthy"}
                color={warn ? "warning" : "success"}
                variant="outlined"
              />
            </Stack>
            <LinearProgress variant="determinate" value={p.row.fresh_pct} />
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to={p.row.explorer_path} size="small" variant="outlined">
            Open
          </Button>
          <Button component={RouterLink} to={p.row.mapping_path} size="small" variant="outlined">
            Map
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Compliance — All frameworks</Typography>
      </Stack>

      {/* Top colorful KPI cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          {topCard(
            {
              label: "Frameworks",
              value: `${frameworks.length}`,
              hint: "Active in scope",
              icon: LibraryBooksIcon,
              color: "secondary",
            },
            theme
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard(
            {
              label: "Requirements",
              value: `${fmt(totalReqs)}`,
              hint: `Eff.: ${fmt(totalEffReqs)} · Map.: ${fmt(totalMappedReqs)}`,
              icon: AssignmentTurnedInIcon,
              color: "success",
            },
            theme
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard(
            {
              label: "Avg. Coverage",
              value: `${pct(avgCoverage)}%`,
              hint: "Avg across frameworks",
              icon: InsightsIcon,
              color: "info",
            },
            theme
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard(
            {
              label: "Avg. Freshness",
              value: `${pct(avgFreshness)}%`,
              hint: "Evidence within policy",
              icon: FactCheckIcon,
              color: "warning",
            },
            theme
          )}
        </Grid>
      </Grid>

      {/* Framework cards (2 x 2) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {frameworks.map((f) => (
          <Grid key={f.id} item xs={12} md={6} lg={6} size={6}>
            <FrameworkCard f={f} warnFreshPct={warnFreshPct} />
          </Grid>
        ))}
      </Grid>

      {/* Summary table */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Framework summary</Typography>
          <Box sx={{ height: 420, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableColumnMenu
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              density="compact"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
