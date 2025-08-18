import { useEffect, useMemo, useState } from 'react';
import baseEvidence from '../../mock/evidence.json';


const LS_EVIDENCE = 'evidence_local';
const LS_ASSURANCE = 'assurance_overlays';
const LS_ACTIVITIES = 'activities_local';

/* ---------- Evidence per control (mock + local) ---------- */
export function useEvidence(controlId) {
  const [local, setLocal] = useState(() => readLS(LS_EVIDENCE, {}));

  useEffect(() => {
    const onStorage = () => setLocal(readLS(LS_EVIDENCE, {}));
    const onOverlay = () => setMap(readLS(LS_ASSURANCE, {})); // in-tab updates
    window.addEventListener('storage', onStorage);
    window.addEventListener('assurance_overlay_updated', onOverlay);
       return () => {
     window.removeEventListener('storage', onStorage);
     window.removeEventListener('assurance_overlay_updated', onOverlay);
   };
    
  }, []);

  const list = useMemo(() => {
    const base = baseEvidence?.by_control?.[String(controlId)] || [];
    const extra = (local?.[String(controlId)] || []);
    return [...base, ...extra].sort((a,b)=> new Date(b.ts)-new Date(a.ts));
  }, [controlId, local]);

  const addEvidence = (fileLike, note, user = 'you@local') => {
    if (!controlId) return;
    const next = { ...local };
    const arr = next[String(controlId)] || [];
    arr.push({ id: `local-${Date.now()}`, filename: fileLike || 'evidence.txt', note, uploaded_by: user, ts: new Date().toISOString() });
    next[String(controlId)] = arr;
    writeLS(LS_EVIDENCE, next);
    setLocal(next);
    logActivity({
      type: 'evidence_upload',
      scope: 'entity:1',
      user,
      entity: { kind: 'control', id: Number(controlId), code: null, title: null },
      file: fileLike || 'evidence.txt',
      size_kb: 0
    });
  };

  return { list, addEvidence };
}

/* ---------- Assurance overlays (reflect immediately in grids) ---------- */
export function useAssuranceOverlay() {
  const [map, setMap] = useState(() => readLS(LS_ASSURANCE, {}));

  useEffect(() => {
    const onStorage = () => setMap(readLS(LS_ASSURANCE, {}));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setStatus = (controlId, status, user='you@local') => {
    const next = { ...map, [String(controlId)]: { assurance_status: status } };
    writeLS(LS_ASSURANCE, next);
    setMap(next);
    try { window.dispatchEvent(new Event('assurance_overlay_updated')); } catch {}
    logActivity({
      type: 'assurance_change',
      scope: 'entity:1',
      user,
      entity: { kind: 'control', id: Number(controlId), code: null, title: null },
      from: null, to: status
    });
  };

  return { map, setStatus };
}

/* ---------- Activities local merge helper ---------- */
export function logActivity(event) {
  const cur = readLS(LS_ACTIVITIES, []);
  const next = [{ id: `loc-${Date.now()}`, ts: new Date().toISOString(), ...event }, ...cur];
  writeLS(LS_ACTIVITIES, next);
}

/* ---------- LS helpers ---------- */
function readLS(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || ''); return v ?? fallback; } catch { return fallback; }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
