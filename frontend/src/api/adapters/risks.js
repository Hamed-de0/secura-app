function normalize(s) { return String(s || '').trim().toLowerCase(); }
function title(s) { return s ? s.replace(/\b\w/g, c => c.toUpperCase()) : '—'; }

function statusChipMeta(status) {
  switch (normalize(status)) {
    case 'open':        return { color: 'warning',  variant: 'filled'   };
    case 'mitigating':  return { color: 'info',     variant: 'filled'   };
    case 'accepted':    return { color: 'secondary',variant: 'outlined' };
    case 'exception':   return { color: 'error',    variant: 'outlined' };
    case 'closed':      return { color: 'success',  variant: 'filled'   };
    case 'monitoring':  return { color: 'primary',  variant: 'outlined' };
    case 'deferred':    return { color: 'default',  variant: 'outlined' };
    default:            return { color: 'default',  variant: 'outlined' };
  }
}


export function adaptContextsToRegisterRows(
  items = [],
  {
    // Fallbacks when appetite isn't provided (5×5 scale → max 25)
    appetiteFallback = { greenMax: 10, amberMax: 20 },
    now = new Date(),
  } = {}
) {
  return items.map((it) => {
    
    const impacts = it.impacts || {};
    const maxImpact = Math.max(
      0,
      impacts.C || 0,
      impacts.I || 0,
      impacts.A || 0,
      impacts.L || 0,
      impacts.R || 0
    );

    const residual = it.residual ?? 0;

    // Appetite thresholds (prefer per-item appetite; else fallback)
    const greenMax = it.appetite?.greenMax ?? appetiteFallback.greenMax;
    const amberMax = it.appetite?.amberMax ?? appetiteFallback.amberMax;

    // RAG color (string)
    const rag = calcRagColor(residual, greenMax, amberMax);

    // Optional: MUI chip color you can use directly in renderCell
    const ragMui =
      rag === 'red' ? 'error' : rag === 'yellow' ? 'warning' : 'success';

    const status = it.status ?? 'Open';
    const { color: statusColor, variant: statusVariant } = statusChipMeta(status);

    return {
      id: it.contextId ?? it.id,
      scenario: it.scenarioTitle ?? it.scenario ?? '—',
      scope:
        it.scopeName ||
        it.scopeRef?.label ||
        it.scopeDisplay ||
        it.scope ||
        '—',
      L: it.likelihood ?? 0,
      I: maxImpact,
      initial: it.initial ?? 0,
      residual,
      // TODO(gated): uses optional residual_gated/targetResidual
      residualEffective: it.residual_gated,
      targetResidual: it.targetResidual,
      owner: it.owner ?? 'Unassigned',
      // extras for renderers
      
      statusColor,
      statusVariant, 
      statusLabel: status ,
      // human-friendly relative time
      updated: formatRelative(it.lastUpdated || it.updatedAt, now),
      // extra fields if you want them in the grid later
      rag,       // 'green' | 'yellow' | 'red'
      ragMui,    // 'success' | 'warning' | 'error'
      updatedAt: it.lastUpdated || it.updatedAt || null, // raw ISO if needed
    };
  });
}



/* ---------- helpers ---------- */

function calcRagColor(residual, greenMax, amberMax) {
  if (residual == null) return 'green';
  if (residual <= greenMax) return 'green';
  if (residual <= amberMax) return 'yellow';
  return 'red';
}

/** e.g. 'now', '45m', '6h', '3d', '2w', '4mo', '1y' */
function formatRelative(iso, now = new Date()) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  const ms = now - d;
  if (ms < 0) return 'now';

  const s = Math.floor(ms / 1000);
  if (s < 60) return 'now';

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;

  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;

  const w = Math.floor(days / 7);
  if (w < 4) return `${w}w`;

  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;

  const y = Math.floor(days / 365);
  return `${y}y`;
}
