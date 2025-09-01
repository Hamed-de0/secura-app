// src/pages/compliance/components/RequirementDetailPanel.jsx
import * as React from "react";
import { Box, Chip, Divider, List, ListItem, ListItemText, Skeleton, Stack, Typography, Link } from "@mui/material";
import { fetchRequirementDetail } from "../../../api/services/compliance";

const STATUS_COLOR = {
  met: "#2e7d32",
  partial: "#ed6c02",
  gap: "#d32f2f",
  unknown: "#9e9e9e",
};

export default function RequirementDetailPanel({
  requirementId,
  versionId,
  scopeType,
  scopeId,
  onOpenExplorer,
  headerFallback,
}) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchRequirementDetail({
          requirementId,
          versionId,
          scopeType,
          scopeId,
          include: "mappings,evidence,exceptions,status",
        });
        if (alive) setData(res?.data ?? res);
      } catch (e) {
        console.error("Failed to fetch requirement detail:", e);
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [requirementId, versionId, scopeType, scopeId]);

  // 🔒 Call hooks unconditionally before any return
  const normalized = React.useMemo(
    () => normalizeDetailPayload(data, headerFallback),
    [data, headerFallback]
  );

  const { header, status, controls, evidence, lifecycle, exceptions } = normalized;

  const evByLink = React.useMemo(() => {
    const map = new Map();
    for (const ev of evidence) {
      const k = ev.contextLinkId ?? "__unmapped__";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    }
    return map;
  }, [evidence]);

  // Now safe to return conditionally
  if (loading) return <DrawerSkeleton headerFallback={headerFallback} />;
  if (error) return <Box p={2}><Typography color="error">Failed to load requirement details.</Typography></Box>;
  if (!data)  return <Box p={2}><Typography>No details available.</Typography></Box>;

  return (
    <Box sx={{ p: 2, pb: 6 }}>
      {/* Header */}
      <Stack spacing={1} mb={2}>
        {header.breadcrumbs?.length > 0 && (
          <Typography variant="overline" color="text.secondary">
            {header.breadcrumbs.join(" › ")}
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">
            {header.code ? `${header.code} — ${header.title}` : (header.title || "Requirement")}
          </Typography>
          <Chip
            size="small"
            label={status.label || "Unknown"}
            sx={{ bgcolor: STATUS_COLOR[status.key] || STATUS_COLOR.unknown, color: "#fff" }}
          />
        </Stack>
        {onOpenExplorer && (
          <Link component="button" variant="body2" onClick={onOpenExplorer}>
            Open in Explorer (preserves current filters)
          </Link>
        )}
      </Stack>

      {/* Controls (with inline evidence by control_context_link_id) */}
      <Section title="Controls">
        {controls.length === 0 ? <Empty text="No mapped controls." /> : (
          <List dense>
            {controls.map(c => {
              const evList = c.contextLinkId != null ? (evByLink.get(c.contextLinkId) || []) : [];
              return (
                <Box key={c.id} sx={{ mb: evList.length ? 1.5 : 0 }}>
                  <ListItem disableGutters
                    secondaryAction={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {typeof c.evidenceCount === 'number' && <Chip size="small" label={`${c.evidenceCount} ev.`} />}
                        <Chip
                          size="small"
                          label={c.statusLabel}
                          sx={{ bgcolor: (STATUS_COLOR[c.statusKey] || STATUS_COLOR.unknown), color: "#fff" }}
                        />
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={`${c.code || c.id} — ${c.title || "Untitled control"}`}
                      secondary={[c.description, c.lastEvidenceAt && `Last evidence: ${fmtDateTime(c.lastEvidenceAt)}`]
                        .filter(Boolean).join(" • ")}
                    />
                  </ListItem>

                  {evList.length > 0 && (
                    <Box sx={{ pl: 2, pr: 1, pb: 1 }}>
                      <List dense>
                        {evList.map(ev => (
                          <ListItem key={ev.id} disableGutters
                            secondaryAction={
                              <Chip size="small" label={ev.state}
                                    sx={{ bgcolor: ev.state === "valid" ? STATUS_COLOR.met : STATUS_COLOR.gap, color:"#fff" }} />
                            }>
                            <ListItemText
                              primary={ev.name}
                              secondary={[
                                ev.type && `Type: ${ev.type}`,
                                ev.validFrom && `From: ${fmtDate(ev.validFrom)}`,
                                ev.validTo && `To: ${fmtDate(ev.validTo)}`,
                                ev.verifiedAt && `Verified: ${fmtDate(ev.verifiedAt)}`,
                                ev.url && `URL: ${ev.url}`,
                              ].filter(Boolean).join(" • ")}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              );
            })}
          </List>
        )}
      </Section>

      {/* Unmapped evidence (if any) */}
      {(evByLink.get("__unmapped__") || []).length > 0 && (
        <Section title="Unmapped Evidence">
          <List dense>
            {(evByLink.get("__unmapped__") || []).map(ev => (
              <ListItem key={ev.id} disableGutters
                secondaryAction={
                  <Chip size="small" label={ev.state}
                        sx={{ bgcolor: ev.state === "valid" ? STATUS_COLOR.met : STATUS_COLOR.gap, color:"#fff" }} />
                }>
                <ListItemText
                  primary={ev.name}
                  secondary={[
                    ev.type && `Type: ${ev.type}`,
                    ev.validFrom && `From: ${fmtDate(ev.validFrom)}`,
                    ev.validTo && `To: ${fmtDate(ev.validTo)}`,
                    ev.verifiedAt && `Verified: ${fmtDate(ev.verifiedAt)}`,
                    ev.url && `URL: ${ev.url}`,
                  ].filter(Boolean).join(" • ")}
                />
              </ListItem>
            ))}
          </List>
        </Section>
      )}

      {/* Flat Evidence list (all) */}
      <Section title="Evidence">
        {evidence.length === 0 ? <Empty text="No evidence provided." /> : (
          <List dense>
            {evidence.map(ev => (
              <ListItem key={ev.id} disableGutters
                secondaryAction={
                  <Chip size="small" label={ev.state}
                        sx={{ bgcolor: ev.state === "valid" ? STATUS_COLOR.met : STATUS_COLOR.gap, color:"#fff" }} />
                }>
                <ListItemText
                  primary={ev.name}
                  secondary={[
                    ev.type && `Valid type: ${ev.type}`,
                    ev.validFrom && `Valid from: ${fmtDate(ev.validFrom)}`,
                    ev.validTo && `Valid to: ${fmtDate(ev.validTo)}`,
                    ev.verifiedAt && `Verified: ${fmtDate(ev.verifiedAt)}`,
                  ].filter(Boolean).join(" • ")}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* Lifecycle */}
      <Section title="Lifecycle">
        {lifecycle.length === 0 ? <Empty text="No lifecycle events." /> : (
          <List dense>
            {lifecycle.map(ev => (
              <ListItem key={ev.id} disableGutters>
                <ListItemText
                  primary={`${fmtDateTime(ev.timestamp)} — ${ev.event}`}
                  secondary={[ev.actor && `by ${ev.actor}`, ev.note].filter(Boolean).join(" • ")}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* Exceptions */}
      <Section title="Exceptions">
        {exceptions.length === 0 ? <Empty text="No exceptions." /> : (
          <List dense>
            {exceptions.map(ex => (
              <ListItem key={ex.id} disableGutters
                secondaryAction={ex.status ? <Chip size="small" label={ex.status} /> : null}>
                <ListItemText
                  primary={ex.title || `Exception #${ex.id}`}
                  secondary={[
                    ex.reason,
                    ex.expiresAt && `Expires: ${fmtDate(ex.expiresAt)}`,
                  ].filter(Boolean).join(" • ")}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box mb={3}>
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

function Empty({ text }) {
  return <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>{text}</Typography>;
}

function DrawerSkeleton({ headerFallback }) {
  return (
    <Box p={2}>
      <Typography variant="overline" color="text.secondary">Requirement</Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {headerFallback?.code ? `${headerFallback.code} — ${headerFallback.title || ""}` : <Skeleton width="70%" />}
      </Typography>
      <Skeleton width="40%" />
      <Box mt={2}>
        <Skeleton height={24} />
        <Skeleton height={24} />
        <Skeleton height={24} />
      </Box>
    </Box>
  );
}

function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d) ? String(s) : d.toLocaleDateString();
}
function fmtDateTime(s) {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d) ? String(s) : d.toLocaleString();
}

// Robust mapper (handles null payload + your current JSON)
function normalizeDetailPayload(payload, headerFallback) {
  if (!payload) {
    return {
      header: {
        code: headerFallback?.code ?? "",
        title: headerFallback?.title ?? "",
        breadcrumbs: [],
      },
      status: { key: "unknown", label: "Unknown" },
      controls: [],
      evidence: [],
      lifecycle: [],
      exceptions: [],
    };
  }

  const header = {
    code: payload?.requirement?.code ?? headerFallback?.code ?? "",
    title: payload?.requirement?.title ?? headerFallback?.title ?? "",
    breadcrumbs: [payload?.requirement?.breadcrumb].filter(Boolean),
  };

  const rawStatus = payload?.status?.status || payload?.status || "unknown";
  const key = String(rawStatus).toLowerCase();
  const status = { key, label: key.charAt(0).toUpperCase() + key.slice(1) };

  // Controls from `mappings`
  const controls = Array.isArray(payload?.mappings) ? payload.mappings.map(m => ({
    id: m.control_id,
    code: m.control_code,
    title: m.control_title,
    description: m.description,
    contextLinkId: m.context_link_id ?? null,
    statusKey: (m.control_status || "unknown").toLowerCase(),
    statusLabel: m.control_status || "Unknown",
    evidenceCount: m.evidence_count ?? 0,
    lastEvidenceAt: m.last_evidence_at ?? null,
  })) : [];

  // Evidence with control_context_link_id
  const evidence = Array.isArray(payload?.evidence) ? payload.evidence.map(e => ({
    id: e.evidence_id ?? e.id,
    name: e.title || `Evidence #${e.evidence_id}`,
    type: e.evidence_type || e.type,
    url: e.evidence_url,
    filePath: e.file_path,
    state: (e.status || "unknown").toLowerCase(), // valid|expired|unknown
    validFrom: e.collected_at,
    validTo: e.valid_until,
    verifiedAt: e.verified_at ?? e.last_verified_at,
    contextLinkId: e.control_context_link_id ?? null,
  })) : [];

  // Lifecycle (might be absent in your payload – default to [])
  const lifecycle = Array.isArray(payload?.lifecycle) ? payload.lifecycle.map(l => ({
    id: l.id,
    timestamp: l.timestamp ?? l.ts ?? l.created_at,
    event: l.event ?? l.action,
    actor: l.actor,
    note: l.note ?? l.message,
  })) : [];

  const exceptions = Array.isArray(payload?.exceptions) ? payload.exceptions.map(ex => ({
    id: ex.id,
    title: ex.title,
    reason: ex.reason,
    status: ex.status,
    expiresAt: ex.expires_at ?? ex.expiresAt,
  })) : [];

  return { header, status, controls, evidence, lifecycle, exceptions };
}
