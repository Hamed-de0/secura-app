import React, { useEffect, useState } from "react";
import {
  Paper,
  alpha,
  useTheme,
  Stack,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Avatar,
  Button,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import GavelIcon from "@mui/icons-material/Gavel";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";

const STATUS_STYLES = {
  Open: { color: "info" },
  Analyzing: { color: "secondary" },
  Proposed: { color: "primary" },
  Approved: { color: "primary", variant: "outlined" },
  Implementing: { color: "warning" },
  Implemented: { color: "success", variant: "outlined" },
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
    // console.log("ControlsCell:", { implemented, total }); // DEBUG
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

function useDebounce(value, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function RiskDetailModal({ open, onClose, row, appetite = 30 }) {
  const theme = useTheme();
  const navigate = useNavigate();

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
                  <EvidenceCell
                    ok={sampleData.evidence.ok}
                    warn={sampleData.evidence.warn}
                  />
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

export default function RiskCustomGrid({
  rows = [],
  loading,
  height = 560,
  total = 0,
  pageSize = 10,
  page = 0,
  defaultSort = { field: "updatedAt", sort: "desc" },
  compactToolbar = false,
  orderMenuItems = [],
  filters,
  onFiltersChange,
  onRowClick,
}) {
  const theme = useTheme();
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [owner, setOwner] = useState("all");
  const [scope, setScope] = useState("all");
  const [domain, setDomain] = useState("all");
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
  const [viewRows, setViewRows] = useState([]);

  const offset = page * pageSize;
  const limit = pageSize;
  const s = sortModel[0] || { field: "updatedAt", sort: "desc" };

  const columns = [
    {
      field: "scenarioTitle",
      headerName: "Scenario",
      flex: 1.6,
      minWidth: 260,
      renderCell: (p) => (
        // import.meta.env.DEV && console.log('scenario cell params:', p),
        <Stack spacing={0.25}>
          <Typography fontWeight={400} noWrap>
            {p?.row?.scenarioTitle || "—"}
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
      headerAlign: "center",
      align: "center",
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
      align: "center",
        headerAlign: "center",
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
      headerName: "L",
      width: 80,
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
      width: 120,
      align: "center",
      headerAlign: "center",
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
          <Box sx={{ width: 100, height: 26, alignContent: "center", justifyContent: "center", alignItems: "center", display: "flex" }}>
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
        import.meta.env.DEV && console.log('control cell params:', p),
        <ControlsCell
          implemented={p?.row?.controls?.implemented}
          total={p?.row?.controls?.total}
        />
      ),
    },
    {
      field: "evidence",
      headerName: "Evidence",
      width: 140,
      sortable: false,
      renderCell: (p) => (
        <EvidenceCell
          ok={p?.value?.evidence?.ok}
          warn={p?.value?.evidence?.warn}
        />
      ),
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

  // useEffect to update viewRows when rows or search changes
  useEffect(() => {
    // console.log("RiskCustomGrid: filtering rows", { rows, search }); // DEBUG
    if (!rows) {
      setViewRows([]);
      return;
    }
    const _q = (search || "").toLowerCase();
    const filtered = rows.filter((r) => {
      if (
        _q &&
        !`${r.scenarioTitle ?? ""} ${r.owner ?? ""}`.toLowerCase().includes(_q)
      )
        return false;
      return true;
    });
    setViewRows(filtered);
  }, [rows, search]);

  return (
    <Paper
      variant="outlined"
      sx={{ height, borderRadius: 1, overflowX: "auto" }}
    >
      <DataGrid
        rows={rows ?? []}
        rowCount={total}
        getRowId={(r) =>
          r.id ??
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
        // initialState={{
        // pagination: { paginationModel: { pageSize: 10 } },
        // columns: {columnVisibilityModel: { trend: true, evidence: true },  },     }}
        getRowHeight={() => 56}
        onRowDoubleClick={(p) => {
          setSelectedRow(p.row);
          setModalOpen(true);
        }}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: alpha(useTheme().palette.action.hover, 0.4),
          },
          "& .MuiDataGrid-cell": { outline: 0 },
        }}
      />
      {/* Detail Modal */}
      <RiskDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        row={selectedRow}
        appetite={appetite}
      />
    </Paper>
  );
}
