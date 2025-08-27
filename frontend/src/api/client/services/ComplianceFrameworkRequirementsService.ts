/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrameworkRequirementCreate } from '../models/FrameworkRequirementCreate';
import type { FrameworkRequirementOut } from '../models/FrameworkRequirementOut';
import type { FrameworkRequirementUpdate } from '../models/FrameworkRequirementUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceFrameworkRequirementsService {
    /**
     * List By Version
     * @param versionId
     * @returns FrameworkRequirementOut Successful Response
     * @throws ApiError
     */
    public static listByVersionFrameworkRequirementsVersionsVersionIdRequirementsGet(
        versionId: number,
    ): CancelablePromise<Array<FrameworkRequirementOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/framework_requirements/versions/{version_id}/requirements',
            path: {
                'version_id': versionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create For Version
     * @param versionId
     * @param requestBody
     * @returns FrameworkRequirementOut Successful Response
     * @throws ApiError
     */
    public static createForVersionFrameworkRequirementsVersionsVersionIdRequirementsPost(
        versionId: number,
        requestBody: FrameworkRequirementCreate,
    ): CancelablePromise<FrameworkRequirementOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/framework_requirements/versions/{version_id}/requirements',
            path: {
                'version_id': versionId,
            },
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
     * @returns FrameworkRequirementOut Successful Response
     * @throws ApiError
     */
    public static updateFrameworkRequirementsIdPut(
        id: number,
        requestBody: FrameworkRequirementUpdate,
    ): CancelablePromise<FrameworkRequirementOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/framework_requirements/{id}',
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
    public static deleteFrameworkRequirementsIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/framework_requirements/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
