/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTagBulkCreate } from '../models/AssetTagBulkCreate';
import type { AssetTagCreate } from '../models/AssetTagCreate';
import type { AssetTagRead } from '../models/AssetTagRead';
import type { AssetTagUpdate } from '../models/AssetTagUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetTagsService {
    /**
     * Read All Tags
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static readAllTagsAssetTagsGet(): CancelablePromise<Array<AssetTagRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-tags/',
        });
    }
    /**
     * Create Tag
     * @param requestBody
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static createTagAssetTagsPost(
        requestBody: AssetTagCreate,
    ): CancelablePromise<AssetTagRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-tags/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Tag
     * @param tagId
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static readTagAssetTagsTagIdGet(
        tagId: number,
    ): CancelablePromise<AssetTagRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Tag
     * @param tagId
     * @param requestBody
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static updateTagAssetTagsTagIdPut(
        tagId: number,
        requestBody: AssetTagUpdate,
    ): CancelablePromise<AssetTagRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset-tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Tag
     * @param tagId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTagAssetTagsTagIdDelete(
        tagId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Tags Bulk
     * @param requestBody
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static createTagsBulkAssetTagsBunchPost(
        requestBody: AssetTagBulkCreate,
    ): CancelablePromise<Array<AssetTagRead>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-tags/bunch/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Tags For Asset
     * @param assetId
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static readTagsForAssetAssetTagsAssetsAssetIdTagsGet(
        assetId: number,
    ): CancelablePromise<Array<AssetTagRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-tags/assets/{asset_id}/tags',
            path: {
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Or Assign Tag
     * @param assetId
     * @param requestBody
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static createOrAssignTagAssetTagsAssetsAssetIdTagsCreateOrAssignPost(
        assetId: number,
        requestBody: AssetTagCreate,
    ): CancelablePromise<AssetTagRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-tags/assets/{asset_id}/tags/create-or-assign',
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
     * Add Tag To Asset
     * @param assetId
     * @param tagId
     * @returns AssetTagRead Successful Response
     * @throws ApiError
     */
    public static addTagToAssetAssetTagsAssetsAssetIdTagsTagIdPost(
        assetId: number,
        tagId: number,
    ): CancelablePromise<AssetTagRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-tags/assets/{asset_id}/tags/{tag_id}',
            path: {
                'asset_id': assetId,
                'tag_id': tagId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Tag From Asset
     * @param assetId
     * @param tagId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeTagFromAssetAssetTagsAssetsAssetIdTagsTagIdDelete(
        assetId: number,
        tagId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-tags/assets/{asset_id}/tags/{tag_id}',
            path: {
                'asset_id': assetId,
                'tag_id': tagId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign Tag To Group
     * @param groupId
     * @param tagId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignTagToGroupAssetTagsAssignTagToGroupGroupIdTagIdPost(
        groupId: number,
        tagId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-tags/assign-tag-to-group/{group_id}/{tag_id}',
            path: {
                'group_id': groupId,
                'tag_id': tagId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
