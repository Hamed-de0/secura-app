// Derive KPIs from existing feature mocks (no backend).
import { sampleTasks } from '../mywork/mocks';
import { sampleEvidence } from '../evidence/mocks';
import { sampleCampaigns } from '../attestations/mocks';
import { sampleExceptions } from '../exceptions/mocks';
import { sampleVendors } from '../providers/mocks';

export function computeKpis() {
  const openRisks = 14; // placeholder until risk mocks exist
  const evidenceDue30 = sampleEvidence.filter(e => daysUntil(e.dueDate) <= 30).length;
  const evidenceOverdue = sampleEvidence.filter(e => daysUntil(e.dueDate) < 0).length;
  const exceptionsPending = sampleExceptions.filter(x => x.status === 'pending').length;
  const attestationsRunning = sampleCampaigns.filter(c => c.status === 'running').length;
  const providerReviews30 = sampleVendors.filter(v => daysUntil(v.nextReview) <= 30).length;

  // Controls pass rate (from trend mock last point)
  const controlsPassRate = 76;

  return {
    openRisks,
    evidenceDue30,
    evidenceOverdue,
    exceptionsPending,
    attestationsRunning,
    controlsPassRate,
    providerReviews30,
  };
}

export function pickTopTasks(n = 6) {
  return sampleTasks
    .slice()
    .sort((a, b) => dateMs(a.dueDate) - dateMs(b.dueDate))
    .slice(0, n);
}

export function pickDueEvidence(n = 6) {
  return sampleEvidence
    .slice()
    .sort((a, b) => dateMs(a.dueDate) - dateMs(b.dueDate))
    .slice(0, n);
}

function dateMs(d) { return d ? new Date(d).getTime() : Infinity; }
function daysUntil(d) {
  if (!d) return Infinity;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}
