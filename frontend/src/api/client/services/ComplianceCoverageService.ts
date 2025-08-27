/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrameworkImplementationCoverage } from '../models/FrameworkImplementationCoverage';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceCoverageService {
    /**
     * Get Version Effective Coverage
     * @param versionId
     * @param scopeType asset|asset_type|asset_group|tag|bu|site|entity|service|org_group
     * @param scopeId
     * @returns FrameworkImplementationCoverage Successful Response
     * @throws ApiError
     */
    public static getVersionEffectiveCoverageCoverageFrameworkVersionsVersionIdEffectiveGet(
        versionId: number,
        scopeType: string,
        scopeId: number,
    ): CancelablePromise<FrameworkImplementationCoverage> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/coverage/framework_versions/{version_id}/effective',
            path: {
                'version_id': versionId,
            },
            query: {
                'scope_type': scopeType,
                'scope_id': scopeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
