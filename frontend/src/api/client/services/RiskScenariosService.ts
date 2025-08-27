/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskScenarioCreate } from '../models/RiskScenarioCreate';
import type { RiskScenarioEnrichRequest } from '../models/RiskScenarioEnrichRequest';
import type { RiskScenarioGrouped } from '../models/RiskScenarioGrouped';
import type { RiskScenarioRead } from '../models/RiskScenarioRead';
import type { RiskScenarioUpdate } from '../models/RiskScenarioUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskScenariosService {
    /**
     * Create
     * @param requestBody
     * @returns RiskScenarioRead Successful Response
     * @throws ApiError
     */
    public static createRisksRiskScenariosPost(
        requestBody: RiskScenarioCreate,
    ): CancelablePromise<RiskScenarioRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk_scenarios/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read All
     * @param offset
     * @param limit
     * @returns RiskScenarioRead Successful Response
     * @throws ApiError
     */
    public static readAllRisksRiskScenariosGet(
        offset?: number,
        limit: number = 100,
    ): CancelablePromise<Array<RiskScenarioRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenarios/',
            query: {
                'offset': offset,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read
     * @param scenarioId
     * @returns RiskScenarioRead Successful Response
     * @throws ApiError
     */
    public static readRisksRiskScenariosScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<RiskScenarioRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenarios/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete
     * @param scenarioId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteRisksRiskScenariosScenarioIdDelete(
        scenarioId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risk_scenarios/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Scenario
     * @param scenarioId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateScenarioRisksRiskScenariosScenarioIdPut(
        scenarioId: number,
        requestBody: RiskScenarioUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/risk_scenarios/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Grouped Risk Scenarios
     * @returns RiskScenarioGrouped Successful Response
     * @throws ApiError
     */
    public static getGroupedRiskScenariosRisksRiskScenariosManageGroupedGet(): CancelablePromise<Array<RiskScenarioGrouped>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenarios/manage/grouped',
        });
    }
    /**
     * Get All With Subcategories
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAllWithSubcategoriesRisksRiskScenariosRiskScenarioCategoriesWithSubcategoriesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenarios/risk-scenario-categories/with-subcategories',
        });
    }
    /**
     * Get Risk Score
     * @param scenarioId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRiskScoreRisksRiskScenariosRiskScoreScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenarios/risk-score/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Enrich Scenario
     * @param scenarioId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static enrichScenarioRisksRiskScenariosRiskScenariosScenarioIdEnrichPost(
        scenarioId: number,
        requestBody: RiskScenarioEnrichRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk_scenarios/risk-scenarios/{scenario_id}/enrich',
            path: {
                'scenario_id': scenarioId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
