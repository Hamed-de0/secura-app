/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EvidencePolicyCreate } from '../models/EvidencePolicyCreate';
import type { EvidencePolicyOut } from '../models/EvidencePolicyOut';
import type { EvidencePolicyUpdate } from '../models/EvidencePolicyUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceEvidencePoliciesService {
    /**
     * Create Policy
     * @param requestBody
     * @returns EvidencePolicyOut Successful Response
     * @throws ApiError
     */
    public static createPolicyEvidencePoliciesPost(
        requestBody: EvidencePolicyCreate,
    ): CancelablePromise<EvidencePolicyOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/evidence_policies',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Policy
     * @param policyId
     * @param requestBody
     * @returns EvidencePolicyOut Successful Response
     * @throws ApiError
     */
    public static updatePolicyEvidencePoliciesPolicyIdPatch(
        policyId: number,
        requestBody: EvidencePolicyUpdate,
    ): CancelablePromise<EvidencePolicyOut> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/evidence_policies/{policy_id}',
            path: {
                'policy_id': policyId,
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
     * @param policyId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePolicyEvidencePoliciesPolicyIdDelete(
        policyId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/evidence_policies/{policy_id}',
            path: {
                'policy_id': policyId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Policy By Control
     * @param controlId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPolicyByControlEvidencePoliciesByControlControlIdGet(
        controlId: number,
    ): CancelablePromise<(EvidencePolicyOut | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/evidence_policies/by-control/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Policy By Requirement
     * @param frameworkRequirementId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPolicyByRequirementEvidencePoliciesByRequirementFrameworkRequirementIdGet(
        frameworkRequirementId: number,
    ): CancelablePromise<(EvidencePolicyOut | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/evidence_policies/by-requirement/{framework_requirement_id}',
            path: {
                'framework_requirement_id': frameworkRequirementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
