import * as React from "react";
import { Box, Card, CardContent, Stack, Button, Typography, Divider } from "@mui/material";

export default function ActionsRail({ requirementId, versionId, scopeType, scopeId,
  onAddEvidence, onCreateException, onAssignOwner, onExport, suggestions
}) {
  return (
    <Stack spacing={2} sx={{ position: "sticky", top: 16 }}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Actions</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" size="small" onClick={onAddEvidence} disabled={!scopeType || scopeId == null}>
              Add Evidence
            </Button>
            <Button variant="outlined" size="small" onClick={onCreateException}>
              Create Exception
            </Button>
            <Button variant="outlined" size="small" onClick={onAssignOwner}>
              Assign Owner
            </Button>
            <Divider sx={{ my: 1 }} />
            <Button variant="text" size="small" onClick={onExport}>
              Export report
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Suggested controls</Typography>
          <Box sx={{ mt: 1 }}>
            {suggestions}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
