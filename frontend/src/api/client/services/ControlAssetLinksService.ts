/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlAssetLinkCreate } from '../models/ControlAssetLinkCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlAssetLinksService {
    /**
     * Create Link
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createLinkControlsControlAssetLinksPost(
        requestBody: ControlAssetLinkCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-asset-links/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Link
     * @param controlId
     * @param assetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLinkControlsControlAssetLinksDelete(
        controlId: number,
        assetId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-asset-links/',
            query: {
                'control_id': controlId,
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
