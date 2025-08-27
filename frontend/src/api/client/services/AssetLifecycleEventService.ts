/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetLifecycleEventCreate } from '../models/AssetLifecycleEventCreate';
import type { AssetLifecycleEventRead } from '../models/AssetLifecycleEventRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetLifecycleEventService {
    /**
     * Create
     * @param requestBody
     * @returns AssetLifecycleEventRead Successful Response
     * @throws ApiError
     */
    public static createAssetLifecycleEventsPost(
        requestBody: AssetLifecycleEventCreate,
    ): CancelablePromise<AssetLifecycleEventRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset_lifecycle_events/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read All
     * @param skip
     * @param limit
     * @returns AssetLifecycleEventRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetLifecycleEventsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetLifecycleEventRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_lifecycle_events/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read
     * @param itemId
     * @returns AssetLifecycleEventRead Successful Response
     * @throws ApiError
     */
    public static readAssetLifecycleEventsItemIdGet(
        itemId: number,
    ): CancelablePromise<AssetLifecycleEventRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_lifecycle_events/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param itemId
     * @param requestBody
     * @returns AssetLifecycleEventRead Successful Response
     * @throws ApiError
     */
    public static updateAssetLifecycleEventsItemIdPut(
        itemId: number,
        requestBody: AssetLifecycleEventCreate,
    ): CancelablePromise<AssetLifecycleEventRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset_lifecycle_events/{item_id}',
            path: {
                'item_id': itemId,
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
     * @param itemId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetLifecycleEventsItemIdDelete(
        itemId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset_lifecycle_events/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
