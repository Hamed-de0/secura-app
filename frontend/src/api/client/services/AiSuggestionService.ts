/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiSuggestionService {
    /**
     * Suggest Threats
     * @param assetTypeId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static suggestThreatsAiSuggestAssettypeThreatsAssetTypeIdGet(
        assetTypeId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ai/suggest/assettype-threats/{asset_type_id}',
            path: {
                'asset_type_id': assetTypeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
