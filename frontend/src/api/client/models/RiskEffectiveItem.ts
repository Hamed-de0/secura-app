/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__risks__risk_effective__AppetiteOut } from './app__schemas__risks__risk_effective__AppetiteOut';
import type { app__schemas__risks__risk_effective__ControlsOut } from './app__schemas__risks__risk_effective__ControlsOut';
import type { app__schemas__risks__risk_effective__EvidenceOut } from './app__schemas__risks__risk_effective__EvidenceOut';
import type { app__schemas__risks__risk_effective__ScopeRef } from './app__schemas__risks__risk_effective__ScopeRef';
import type { SourceOut } from './SourceOut';
export type RiskEffectiveItem = {
    id: number;
    scenarioId: number;
    scenarioTitle: string;
    assetName: string;
    scope: string;
    owner: string;
    ownerInitials: string;
    status: string;
    likelihood: number;
    impacts: Record<string, number>;
    initial: number;
    residual: number;
    trend: Array<Record<string, number>>;
    controls: app__schemas__risks__risk_effective__ControlsOut;
    evidence: app__schemas__risks__risk_effective__EvidenceOut;
    lastReview?: (string | null);
    nextReview?: (string | null);
    last_update?: (string | null);
    overAppetite?: (boolean | null);
    severity?: (number | null);
    severityBand?: ('Low' | 'Medium' | 'High' | 'Critical' | null);
    domains?: (Array<'C' | 'I' | 'A' | 'L' | 'R'> | null);
    scopeDisplay?: (string | null);
    scopeRef?: (app__schemas__risks__risk_effective__ScopeRef | null);
    reviewSLAStatus?: ('OnTrack' | 'DueSoon' | 'Overdue' | null);
    sources: Array<SourceOut>;
    compliance: Array<string>;
    appetite: app__schemas__risks__risk_effective__AppetiteOut;
    rag: RiskEffectiveItem.rag;
};
export namespace RiskEffectiveItem {
    export enum rag {
        GREEN = 'Green',
        AMBER = 'Amber',
        RED = 'Red',
    }
}

