/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskContextImpactRatingCreate } from '../models/RiskContextImpactRatingCreate';
import type { RiskContextImpactRatingRead } from '../models/RiskContextImpactRatingRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImpactRatingsService {
    /**
     * Create Rating
     * @param requestBody
     * @returns RiskContextImpactRatingRead Successful Response
     * @throws ApiError
     */
    public static createRatingRisksRiskContextImpactRatingsPost(
        requestBody: RiskContextImpactRatingCreate,
    ): CancelablePromise<RiskContextImpactRatingRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk-context-impact-ratings/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read By Context
     * @param contextId
     * @returns RiskContextImpactRatingRead Successful Response
     * @throws ApiError
     */
    public static readByContextRisksRiskContextImpactRatingsByContextContextIdGet(
        contextId: number,
    ): CancelablePromise<Array<RiskContextImpactRatingRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-context-impact-ratings/by-context/{context_id}',
            path: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upsert Ratings Batch
     * @param requestBody
     * @returns RiskContextImpactRatingRead Successful Response
     * @throws ApiError
     */
    public static upsertRatingsBatchRisksRiskContextImpactRatingsBatchPost(
        requestBody: Array<RiskContextImpactRatingCreate>,
    ): CancelablePromise<Array<RiskContextImpactRatingRead>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk-context-impact-ratings/batch/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
