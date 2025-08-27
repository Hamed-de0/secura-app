/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlApplicabilityPolicyCreate } from '../models/ControlApplicabilityPolicyCreate';
import type { ControlApplicabilityPolicyOut } from '../models/ControlApplicabilityPolicyOut';
import type { ControlApplicabilityPolicyUpdate } from '../models/ControlApplicabilityPolicyUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PoliciesControlApplicabilityService {
    /**
     * List Policies
     * @returns ControlApplicabilityPolicyOut Successful Response
     * @throws ApiError
     */
    public static listPoliciesPoliciesControlApplicabilityGet(): CancelablePromise<Array<ControlApplicabilityPolicyOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/policies/control-applicability',
        });
    }
    /**
     * Create Policy
     * @param requestBody
     * @returns ControlApplicabilityPolicyOut Successful Response
     * @throws ApiError
     */
    public static createPolicyPoliciesControlApplicabilityPost(
        requestBody: ControlApplicabilityPolicyCreate,
    ): CancelablePromise<ControlApplicabilityPolicyOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/policies/control-applicability',
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
     * @returns ControlApplicabilityPolicyOut Successful Response
     * @throws ApiError
     */
    public static updatePolicyPoliciesControlApplicabilityIdPut(
        id: number,
        requestBody: ControlApplicabilityPolicyUpdate,
    ): CancelablePromise<ControlApplicabilityPolicyOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/policies/control-applicability/{id}',
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
    public static deletePolicyPoliciesControlApplicabilityIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/policies/control-applicability/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
