/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__risks__risk_scenario_context__ScopeRef } from './app__schemas__risks__risk_scenario_context__ScopeRef';
export type PrefillResponseItem = {
    scenarioId: number;
    scopeRef: app__schemas__risks__risk_scenario_context__ScopeRef;
    exists: boolean;
    likelihood: number;
    impacts: Record<string, number>;
    rationale?: Array<string>;
    suggestedReviewDate?: (string | null);
};

