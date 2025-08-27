/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetRelationCreate } from '../models/AssetRelationCreate';
import type { AssetRelationRead } from '../models/AssetRelationRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetRelationService {
    /**
     * Create
     * @param requestBody
     * @returns AssetRelationRead Successful Response
     * @throws ApiError
     */
    public static createAssetRelationsPost(
        requestBody: AssetRelationCreate,
    ): CancelablePromise<AssetRelationRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset_relations/',
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
     * @returns AssetRelationRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetRelationsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetRelationRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_relations/',
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
     * @returns AssetRelationRead Successful Response
     * @throws ApiError
     */
    public static readAssetRelationsItemIdGet(
        itemId: number,
    ): CancelablePromise<AssetRelationRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_relations/{item_id}',
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
     * @returns AssetRelationRead Successful Response
     * @throws ApiError
     */
    public static updateAssetRelationsItemIdPut(
        itemId: number,
        requestBody: AssetRelationCreate,
    ): CancelablePromise<AssetRelationRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset_relations/{item_id}',
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
    public static deleteAssetRelationsItemIdDelete(
        itemId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset_relations/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
