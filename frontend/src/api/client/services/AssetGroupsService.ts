/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetGroupCreate } from '../models/AssetGroupCreate';
import type { AssetGroupRead } from '../models/AssetGroupRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetGroupsService {
    /**
     * Create
     * @param requestBody
     * @returns AssetGroupRead Successful Response
     * @throws ApiError
     */
    public static createAssetGroupsPost(
        requestBody: AssetGroupCreate,
    ): CancelablePromise<AssetGroupRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/asset-groups/',
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
     * @param fields
     * @returns AssetGroupRead Successful Response
     * @throws ApiError
     */
    public static readAllAssetGroupsGet(
        skip?: number,
        limit: number = 300,
        fields?: (string | null),
    ): CancelablePromise<Array<AssetGroupRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-groups/',
            query: {
                'skip': skip,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read
     * @param groupId
     * @returns AssetGroupRead Successful Response
     * @throws ApiError
     */
    public static readAssetGroupsGroupIdGet(
        groupId: number,
    ): CancelablePromise<AssetGroupRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-groups/{group_id}',
            path: {
                'group_id': groupId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param groupId
     * @param requestBody
     * @returns AssetGroupRead Successful Response
     * @throws ApiError
     */
    public static updateAssetGroupsGroupIdPut(
        groupId: number,
        requestBody: AssetGroupCreate,
    ): CancelablePromise<AssetGroupRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/asset-groups/{group_id}',
            path: {
                'group_id': groupId,
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
     * @param groupId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetGroupsGroupIdDelete(
        groupId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/asset-groups/{group_id}',
            path: {
                'group_id': groupId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Asset Group Tree
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readAssetGroupTreeAssetGroupsManageTreeGet(): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/asset-groups/manage/tree',
        });
    }
}
