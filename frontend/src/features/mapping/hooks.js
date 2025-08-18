import { useEffect, useMemo, useState } from 'react';
import { MOCK_MODE } from '../../lib/mock/mockMode';
import mappingsMock from '../../mock/mappings.json';
import catalogMock from '../../mock/controls_catalog.json';

/** Local draft store key per version */
const keyFor = (versionId) => `mm_draft_v${versionId}`;

export function useControlsCatalog() {
    const list = useMemo(() => (catalogMock.controls || []), []);
    return { data: list, isLoading: false };
}

/** Manage requirement↔controls mappings as a local draft (no backend yet). */
export function useMappings(versionId) {
    const [draft, setDraft] = useState(null);
    const [base, setBase] = useState(null);
    // Initialize from mock + any saved draft in localStorage
    useEffect(() => {
        if (!versionId) return;
        const saved = safeParse(localStorage.getItem(keyFor(versionId)));
        const _base = (MOCK_MODE && mappingsMock.version_id === versionId)
            ? mappingsMock
            : { version_id: versionId, requirements: {} };
        setBase(clone(_base));
        setDraft(saved && saved.version_id === versionId ? saved : clone(_base));
    }, [versionId]);

    const persist = (next) => {
        setDraft(next);
        try { localStorage.setItem(keyFor(versionId), JSON.stringify(next)); } catch { }
    };

    const api = useMemo(() => ({
        isLoading: !draft,
        base,
        getForRequirement: (reqId) => draft?.requirements?.[String(reqId)] || [],
        getBaseForRequirement: (reqId) => base?.requirements?.[String(reqId)] || [],
        diffForRequirement: (reqId) => {
            const rid = String(reqId);
            const a = base?.requirements?.[rid] || [];
            const b = draft?.requirements?.[rid] || [];
            const idx = (arr) => new Map(arr.map(m => [m.control_id, Number(m.weight) || 0]));
            const A = idx(a), B = idx(b);
            let added = 0, removed = 0, changed = 0;
            for (const id of B.keys()) if (!A.has(id)) added++;
            for (const id of A.keys()) if (!B.has(id)) removed++;
            for (const id of B.keys()) {
                if (A.has(id) && A.get(id) !== B.get(id)) changed++;
            }
            return { added, removed, changed, total: b.length };
        },
        hasChanges: (reqId) => {
            const d = apiRef?.diffForRequirement ? apiRef.diffForRequirement(reqId) : null;
            return d ? (d.added || d.removed || d.changed) > 0 : false;
        },
        addMapping: (reqId, control_id, weight = 100) => {
            const rid = String(reqId);
            const next = clone(draft);
            next.requirements[rid] = next.requirements[rid] || [];
            if (!next.requirements[rid].some(m => m.control_id === control_id)) {
                next.requirements[rid].push({ control_id, weight });
                persist(next);
            }
        },
        updateWeight: (reqId, control_id, weight) => {
            const rid = String(reqId);
            const next = clone(draft);
            const row = (next.requirements[rid] || []).find(m => m.control_id === control_id);
            if (row) { row.weight = Math.max(0, Math.min(1000, Number(weight) || 0)); persist(next); }
        },
        removeMapping: (reqId, control_id) => {
            const rid = String(reqId);
            const next = clone(draft);
            next.requirements[rid] = (next.requirements[rid] || []).filter(m => m.control_id !== control_id);
            persist(next);
        },
        totalWeight: (reqId) => (draft?.requirements?.[String(reqId)] || [])
            .reduce((sum, m) => sum + (Number(m.weight) || 0), 0),
        resetDraft: () => {
            try { localStorage.removeItem(keyFor(versionId)); } catch { }
            const base = (MOCK_MODE && mappingsMock.version_id === versionId) ? mappingsMock
                : { version_id: versionId, requirements: {} };
            setDraft(clone(base));
        },
        // placeholder for real save later
        serialize: () => clone(draft),
        exportJSON: () => {
            const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `mappings_v${versionId}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }), [draft, versionId]);

    const apiRef = api;

    return api;
}

function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
function safeParse(s) { try { return JSON.parse(s || ''); } catch { return null; } }
