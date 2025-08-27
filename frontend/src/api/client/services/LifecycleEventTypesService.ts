/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LifecycleEventTypeCreate } from '../models/LifecycleEventTypeCreate';
import type { LifecycleEventTypeRead } from '../models/LifecycleEventTypeRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LifecycleEventTypesService {
    /**
     * List Event Types
     * @returns LifecycleEventTypeRead Successful Response
     * @throws ApiError
     */
    public static listEventTypesLifecycleEventTypesGet(): CancelablePromise<Array<LifecycleEventTypeRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lifecycle-event-types/',
        });
    }
    /**
     * Create Event Type
     * @param requestBody
     * @returns LifecycleEventTypeRead Successful Response
     * @throws ApiError
     */
    public static createEventTypeLifecycleEventTypesPost(
        requestBody: LifecycleEventTypeCreate,
    ): CancelablePromise<LifecycleEventTypeRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/lifecycle-event-types/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Many
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createManyLifecycleEventTypesBunchPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/lifecycle-event-types/bunch/',
        });
    }
}
