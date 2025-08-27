/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenerateByTypeRequest } from '../models/GenerateByTypeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskEngineService {
    /**
     * Preview By Type
     * @param assetTypeId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static previewByTypeRisksRiskEnginePreviewByTypeAssetTypeIdGet(
        assetTypeId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-engine/preview/by-type/{asset_type_id}',
            path: {
                'asset_type_id': assetTypeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate By Type
     * @param assetTypeId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateByTypeRisksRiskEngineGenerateByTypeAssetTypeIdPost(
        assetTypeId: number,
        requestBody: GenerateByTypeRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk-engine/generate/by-type/{asset_type_id}',
            path: {
                'asset_type_id': assetTypeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
