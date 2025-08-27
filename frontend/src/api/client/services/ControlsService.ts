/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlCreate } from '../models/ControlCreate';
import type { ControlRead } from '../models/ControlRead';
import type { ControlsPage } from '../models/ControlsPage';
import type { ControlUpdate } from '../models/ControlUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlsService {
    /**
     * Create Control
     * @param requestBody
     * @returns ControlRead Successful Response
     * @throws ApiError
     */
    public static createControlControlsControlsPost(
        requestBody: ControlCreate,
    ): CancelablePromise<ControlRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/controls/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Controls
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @returns ControlsPage Successful Response
     * @throws ApiError
     */
    public static listControlsControlsControlsGet(
        offset?: number,
        limit: number = 25,
        sortBy: string = 'id',
        sortDir: string = 'asc',
    ): CancelablePromise<ControlsPage> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/controls/',
            query: {
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
     * Get Control
     * @param controlId
     * @returns ControlRead Successful Response
     * @throws ApiError
     */
    public static getControlControlsControlsControlIdGet(
        controlId: number,
    ): CancelablePromise<ControlRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/controls/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Control
     * @param controlId
     * @param requestBody
     * @returns ControlRead Successful Response
     * @throws ApiError
     */
    public static updateControlControlsControlsControlIdPut(
        controlId: number,
        requestBody: ControlUpdate,
    ): CancelablePromise<ControlRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/controls/controls/{control_id}',
            path: {
                'control_id': controlId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Control
     * @param controlId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteControlControlsControlsControlIdDelete(
        controlId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/controls/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
