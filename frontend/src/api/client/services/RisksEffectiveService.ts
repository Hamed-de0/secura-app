/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskEffectiveItem } from '../models/RiskEffectiveItem';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RisksEffectiveService {
    /**
     * Get Effective Risks For Asset
     * @param assetId
     * @param view
     * @param days
     * @returns RiskEffectiveItem Successful Response
     * @throws ApiError
     */
    public static getEffectiveRisksForAssetRisksAssetsAssetIdRisksGet(
        assetId: number,
        view: string = 'effective',
        days: number = 90,
    ): CancelablePromise<Array<RiskEffectiveItem>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/assets/{asset_id}/risks',
            path: {
                'asset_id': assetId,
            },
            query: {
                'view': view,
                'days': days,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
