import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack } from '@mui/material';

export default function UploadEvidenceDialog({ open, onClose, onComplete, preset }) {
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => { if (!open) setFiles([]); }, [open]);

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request / Upload evidence</DialogTitle>
      <DialogContent>
        {preset?.objectType && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Object: {preset.objectType} {preset.objectCode || ''}
          </Typography>
        )}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={files.length === 0}
          onClick={() => onComplete?.({ files, objectType: preset?.objectType, objectCode: preset?.objectCode })}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function fmt(b) { if (b === 0) return '0 B'; if (!b) return ''; const u=['B','KB','MB','GB']; let i=0,n=b; while(n>=1024&&i<u.length-1){n/=1024;i++;} return `${n.toFixed(1)} ${u[i]}`; }
