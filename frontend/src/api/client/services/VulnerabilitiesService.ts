/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VulnerabilityCreate } from '../models/VulnerabilityCreate';
import type { VulnerabilityRead } from '../models/VulnerabilityRead';
import type { VulnerabilityUpdate } from '../models/VulnerabilityUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VulnerabilitiesService {
    /**
     * Create
     * @param requestBody
     * @returns VulnerabilityRead Successful Response
     * @throws ApiError
     */
    public static createRisksVulnerabilitiesPost(
        requestBody: VulnerabilityCreate,
    ): CancelablePromise<VulnerabilityRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/vulnerabilities/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read All
     * @param skip
     * @param limit
     * @returns VulnerabilityRead Successful Response
     * @throws ApiError
     */
    public static readAllRisksVulnerabilitiesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<VulnerabilityRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/vulnerabilities/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read
     * @param vulnId
     * @returns VulnerabilityRead Successful Response
     * @throws ApiError
     */
    public static readRisksVulnerabilitiesVulnIdGet(
        vulnId: number,
    ): CancelablePromise<VulnerabilityRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/vulnerabilities/{vuln_id}',
            path: {
                'vuln_id': vulnId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param vulnId
     * @param requestBody
     * @returns VulnerabilityRead Successful Response
     * @throws ApiError
     */
    public static updateRisksVulnerabilitiesVulnIdPut(
        vulnId: number,
        requestBody: VulnerabilityUpdate,
    ): CancelablePromise<VulnerabilityRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/vulnerabilities/{vuln_id}',
            path: {
                'vuln_id': vulnId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete
     * @param vulnId
     * @returns VulnerabilityRead Successful Response
     * @throws ApiError
     */
    public static deleteRisksVulnerabilitiesVulnIdDelete(
        vulnId: number,
    ): CancelablePromise<VulnerabilityRead> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/vulnerabilities/{vuln_id}',
            path: {
                'vuln_id': vulnId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
