import * as React from 'react';
import { Drawer, Box, IconButton, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function RightPanelDrawer({
  open,
  onClose,
  title,
  children,
  footer = null,
  initialWidth = 520,
  minWidth = 380,
  maxWidth = 980,
  keepMounted = true,
  hideBackdrop = false,
  PaperProps,
}) {
  const [width, setWidth] = React.useState(initialWidth);
  const dragState = React.useRef({ dragging: false, startX: 0, startW: initialWidth });

  React.useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth, open]);

  React.useEffect(() => {
    function onMove(e) {
      if (!dragState.current.dragging) return;
      const dx = dragState.current.startX - e.clientX; // dragging left edge
      const w = Math.max(minWidth, Math.min(maxWidth, dragState.current.startW + dx));
      setWidth(w);
    }
    function onUp() {
      dragState.current.dragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [minWidth, maxWidth]);

  const startDrag = (e) => {
    dragState.current.dragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startW = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted={keepMounted}
      hideBackdrop={hideBackdrop}
      PaperProps={{
        sx: {
          width,
          boxSizing: 'border-box',
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
        ...PaperProps,
      }}
    >
      {/* Drag handle on the left edge */}
      <Box
        onMouseDown={startDrag}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          zIndex: 2,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        aria-label="Resize panel"
      />

      {/* Header */}
      <Box sx={{ p: 1.25, pl: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, pr: 1 }} noWrap>
          {title || ''}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {children}
      </Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 1.25 }}>{footer}</Box>
        </>
      )}
    </Drawer>
  );
}
