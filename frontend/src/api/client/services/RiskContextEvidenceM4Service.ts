/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EvidenceCreateIn } from '../models/EvidenceCreateIn';
import type { EvidenceItemOut } from '../models/EvidenceItemOut';
import type { EvidenceListOut } from '../models/EvidenceListOut';
import type { EvidenceUpdateIn } from '../models/EvidenceUpdateIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskContextEvidenceM4Service {
    /**
     * List Context Evidence
     * @param contextId
     * @param controlId
     * @param type Filter by evidence type
     * @param freshness
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @returns EvidenceListOut Successful Response
     * @throws ApiError
     */
    public static listContextEvidenceRisksRisksRiskScenarioContextsContextIdEvidenceGet(
        contextId: number,
        controlId?: (number | null),
        type?: (string | null),
        freshness?: (string | null),
        offset?: number,
        limit: number = 50,
        sortBy: string = 'captured_at',
        sortDir: string = 'desc',
    ): CancelablePromise<EvidenceListOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/evidence/',
            path: {
                'context_id': contextId,
            },
            query: {
                'control_id': controlId,
                'type': type,
                'freshness': freshness,
                'offset': offset,
                'limit': limit,
                'sort_by': sortBy,
                'sort_dir': sortDir,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Context Evidence
     * @param contextId
     * @param requestBody
     * @returns EvidenceItemOut Successful Response
     * @throws ApiError
     */
    public static createContextEvidenceRisksRisksRiskScenarioContextsContextIdEvidencePost(
        contextId: number,
        requestBody: EvidenceCreateIn,
    ): CancelablePromise<EvidenceItemOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/evidence/',
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
     * Update Context Evidence
     * @param contextId
     * @param evidenceId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateContextEvidenceRisksRisksRiskScenarioContextsContextIdEvidenceEvidenceIdPatch(
        contextId: number,
        evidenceId: number,
        requestBody: EvidenceUpdateIn,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/evidence/{evidence_id}/',
            path: {
                'context_id': contextId,
                'evidence_id': evidenceId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Context Evidence
     * @param contextId
     * @param evidenceId
     * @returns void
     * @throws ApiError
     */
    public static deleteContextEvidenceRisksRisksRiskScenarioContextsContextIdEvidenceEvidenceIdDelete(
        contextId: number,
        evidenceId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risks/risk_scenario_contexts/{context_id}/evidence/{evidence_id}/',
            path: {
                'context_id': contextId,
                'evidence_id': evidenceId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
