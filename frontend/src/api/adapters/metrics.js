// Metrics adapter for Risk Ops KPI tiles.
// Normalizes API response into a stable UI shape expected by KPIStrip.

function toNum(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function pct(num, den) {
  const n = toNum(num), d = toNum(den);
  if (d <= 0) return 0;
  return Math.round((n / d) * 100);
}

function toIso(x) {
  if (!x) return null;
  try {
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

export function adaptRiskOpsMetrics(api = {}) {
  // Guard against null or non-object inputs
  if (!api || typeof api !== 'object') api = {};
  // Totals
  const total = toNum(
    api.total ?? api.count ?? api.full_count ?? api.contexts_total ?? 0
  );

  // Appetite
  const overAppetite = toNum(
    api.overAppetite ?? api.over_appetite ?? api.overAppetiteCount ?? api.over_appetite_count ?? api.over_threshold ?? 0
  );
  const appetitePercent = pct(overAppetite, total);

  // RAG counts (green/amber/red)
  const rag = api.ragCounts ?? api.rag_counts ?? api.rag_distribution ?? api.rag ?? {};
  const ragCounts = {
    green: toNum(rag.green ?? rag.Green ?? rag.g),
    amber: toNum(rag.amber ?? rag.Amber ?? rag.yellow ?? rag.Yellow ?? rag.a),
    red: toNum(rag.red ?? rag.Red ?? rag.r),
  };

  // Severity counts (optional)
  const sev = api.severityCounts ?? api.severity_counts ?? {};
  const highCritical = toNum(sev.High ?? sev.high) + toNum(sev.Critical ?? sev.critical) || ragCounts.red || 0;

  // Residual (optional)
  const avgResidual = toNum(api.avgResidual ?? api.avg_residual);

  // Review SLA
  const review = api.reviewSLA ?? api.review_sla ?? api.reviews ?? {};
  const rOn = toNum(review.onTrack ?? review.on_track ?? review.ok);
  const rSoon = toNum(review.dueSoon ?? review.due_soon ?? review.warn);
  const rLate = toNum(review.overdue);
  const reviewPct = pct(rOn, rOn + rSoon + rLate);

  // Evidence freshness
  const evidence = api.evidence ?? api.assurance ?? {};
  const eOk = toNum(evidence.ok);
  const eWarn = toNum(evidence.warn);
  const eLate = toNum(evidence.overdue);
  const eMissing = toNum(evidence.missing);
  const evidencePct = pct(eOk, eOk + eWarn + eLate);

  // Controls awaiting verification (optional)
  const controlsAwaitingVerification = toNum(
    api.controlsAwaitingVerification ?? api.controls_awaiting_verification ?? api.controls?.awaitingVerification ?? api.controls?.awaiting_verification ?? api.awaiting_verification ?? 0
  );

  // Timestamps
  const lastUpdatedMax = toIso(
    api.lastUpdatedMax ?? api.last_updated_max ?? api.max_updated_at
  );
  const asOf = toIso(api.asOf ?? api.as_of ?? api.generated_at ?? api.timestamp ?? lastUpdatedMax);

  // Ownership/Mitigations (optional)
  const withOwner = toNum(api.ownerAssigned ?? api.owners_assigned ?? api.withOwner);
  const withOwnerPct = pct(withOwner, total);
  const mitigations = toNum(api.mitigationsInProgress ?? api.mitigations_in_progress);

  // Improvement (optional)
  const residualReduction30d = toNum(api.residualReduction30d ?? api.residual_reduction_30d);

  return {
    exposure: {
      total,
      highCritical,
      avgResidual,
      trend: [],
    },
    appetite: {
      count: overAppetite,
      percent: appetitePercent, // note: UI appends "%"
      exceptions30: toNum(api.exceptionsExpiring30d ?? api.exceptions?.expiring30d),
    },
    ownership: {
      withOwner,
      withOwnerPct: `${withOwnerPct}%`,
      mitigations,
    },
    assurance: {
      evidencePct: `${evidencePct}%`,
      reviewPct: `${reviewPct}%`,
    },
    improvement: {
      days: 30,
      delta: residualReduction30d ? `-${residualReduction30d}` : '0',
    },
    meta: {
      ragCounts,
      reviewSLA: { onTrack: rOn, dueSoon: rSoon, overdue: rLate },
      evidence: { ok: eOk, warn: eWarn, overdue: eLate, missing: eMissing },
      controlsAwaitingVerification,
      lastUpdatedMax,
      asOf,
    },
  };
}
