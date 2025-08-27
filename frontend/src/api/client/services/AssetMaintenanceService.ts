/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetMaintenanceCreate } from '../models/AssetMaintenanceCreate';
import type { AssetMaintenanceRead } from '../models/AssetMaintenanceRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetMaintenanceService {
    /**
     * Create
     * @param requestBody
     * @returns AssetMaintenanceRead Successful Response
     * @throws ApiError
     */
    public static createAssetMaintenancePost(
        requestBody: AssetMaintenanceCreate,
    ): CancelablePromise<AssetMaintenanceRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset_maintenance/',
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
     * @returns AssetMaintenanceRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetMaintenanceGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetMaintenanceRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_maintenance/',
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
     * @returns AssetMaintenanceRead Successful Response
     * @throws ApiError
     */
    public static readAssetMaintenanceItemIdGet(
        itemId: number,
    ): CancelablePromise<AssetMaintenanceRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_maintenance/{item_id}',
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
     * @returns AssetMaintenanceRead Successful Response
     * @throws ApiError
     */
    public static updateAssetMaintenanceItemIdPut(
        itemId: number,
        requestBody: AssetMaintenanceCreate,
    ): CancelablePromise<AssetMaintenanceRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset_maintenance/{item_id}',
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
    public static deleteAssetMaintenanceItemIdDelete(
        itemId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset_maintenance/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
