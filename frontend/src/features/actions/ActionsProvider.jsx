import * as React from 'react';
import { Snackbar } from '@mui/material';
import { useLocation } from 'react-router-dom';

// Action UIs (single definitions, reused everywhere)
import UploadEvidenceDialog from './UploadEvidenceDialog.jsx';
import CreateExceptionDrawer from './CreateExceptionDrawer.jsx';
import MapControlDialog from './MapControlDialog.jsx';

// ---- Public action IDs (stable) --------------------------------------------
export const ACTIONS = {
  EVIDENCE_UPLOAD: 'evidence.upload',
  EXCEPTION_CREATE: 'exception.create',
  MAPPING_CONTROL_TO_REQ: 'mapping.controlToReq',
};

// ---- Registry: intent -> Component + adapters -------------------------------
const registry = {
  [ACTIONS.EVIDENCE_UPLOAD]: {
    Component: UploadEvidenceDialog,
    normalize: (payload) => ({ preset: payload }),
    onComplete: ({ files }) => ({ snack: `Uploaded ${files.length} file(s)` }),
  },
  [ACTIONS.EXCEPTION_CREATE]: {
    Component: CreateExceptionDrawer,
    normalize: (payload) => ({ preset: payload }),
    onComplete: () => ({ snack: 'Exception created' }),
  },
  [ACTIONS.MAPPING_CONTROL_TO_REQ]: {
    Component: MapControlDialog,
    normalize: (payload) => ({ preset: payload }),
    onComplete: ({ requirements = [] }) => ({ snack: `Mapped to ${requirements.length} requirement(s)` }),
  },
};

// ---- Context API ------------------------------------------------------------
const Ctx = React.createContext(null);
export const useActions = () => React.useContext(Ctx);

export default function ActionsProvider({ children }) {
  const [current, setCurrent] = React.useState(null); // { id, payload }
  const [snack, setSnack] = React.useState('');

  const run = React.useCallback((id, payload = {}) => {
    if (!registry[id]) return console.warn('Unknown action:', id);
    setCurrent({ id, payload });
  }, []);
  const close = React.useCallback(() => setCurrent(null), []);

  // Deep link: ?action=…&payload=<JSON>
  const { search } = useLocation();
  React.useEffect(() => {
    const qs = new URLSearchParams(search);
    const id = qs.get('action');
    const raw = qs.get('payload');
    if (!id || !registry[id] || current) return;
    let payload = {};
    if (raw) {
      try { payload = JSON.parse(raw); } catch { /* ignore */ }
    }
    setCurrent({ id, payload });
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = React.useMemo(() => ({ run }), [run]);

  const Comp = current ? registry[current.id]?.Component : null;
  const extra = current ? (registry[current.id]?.normalize?.(current.payload) || {}) : {};

  const handleDone = (result) => {
    const msg = registry[current.id]?.onComplete?.(result)?.snack;
    if (msg) setSnack(msg);
    close();
  };

  return (
    <Ctx.Provider value={value}>
      {children}

      {Comp && (
        <Comp
          open
          {...extra}
          onClose={close}
          onComplete={handleDone}
          onCreate={handleDone}
          onSave={handleDone}
        />
      )}

      <Snackbar open={!!snack} autoHideDuration={2200} onClose={() => setSnack('')} message={snack} />
    </Ctx.Provider>
  );
}
