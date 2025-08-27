// src/features/risks/builder/ContextBuilderDrawer.jsx
import * as React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Divider,
  Typography,
  LinearProgress,
} from "@mui/material";
import RightPanelDrawer from "../../../components/rightpanel/RightPanelDrawer";

import StepModeSelect from "./steps/StepModeSelect";
import StepSelect from "./steps/StepSelect";
import StepPrefill from "./steps/StepPrefill";
import StepGovern from "./steps/StepGovern";
import StepReview from "./steps/StepReview";

// ⬇️ real data services
import { fetchScopeCatalog } from "../../../api/services/scopes";
// NOTE: if your fetchScenarios actually lives in scenarios.js, change import accordingly.
import {
  fetchScenarios,
  prefillRiskContexts,
} from "../../../api/services/risks";

const STEPS = ["Select", "Prefill", "Own & Review", "Confirm"];

export default function ContextBuilderDrawer({
  open,
  onClose,
  onCreated, // function(summary, items)
  initialMode = "scenarioFirst", // or 'scopeFirst'
}) {
  const [mode, setMode] = React.useState(initialMode); // scenarioFirst | scopeFirst
  const [activeStep, setActiveStep] = React.useState(0);

  // Step data
  const [selectedScenarios, setSelectedScenarios] = React.useState([]); // [scenarioId,...]
  const [selectedScopes, setSelectedScopes] = React.useState([]); // [{id,type,label},...]
  const [rows, setRows] = React.useState([]); // candidate rows with scores

  // Ownership (Step 2)
  const [ownerId, setOwnerId] = React.useState(null);
  const [nextReview, setNextReview] = React.useState(null);

  // Catalogs
  const [scenarios, setScenarios] = React.useState([]);
  const [scopes, setScopes] = React.useState([]);
  const [loadingLists, setLoadingLists] = React.useState(false);

  // Prefill state
  const [loadingPrefill, setLoadingPrefill] = React.useState(false);

  // Load catalogs when drawer opens
  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setLoadingLists(true);
      try {
        const [scen, scps] = await Promise.all([
          fetchScenarios?.({ limit: 500 }) ?? Promise.resolve([]),
          fetchScopeCatalog(),
        ]);
        if (!alive) return;
        setScenarios(Array.isArray(scen) ? scen : []);
        setScopes(Array.isArray(scps) ? scps : []);
      } finally {
        if (alive) setLoadingLists(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  // Helpers to enrich prefill rows
  const scenById = React.useMemo(
    () => Object.fromEntries(scenarios.map((s) => [s.id, s])),
    [scenarios]
  );
  const scopeKey = (ref) => `${ref.type}:${ref.id}`;
  const scopeByKey = React.useMemo(
    () =>
      Object.fromEntries(
        scopes.map((s) => [scopeKey({ type: s.type, id: s.id }), s])
      ),
    [scopes]
  );

  // Reset when closing
  React.useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setActiveStep(0);
      setSelectedScenarios([]);
      setSelectedScopes([]);
      setRows([]);
      setOwnerId(null);
      setNextReview(null);
    }
  }, [open, initialMode]);

  // --- Prefill via backend ---
  const doPrefill = async () => {
    if (!selectedScenarios.length || !selectedScopes.length) return;
    setLoadingPrefill(true);
    try {
      // Build request pairs
      const pairs = [];
      for (const sid of selectedScenarios) {
        for (const sc of selectedScopes) {
          pairs.push({
            scenarioId: sid,
            scopeRef: { type: sc.type, id: sc.id },
          });
        }
      }

      const pf = await prefillRiskContexts(pairs); // [{scenarioId, scopeRef, exists, likelihood, impacts, rationale, suggestedReviewDate}]

      const adapted = (pf || []).map((x) => {
        const scen = scenById[x.scenarioId];
        const sc = scopeByKey[scopeKey(x.scopeRef)];
        const impacts = x.impacts || {};
        const maxImpact = Math.max(
          impacts.C || 0,
          impacts.I || 0,
          impacts.A || 0,
          impacts.L || 0,
          impacts.R || 0
        );
        // 5x5 scale residual + simple RAG (adjust later if you move to 1–50 appetite)
        const residual = (x.likelihood || 0) * maxImpact;
        let rag = "Green";
        if (residual > 20) rag = "Red";
        else if (residual > 10) rag = "Amber";

        return {
          id: `${x.scenarioId}:${x.scopeRef.type}:${x.scopeRef.id}`,
          scenarioId: x.scenarioId,
          scenarioTitle: scen?.title || `Scenario ${x.scenarioId}`,
          scopeRef: x.scopeRef,
          scopeLabel: sc?.label || `${x.scopeRef.type}:${x.scopeRef.id}`,
          likelihood: x.likelihood ?? 3,
          impacts,
          rationale: x.rationale || [],
          residual,
          rag,
          exists: !!x.exists,
        };
      });

      setRows(adapted);
    } finally {
      setLoadingPrefill(false);
    }
  };

  const canNextFromSelect =
    selectedScenarios.length > 0 && selectedScopes.length > 0;

  const handleNext = async () => {
    if (activeStep === 0) {
      await doPrefill();
    }
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleCommit = () => {
    // In real flow: POST /bulk_create with rows (+ ownerId/nextReview), then refresh register/metrics.
    const created = rows.filter((r) => !r.exists);
    const skipped = rows.filter((r) => r.exists);
    const overAppetite = rows.filter((r) => r.overAppetite).length;

    onCreated?.(
      { created: created.length, skipped: skipped.length, overAppetite },
      created
    );
    onClose?.();
  };

  // Wizard footer CTAs
  const footer = (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ gap: 1 }}
    >
      <Typography variant="body2" color="text.secondary">
        {activeStep === 0 && canNextFromSelect
          ? `${selectedScenarios.length} scenario(s) × ${
              selectedScopes.length
            } scope(s) → ${
              selectedScenarios.length * selectedScopes.length
            } candidate(s)`
          : ""}
        {activeStep === 1 && `Candidates: ${rows.length}`}
      </Typography>
      <Box>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        {activeStep < STEPS.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !canNextFromSelect}
          >
            Next
          </Button>
        )}
        {activeStep === STEPS.length - 1 && (
          <Button variant="contained" color="primary" onClick={handleCommit}>
            Create {rows.filter((r) => !r.exists).length} Contexts
          </Button>
        )}
      </Box>
    </Stack>
  );

  return (
    <RightPanelDrawer
      open={open}
      onClose={onClose}
      title="Risk Context Builder"
      initialWidth={920}
      minWidth={720}
      maxWidth={1280}
      footer={footer}
    >
      <Box sx={{ display: "grid", gap: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Divider />

        {/* Optional loader on the first step while catalogs load */}
        {activeStep === 0 && loadingLists && <LinearProgress />}

        {/* Step 0: Select mode + pick items (now using real data) */}
        {activeStep === 0 && (
          <StepSelect
            mode={mode}
            onModeChange={setMode}
            scenarios={scenarios}
            scopes={scopes}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            selectedScopes={selectedScopes}
            setSelectedScopes={setSelectedScopes}
          />
        )}

        {/* Step 1: Prefill */}
        {activeStep === 1 && (
          <>
            {loadingPrefill && <LinearProgress />}
            <StepPrefill rows={rows} setRows={setRows} />
          </>
        )}

        {/* Step 2: Own & Review (owners source will be handled inside the step if needed) */}
        {activeStep === 2 && (
          <StepGovern
            rows={rows}
            setRows={setRows}
            owners={[]} // keep prop for compatibility; step can use OwnerPicker internally
            ownerId={ownerId}
            setOwnerId={setOwnerId}
            nextReview={nextReview}
            setNextReview={setNextReview}
          />
        )}

        {/* Step 3: Confirm */}
        {activeStep === 3 && (
          <StepReview rows={rows} ownerId={ownerId} nextReview={nextReview} />
        )}
      </Box>
    </RightPanelDrawer>
  );
}
