import React from "react";
import { Box, Typography, Stack, Chip, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getScopeLabel } from "../../../lib/mock/rbacClient";
import EffectiveControlsGrid from "../../controls/components/EffectiveControlsGrid.jsx";
import { useNavigate } from "react-router-dom";

export default function ProviderDetail({ service }) {
  const navigate = useNavigate();
  const theme = useTheme();
  if (!service) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Select a service to view details.
        </Typography>
      </Box>
    );
  }

  const scopeChips = (service.affected_scopes || []).map((key) => {
    const [type, idStr] = key.split(":");
    const id = Number(idStr);
    return { key, type, id, label: getScopeLabel(type, id) };
  });

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {service.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Provider: {service.provider}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
        <Chip
          size="small"
          label={`inheritance: ${service.inheritance_type}`}
          variant="outlined"
        />
        <Chip
          size="small"
          label={`responsibility: ${service.responsibility}`}
          variant="outlined"
        />
      </Stack>

      {service.description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {service.description}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Affected scopes
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {scopeChips.map((s) => (
          <Chip key={s.key} size="small" label={`${s.type}: ${s.label}`} />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Provided controls (effective)
      </Typography>

      <EffectiveControlsGrid
        rows={service.controls || []}
        loading={false}
        onRowClick={(row) =>
          navigate(
            `/controls?q=${encodeURIComponent(row.code || row.title || "")}`
          )
        }
      />
    </Box>
  );
}
