/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeCreate } from '../models/AssetTypeCreate';
import type { AssetTypeRead } from '../models/AssetTypeRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetTypesService {
    /**
     * Create
     * @param requestBody
     * @returns AssetTypeRead Successful Response
     * @throws ApiError
     */
    public static createAssetTypesPost(
        requestBody: AssetTypeCreate,
    ): CancelablePromise<AssetTypeRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-types/',
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
     * @returns AssetTypeRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetTypesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetTypeRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-types/',
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
     * @param typeId
     * @returns AssetTypeRead Successful Response
     * @throws ApiError
     */
    public static readAssetTypesTypeIdGet(
        typeId: number,
    ): CancelablePromise<AssetTypeRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-types/{type_id}',
            path: {
                'type_id': typeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param typeId
     * @param requestBody
     * @returns AssetTypeRead Successful Response
     * @throws ApiError
     */
    public static updateAssetTypesTypeIdPut(
        typeId: number,
        requestBody: AssetTypeCreate,
    ): CancelablePromise<AssetTypeRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset-types/{type_id}',
            path: {
                'type_id': typeId,
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
     * @param typeId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetTypesTypeIdDelete(
        typeId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-types/{type_id}',
            path: {
                'type_id': typeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
