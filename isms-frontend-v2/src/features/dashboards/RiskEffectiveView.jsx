import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  Button,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  ShieldOutlined as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CheckCircle as CheckCircleIcon,
  ReportGmailerrorred as WarningIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";
import {
  LineChart,
  BarChart,
  Bar,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import configs from "../configs";

/**
 * Risks (Effective) — Static demo view with a professional Modal detail
 * - Auditor‑friendly table with KPIs & filters
 * - Eye icon opens an impressive modal with overview, trend, controls, sources & compliance
 */
const IMPACT_FULL = {
  C: "Confidentiality",
  I: "Integrity",
  A: "Availability",
  L: "Legal",
  R: "Reputation",
};

const impactColorByLevel = (lvl) => {
  // 0..5 → grey..green..amber..red
  if (!lvl) return "#e0e0e0";
  return {
    1: "#66bb6a", // green
    2: "#9ccc65",
    3: "#ffd54f", // amber
    4: "#ffb74d",
    5: "#e57373", // red
  }[Math.min(5, Math.max(0, Number(lvl)))];
};

const STATUS_STYLES = {
  Open: { color: "info" },
  Analyzing: { color: "secondary" },
  Proposed: { color: "primary" },
  Approved: { color: "primary", variant: "outlined" },
  Implementing: { color: "warning" },
  Verified: { color: "success" },
  Accepted: { color: "default", variant: "outlined" },
  Transferred: { color: "secondary", variant: "outlined" },
  Avoided: { color: "success", variant: "outlined" },
  Closed: { color: "success" },
  "On Hold": { color: "default", variant: "outlined" },
  Blocked: { color: "error" },
  Exception: { color: "warning", variant: "outlined" },
  Reopened: { color: "error", variant: "outlined" },
};

function useDebounce(value, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const KPICard = ({ title, value, spark = [] }) => {
  const theme = useTheme();
  return (
    <Card elevation={2} sx={{ flex: 1, minWidth: 220, borderRadius: 3 }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ width: 120, height: 36 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={spark}
                margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
              >
                <RechartsTooltip
                  cursor={{ stroke: theme.palette.divider }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  dot={false}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ScopeChip = ({ scope }) => {
  const colorMap = {
    asset: "primary",
    tag: "secondary",
    group: "warning",
    type: "default",
  };
  return (
    <Chip
      size="small"
      label={scope?.toUpperCase?.() || scope}
      color={colorMap[scope] || "default"}
      variant="outlined"
    />
  );
};

const ImpactChips = ({ impacts }) => {
  const order = ["C", "I", "A", "L", "R"]; // Conf, Integ, Avail, Legal, Reputation
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      {order.map((k) => (
        <Chip
          key={k}
          size="small"
          label={`${k}:${impacts?.[k] ?? "-"}`}
          variant="outlined"
        />
      ))}
    </Stack>
  );
};

const ResidualPill = ({ value, appetite = 30 }) => {
  const theme = useTheme();
  const rag =
    value > appetite ? "error" : value > appetite * 0.6 ? "warning" : "success";
  const bg = alpha(theme.palette[rag].main, 0.15);
  const fg = theme.palette[rag].main;
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: 20,
        bgcolor: bg,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        minWidth: 30,
        width: 30,
        height: 30,
        justifyContent: "center",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </Box>
  );
};

const TrendSpark = ({ data = [] }) => (
  <Box sx={{ width: 120, height: 28 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </Box>
);

const ControlsCell = ({ implemented = 0, total = 0 }) => {
  const pct = total === 0 ? 0 : Math.round((implemented / total) * 100);
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ minWidth: 140 }}
    >
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 8, borderRadius: 6 }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          width: 48,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {implemented}/{total}
      </Typography>
    </Stack>
  );
};

const EvidenceCell = ({ ok = 0, warn = 0 }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Tooltip title="Verified evidence">
      <Stack direction="row" spacing={0.5} alignItems="center">
        <CheckCircleIcon fontSize="small" color="success" />
        <Typography
          variant="caption"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {ok}
        </Typography>
      </Stack>
    </Tooltip>
    <Tooltip title="Issues / missing">
      <Stack direction="row" spacing={0.5} alignItems="center">
        <WarningIcon fontSize="small" color="warning" />
        <Typography
          variant="caption"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {warn}
        </Typography>
      </Stack>
    </Tooltip>
  </Stack>
);

// ------------------- Static Demo Data ------------------- //
const demoSpark = Array.from({ length: 16 }, (_, i) => ({
  x: i,
  y: 40 + Math.round(Math.sin(i / 2) * 8 + i),
}));

const DEMO_RISKS = [
  {
    id: 1,
    scenarioId: 101,
    scenarioTitle: "Disclosure of information due to misdelivery",
    assetName: "Dev-Server",
    scope: "asset",
    owner: "Oliver",
    ownerInitials: "JK",
    status: "Open",
    likelihood: 3,
    impacts: { C: 4, I: 4, A: 3, L: 2, R: 2 },
    initial: 45,
    residual: 18,
    trend: demoSpark,
    controls: {
      implemented: 2,
      total: 5,
      recommended: ["MFA", "DLP", "Email TLS"],
      implementedList: ["MFA", "TLS"],
    },
    evidence: { ok: 3, warn: 1 },
    lastReview: "2025-07-10",
    nextReview: "2025-10-10",
    sources: [
      {
        scope: "type",
        name: "Virtual Machine",
        likelihood: 3,
        impacts: { C: 4, I: 4, A: 2, L: 2, R: 1 },
      },
      {
        scope: "asset",
        name: "Dev-Server",
        likelihood: 3,
        impacts: { C: 4, I: 4, A: 3, L: 2, R: 2 },
      },
    ],
    compliance: ["ISO 27001: 8.24", "DORA: Art. 10", "GDPR: Art. 32"],
  },
  {
    id: 2,
    scenarioId: 102,
    scenarioTitle: "Drive-by exploits using known software",
    assetName: "Virtual Machine",
    scope: "type",
    owner: "Unassigned",
    ownerInitials: "?",
    status: "Closed",
    likelihood: 3,
    impacts: { C: 4, I: 4, A: 4, L: 2, R: 2 },
    initial: 35,
    residual: 20,
    trend: demoSpark.map((p) => ({ ...p, y: p.y - 8 })),
    controls: {
      implemented: 1,
      total: 4,
      recommended: ["Patch mgmt", "AV/EDR", "Hardening"],
      implementedList: ["Patch mgmt"],
    },
    evidence: { ok: 1, warn: 2 },
    lastReview: "2025-07-01",
    nextReview: "2025-09-30",
    sources: [
      {
        scope: "type",
        name: "Virtual Machine",
        likelihood: 3,
        impacts: { C: 4, I: 4, A: 4, L: 2, R: 2 },
      },
    ],
    compliance: ["ISO 27001: 8.8", "BSI OPS.1.1"],
  },
  {
    id: 3,
    scenarioId: 103,
    scenarioTitle: "System failure due to configuration errors",
    assetName: "Prod-API",
    scope: "tag",
    owner: "Oliver",
    ownerInitials: "SP",
    status: "Analyzing",
    likelihood: 2,
    impacts: { C: 3, I: 4, A: 5, L: 3, R: 2 },
    initial: 50,
    residual: 26,
    trend: demoSpark.map((p) => ({ ...p, y: p.y + (p.x % 3 === 0 ? 6 : -5) })),
    controls: {
      implemented: 3,
      total: 6,
      recommended: ["Change control", "Backups", "Monitoring"],
      implementedList: ["Backups", "Monitoring", "Reviews"],
    },
    evidence: { ok: 4, warn: 1 },
    lastReview: "2025-06-20",
    nextReview: "2025-09-01",
    sources: [
      {
        scope: "type",
        name: "Server Application",
        likelihood: 2,
        impacts: { C: 3, I: 3, A: 4, L: 2, R: 2 },
      },
      {
        scope: "tag",
        name: "Prod",
        likelihood: 2,
        impacts: { C: 3, I: 4, A: 5, L: 3, R: 2 },
      },
    ],
    compliance: ["ISO 27001: 8.32", "DORA RTS: ICT Change"],
  },
  {
    id: 4,
    scenarioId: 107,
    scenarioTitle: "Credential stuffing against customer portal",
    assetName: "Customer Portal",
    scope: "group",
    owner: "Hamed",
    ownerInitials: "SV",
    status: "Open",
    likelihood: 4,
    impacts: { C: 4, I: 4, A: 3, L: 4, R: 4 },
    initial: 60,
    residual: 34,
    trend: demoSpark.map((p) => ({ ...p, y: p.y + (p.x % 4 === 0 ? 8 : -4) })),
    controls: {
      implemented: 2,
      total: 7,
      recommended: ["MFA", "Rate limiting", "WAF", "Password policy"],
      implementedList: ["WAF", "Rate limiting"],
    },
    evidence: { ok: 2, warn: 2 },
    lastReview: "2025-07-08",
    nextReview: "2025-10-01",
    sources: [
      {
        scope: "group",
        name: "External-Facing",
        likelihood: 4,
        impacts: { C: 4, I: 4, A: 3, L: 4, R: 4 },
      },
      {
        scope: "type",
        name: "Web Application",
        likelihood: 3,
        impacts: { C: 3, I: 3, A: 3, L: 3, R: 3 },
      },
    ],
    compliance: ["ISO 27001: 8.23", "NIST 800-53: IA-2"],
  },
  {
    id: 5,
    scenarioId: 108,
    scenarioTitle: "Ransomware via phishing",
    assetName: "Corporate Laptops",
    scope: "type",
    owner: "Unassigned",
    ownerInitials: "?",
    status: "Closed",
    likelihood: 3,
    impacts: { C: 5, I: 4, A: 4, L: 3, R: 5 },
    initial: 55,
    residual: 28,
    trend: demoSpark.map((p) => ({ ...p, y: p.y - 6 })),
    controls: {
      implemented: 3,
      total: 6,
      recommended: ["EDR", "Email filtering", "Backup tests", "User training"],
      implementedList: ["EDR", "Email filtering", "User training"],
    },
    evidence: { ok: 3, warn: 1 },
    lastReview: "2025-07-05",
    nextReview: "2025-09-20",
    sources: [
      {
        scope: "type",
        name: "Endpoint",
        likelihood: 3,
        impacts: { C: 5, I: 4, A: 4, L: 3, R: 5 },
      },
    ],
    compliance: ["ISO 27001: 8.16", "NIST 800-53: SI-3"],
  },
  {
    id: 6,
    scenarioId: 109,
    scenarioTitle: "Data leakage via misconfigured object storage",
    assetName: "Data Lake",
    scope: "asset",
    owner: "Anikar",
    ownerInitials: "JK",
    status: "Implementing",
    likelihood: 3,
    impacts: { C: 5, I: 3, A: 2, L: 4, R: 4 },
    initial: 48,
    residual: 22,
    trend: demoSpark.map((p) => ({ ...p, y: p.y + 3 })),
    controls: {
      implemented: 2,
      total: 5,
      recommended: [
        "Least privilege",
        "Bucket policies",
        "DLP",
        "Access reviews",
      ],
      implementedList: ["Least privilege", "Bucket policies"],
    },
    evidence: { ok: 2, warn: 1 },
    lastReview: "2025-06-30",
    nextReview: "2025-09-15",
    sources: [
      {
        scope: "type",
        name: "Storage Service",
        likelihood: 3,
        impacts: { C: 5, I: 3, A: 2, L: 4, R: 4 },
      },
      {
        scope: "asset",
        name: "Data Lake",
        likelihood: 3,
        impacts: { C: 5, I: 3, A: 2, L: 4, R: 4 },
      },
    ],
    compliance: ["ISO 27001: 8.12", "GDPR: Art. 32"],
  },
  {
    id: 7,
    scenarioId: 110,
    scenarioTitle: "Unpatched library in backend enables RCE",
    assetName: "Backend-API",
    scope: "asset",
    owner: "Oliver",
    ownerInitials: "SP",
    status: "Implementing",
    likelihood: 3,
    impacts: { C: 4, I: 4, A: 5, L: 2, R: 3 },
    initial: 52,
    residual: 24,
    trend: demoSpark.map((p) => ({ ...p, y: p.y - (p.x % 5 === 0 ? 10 : 2) })),
    controls: {
      implemented: 2,
      total: 6,
      recommended: ["Patch mgmt", "SCA", "WAF rules", "Code review"],
      implementedList: ["Patch mgmt", "SCA"],
    },
    evidence: { ok: 2, warn: 2 },
    lastReview: "2025-07-12",
    nextReview: "2025-10-05",
    sources: [
      {
        scope: "type",
        name: "Server Application",
        likelihood: 3,
        impacts: { C: 4, I: 4, A: 4, L: 2, R: 3 },
      },
      {
        scope: "asset",
        name: "Backend-API",
        likelihood: 3,
        impacts: { C: 4, I: 4, A: 5, L: 2, R: 3 },
      },
    ],
    compliance: ["ISO 27001: 8.8", "OWASP ASVS: V5"],
  },
  {
    id: 8,
    scenarioId: 111,
    scenarioTitle: "Third-party outage causes service unavailability",
    assetName: "Payment Gateway",
    scope: "tag",
    owner: "Hamed",
    ownerInitials: "SV",
    status: "Open",
    likelihood: 2,
    impacts: { C: 2, I: 3, A: 5, L: 3, R: 4 },
    initial: 40,
    residual: 25,
    trend: demoSpark.map((p) => ({ ...p, y: p.y + (p.x % 2 === 0 ? 2 : -3) })),
    controls: {
      implemented: 2,
      total: 5,
      recommended: ["Multi-region", "Runbooks", "Monitoring", "Vendor SLA"],
      implementedList: ["Runbooks", "Monitoring"],
    },
    evidence: { ok: 1, warn: 2 },
    lastReview: "2025-06-25",
    nextReview: "2025-09-25",
    sources: [
      {
        scope: "tag",
        name: "Payments",
        likelihood: 2,
        impacts: { C: 2, I: 3, A: 5, L: 3, R: 4 },
      },
      {
        scope: "type",
        name: "Integration Service",
        likelihood: 2,
        impacts: { C: 2, I: 3, A: 4, L: 2, R: 3 },
      },
    ],
    compliance: ["ISO 27001: 8.14", "DORA: Art. 11"],
  },
];

const OWNERS = ["All", "Open", "Jessica K.", "Spaerberg", "Unassigned"];
const SCOPES = ["All", "asset", "tag", "group", "type"];
const DOMAINS = ["All", "C", "I", "A", "L", "R"];

// ------------------------------------------------------- //
function RiskDetailModal({ open, onClose, row, appetite = 30 }) {
  const theme = useTheme();
  if (!row) return null;

  const sampleData = {
    id: 4,
    scenarioId: 107,
    scenarioTitle: "Credential stuffing against customer portal",
    assetName: "Customer Portal",
    scope: "group",
    owner: "Hamed",
    ownerInitials: "SV",
    status: "Open",
    likelihood: 4,
    impacts: { C: 4, I: 4, A: 3, L: 4, R: 4 },
    initial: 60,
    residual: 34,
    // trend: demoSpark.map((p) => ({ ...p, y: p.y + (p.x % 4 === 0 ? 8 : -4) })),
    controls: { implemented: 2, total: 7, recommended: ["MFA", "Rate limiting", "WAF", "Password policy"], implementedList: ["WAF", "Rate limiting"] },
    evidence: { ok: 2, warn: 2 },
    lastReview: "2025-07-08",
    nextReview: "2025-10-01",
    sources: [
      { scope: "group", name: "External-Facing", likelihood: 4, impacts: { C: 4, I: 4, A: 3, L: 4, R: 4 } },
      { scope: "type", name: "Web Application", likelihood: 3, impacts: { C: 3, I: 3, A: 3, L: 3, R: 3 } },
    ],
    compliance: ["ISO 27001: 8.23", "NIST 800-53: IA-2"],
  };

  const pct = row.controls.total
    ? Math.round((row.controls.implemented / row.controls.total) * 100)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={0.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800}>
                {row.scenarioTitle}
              </Typography>
              <ScopeChip scope={row.scope} />
              <Chip
                size="small"
                label={`ID: ${row.scenarioId}`}
                icon={<ShieldIcon />}
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Asset / Context: <b>{row.scopeName}</b>
            </Typography>
          </Stack>
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Overview */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Overview
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      label={`Likelihood: ${row.likelihood}`}
                      size="small"
                    />
                    <ImpactChips impacts={row.impacts} />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2">Initial</Typography>
                    <Chip size="small" label={row.initial} variant="outlined" />
                    <Typography variant="body2">Residual</Typography>
                    <ResidualPill value={row.residual} appetite={appetite} />
                    <Chip
                      size="small"
                      label={`Appetite ≤ ${appetite}`}
                      variant="outlined"
                    />
                  </Stack>
                  <Box sx={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={row.trend}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Controls
                  </Typography>
                  <Chip
                    size="small"
                    label={`${pct}% coverage`}
                    color={
                      pct > 60 ? "success" : pct > 30 ? "warning" : "default"
                    }
                  />
                </Stack>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ minWidth: 128 }}>
                      Implemented
                    </Typography>
                    <ControlsCell
                      implemented={sampleData.controls.implemented}
                      total={sampleData.controls.total}
                    />
                  </Stack>
                  <Divider flexItem sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Recommended
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {sampleData.controls.recommended.map((c, i) => (
                      <Chip
                        key={i}
                        icon={<AssessmentIcon />}
                        label={c}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Implemented
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {sampleData.controls.implementedList.map((c, i) => (
                      <Chip
                        key={i}
                        icon={<CheckCircleIcon />}
                        label={c}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sources & Compliance */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Sources
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {sampleData.sources.map((s, idx) => (
                      <Chip
                        key={idx}
                        label={`${s.scope.toUpperCase()} • ${s.name}`}
                        icon={<ShieldIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Compliance
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {sampleData.compliance?.map((c, i) => (
                      <Chip
                        key={i}
                        icon={<GavelIcon />}
                        label={c}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Evidence
                  </Typography>
                  <EvidenceCell ok={sampleData.evidence.ok} warn={sampleData.evidence.warn} />
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button startIcon={<TrendingUpIcon />} variant="outlined">
          What‑if
        </Button>
        <Button startIcon={<AssignmentTurnedInIcon />} variant="contained">
          Create Plan
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RisksEffectiveView() {
  const theme = useTheme();
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [owner, setOwner] = useState("All");
  const [scope, setScope] = useState("All");
  const [domain, setDomain] = useState("All");
  const [onlyOverAppetite, setOnlyOverAppetite] = useState(false);
  const [appetite, setAppetite] = useState(30);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState([
    { field: "updatedAt", sort: "desc" },
  ]);
  const [status, setStatus] = useState("all"); // placeholder for later
  const [apiRows, setApiRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const assetId = undefined,
    assetTypeId = undefined; // placeholder

  const { page, pageSize } = paginationModel; // DataGrid
  const offset = page * pageSize;
  const limit = pageSize;

  const s = sortModel[0] || { field: "updatedAt", sort: "desc" };
  const SORT_MAP = {
    scenarioTitle: "scenario_title",
    assetName: "asset_name",
    residual: "residual",
    initial: "initial",
    likelihood: "likelihood",
    scope: "scope",
    updatedAt: "updated_at",
  };
  const sort_by = SORT_MAP[s.field] || "updated_at";
  const sort_dir = s.sort || "desc";

  const params = {
    offset,
    limit,
    sort_by,
    sort_dir,
    scope,
    status,
    search, // debounced value
    asset_id: assetId || undefined,
    asset_type_id: assetTypeId || undefined,
  };

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(
      `${configs.API_BASE_URL}/risks/risk_scenario_contexts/contexts?${qs}`,
      { signal: ac.signal }
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setApiRows(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [configs.API_BASE_URL, qs]);

  const rows = useMemo(() => {
    return DEMO_RISKS.filter((r) => {
      if (
        search &&
        !`${r.scenarioTitle} ${r.assetName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (owner !== "All" && r.owner !== owner) return false;
      if (scope !== "All" && r.scope !== scope) return false;
      if (onlyOverAppetite && !(r.residual > appetite)) return false;
      return true;
    }).map((r) => ({ ...r }));
  }, [search, owner, scope, onlyOverAppetite, appetite]);

  const ImpactTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload; // { k, label, v }
    return (
      <Box
        sx={{
          p: 0.75,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Typography variant="caption">{`${p.label}: ${p.v}`}</Typography>
      </Box>
    );
  };

  const columns = [
    {
      field: "scenarioTitle",
      headerName: "Scenario",
      flex: 1.6,
      minWidth: 260,
      renderCell: (p) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={600} noWrap>
            {p.row.scenarioTitle}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ color: "text.secondary" }}
          >
            <ShieldIcon fontSize="inherit" />
            <Typography variant="caption">ID: {p.row.scenarioId}</Typography>
          </Stack>
        </Stack>
      ),
    },
    { field: "scopeName", headerName: "Asset", width: 160 },
    {
      field: "scope",
      headerName: "Scope",
      width: 100,
      renderCell: (p) => <ScopeChip scope={p.value} />,
      sortable: false,
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 160,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
            {p.row.ownerInitials}
          </Avatar>
          <Typography variant="body2" noWrap>
            {p.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.value}
          {...(STATUS_STYLES[p.value] || {})}
        />
      ),
    },
    {
      field: "likelihood",
      headerName: "Likelihood",
      width: 110,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <Chip size="small" label={p.value} variant="outlined" />
      ),
    },
    {
      field: "impacts",
      headerName: "Impacts",
      flex: 0.9,
      width: 100,
      sortable: false,
      renderCell: (p) => {
        const theme = useTheme();
        const v = p.value || {};
        const order = ["C", "I", "A", "L", "R"];
        const data = order.map((k) => ({
          k,
          label: IMPACT_FULL[k],
          v: Number(v[k] ?? 0),
        }));

        return (
          <Box sx={{ width: 110, height: 26 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="k" hide />
                <YAxis hide domain={[0, 5]} />
                <RechartsTooltip content={<ImpactTooltip />} />
                <Bar
                  dataKey="v"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={impactColorByLevel(d.v, theme)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      },
    },
    {
      field: "initial",
      headerName: "Initial",
      width: 90,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <Chip size="small" label={p.value} variant="outlined" />
      ),
    },
    {
      field: "residual",
      headerName: "Residual",
      width: 90,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (p) => <ResidualPill value={p.value} appetite={appetite} />,
    },
    {
      field: "trend",
      headerName: "Trend",
      width: 140,
      sortable: false,
      renderCell: (p) => <TrendSpark data={p.value} />,
    },
    {
      field: "controls",
      headerName: "Controls",
      width: 170,
      sortable: false,
      renderCell: (p) => (
        <ControlsCell implemented={p.value.implemented} total={p.value.total} />
      ),
    },
    {
      field: "evidence",
      headerName: "Evidence",
      width: 140,
      sortable: false,
      renderCell: (p) => <EvidenceCell ok={p.value.ok} warn={p.value.warn} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 96,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ width: "100%" }}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Tooltip title="Open details">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedRow(params.row);
                setModalOpen(true);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 2 }}>
      <Stack spacing={2}>
        {/* KPIs */}
        <Stack
          useFlexGap
          spacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <KPICard
            title="Over‑Appetite"
            value={rows.filter((r) => r.residual > appetite).length}
            spark={demoSpark}
          />
          <KPICard
            title="Total Residual Trend"
            value={<span>92%</span>}
            spark={demoSpark.map((p) => ({ ...p, y: p.y - 10 }))}
          />
          <KPICard
            title="% with Owner"
            value={
              <span>
                {Math.round(
                  (rows.filter(
                    (r) => r.owner !== "Open" && r.owner !== "Unassigned"
                  ).length /
                    Math.max(rows.length, 1)) *
                    100
                )}
                %
              </span>
            }
            spark={demoSpark.map((p) => ({ ...p, y: p.y + 6 }))}
          />
          <KPICard
            title="Exceptions expiring"
            value={3}
            spark={demoSpark.map((p) => ({ ...p, y: p.y - 4 }))}
          />
          <KPICard
            title="Last Review SLA"
            value={<span>81%</span>}
            spark={demoSpark.map((p) => ({ ...p, y: p.y + 2 }))}
          />
        </Stack>

        {/* Filters */}
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3, overflowX: "auto" }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <TextField
              label="Search"
              placeholder="Scenario or Asset…"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              size="small"
              sx={{ minWidth: 260 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Domain</InputLabel>
              <Select
                label="Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {DOMAINS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Scope Type</InputLabel>
              <Select
                label="Scope Type"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                {SCOPES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Owner</InputLabel>
              <Select
                label="Owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                {OWNERS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="number"
              size="small"
              label="Risk Appetite"
              value={appetite}
              onChange={(e) => setAppetite(parseInt(e.target.value || 0, 10))}
              sx={{ width: 160 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyOverAppetite}
                  onChange={(e) => setOnlyOverAppetite(e.target.checked)}
                />
              }
              label="Over‑Appetite only"
            />
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button startIcon={<TrendingUpIcon />} variant="outlined">
                What‑if
              </Button>
              <Button
                startIcon={<AssignmentTurnedInIcon />}
                variant="contained"
              >
                Create Plan
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper
          variant="outlined"
          sx={{ height: 560, borderRadius: 3, overflowX: "auto" }}
        >
          <DataGrid
            rows={apiRows ?? []}
            rowCount={total}
            getRowId={(r) =>
              r.contextId ??
              `${r.scenarioId}-${r.scope}-${r.assetId ?? r.scopeName}`
            }
            loading={loading}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              columns: {
                columnVisibilityModel: { trend: true, evidence: true },
              },
            }}
            getRowHeight={() => 56}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: alpha(useTheme().palette.action.hover, 0.4),
              },
              "& .MuiDataGrid-cell": { outline: 0 },
            }}
          />
        </Paper>

        <Typography variant="caption" color="text.secondary" textAlign="right">
          Demo view — static data. Replace arrays with API hooks when wiring.
        </Typography>
      </Stack>

      {/* Detail Modal */}
      <RiskDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        row={selectedRow}
        appetite={appetite}
      />
    </Container>
  );
}
