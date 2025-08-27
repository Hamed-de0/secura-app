/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskScoreHistoryRead } from '../models/RiskScoreHistoryRead';
import type { RiskScoreRead } from '../models/RiskScoreRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskScoresService {
    /**
     * Get Context Score
     * @param contextId
     * @returns RiskScoreRead Successful Response
     * @throws ApiError
     */
    public static getContextScoreRisksRiskScoresContextContextIdGet(
        contextId: number,
    ): CancelablePromise<RiskScoreRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/context/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Context History
     * @param contextId
     * @returns RiskScoreHistoryRead Successful Response
     * @throws ApiError
     */
    public static getContextHistoryRisksRiskScoresContextHistoryContextIdGet(
        contextId: number,
    ): CancelablePromise<Array<RiskScoreHistoryRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/context/history/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Calculate Context Score
     * @param contextId
     * @returns RiskScoreRead Successful Response
     * @throws ApiError
     */
    public static calculateContextScoreRisksRiskScoresContextCalculateContextIdGet(
        contextId: number,
    ): CancelablePromise<RiskScoreRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/context/calculate/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Scores By Scenario
     * @param scenarioId
     * @returns RiskScoreRead Successful Response
     * @throws ApiError
     */
    public static getScoresByScenarioRisksRiskScoresScenarioScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<RiskScoreRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/scenario/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Score History By Scenario
     * @param scenarioId
     * @returns RiskScoreHistoryRead Successful Response
     * @throws ApiError
     */
    public static getScoreHistoryByScenarioRisksRiskScoresScenarioHistoryScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<Array<RiskScoreHistoryRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/scenario/history/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Calculate Scores By Scenario
     * @param scenarioId
     * @returns RiskScoreRead Successful Response
     * @throws ApiError
     */
    public static calculateScoresByScenarioRisksRiskScoresScenarioCalculateScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<Array<RiskScoreRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/scenario/calculate/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Calculate All Scores
     * @returns RiskScoreRead Successful Response
     * @throws ApiError
     */
    public static calculateAllScoresRisksRiskScoresCalculateGet(): CancelablePromise<Array<RiskScoreRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-scores/calculate',
        });
    }
}
