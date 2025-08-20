import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import HubIcon from "@mui/icons-material/Hub";
import CategoryIcon from "@mui/icons-material/Category";
import ShieldIcon from "@mui/icons-material/Shield";
import InsightsIcon from "@mui/icons-material/Insights";
import PublicIcon from "@mui/icons-material/Public";

import { getJSON, buildSearchParams } from "../../../api/httpClient";

// Optional usage augmentation from mock coverage (effective hits across versions)
let coverageMock = null;
try {
  // eslint-disable-next-line global-require
  coverageMock = require("../../../mock/coverage.json");
} catch (_) {
  coverageMock = null;
}

// ---- helpers ----------------------------------------------------------------
const LOCAL_THRESHOLD = 200; // if full_count <= this, load-all & do client-side UX

function fmtInt(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
}
function normalizeSource(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Other";
  if (v.includes("iso")) return "ISO";
  if (v.includes("bsi")) return "BSI";
  if (v.includes("gdpr")) return "GDPR";
  if (v.includes("dora")) return "DORA";
  if (v.includes("internal")) return "Internal";
  return "Other";
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
// compact text list (no chip piles)
function TextList({ items = [], max = 2 }) {
  const arr = Array.isArray(items) ? items : [];
  const shown = arr.slice(0, max);
  const extra = arr.length - shown.length;
  const text = shown.join(" • ");
  const title = arr.join(", ");
  return (
    <Typography variant="body2" noWrap title={title}>
      {text}
      {extra > 0 ? `  +${extra}` : ""}
    </Typography>
  );
}
function parseArray(resp) {
  return Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.data)
    ? resp.data
    : Array.isArray(resp?.items)
    ? resp.items
    : [];
}
function getFullCount(resp, fallbackLen) {
  if (Array.isArray(resp)) return fallbackLen;
  if (Number.isFinite(resp?.full_count)) return Number(resp.full_count);
  if (Number.isFinite(resp?.total)) return Number(resp.total);
  return fallbackLen;
}
function adaptRow(r, usageByControlId) {
  const control_id = Number(r.id ?? r.control_id);
  return {
    id: control_id,
    control_id,
    code: r.reference_code || r.code || "",
    title: r.title_en || r.title || r.title_de || "",
    source: normalizeSource(r.control_source || r.source || r.category),
    category: r.category || null,
    control_type: Array.isArray(r.control_type) ? r.control_type : [],
    security_domains: Array.isArray(r.security_domains) ? r.security_domains : [],
    capabilities: Array.isArray(r.capabilities) ? r.capabilities : [],
    properties: Array.isArray(r.properties) ? r.properties : [],
    usage: usageByControlId.get(control_id) || 0,
    richness:
      (r.control_type?.length || 0) +
      (r.control_concept?.length || 0) +
      (r.security_domains?.length || 0) +
      (r.capabilities?.length || 0) +
      (r.properties?.length || 0),
  };
}

export default function ControlsDashboard() {
  const theme = useTheme();

  // ---- Debounced search -----------------------------------------------------
  const [qRaw, setQRaw] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setQ(qRaw.trim()), 400);
    return () => clearTimeout(id);
  }, [qRaw]);

  const [source, setSource] = useState("all");
  const [category, setCategory] = useState("all");

  // ---- Pagination (grid) ----------------------------------------------------
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const limit = paginationModel.pageSize;
  const offset = paginationModel.page * paginationModel.pageSize;

  // reset page when search/filter changes
  useEffect(() => {
    setPaginationModel((pm) => ({ ...pm, page: 0 }));
  }, [q, source, category]);

  // ---- Usage counts from coverage mock -------------------------------------
  const usageByControlId = useMemo(() => {
    const map = new Map();
    if (!coverageMock?.versions) return map;
    for (const vId of Object.keys(coverageMock.versions)) {
      const v = coverageMock.versions[vId];
      for (const req of v.requirements || []) {
        for (const h of req.hits || []) {
          const cid = Number(h.control_id);
          map.set(cid, (map.get(cid) || 0) + 1);
        }
      }
    }
    return map;
  }, []);

  // ---- Mode detection: local vs server -------------------------------------
  const [mode, setMode] = useState("auto"); // "local" or "server" determined at bootstrap
  const [booting, setBooting] = useState(true);
  const [total, setTotal] = useState(0);

  // Local mode data (all rows)
  const [allRowsRaw, setAllRowsRaw] = useState([]);

  // Server mode page data
  const [pageRowsRaw, setPageRowsRaw] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bootstrap once: find full_count; if small, fetch-all and go local mode
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function bootstrap() {
      try {
        const params = buildSearchParams({ limit: 1, offset: 0 });
        const resp = await getJSON("controls/controls/", { searchParams: params, signal: controller.signal });
        const firstArr = parseArray(resp);
        const full = getFullCount(resp, firstArr.length);
        if (cancelled) return;

        setTotal(full);

        if (full <= LOCAL_THRESHOLD) {
          // local mode: fetch all in batches (no q; we'll filter client-side)
          const batch = Math.min(500, Math.max(50, LOCAL_THRESHOLD));
          let all = [];
          for (let off = 0; off < full; off += batch) {
            const p = buildSearchParams({ limit: batch, offset: off });
            // eslint-disable-next-line no-await-in-loop
            const r = await getJSON("controls/controls/", { searchParams: p, signal: controller.signal });
            const arr = parseArray(r);
            all = all.concat(arr);
            if (arr.length < batch) break;
          }
          if (cancelled) return;
          setAllRowsRaw(all);
          setMode("local");
        } else {
          // server mode
          setMode("server");
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load controls");
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Server-mode: fetch page whenever limit/offset/q changes
  useEffect(() => {
    if (booting || mode !== "server") return;
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setPageLoading(true);
      setError(null);
      try {
        const params = buildSearchParams({ limit, offset, q: q.length >= 2 ? q : "" });
        const resp = await getJSON("controls/controls/", { searchParams: params, signal: controller.signal });
        const arr = parseArray(resp);
        const full = getFullCount(resp, arr.length);
        if (!cancelled) {
          setPageRowsRaw(arr);
          setTotal(full);
        }
      } catch (e) {
        if (!cancelled && e.name !== "AbortError") setError(e?.message || "Failed to load controls");
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [booting, mode, limit, offset, q]);

  // ---- Normalize rows -------------------------------------------------------
  const allRows = useMemo(
    () => (mode === "local" ? allRowsRaw.map((r) => adaptRow(r, usageByControlId)) : []),
    [mode, allRowsRaw, usageByControlId]
  );
  const pageRows = useMemo(
    () => (mode === "server" ? pageRowsRaw.map((r) => adaptRow(r, usageByControlId)) : []),
    [mode, pageRowsRaw, usageByControlId]
  );

  // ---- Facets + filtering (global in local mode; page-only in server mode) --
  const facetBase = mode === "local" ? allRows : pageRows;

  const facets = useMemo(() => {
    const setSrc = new Set();
    const setCat = new Set();
    for (const r of facetBase) {
      if (r.source) setSrc.add(r.source);
      if (r.category) setCat.add(r.category);
    }
    return {
      sources: ["all", ...Array.from(setSrc)],
      categories: ["all", ...Array.from(setCat)],
    };
  }, [facetBase, mode]);

  // Apply filters + search
  const rowsFiltered = useMemo(() => {
    const base = mode === "local" ? allRows : pageRows;
    const ql = q.toLowerCase();
    return base.filter((r) => {
      if (source !== "all" && r.source !== source) return false;
      if (category !== "all" && r.category !== category) return false;
      if (q && q.length >= 2) {
        const hay = `${r.code ?? ""} ${r.title ?? ""}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [mode, allRows, pageRows, source, category, q]);

  // Client pagination (only in local mode)
  const [clientPageModel, setClientPageModel] = useState({ page: 0, pageSize: 25 });
  useEffect(() => {
    if (mode === "local") setClientPageModel((pm) => ({ ...pm, page: 0 }));
  }, [mode, q, source, category]);

  // KPIs
  const totalServer = total; // from server full_count
  const visible = rowsFiltered.length;
  const isoCount = rowsFiltered.filter((r) => r.source === "ISO").length;
  const uniqueCats = new Set(rowsFiltered.map((r) => r.category).filter(Boolean)).size;
  const avgRichness = visible ? Math.round(rowsFiltered.reduce((s, r) => s + (r.richness || 0), 0) / visible) : 0;

  // ---- DataGrid columns (no chip piles) -------------------------------------
  const columns = [
    { field: "code", headerName: "Code", width: 120, renderCell: (p) => <span>{p.row.code}</span> },
    { field: "title", headerName: "Control", flex: 1, minWidth: 240, renderCell: (p) => <span>{p.row.title}</span> },
    {
      field: "source",
      headerName: "Source",
      width: 120,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.row.source || "—"}
          color={p.row.source === "ISO" ? "info" : p.row.source === "Internal" ? "secondary" : "default"}
          variant="outlined"
        />
      ),
    },
    { field: "category", headerName: "Category", width: 180, renderCell: (p) => <span>{p.row.category || "—"}</span> },
    { field: "control_type", headerName: "Type", width: 180, renderCell: (p) => <TextList items={p.row.control_type} max={2} /> },
    { field: "security_domains", headerName: "Domains", width: 240, renderCell: (p) => <TextList items={p.row.security_domains} max={2} /> },
    { field: "usage", headerName: "Usage", width: 100, type: "number", renderCell: (p) => <span>{p.row.usage ?? 0}</span> },
  ];

  // ---- Render ---------------------------------------------------------------
  if (booting) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Card sx={{ borderColor: "error.main", borderWidth: 1, borderStyle: "solid" }}>
          <CardContent>
            <Typography variant="subtitle2" color="error">Failed to load controls</Typography>
            <Typography variant="body2" color="text.secondary">{String(error)}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const gridIsServer = mode === "server";
  const gridRows = rowsFiltered;

  return (
    <Box sx={{ p: 2 }}>
      {/* Top colorful KPI cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          {topCard({ label: "Controls", value: fmtInt(totalServer), hint: "Total (server)", icon: LibraryBooksIcon, color: "secondary" }, theme)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard({ label: "ISO share", value: `${visible ? Math.round((isoCount / visible) * 100) : 0}%`, hint: `${fmtInt(isoCount)} in view`, icon: ShieldIcon, color: "info" }, theme)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard({ label: "Categories", value: fmtInt(uniqueCats), hint: "Unique in view", icon: CategoryIcon, color: "success" }, theme)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {topCard({ label: "Richness", value: `${avgRichness}`, hint: "Avg tags per control", icon: HubIcon, color: "warning" }, theme)}
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search code or title…"
            value={qRaw}
            onChange={(e) => setQRaw(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {facets.sources.map((s) => (
              <MenuItem key={s} value={s}>{s === "all" ? "All sources" : s}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {facets.categories.map((c) => (
              <MenuItem key={c} value={c}>{c === "all" ? "All categories" : c}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Source distribution + Top domains (based on current view base) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <PublicIcon fontSize="small" />
                <Typography variant="subtitle2">Source distribution ({mode === "local" ? "all" : "page"})</Typography>
              </Stack>
              <Stack spacing={1.25}>
                {(() => {
                  const base = facetBase;
                  const totalBase = base.length || 1;
                  const map = base.reduce((m, r) => m.set(r.source, (m.get(r.source) || 0) + 1), new Map());
                  return Array.from(map.entries()).map(([s, count]) => {
                    const p = Math.round((count / totalBase) * 100);
                    return (
                      <Box key={s}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{s}</Typography>
                          <Typography variant="caption" color="text.secondary">{count} · {p}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={p} />
                      </Box>
                    );
                  });
                })()}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <InsightsIcon fontSize="small" />
                <Typography variant="subtitle2">Top security domains ({mode === "local" ? "all" : "page"})</Typography>
              </Stack>
              <Stack spacing={1.25}>
                {(() => {
                  const base = facetBase;
                  const map = base.reduce((m, r) => {
                    (r.security_domains || []).forEach((d) => m.set(d, (m.get(d) || 0) + 1));
                    return m;
                  }, new Map());
                  const list = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
                  return list.length ? (
                    list.map(([d, count]) => {
                      const p = base.length ? Math.round((count / base.length) * 100) : 0;
                      return (
                        <Box key={d}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{d}</Typography>
                            <Typography variant="caption" color="text.secondary">{count} · {p}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={p} />
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">No data</Typography>
                  );
                })()}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls grid */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Controls</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={gridRows}
              columns={columns}
              loading={gridIsServer ? pageLoading : false}
              disableColumnMenu
              density="compact"
              {...(gridIsServer
                ? {
                    // server mode: drive backend with limit/offset and show real total
                    paginationMode: "server",
                    rowCount: total,
                    paginationModel,
                    onPaginationModelChange: setPaginationModel,
                    pageSizeOptions: [25, 50, 100],
                  }
                : {
                    // local mode: client pagination/sort across full dataset
                    paginationMode: "client",
                    paginationModel: clientPageModel,
                    onPaginationModelChange: setClientPageModel,
                    pageSizeOptions: [25, 50, 100],
                  })}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
