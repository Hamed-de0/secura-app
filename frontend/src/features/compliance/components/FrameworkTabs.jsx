import * as React from "react";
import { Box, Chip, Stack, Skeleton, Tooltip, Typography } from "@mui/material";
import { useComplianceStatic } from "../../../store/complianceStaticStore";
import { ScopeContext } from "../../../store/scope/ScopeProvider";
import { fetchActiveFrameworks } from "../../../api/services/compliance";

// Normalize API versions into a stable shape for the UI
function normalizeVersions(list = []) {
  return list.map((x) => ({
    versionId: x.versionId ?? x.version_id ?? x.id,            // support multiple shapes
    frameworkId: x.frameworkId ?? x.framework_id,
    frameworkName: x.frameworkName ?? x.framework_name,
    versionLabel: x.versionLabel ?? x.version_label,
    label:
      (x.frameworkName ?? x.framework_name ?? "Framework") +
      (x.versionLabel ?? x.version_label ? ` ${x.versionLabel ?? x.version_label}` : ""),
  }));
}

export default function FrameworkTabs() {
  // 🟢 Use the actual keys from the static store
  const { versions: staticVersions = [], loading: staticLoading } = useComplianceStatic();
  const { scope, versionId, setVersionId } = React.useContext(ScopeContext);

  // Local normalized list
  const frameworks = React.useMemo(() => normalizeVersions(staticVersions), [staticVersions]);
  const staticLoaded = !staticLoading;

  // Active-at-scope map: versionId -> activation meta
  const [byVersion, setByVersion] = React.useState(new Map());
  const [loadingActive, setLoadingActive] = React.useState(false);

  // Load activations when scope changes
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!scope?.type || !scope?.id) return;
      setLoadingActive(true);
      try {
        const resp = await fetchActiveFrameworks({ scopeType: scope.type, scopeId: scope.id });
        if (!mounted) return;
        // Build a simple map locally (no adapter needed)
        const map = new Map();
        (resp?.items ?? []).forEach((i) => {
          map.set(Number(i.version_id), {
            isActiveAtScope: true,
            isActiveNow: !!i.is_active_now,
            raw: i,
          });
        });
        setByVersion(map);
      } catch (e) {
        console.error("active frameworks", e);
        if (mounted) setByVersion(new Map());
      } finally {
        if (mounted) setLoadingActive(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [scope?.type, scope?.id]);

  // On first ready: ensure we have a selected versionId
  const bootRef = React.useRef(false);
  React.useEffect(() => {
    if (!staticLoaded || !frameworks.length) return;
    if (bootRef.current) return;
    bootRef.current = true;

    const current = Number(versionId);
    const exists = frameworks.some((f) => Number(f.versionId) === current);
    if (exists) return;

    // prefer the first active version; else first item
    const firstActive = frameworks.find((f) => byVersion.has(Number(f.versionId)));
    setVersionId(firstActive?.versionId ?? frameworks[0].versionId);
  }, [staticLoaded, frameworks, byVersion, versionId, setVersionId]);

  // Build pills
  const pills = React.useMemo(() => {
    const sel = Number(versionId);
    return frameworks.map((f) => {
      const act = byVersion.get(Number(f.versionId));
      return {
        versionId: f.versionId,
        label: f.label,
        selected: Number(f.versionId) === sel,
        isActiveAtScope: !!act?.isActiveAtScope,
        isActiveNow: !!act?.isActiveNow,
      };
    });
  }, [frameworks, byVersion, versionId]);

  if (!staticLoaded) {
    return (
      <Stack direction="row" spacing={1} sx={{ px: 1, py: 0.5, overflowX: "auto" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={140} height={32} />
        ))}
      </Stack>
    );
  }

  if (staticLoaded && frameworks.length === 0) {
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          No framework versions found. Check <em>/framework_versions</em> API or policies.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 1, py: 0.5, overflowX: "auto" }}>
      <Stack direction="row" spacing={1} sx={{ minHeight: 36 }}>
        {pills.map((p) => {
          const color = p.isActiveAtScope ? "primary" : "default";
          const variant = p.selected ? "filled" : "outlined";
          const chip = (
            <Chip
              key={p.versionId}
              label={p.label}
              variant={variant}
              color={color}
              clickable
              onClick={() => setVersionId(p.versionId)}
              sx={{ height: 32 }}
            />
          );
          return p.isActiveNow ? (
            <Tooltip key={p.versionId} title="Active at this scope now">
              {chip}
            </Tooltip>
          ) : (
            chip
          );
        })}
        {loadingActive && <Skeleton variant="rounded" width={100} height={32} />}
      </Stack>
    </Box>
  );
}
