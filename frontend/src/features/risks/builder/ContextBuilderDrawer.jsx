import * as React from 'react';
import {
  Box, Stepper, Step, StepLabel, Button, Stack, Divider, Typography, LinearProgress
} from '@mui/material';
import  RightPanelDrawer from '../../../components/rightpanel/RightPanelDrawer';

import StepModeSelect from './steps/StepModeSelect';
import StepSelect from './steps/StepSelect';
import StepPrefill from './steps/StepPrefill';
import StepGovern from './steps/StepGovern';
import StepReview from './steps/StepReview';

import { SCENARIOS, SCOPES, OWNERS } from './mock/builderMock';
import { runPrefillForPairs } from './utils/prefillEngine';

const STEPS = ['Select', 'Prefill', 'Own & Review', 'Confirm'];

export default function ContextBuilderDrawer({
  open,
  onClose,
  onCreated,          // function(summary, items)
  initialMode = 'scenarioFirst', // or 'scopeFirst'
}) {
  const [mode, setMode] = React.useState(initialMode);               // scenarioFirst | scopeFirst
  const [activeStep, setActiveStep] = React.useState(0);

  // Step data
  const [selectedScenarios, setSelectedScenarios] = React.useState([]);
  const [selectedScopes, setSelectedScopes] = React.useState([]);

  const [loadingPrefill, setLoadingPrefill] = React.useState(false);
  const [rows, setRows] = React.useState([]);                        // candidate rows with scores
  const [ownerId, setOwnerId] = React.useState(null);
  const [nextReview, setNextReview] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      // reset on close
      setMode(initialMode);
      setActiveStep(0);
      setSelectedScenarios([]);
      setSelectedScopes([]);
      setRows([]);
      setOwnerId(null);
      setNextReview(null);
    }
  }, [open, initialMode]);

  const doPrefill = async () => {
    setLoadingPrefill(true);
    try {
      const pairs = [];
      selectedScenarios.forEach(sid => {
        selectedScopes.forEach(sc => {
          pairs.push({ scenario: SCENARIOS.find(s => s.id === sid), scope: sc });
        });
      });
      // mock prefill engine (replace with API later)
      const out = runPrefillForPairs(pairs);
      setRows(out);
    } finally {
      setLoadingPrefill(false);
    }
  };

  const canNextFromSelect = selectedScenarios.length > 0 && selectedScopes.length > 0;

  const handleNext = async () => {
    if (activeStep === 0) {
      await doPrefill();
    }
    setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const handleBack = () => setActiveStep(s => Math.max(s - 1, 0));

  const handleCommit = () => {
    // In real flow: POST /bulk_create with rows (+ ownerId/nextReview).
    const created = rows.filter(r => !r.exists);
    const skipped = rows.filter(r => r.exists);
    const overAppetite = rows.filter(r => r.overAppetite).length;

    onCreated?.(
      { created: created.length, skipped: skipped.length, overAppetite },
      created
    );
    onClose?.();
  };

  // Wizard footer CTAs
  const footer = (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {activeStep === 0 && canNextFromSelect ? `${selectedScenarios.length} scenario(s) × ${selectedScopes.length} scope(s) → ${selectedScenarios.length * selectedScopes.length} candidate(s)` : ''}
        {activeStep === 1 && `Candidates: ${rows.length}`}
      </Typography>
      <Box>
        <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>}
        {activeStep < STEPS.length - 1 && (
          <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !canNextFromSelect}>
            Next
          </Button>
        )}
        {activeStep === STEPS.length - 1 && (
          <Button variant="contained" color="primary" onClick={handleCommit}>
            Create {rows.filter(r => !r.exists).length} Contexts
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
      <Box sx={{ display:'grid', gap: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
          {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Divider />

        {/* Step 0: Select mode + pick items */}
        {activeStep === 0 && (
          <StepSelect
            mode={mode}
            onModeChange={setMode}
            scenarios={SCENARIOS}
            scopes={SCOPES}
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
            <StepPrefill
              rows={rows}
              setRows={setRows}
            />
          </>
        )}

        {/* Step 2: Own & Review */}
        {activeStep === 2 && (
          <StepGovern
            rows={rows}
            setRows={setRows}
            owners={OWNERS}
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
