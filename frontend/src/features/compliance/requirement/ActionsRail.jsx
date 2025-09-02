import * as React from "react";
import { Box, Card, CardContent, Stack, Button, Typography, Divider } from "@mui/material";

export default function ActionsRail({ requirementId, versionId, scopeType, scopeId,
  onAddEvidence, onCreateException, onAssignOwner, onExport, suggestions
}) {
  return (
    <Stack spacing={2} sx={{ position: "sticky", top: 16 }}>
      <Card>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <Typography variant="overline" color="text.secondary">Actions</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" size="small" fullWidth onClick={onAddEvidence}>ADD EVIDENCE</Button>
            <Button variant="outlined" size="small" fullWidth onClick={onCreateException}>CREATE EXCEPTION</Button>
            <Button variant="outlined" size="small" fullWidth onClick={onAssignOwner}>ASSIGN OWNER</Button>
            <Divider sx={{ my: 1 }} />
            <Button variant="text" size="small" fullWidth onClick={onExport}>EXPORT REPORT</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <Typography variant="overline" color="text.secondary">Suggested controls</Typography>
          <Box sx={{ mt: 1 }}>{suggestions}</Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
