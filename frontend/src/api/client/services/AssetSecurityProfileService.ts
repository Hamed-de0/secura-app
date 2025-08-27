/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetSecurityProfileCreate } from '../models/AssetSecurityProfileCreate';
import type { AssetSecurityProfileRead } from '../models/AssetSecurityProfileRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetSecurityProfileService {
    /**
     * Create
     * @param requestBody
     * @returns AssetSecurityProfileRead Successful Response
     * @throws ApiError
     */
    public static createAssetSecurityProfilesPost(
        requestBody: AssetSecurityProfileCreate,
    ): CancelablePromise<AssetSecurityProfileRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset_security_profiles/',
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
     * @returns AssetSecurityProfileRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetSecurityProfilesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<AssetSecurityProfileRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_security_profiles/',
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
     * @returns AssetSecurityProfileRead Successful Response
     * @throws ApiError
     */
    public static readAssetSecurityProfilesItemIdGet(
        itemId: number,
    ): CancelablePromise<AssetSecurityProfileRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset_security_profiles/{item_id}',
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
     * @returns AssetSecurityProfileRead Successful Response
     * @throws ApiError
     */
    public static updateAssetSecurityProfilesItemIdPut(
        itemId: number,
        requestBody: AssetSecurityProfileCreate,
    ): CancelablePromise<AssetSecurityProfileRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset_security_profiles/{item_id}',
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
    public static deleteAssetSecurityProfilesItemIdDelete(
        itemId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset_security_profiles/{item_id}',
            path: {
                'item_id': itemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
