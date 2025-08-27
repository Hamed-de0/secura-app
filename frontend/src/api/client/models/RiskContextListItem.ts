/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__risks__risk_context_list__AppetiteOut } from './app__schemas__risks__risk_context_list__AppetiteOut';
import type { app__schemas__risks__risk_context_list__ControlsOut } from './app__schemas__risks__risk_context_list__ControlsOut';
import type { app__schemas__risks__risk_context_list__EvidenceOut } from './app__schemas__risks__risk_context_list__EvidenceOut';
import type { app__schemas__risks__risk_context_list__ScopeRef } from './app__schemas__risks__risk_context_list__ScopeRef';
export type RiskContextListItem = {
    contextId: number;
    scenarioId: number;
    scenarioTitle: string;
    scope: string;
    scopeName?: (string | null);
    scopeRef?: (app__schemas__risks__risk_context_list__ScopeRef | null);
    scopeDisplay?: (string | null);
    assetId?: (number | null);
    assetName?: (string | null);
    ownerId?: (number | null);
    owner: string;
    ownerInitials: string;
    status: string;
    likelihood: number;
    impacts: Record<string, number>;
    domains?: (Array<'C' | 'I' | 'A' | 'L' | 'R'> | null);
    impactOverall?: (number | null);
    severity?: (number | null);
    severityBand?: ('Low' | 'Medium' | 'High' | 'Critical' | null);
    overAppetite?: (boolean | null);
    initial: number;
    residual: number;
    trend: Array<Record<string, number>>;
    controls: app__schemas__risks__risk_context_list__ControlsOut;
    evidence: app__schemas__risks__risk_context_list__EvidenceOut;
    updatedAt?: (string | null);
    lastReview?: (string | null);
    nextReview?: (string | null);
    reviewSLAStatus?: ('OnTrack' | 'DueSoon' | 'Overdue' | null);
    appetite?: (app__schemas__risks__risk_context_list__AppetiteOut | null);
};

