/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskAppetitePolicyCreate } from '../models/RiskAppetitePolicyCreate';
import type { RiskAppetitePolicyOut } from '../models/RiskAppetitePolicyOut';
import type { RiskAppetitePolicyUpdate } from '../models/RiskAppetitePolicyUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PoliciesAppetiteService {
    /**
     * List Policies
     * @returns RiskAppetitePolicyOut Successful Response
     * @throws ApiError
     */
    public static listPoliciesPoliciesAppetiteGet(): CancelablePromise<Array<RiskAppetitePolicyOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/policies/appetite',
        });
    }
    /**
     * Create Policy
     * @param requestBody
     * @returns RiskAppetitePolicyOut Successful Response
     * @throws ApiError
     */
    public static createPolicyPoliciesAppetitePost(
        requestBody: RiskAppetitePolicyCreate,
    ): CancelablePromise<RiskAppetitePolicyOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/policies/appetite',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Policy
     * @param id
     * @param requestBody
     * @returns RiskAppetitePolicyOut Successful Response
     * @throws ApiError
     */
    public static updatePolicyPoliciesAppetiteIdPut(
        id: number,
        requestBody: RiskAppetitePolicyUpdate,
    ): CancelablePromise<RiskAppetitePolicyOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/policies/appetite/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Policy
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePolicyPoliciesAppetiteIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/policies/appetite/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Effective For Asset
     * @param assetId
     * @param atTime
     * @param domain C,I,A,L,R or omit for total
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getEffectiveForAssetPoliciesAppetiteEffectiveAssetAssetIdGet(
        assetId: number,
        atTime?: (string | null),
        domain?: (string | null),
    ): CancelablePromise<(RiskAppetitePolicyOut | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/policies/appetite/effective/asset/{asset_id}',
            path: {
                'asset_id': assetId,
            },
            query: {
                'at_time': atTime,
                'domain': domain,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
