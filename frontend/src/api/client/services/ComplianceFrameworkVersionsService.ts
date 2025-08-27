/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrameworksWithVersions } from '../models/FrameworksWithVersions';
import type { FrameworkVersionCreate } from '../models/FrameworkVersionCreate';
import type { FrameworkVersionOut } from '../models/FrameworkVersionOut';
import type { FrameworkVersionUpdate } from '../models/FrameworkVersionUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceFrameworkVersionsService {
    /**
     * Create Version
     * @param requestBody
     * @returns FrameworkVersionOut Successful Response
     * @throws ApiError
     */
    public static createVersionFrameworkVersionsPost(
        requestBody: FrameworkVersionCreate,
    ): CancelablePromise<FrameworkVersionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/framework_versions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Frameworks Versions
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @param search
     * @returns FrameworksWithVersions Successful Response
     * @throws ApiError
     */
    public static listFrameworksVersionsFrameworkVersionsGet(
        offset?: number,
        limit: number = 50,
        sortBy: string = 'framework_name',
        sortDir: string = 'asc',
        search?: (string | null),
    ): CancelablePromise<Array<FrameworksWithVersions>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/framework_versions/',
            query: {
                'offset': offset,
                'limit': limit,
                'sort_by': sortBy,
                'sort_dir': sortDir,
                'search': search,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Versions
     * @param frameworkId
     * @returns FrameworkVersionOut Successful Response
     * @throws ApiError
     */
    public static listVersionsFrameworkVersionsFrameworksFrameworkIdGet(
        frameworkId: number,
    ): CancelablePromise<Array<FrameworkVersionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/framework_versions/frameworks/{framework_id}',
            path: {
                'framework_id': frameworkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Version
     * @param id
     * @param requestBody
     * @returns FrameworkVersionOut Successful Response
     * @throws ApiError
     */
    public static updateVersionFrameworkVersionsIdPut(
        id: number,
        requestBody: FrameworkVersionUpdate,
    ): CancelablePromise<FrameworkVersionOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/framework_versions/{id}',
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
     * Delete Version
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteVersionFrameworkVersionsIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/framework_versions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
