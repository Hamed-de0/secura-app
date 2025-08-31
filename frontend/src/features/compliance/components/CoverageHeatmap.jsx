import * as React from "react";
import { Box, Stack, Typography, Tooltip, Skeleton, Divider } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { fetchCoverageRollup } from "../../../api/services/compliance";

const COLS = [
  { key: "met",     label: "Met",     tone: (t)=>t.palette.success.main },
  { key: "partial", label: "Partial", tone: (t)=>t.palette.warning.main },
  { key: "gap",     label: "Gap",     tone: (t)=>t.palette.error.main },
  { key: "unknown", label: "Unknown", tone: (t)=>t.palette.grey[500]   },
];

export default function CoverageHeatmap({ versionId, scopeTypes = ["org","entity","bu","service","site","asset_group","asset_type","tag","asset"], onCellClick }) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]); // [{scope_type, counts:{...}}]

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCoverageRollup({ versionId, scopeTypes });
        // Ensure all requested scopes exist in rows even if API omits them
        const byType = new Map((data.items || []).map(it => [it.scope_type, it]));
        const normalized = scopeTypes.map(st => byType.get(st) || ({
          scope_type: st,
          counts: { total: 0, met: 0, partial: 0, gap: 0, unknown: 0 }
        }));
        if (alive) setRows(normalized);
      } catch (e) {
        console.error("heatmap load failed", e);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [versionId, JSON.stringify(scopeTypes)]);

  if (loading) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={28} />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={32} />)}
      </Stack>
    );
  }

  // Find max cell to scale intensity
  const maxVal = Math.max(
    1,
    ...rows.flatMap(r => COLS.map(c => r.counts?.[c.key] ?? 0))
  );

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Coverage heatmap</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: `160px repeat(${COLS.length}, 1fr)`, gap: 0.5, mt: 1 }}>
        {/* Header */}
        <Box />
        {COLS.map(col => (
          <Box key={col.key} sx={{ px: 1, py: 0.5 }}>
            <Typography variant="caption" color="text.secondary">{col.label}</Typography>
          </Box>
        ))}
        <Divider sx={{ gridColumn: `1 / span ${COLS.length+1}`, my: 0.5 }} />

        {/* Rows */}
        {rows.map((r) => (
          <React.Fragment key={r.scope_type}>
            <Box sx={{ px: 1, py: 0.75 }}>
              <Typography variant="body2" sx={{ textTransform: "none" }}>{r.scope_type}</Typography>
            </Box>
            {COLS.map(col => {
              const v = r.counts?.[col.key] ?? 0;
              const base = col.tone(theme);
              const bg = alpha(base, v === 0 ? 0.08 : 0.15 + 0.65 * (v / maxVal));
              const border = alpha(base, 0.35);
              const handleClick = () => {
                if (onCellClick) return onCellClick({ scopeType: r.scope_type, status: col.key, versionId });
                // Default deep-link to Explorer (no scope_id for rollup)
                const url = `/compliance/versions/${versionId}?scope_type=${r.scope_type}&status=${col.key}`;
                window.location.assign(url);
              };
              return (
                <Tooltip key={col.key} title={`${r.scope_type} • ${col.label}: ${v}`}>
                  <Box
                    onClick={handleClick}
                    sx={{
                      cursor: v > 0 ? "pointer" : "default",
                      px: 1, py: 0.75, textAlign: "center",
                      bgcolor: bg, border: `1px solid ${border}`, borderRadius: 0.75,
                      userSelect: "none"
                    }}
                  >
                    <Typography variant="body2">{v}</Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
