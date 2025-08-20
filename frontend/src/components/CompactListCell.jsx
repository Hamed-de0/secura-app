import React from "react";
import { Box, Button, Popover, List, ListItem, Typography } from "@mui/material";

export default function CompactListCell({ items = [], max = 2 }) {
  const arr = Array.isArray(items) ? items : [];
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const visible = arr.slice(0, max);
  const extra = arr.length > max ? arr.length - max : 0;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ color: "text.primary" }}>
          {visible.join(" • ") || "—"}
        </Typography>
        {extra > 0 && (
          <Button size="small" variant="text" onClick={(e) => setAnchor(e.currentTarget)}>
            +{extra}
          </Button>
        )}
      </Box>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 1, maxWidth: 360 }}>
          <List dense disablePadding>
            {arr.map((x, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <Typography variant="body2">{String(x)}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}
