import React, { useContext, useMemo, useState } from "react";
import { Box, Grid, Skeleton, Stack, Chip, Typography } from "@mui/material";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useEffectiveControls } from "../hooks";
import ControlsFilters from "../components/ControlsFilters.jsx";
import EffectiveControlsGrid from "../components/EffectiveControlsGrid.jsx";
import { useSearchParams } from "react-router-dom";

export default function ControlsAtScope() {
  const { scope } = useContext(ScopeContext);
  const { data: controls, isLoading } = useEffectiveControls(scope);

  const [source, setSource] = useState(null);
  const [assurance, setAssurance] = useState(null);
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  React.useEffect(() => {
    const cur = params.get("q") || "";
    if (cur !== q)
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.set("q", q);
          return n;
        },
        { replace: true }
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    const list = Array.isArray(controls) ? controls : [];
    return list.filter((c) => {
      if (source && c.source !== source) return false;
      if (assurance && (c.assurance_status || "").toLowerCase() !== assurance)
        return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${c.code ?? ""} ${c.title ?? ""} ${
          c.notes ?? ""
        }`.toLowerCase();
        return hay.includes(needle);
      }
      return true;
    });
  }, [controls, source, assurance, q]);

  const quickCounts = useMemo(() => {
    const list = Array.isArray(controls) ? controls : [];
    const bySource = list.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1;
      return acc;
    }, {});
    const byAssurance = list.reduce((acc, c) => {
      const k = (c.assurance_status || "unknown").toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return { bySource, byAssurance };
  }, [controls]);

  return (
    <Box sx={{ p: 2 }}>
      <ControlsFilters
        source={source}
        setSource={setSource}
        assurance={assurance}
        setAssurance={setAssurance}
        q={q}
        setQ={setQ}
        total={(controls || []).length}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
        {Object.entries(quickCounts.bySource).map(([k, v]) => (
          <Chip key={k} size="small" label={`${k}: ${v}`} />
        ))}
        {Object.entries(quickCounts.byAssurance).map(([k, v]) => (
          <Chip key={k} size="small" label={`${k}: ${v}`} />
        ))}
      </Stack>

      {isLoading ? (
        <Skeleton variant="rounded" height={520} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <EffectiveControlsGrid rows={filtered} loading={false} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
