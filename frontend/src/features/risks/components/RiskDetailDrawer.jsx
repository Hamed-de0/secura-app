import React from "react";
import { Drawer, Box, Typography, Stack, Chip, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { makeChartColors } from "../../../theme/rechartsAdapter";
import {
  getSourceChipProps,
  getAssuranceChipProps,
} from "../../../theme/chips";
import { useContext } from "react";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useFrameworkVersions } from "../../../lib/mock/useRbac";
import { Link as RouterLink } from "react-router-dom";
import { Button, Link } from "@mui/material";

export default function RiskDetailDrawer({ open, onClose, risk }) {
  const theme = useTheme();
  const c = makeChartColors(theme);
  const { versions } = useContext(ScopeContext);
  const { data: allVersions } = useFrameworkVersions();
  const vCode = new Map((allVersions || []).map((v) => [v.id, v.code]));
  const impactedByVersion = (risk?.impacted_requirements || [])
    .filter((v) => (versions || []).includes(v.version_id))
    .map((v) => ({
      version_id: v.version_id,
      code: vCode.get(v.version_id) || `v${v.version_id}`,
      items: v.items || [],
    }));

  if (!open || !risk) return null;

  const data = (risk.trend || []).map((v, i) => ({ m: i + 1, residual: v }));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 460, pt:8 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          {risk.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Owner: {risk.owner} · Status: {risk.status}
        </Typography>

        <Box sx={{ mt: 2, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke={c.gridColor} strokeDasharray="4 4" />
              <XAxis dataKey="m" stroke={c.axisColor} />
              <YAxis stroke={c.axisColor} />
              <RTooltip />
              <Line
                type="monotone"
                dataKey="residual"
                stroke={c.warn}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Linked controls
        </Typography>
        <Stack spacing={1}>
          {(risk.linked_controls || []).map((h, idx) => (
            <Box
              key={idx}
              sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="body2">
                  {h.code} — {h.title}
                </Typography>
                <Chip
                  size="small"
                  label={h.source}
                  {...getSourceChipProps(h.source, theme)}
                />
                <Chip
                  size="small"
                  label={h.assurance_status}
                  {...getAssuranceChipProps(h.assurance_status, theme)}
                />
                <Typography variant="caption" color="text.secondary">
                  contrib {(h.contribution ?? 0).toFixed(2)}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Impacted requirements (by selected version)
        </Typography>
        {!impactedByVersion || impactedByVersion.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No impacted requirements for the currently selected version(s).
          </Typography>
        ) : (
          <Stack spacing={1}>
            {impactedByVersion.map((block) => (
              <Box
                key={block.version_id}
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">{block.code}</Typography>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/compliance/versions/${block.version_id}`}
                  >
                    Open in Compliance
                  </Button>
                </Stack>
                <Stack spacing={0.75}>
                  {block.items.map((it) => (
                    <Box
                      key={it.requirement_id}
                      sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 96 }}>
                        {it.code}
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {it.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        contrib {Math.round((it.contribution || 0) * 100)}%
                      </Typography>
                      {Array.isArray(it.contributed_by) &&
                        it.contributed_by.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            via{" "}
                            {it.contributed_by.map((id) => `#${id}`).join(", ")}
                          </Typography>
                        )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
