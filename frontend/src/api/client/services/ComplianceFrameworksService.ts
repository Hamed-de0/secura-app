/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrameworkCreate } from '../models/FrameworkCreate';
import type { FrameworkOut } from '../models/FrameworkOut';
import type { FrameworkUpdate } from '../models/FrameworkUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceFrameworksService {
    /**
     * List All
     * @returns FrameworkOut Successful Response
     * @throws ApiError
     */
    public static listAllFrameworksGet(): CancelablePromise<Array<FrameworkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/frameworks',
        });
    }
    /**
     * Create
     * @param requestBody
     * @returns FrameworkOut Successful Response
     * @throws ApiError
     */
    public static createFrameworksPost(
        requestBody: FrameworkCreate,
    ): CancelablePromise<FrameworkOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/frameworks',
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
     * @returns FrameworkOut Successful Response
     * @throws ApiError
     */
    public static updateFrameworksIdPut(
        id: number,
        requestBody: FrameworkUpdate,
    ): CancelablePromise<FrameworkOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/frameworks/{id}',
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
    public static deleteFrameworksIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/frameworks/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
