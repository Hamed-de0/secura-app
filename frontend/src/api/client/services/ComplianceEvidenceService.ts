/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlEvidenceCreate } from '../models/ControlEvidenceCreate';
import type { ControlEvidenceOut } from '../models/ControlEvidenceOut';
import type { ControlEvidenceUpdate } from '../models/ControlEvidenceUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceEvidenceService {
    /**
     * Add Evidence
     * @param requestBody
     * @returns ControlEvidenceOut Successful Response
     * @throws ApiError
     */
    public static addEvidenceEvidencePost(
        requestBody: ControlEvidenceCreate,
    ): CancelablePromise<ControlEvidenceOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/evidence',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Evidence
     * @param linkId
     * @returns ControlEvidenceOut Successful Response
     * @throws ApiError
     */
    public static listEvidenceEvidenceControlLinkIdGet(
        linkId: number,
    ): CancelablePromise<Array<ControlEvidenceOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/evidence/control/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Evidence
     * @param evidenceId
     * @param requestBody
     * @returns ControlEvidenceOut Successful Response
     * @throws ApiError
     */
    public static updateEvidenceEvidenceEvidenceIdPatch(
        evidenceId: number,
        requestBody: ControlEvidenceUpdate,
    ): CancelablePromise<ControlEvidenceOut> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/evidence/{evidence_id}',
            path: {
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
     * Delete Evidence
     * @param evidenceId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteEvidenceEvidenceEvidenceIdDelete(
        evidenceId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/evidence/{evidence_id}',
            path: {
                'evidence_id': evidenceId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
