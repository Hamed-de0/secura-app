/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeControlLinkCreate } from '../models/AssetTypeControlLinkCreate';
import type { AssetTypeControlLinkOut } from '../models/AssetTypeControlLinkOut';
import type { AssetTypeControlLinkOutDetails } from '../models/AssetTypeControlLinkOutDetails';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetTypeControlService {
    /**
     * Add Link
     * @param requestBody
     * @returns AssetTypeControlLinkOut Successful Response
     * @throws ApiError
     */
    public static addLinkAssetTypeControlLinkPost(
        requestBody: AssetTypeControlLinkCreate,
    ): CancelablePromise<AssetTypeControlLinkOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-type-control-link/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Links
     * @param assetTypeId
     * @returns AssetTypeControlLinkOutDetails Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeControlLinkByAssetTypeAssetTypeIdByNameGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeControlLinkOutDetails>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-control-link/by-asset-type/{asset_type_id}/by-name',
            path: {
                'asset_type_id': assetTypeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Links
     * @param assetTypeId
     * @returns AssetTypeControlLinkOut Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeControlLinkByAssetTypeAssetTypeIdGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeControlLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-control-link/by-asset-type/{asset_type_id}',
            path: {
                'asset_type_id': assetTypeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Link
     * @param linkId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLinkAssetTypeControlLinkLinkIdDelete(
        linkId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-type-control-link/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
