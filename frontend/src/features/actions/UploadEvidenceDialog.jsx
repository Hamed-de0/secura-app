import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack, Tabs, Tab, TextField } from '@mui/material';

export default function UploadEvidenceDialog({ open, onClose, onComplete, preset, allowSelectExisting = false }) {
  const [files, setFiles] = React.useState([]);
  const [mode, setMode] = React.useState('upload'); // 'upload' | 'select'
  const [existingId, setExistingId] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setFiles([]);
      setExistingId('');
      setMode('upload');
    }
  }, [open]);

  const onDrop = (e) => {
    e.preventDefault();
    const list = [...(e.dataTransfer?.files || [])];
    if (list.length) setFiles((prev) => [...prev, ...list]);
  };
  const onPick = (e) => {
    const list = [...(e.target?.files || [])];
    if (list.length) setFiles((prev) => [...prev, ...list]);
  };
  const removeAt = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const canSelect = allowSelectExisting && String(existingId).trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request / Upload evidence</DialogTitle>
      <DialogContent>
        {preset?.objectType && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Object: {preset.objectType} {preset.objectCode || ''}
          </Typography>
        )}
        {allowSelectExisting && (
          <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ mb: 1 }}>
            <Tab value="upload" label="Upload new" />
            <Tab value="select" label="Select existing" />
          </Tabs>
        )}

        {mode === 'select' && allowSelectExisting ? (
          <Box>
            <TextField
              fullWidth
              label="Existing evidence ID"
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
              placeholder="Enter evidence ID to use as replacement"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: .5, display: 'block' }}>
              Provide the ID of an existing evidence item to supersede with.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              onDragOver={(e)=> e.preventDefault()}
              onDrop={onDrop}
              sx={{
                border: '1px dashed', borderColor: 'divider', borderRadius: 2,
                p: 3, textAlign: 'center', bgcolor: 'background.default', cursor: 'pointer'
              }}
              onClick={() => document.getElementById('upload-input').click()}
            >
              <Typography>Drag & drop files here, or click to select</Typography>
              <input id="upload-input" type="file" multiple hidden onChange={onPick} />
            </Box>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
              {files.map((f, i) => (
                <Chip key={`${f.name}-${i}`} label={`${f.name} (${fmt(f.size)})`} onDelete={() => removeAt(i)} />
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'select' && allowSelectExisting ? (
          <Button
            variant="contained"
            disabled={!canSelect}
            onClick={() => onComplete?.({ selectedId: Number(existingId), objectType: preset?.objectType, objectCode: preset?.objectCode })}
          >
            Use Selected
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={files.length === 0}
            onClick={() => onComplete?.({ files, objectType: preset?.objectType, objectCode: preset?.objectCode })}
          >
            Upload
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function fmt(b) { if (b === 0) return '0 B'; if (!b) return ''; const u=['B','KB','MB','GB']; let i=0,n=b; while(n>=1024&&i<u.length-1){n/=1024;i++;} return `${n.toFixed(1)} ${u[i]}`; }
