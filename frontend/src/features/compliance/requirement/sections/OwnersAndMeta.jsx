import * as React from "react";
import { Box, Stack, Chip, Typography, Link } from "@mui/material";

export default function OwnersAndMeta({ owners, onAssign }) {
  const list = Array.isArray(owners) ? owners : [];
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">Owners</Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
        {list.map((o, i) => (
          <Chip key={`${o.scope_type}-${o.scope_id}-${o.user_id}-${i}`} label={`${o.role}: ${o.name || o.user_id}`} />
        ))}
        <Link component="button" onClick={onAssign}>Assign owner</Link>
      </Stack>
    </Box>
  );
}
