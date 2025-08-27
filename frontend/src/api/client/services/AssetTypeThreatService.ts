/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeThreatLinkCreate } from '../models/AssetTypeThreatLinkCreate';
import type { AssetTypeThreatLinkOut } from '../models/AssetTypeThreatLinkOut';
import type { AssetTypeThreatLinkOutDetails } from '../models/AssetTypeThreatLinkOutDetails';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetTypeThreatService {
    /**
     * Create Link
     * @param requestBody
     * @returns AssetTypeThreatLinkOut Successful Response
     * @throws ApiError
     */
    public static createLinkAssetTypeThreatLinkPost(
        requestBody: AssetTypeThreatLinkCreate,
    ): CancelablePromise<AssetTypeThreatLinkOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-type-threat-link/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Link
     * @param requestBody
     * @returns AssetTypeThreatLinkOut Successful Response
     * @throws ApiError
     */
    public static createLinkAssetTypeThreatLinkBulkInsertPost(
        requestBody: Array<AssetTypeThreatLinkCreate>,
    ): CancelablePromise<Array<AssetTypeThreatLinkOut>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-type-threat-link/bulk-insert',
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
     * @returns AssetTypeThreatLinkOutDetails Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeThreatLinkByAssetTypeAssetTypeIdByNameGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeThreatLinkOutDetails>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-threat-link/by-asset-type/{asset_type_id}/by-name',
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
     * @returns AssetTypeThreatLinkOut Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeThreatLinkByAssetTypeAssetTypeIdGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeThreatLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-threat-link/by-asset-type/{asset_type_id}',
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
     * @returns AssetTypeThreatLinkOut Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeThreatLinkByThreatThreatIdByNameGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeThreatLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-threat-link/by-threat/{threat_id}/by-name',
            query: {
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
     * @returns AssetTypeThreatLinkOut Successful Response
     * @throws ApiError
     */
    public static getLinksAssetTypeThreatLinkByThreatThreatIdGet(
        assetTypeId: number,
    ): CancelablePromise<Array<AssetTypeThreatLinkOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-type-threat-link/by-threat/{threat_id}',
            query: {
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
    public static deleteLinkAssetTypeThreatLinkLinkIdDelete(
        linkId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-type-threat-link/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
