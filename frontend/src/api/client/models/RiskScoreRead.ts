/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScoreRead = {
    risk_scenario_context_id: number;
    initial_score: number;
    residual_score: number;
    initial_by_domain: Record<string, number>;
    residual_by_domain: Record<string, number>;
    last_updated: string;
};

