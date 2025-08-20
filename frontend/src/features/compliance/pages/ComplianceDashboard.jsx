import React from "react";
import { Box, Grid, Card, CardContent, Typography, LinearProgress, Stack, Chip, Divider, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { useI18n } from '../../../store/i18n/I18nProvider'
import dashboard from "../../../mock/compliance_dashboard.json";

function pct(n) {
  const v = Math.max(0, Math.min(1, Number(n ?? 0)));
  return Math.round(v * 100);
}

function StatCard({ label, value, hint }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
        {hint ? <Typography variant="caption" color="text.secondary">{hint}</Typography> : null}
      </CardContent>
    </Card>
  );
}

export default function ComplianceDashboard() {
  const { t } = useI18n();

  // --- derive rows for the DataGrid
  const gapRows = (dashboard.top_gaps || []).map((g, idx) => ({
    id: g.id ?? idx + 1,
    ...g,
  }));

  const gapColumns = [
    { field: "code", headerName: "Code", width: 120, renderCell: (p) => <span>{p.row.code}</span> },
    { field: "title", headerName: "Requirement", flex: 1, minWidth: 240, renderCell: (p) => <span>{p.row.title}</span> },
    { field: "severity", headerName: "Severity", width: 120, renderCell: (p) => {
        const sev = String(p.row.severity || "").toLowerCase();
        const color = sev === "high" ? "error" : sev === "medium" ? "warning" : "default";
        return <Chip size="small" color={color} label={sev || "—"} variant={color === "default" ? "outlined" : "filled"} />;
      }
    },
    { field: "mapped_count", headerName: "Mapped", width: 110, type: "number", renderCell: (p) => <span>{p.row.mapped_count ?? 0}</span> },
    { field: "hits_count", headerName: "Effective hits", width: 140, type: "number", renderCell: (p) => <span>{p.row.hits_count ?? 0}</span> },
    { field: "gap_reason", headerName: "Gap reason", flex: 1, minWidth: 200, renderCell: (p) => <span>{p.row.gap_reason || "—"}</span> },
  ];

  const k = dashboard.kpis || {};
  const byClause = dashboard.by_clause || [];
  const dist = dashboard.status_distribution || [];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">
          {t("common.compliance", "Compliance")} — {dashboard.version?.code || "ISO 27001:2022"}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to={`/compliance/versions/${dashboard.version?.id ?? 1}`} variant="outlined" size="small">
            {t("compliance.openExplorer", "Open Explorer")}
          </Button>
          <Button component={RouterLink} to="/mapping" variant="outlined" size="small">
            {t("compliance.manageMappings", "Manage mappings")}
          </Button>
        </Stack>
      </Stack>

      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={t("compliance.requirementsTotal", "Requirements")}
            value={`${k.requirements_total ?? 0}`}
            hint={`${t("compliance.mapped", "Mapped")}: ${k.mapped_requirements ?? 0} · ${t("compliance.effective", "Effective")}: ${k.effective_requirements ?? 0}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={t("common.Controls", "Controls")}
            value={`${k.controls_total ?? 0}`}
            hint={`${t("compliance.implemented", "Implemented")}: ${k.controls_implemented ?? 0}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={t("compliance.coverage", "Coverage")}
            value={`${pct(k.coverage_pct)}%`}
            hint={t("compliance.coverageHint", "Requirements with effective controls")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={t("compliance.evidenceFreshness", "Evidence freshness")}
            value={`${pct(k.evidence_fresh_pct)}%`}
            hint={t("compliance.evidenceFreshnessHint", "Evidence within policy freshness")}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Coverage by clause */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("compliance.coverageByClause", "Coverage by clause")}</Typography>
              <Stack spacing={1.25}>
                {byClause.map((c, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.code}</Typography>
                      <Typography variant="caption" color="text.secondary">{pct(c.coverage_pct)}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct(c.coverage_pct)} />
                    <Typography variant="caption" color="text.secondary">{c.title}</Typography>
                  </Box>
                ))}
                {byClause.length === 0 && (
                  <Typography variant="body2" color="text.secondary">{t("common.noData", "No data")}</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Control assurance distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("compliance.controlStatuses", "Control statuses")}</Typography>
              <Stack spacing={1.25}>
                {dist.map((d, idx) => {
                  const total = dist.reduce((s, x) => s + Number(x.count || 0), 0) || 1;
                  const p = Math.round((Number(d.count || 0) / total) * 100);
                  return (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{d.status}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.count} · {p}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={p} />
                    </Box>
                  );
                })}
                {dist.length === 0 && (
                  <Typography variant="body2" color="text.secondary">{t("common.noData", "No data")}</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top gaps */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("compliance.topGaps", "Top gaps")}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 420, width: "100%" }}>
                <DataGrid
                  rows={gapRows}
                  columns={gapColumns}
                  disableColumnMenu
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  density="compact"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
