/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetScanCreate } from '../models/AssetScanCreate';
import type { AssetScanRead } from '../models/AssetScanRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetScanService {
    /**
     * Create
     * @param requestBody
     * @returns AssetScanRead Successful Response
     * @throws ApiError
     */
    public static createAssetScansPost(
        requestBody: AssetScanCreate,
    ): CancelablePromise<AssetScanRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset_scans/',
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
     * @returns AssetScanRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetScansGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetScanRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_scans/',
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
     * @returns AssetScanRead Successful Response
     * @throws ApiError
     */
    public static readAssetScansItemIdGet(
        itemId: number,
    ): CancelablePromise<AssetScanRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_scans/{item_id}',
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
     * @returns AssetScanRead Successful Response
     * @throws ApiError
     */
    public static updateAssetScansItemIdPut(
        itemId: number,
        requestBody: AssetScanCreate,
    ): CancelablePromise<AssetScanRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset_scans/{item_id}',
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
    public static deleteAssetScansItemIdDelete(
        itemId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset_scans/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
