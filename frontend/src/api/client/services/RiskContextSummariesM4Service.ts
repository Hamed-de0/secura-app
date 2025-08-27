/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContextSummariesOut } from '../models/ContextSummariesOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskContextSummariesM4Service {
    /**
     * Get Context Summaries
     * @param contextId
     * @returns ContextSummariesOut Successful Response
     * @throws ApiError
     */
    public static getContextSummariesRisksRisksRiskScenarioContextsContextIdSummariesGet(
        contextId: number,
    ): CancelablePromise<ContextSummariesOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/summaries/',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
