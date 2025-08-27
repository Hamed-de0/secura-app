/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObligationAtomCreate } from '../models/ObligationAtomCreate';
import type { ObligationAtomOut } from '../models/ObligationAtomOut';
import type { ObligationAtomUpdate } from '../models/ObligationAtomUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ObligationsService {
    /**
     * List Obligations
     * @param requirementId
     * @returns ObligationAtomOut Successful Response
     * @throws ApiError
     */
    public static listObligationsObligationsFrameworkRequirementsRequirementIdGet(
        requirementId: number,
    ): CancelablePromise<Array<ObligationAtomOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/obligations/framework_requirements/{requirement_id}',
            path: {
                'requirement_id': requirementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Obligation
     * @param requirementId
     * @param requestBody
     * @returns ObligationAtomOut Successful Response
     * @throws ApiError
     */
    public static createObligationObligationsFrameworkRequirementsRequirementIdPost(
        requirementId: number,
        requestBody: ObligationAtomCreate,
    ): CancelablePromise<ObligationAtomOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/obligations/framework_requirements/{requirement_id}',
            path: {
                'requirement_id': requirementId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Obligation
     * @param atomId
     * @returns ObligationAtomOut Successful Response
     * @throws ApiError
     */
    public static getObligationObligationsAtomIdGet(
        atomId: number,
    ): CancelablePromise<ObligationAtomOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/obligations/{atom_id}',
            path: {
                'atom_id': atomId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Obligation
     * @param atomId
     * @param requestBody
     * @returns ObligationAtomOut Successful Response
     * @throws ApiError
     */
    public static updateObligationObligationsAtomIdPut(
        atomId: number,
        requestBody: ObligationAtomUpdate,
    ): CancelablePromise<ObligationAtomOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/obligations/{atom_id}',
            path: {
                'atom_id': atomId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Obligation
     * @param atomId
     * @returns void
     * @throws ApiError
     */
    public static deleteObligationObligationsAtomIdDelete(
        atomId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/obligations/{atom_id}',
            path: {
                'atom_id': atomId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
