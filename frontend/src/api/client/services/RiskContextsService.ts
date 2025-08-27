/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchAssignIn } from '../models/BatchAssignIn';
import type { PrefillRequest } from '../models/PrefillRequest';
import type { PrefillResponseItem } from '../models/PrefillResponseItem';
import type { RiskContextDetails } from '../models/RiskContextDetails';
import type { RiskContextListResponse } from '../models/RiskContextListResponse';
import type { RiskScenarioContext } from '../models/RiskScenarioContext';
import type { RiskScenarioContextCreate } from '../models/RiskScenarioContextCreate';
import type { RiskScenarioContextUpdate } from '../models/RiskScenarioContextUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskContextsService {
    /**
     * Create Context
     * Create a risk scenario context using normalized scope (scope_type + scope_id).
     * Legacy asset* fields in the payload are accepted and auto-inferred by the schema.
     * @param requestBody
     * @returns RiskScenarioContext Successful Response
     * @throws ApiError
     */
    public static createContextRisksRiskScenarioContextsPost(
        requestBody: RiskScenarioContextCreate,
    ): CancelablePromise<RiskScenarioContext> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk_scenario_contexts/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Contexts
     * @param riskScenarioId Filter by scenario id
     * @param scopeType One of: org_group, tag, site, entity, asset_type, asset, service, bu, asset_group
     * @param scopeId Scope id
     * @param assetId
     * @param assetGroupId
     * @param assetTagId
     * @param assetTypeId
     * @returns RiskScenarioContext Successful Response
     * @throws ApiError
     */
    public static listContextsRisksRiskScenarioContextsGet(
        riskScenarioId?: (number | null),
        scopeType?: (string | null),
        scopeId?: (number | null),
        assetId?: (number | null),
        assetGroupId?: (number | null),
        assetTagId?: (number | null),
        assetTypeId?: (number | null),
    ): CancelablePromise<Array<RiskScenarioContext>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/',
            query: {
                'risk_scenario_id': riskScenarioId,
                'scope_type': scopeType,
                'scope_id': scopeId,
                'asset_id': assetId,
                'asset_group_id': assetGroupId,
                'asset_tag_id': assetTagId,
                'asset_type_id': assetTypeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Risk Context Metrics
     * @param scope
     * @param scopeId
     * @param status
     * @param domain
     * @param overAppetite
     * @param ownerId
     * @param days
     * @param search
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRiskContextMetricsRisksRiskScenarioContextsMetricsGet(
        scope: string = 'all',
        scopeId?: number,
        status: string = 'all',
        domain: string = 'all',
        overAppetite?: (boolean | null),
        ownerId?: (number | null),
        days: number = 90,
        search: string = '',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/metrics',
            query: {
                'scope': scope,
                'scope_id': scopeId,
                'status': status,
                'domain': domain,
                'over_appetite': overAppetite,
                'owner_id': ownerId,
                'days': days,
                'search': search,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Contexts
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @param scope
     * @param status
     * @param search
     * @param domain
     * @param overAppetite
     * @param ownerId
     * @param days
     * @returns RiskContextListResponse Successful Response
     * @throws ApiError
     */
    public static getContextsRisksRiskScenarioContextsContextsGet(
        offset?: number,
        limit: number = 25,
        sortBy: string = 'updated_at',
        sortDir: string = 'desc',
        scope: string = 'all',
        status: string = 'all',
        search: string = '',
        domain: string = 'all',
        overAppetite?: (boolean | null),
        ownerId?: (number | null),
        days: number = 90,
    ): CancelablePromise<RiskContextListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/contexts',
            query: {
                'offset': offset,
                'limit': limit,
                'sort_by': sortBy,
                'sort_dir': sortDir,
                'scope': scope,
                'status': status,
                'search': search,
                'domain': domain,
                'over_appetite': overAppetite,
                'owner_id': ownerId,
                'days': days,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Risk Context Details
     * @param contextId
     * @param days
     * @returns RiskContextDetails Successful Response
     * @throws ApiError
     */
    public static getRiskContextDetailsRisksRiskScenarioContextsContextIdDetailsGet(
        contextId: number,
        days: number = 90,
    ): CancelablePromise<RiskContextDetails> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/{context_id}/details',
            path: {
                'context_id': contextId,
            },
            query: {
                'days': days,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Context
     * @param contextId
     * @returns RiskScenarioContext Successful Response
     * @throws ApiError
     */
    public static getContextRisksRiskScenarioContextsContextIdGet(
        contextId: number,
    ): CancelablePromise<RiskScenarioContext> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Context
     * @param contextId
     * @param requestBody
     * @returns RiskScenarioContext Successful Response
     * @throws ApiError
     */
    public static updateContextRisksRiskScenarioContextsContextIdPut(
        contextId: number,
        requestBody: RiskScenarioContextUpdate,
    ): CancelablePromise<RiskScenarioContext> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/risk_scenario_contexts/{context_id}',
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
     * Delete Context
     * @param contextId
     * @returns void
     * @throws ApiError
     */
    public static deleteContextRisksRiskScenarioContextsContextIdDelete(
        contextId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risk_scenario_contexts/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Risk Score
     * @param contextId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRiskScoreRisksRiskScenarioContextsRiskScoreContextIdGet(
        contextId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/risk-score/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Batch Assign
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static batchAssignRisksRiskScenarioContextsBatchAssignPost(
        requestBody: BatchAssignIn,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk_scenario_contexts/batch-assign',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Prefill
     * @param requestBody
     * @returns PrefillResponseItem Successful Response
     * @throws ApiError
     */
    public static prefillRisksRiskScenarioContextsPrefillPost(
        requestBody: PrefillRequest,
    ): CancelablePromise<Array<PrefillResponseItem>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk_scenario_contexts/prefill/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Expanded Contexts
     * @param page
     * @param pageSize
     * @param search
     * @param scopeType
     * @param status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getExpandedContextsRisksRiskScenarioContextsExpandedManageGet(
        page: number = 1,
        pageSize: number = 10,
        search?: (string | null),
        scopeType?: (string | null),
        status?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk_scenario_contexts/expanded/manage',
            query: {
                'page': page,
                'page_size': pageSize,
                'search': search,
                'scope_type': scopeType,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
