/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_import_crosswalks_crosswalks_bulk_post } from '../models/Body_import_crosswalks_crosswalks_bulk_post';
import type { ControlFrameworkMappingCreate } from '../models/ControlFrameworkMappingCreate';
import type { ControlFrameworkMappingNamesOut } from '../models/ControlFrameworkMappingNamesOut';
import type { ControlFrameworkMappingOut } from '../models/ControlFrameworkMappingOut';
import type { ControlFrameworkMappingUpdate } from '../models/ControlFrameworkMappingUpdate';
import type { FrameworkRequirementOut } from '../models/FrameworkRequirementOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceCrosswalksService {
    /**
     * Create
     * @param requestBody
     * @returns ControlFrameworkMappingOut Successful Response
     * @throws ApiError
     */
    public static createCrosswalksPost(
        requestBody: ControlFrameworkMappingCreate,
    ): CancelablePromise<ControlFrameworkMappingOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/crosswalks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param id
     * @param requestBody
     * @returns ControlFrameworkMappingOut Successful Response
     * @throws ApiError
     */
    public static updateCrosswalksIdPut(
        id: number,
        requestBody: ControlFrameworkMappingUpdate,
    ): CancelablePromise<ControlFrameworkMappingOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/crosswalks/{id}',
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
     * Delete
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCrosswalksIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/crosswalks/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List By Requirement
     * @param frameworkRequirementId
     * @returns ControlFrameworkMappingNamesOut Successful Response
     * @throws ApiError
     */
    public static listByRequirementCrosswalksRequirementsFrameworkRequirementIdGet(
        frameworkRequirementId: number,
    ): CancelablePromise<Array<ControlFrameworkMappingNamesOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/crosswalks/requirements/{framework_requirement_id}',
            path: {
                'framework_requirement_id': frameworkRequirementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Requirements For Control
     * @param controlId
     * @returns FrameworkRequirementOut Successful Response
     * @throws ApiError
     */
    public static listRequirementsForControlCrosswalksControlsControlIdGet(
        controlId: number,
    ): CancelablePromise<Array<FrameworkRequirementOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/crosswalks/controls/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Import Crosswalks
     * CSV headers (required + optional):
     * framework_code,framework_version,requirement_code,control_ref,weight,notes,
     * atom_key,relation_type,coverage_level,applicability,evidence_hint,rationale
     *
     * - If atom_key is present, mapping is created at the obligation level.
     * - applicability: JSON string (e.g., {"xborder":false})
     * - evidence_hint: JSON array of strings (e.g., ["IR runbook","Receipt"]) or semicolon list
     * @param formData
     * @param upsertAtoms
     * @returns any Successful Response
     * @throws ApiError
     */
    public static importCrosswalksCrosswalksBulkPost(
        formData: Body_import_crosswalks_crosswalks_bulk_post,
        upsertAtoms: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/crosswalks/bulk',
            query: {
                'upsert_atoms': upsertAtoms,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
