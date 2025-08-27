/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlContextEffectOverrideCreate } from '../models/ControlContextEffectOverrideCreate';
import type { ControlContextEffectOverrideOut } from '../models/ControlContextEffectOverrideOut';
import type { ControlContextEffectOverrideUpdate } from '../models/ControlContextEffectOverrideUpdate';
import type { ControlContextLinkCreate } from '../models/ControlContextLinkCreate';
import type { ControlContextLinkOut } from '../models/ControlContextLinkOut';
import type { ControlContextLinkUpdate } from '../models/ControlContextLinkUpdate';
import type { ControlContextStatusUpdate } from '../models/ControlContextStatusUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlContextService {
    /**
     * Upsert Link
     * Create-or-update a control link.
     *
     * New model supports two targets:
     * 1) risk_scenario_context_id (explicit risk treatment), OR
     * 2) scope_type + scope_id (baseline/company/service/etc.).
     *
     * Behavior:
     * - Try create; if a 409 duplicate exists, update that row instead (idempotent upsert).
     * - Trigger risk score recalculation only when tied to a risk context.
     * @param requestBody
     * @returns ControlContextLinkOut Successful Response
     * @throws ApiError
     */
    public static upsertLinkControlsControlContextLinksPost(
        requestBody: ControlContextLinkCreate,
    ): CancelablePromise<ControlContextLinkOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-context/links',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Links
     * Flexible list endpoint covering both risk-linked and scope-only links.
     * @param riskScenarioContextId
     * @param scopeType
     * @param scopeId
     * @param controlId
     * @returns ControlContextLinkOut Successful Response
     * @throws ApiError
     */
    public static listLinksControlsControlContextLinksGet(
        riskScenarioContextId?: (number | null),
        scopeType?: (string | null),
        scopeId?: (number | null),
        controlId?: (number | null),
    ): CancelablePromise<Array<ControlContextLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-context/links',
            query: {
                'risk_scenario_context_id': riskScenarioContextId,
                'scope_type': scopeType,
                'scope_id': scopeId,
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Link
     * @param id
     * @param requestBody
     * @returns ControlContextLinkOut Successful Response
     * @throws ApiError
     */
    public static updateLinkControlsControlContextLinksIdPut(
        id: number,
        requestBody: ControlContextLinkUpdate,
    ): CancelablePromise<ControlContextLinkOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/controls/control-context/links/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Link
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLinkControlsControlContextLinksIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-context/links/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Links By Context
     * @param contextId
     * @returns ControlContextLinkOut Successful Response
     * @throws ApiError
     */
    public static listLinksByContextControlsControlContextLinksByContextContextIdGet(
        contextId: number,
    ): CancelablePromise<Array<ControlContextLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-context/links/by-context/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Links By Scope
     * List links implemented directly at a scope (not via risk context).
     * @param scopeType e.g., entity|service|asset|asset_type|asset_group|tag|bu|site|org_group
     * @param scopeId
     * @param controlId
     * @returns ControlContextLinkOut Successful Response
     * @throws ApiError
     */
    public static listLinksByScopeControlsControlContextLinksByScopeGet(
        scopeType: string,
        scopeId: number,
        controlId?: (number | null),
    ): CancelablePromise<Array<ControlContextLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-context/links/by-scope',
            query: {
                'scope_type': scopeType,
                'scope_id': scopeId,
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upsert Override
     * @param requestBody
     * @returns ControlContextEffectOverrideOut Successful Response
     * @throws ApiError
     */
    public static upsertOverrideControlsControlContextOverridesPost(
        requestBody: ControlContextEffectOverrideCreate,
    ): CancelablePromise<ControlContextEffectOverrideOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-context/overrides',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Override
     * @param id
     * @param requestBody
     * @returns ControlContextEffectOverrideOut Successful Response
     * @throws ApiError
     */
    public static updateOverrideControlsControlContextOverridesIdPut(
        id: number,
        requestBody: ControlContextEffectOverrideUpdate,
    ): CancelablePromise<ControlContextEffectOverrideOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/controls/control-context/overrides/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Override
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteOverrideControlsControlContextOverridesIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-context/overrides/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Overrides By Context
     * @param contextId
     * @returns ControlContextEffectOverrideOut Successful Response
     * @throws ApiError
     */
    public static listOverridesByContextControlsControlContextOverridesByContextContextIdGet(
        contextId: number,
    ): CancelablePromise<Array<ControlContextEffectOverrideOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-context/overrides/by-context/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Status
     * @param linkId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateStatusControlsControlContextLinkIdStatusPatch(
        linkId: number,
        requestBody: ControlContextStatusUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/controls/control-context/{link_id}/status',
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
}
