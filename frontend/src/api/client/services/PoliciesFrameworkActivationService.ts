/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrameworkActivationPolicyCreate } from '../models/FrameworkActivationPolicyCreate';
import type { FrameworkActivationPolicyOut } from '../models/FrameworkActivationPolicyOut';
import type { FrameworkActivationPolicyUpdate } from '../models/FrameworkActivationPolicyUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PoliciesFrameworkActivationService {
    /**
     * List Policies
     * @param active Return only currently effective policies
     * @returns FrameworkActivationPolicyOut Successful Response
     * @throws ApiError
     */
    public static listPoliciesPoliciesFrameworkActivationGet(
        active: boolean = false,
    ): CancelablePromise<Array<FrameworkActivationPolicyOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/policies/framework-activation',
            query: {
                'active': active,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Policy
     * @param requestBody
     * @returns FrameworkActivationPolicyOut Successful Response
     * @throws ApiError
     */
    public static createPolicyPoliciesFrameworkActivationPost(
        requestBody: FrameworkActivationPolicyCreate,
    ): CancelablePromise<FrameworkActivationPolicyOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/policies/framework-activation',
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
     * @returns FrameworkActivationPolicyOut Successful Response
     * @throws ApiError
     */
    public static updatePolicyPoliciesFrameworkActivationIdPut(
        id: number,
        requestBody: FrameworkActivationPolicyUpdate,
    ): CancelablePromise<FrameworkActivationPolicyOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/policies/framework-activation/{id}',
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
    public static deletePolicyPoliciesFrameworkActivationIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/policies/framework-activation/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
