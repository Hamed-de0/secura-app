import React, { useContext, useMemo, useState } from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useRisksAtScope, useRiskAppetite } from "../hooks";
import RiskFilters from "../components/RiskFilters.jsx";
import RiskTable from "../components/RiskTable.jsx";
import RiskDetailDrawer from "../components/RiskDetailDrawer.jsx";
import RiskMetrics from "../components/RiskMetrics.jsx";
import RiskHeatmapPanel from "../components/RiskHeatmapPanel.jsx";
import RiskAppetiteStrip from '../components/RiskAppetiteStrip.jsx';

export default function RiskView() {
  const { scope } = useContext(ScopeContext);
  const { data: risks, isLoading } = useRisksAtScope(scope);
  const { data: appetite } = useRiskAppetite();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState(null);
  const [level, setLevel] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const list = Array.isArray(risks) ? risks : [];
    return list.filter((r) => {
      if (status && r.status !== status) return false;
      if (level && Number(r.residual_level) !== Number(level)) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.title} ${r.owner} ${r.category} ${(r.tags || []).join(
          " "
        )}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [risks, q, status, level]);

  return (
    <Box sx={{ p: 2 }}>
      <RiskMetrics risks={risks} />
      <RiskAppetiteStrip risks={risks} targetLevel={appetite?.target_level ?? 2} />
      <RiskFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        level={level}
        setLevel={setLevel}
      />
      {isLoading ? (
        <Skeleton variant="rounded" height={520} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <RiskTable
              rows={filtered}
              loading={false}
              onRowClick={(row) => setSelected(row)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RiskHeatmapPanel />
          </Grid>
        </Grid>
      )}
      <RiskDetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        risk={selected}
      />
    </Box>
  );
}
