import * as React from 'react';
import { Card, CardContent, Stack, Button } from '@mui/material';
import AddTaskIcon from '@mui/icons-material/AddTask';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FactCheckIcon from '@mui/icons-material/FactCheck';

export default function QuickActions({ scopeQuery }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
          <Button size="small" startIcon={<AddTaskIcon/>} href={`/exceptions${scopeQuery}`}>Create exception</Button>
          <Button size="small" startIcon={<UploadFileIcon/>} href={`/evidence${scopeQuery}`}>Request evidence</Button>
          <Button size="small" startIcon={<FactCheckIcon/>} href={`/attestations${scopeQuery}`}>New attestation</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
