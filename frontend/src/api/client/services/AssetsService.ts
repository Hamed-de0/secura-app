/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetCreate } from '../models/AssetCreate';
import type { AssetRead } from '../models/AssetRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetsService {
    /**
     * Create
     * @param requestBody
     * @returns AssetRead Successful Response
     * @throws ApiError
     */
    public static createAssetsPost(
        requestBody: AssetCreate,
    ): CancelablePromise<AssetRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assets/',
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
     * @param includeChildren Include related child assets
     * @returns AssetRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetsGet(
        skip?: number,
        limit: number = 100,
        includeChildren: boolean = false,
    ): CancelablePromise<Array<AssetRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/',
            query: {
                'skip': skip,
                'limit': limit,
                'include_children': includeChildren,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read
     * @param assetId
     * @param includeChildren Include children of this asset
     * @returns AssetRead Successful Response
     * @throws ApiError
     */
    public static readAssetsAssetIdGet(
        assetId: number,
        includeChildren: boolean = false,
    ): CancelablePromise<AssetRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/{asset_id}',
            path: {
                'asset_id': assetId,
            },
            query: {
                'include_children': includeChildren,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param assetId
     * @param requestBody
     * @returns AssetRead Successful Response
     * @throws ApiError
     */
    public static updateAssetsAssetIdPut(
        assetId: number,
        requestBody: AssetCreate,
    ): CancelablePromise<AssetRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/assets/{asset_id}',
            path: {
                'asset_id': assetId,
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
     * @param assetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetsAssetIdDelete(
        assetId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/assets/{asset_id}',
            path: {
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Cascade
     * @param assetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCascadeAssetsAssetIdCascadeDelete(
        assetId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/assets/{asset_id}/cascade',
            path: {
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
