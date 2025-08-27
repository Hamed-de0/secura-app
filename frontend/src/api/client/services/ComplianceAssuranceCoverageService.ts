/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceAssuranceCoverageService {
    /**
     * Get Assurance
     * @param versionId
     * @param contextId risk_scenario_context_id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssuranceAssuranceFrameworkVersionsVersionIdGet(
        versionId: number,
        contextId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assurance/framework_versions/{version_id}',
            path: {
                'version_id': versionId,
            },
            query: {
                'context_id': contextId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
