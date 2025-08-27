/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetOwnerCreate } from '../models/AssetOwnerCreate';
import type { AssetOwnerRead } from '../models/AssetOwnerRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetOwnersService {
    /**
     * Create
     * @param requestBody
     * @returns AssetOwnerRead Successful Response
     * @throws ApiError
     */
    public static createAssetOwnersPost(
        requestBody: AssetOwnerCreate,
    ): CancelablePromise<AssetOwnerRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-owners/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read All
     * @param assetId
     * @param personId
     * @param skip
     * @param limit
     * @returns AssetOwnerRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetOwnersGet(
        assetId?: (number | null),
        personId?: (number | null),
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetOwnerRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-owners/',
            query: {
                'asset_id': assetId,
                'person_id': personId,
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
     * @param ownerId
     * @returns AssetOwnerRead Successful Response
     * @throws ApiError
     */
    public static readAssetOwnersOwnerIdGet(
        ownerId: number,
    ): CancelablePromise<AssetOwnerRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-owners/{owner_id}',
            path: {
                'owner_id': ownerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param ownerId
     * @param requestBody
     * @returns AssetOwnerRead Successful Response
     * @throws ApiError
     */
    public static updateAssetOwnersOwnerIdPut(
        ownerId: number,
        requestBody: AssetOwnerCreate,
    ): CancelablePromise<AssetOwnerRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset-owners/{owner_id}',
            path: {
                'owner_id': ownerId,
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
     * @param ownerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetOwnersOwnerIdDelete(
        ownerId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-owners/{owner_id}',
            path: {
                'owner_id': ownerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
