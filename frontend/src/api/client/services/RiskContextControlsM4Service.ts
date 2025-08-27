/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContextControlCreate } from '../models/ContextControlCreate';
import type { ContextControlOut } from '../models/ContextControlOut';
import type { ContextControlsListOut } from '../models/ContextControlsListOut';
import type { ContextControlUpdate } from '../models/ContextControlUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskContextControlsM4Service {
    /**
     * List Context Controls
     * @param contextId
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @param include pass "summary" to include aggregates
     * @returns ContextControlsListOut Successful Response
     * @throws ApiError
     */
    public static listContextControlsRisksRisksRiskScenarioContextsContextIdControlsGet(
        contextId: number,
        offset?: number,
        limit: number = 25,
        sortBy: string = 'status',
        sortDir: string = 'asc',
        include: string = '',
    ): CancelablePromise<ContextControlsListOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/controls/',
            path: {
                'context_id': contextId,
            },
            query: {
                'offset': offset,
                'limit': limit,
                'sort_by': sortBy,
                'sort_dir': sortDir,
                'include': include,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Link Control
     * @param contextId
     * @param requestBody
     * @returns ContextControlOut Successful Response
     * @throws ApiError
     */
    public static linkControlRisksRisksRiskScenarioContextsContextIdControlsPost(
        contextId: number,
        requestBody: ContextControlCreate,
    ): CancelablePromise<ContextControlOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/controls/',
            path: {
                'context_id': contextId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Link
     * @param linkId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateLinkRisksRisksRiskScenarioContextsContextControlsLinkIdPatch(
        linkId: number,
        requestBody: ContextControlUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/risks/risks/risk_scenario_contexts/context_controls/{link_id}/',
            path: {
                'link_id': linkId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Unlink
     * @param linkId
     * @returns void
     * @throws ApiError
     */
    public static unlinkRisksRisksRiskScenarioContextsContextControlsLinkIdDelete(
        linkId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risks/risk_scenario_contexts/context_controls/{link_id}/',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
