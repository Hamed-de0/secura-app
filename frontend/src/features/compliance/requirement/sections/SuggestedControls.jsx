import * as React from "react";
import { List, ListItem, Stack, Chip, Button, Divider, Typography, Box } from "@mui/material";

const TIER_COLOR = { high: "#2e7d32", med: "#ed6c02", low: "#9e9e9e" };

export default function SuggestedControls({ items, onAddMapping }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <em>No suggestions right now.</em>;

  return (
    <List dense disablePadding>
      {list.map((s, idx) => {
        const score = typeof s.score === "number" ? s.score : null;
        const tier = scoreTier(score);
        return (
          <React.Fragment key={s.control_id}>
            <ListItem sx={{ py: 0.75 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
                {/* LEFT */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25, minWidth: 0 }}>
                    <Chip size="small" label={s.control_code || s.control_id} variant="outlined" />
                    <Typography variant="body2" noWrap title={s.title || ""}>
                      {s.title || ""}
                    </Typography>
                  </Stack>
                  {s.reason && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={s.reason}
                    >
                      {s.reason}
                    </Typography>
                  )}
                </Box>

                {/* RIGHT */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  {score !== null && (
                    <Chip
                      size="small"
                      label={`Score ${score.toFixed(2)}`}
                      sx={{ bgcolor: TIER_COLOR[tier], color: "#fff" }}
                    />
                  )}
                  <Button size="small" variant="contained" onClick={() => onAddMapping(s.control_id)}>
                    ADD MAPPING
                  </Button>
                </Stack>
              </Stack>
            </ListItem>
            {idx < list.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </List>
  );
}

function scoreTier(score) {
  if (score === null || isNaN(score)) return "low";
  if (score >= 2.0) return "high";
  if (score >= 1.0) return "med";
  return "low";
}
