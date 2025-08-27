/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ThreatCreate } from '../models/ThreatCreate';
import type { ThreatRead } from '../models/ThreatRead';
import type { ThreatUpdate } from '../models/ThreatUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ThreatsService {
    /**
     * Create
     * @param requestBody
     * @returns ThreatRead Successful Response
     * @throws ApiError
     */
    public static createRisksThreatsPost(
        requestBody: ThreatCreate,
    ): CancelablePromise<ThreatRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/threats/',
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
     * @returns ThreatRead Successful Response
     * @throws ApiError
     */
    public static readAllRisksThreatsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ThreatRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/threats/',
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
     * Read One
     * @param threatId
     * @returns ThreatRead Successful Response
     * @throws ApiError
     */
    public static readOneRisksThreatsThreatIdGet(
        threatId: number,
    ): CancelablePromise<ThreatRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/threats/{threat_id}',
            path: {
                'threat_id': threatId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param threatId
     * @param requestBody
     * @returns ThreatRead Successful Response
     * @throws ApiError
     */
    public static updateRisksThreatsThreatIdPut(
        threatId: number,
        requestBody: ThreatUpdate,
    ): CancelablePromise<ThreatRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/threats/{threat_id}',
            path: {
                'threat_id': threatId,
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
     * @param threatId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteRisksThreatsThreatIdDelete(
        threatId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/threats/{threat_id}',
            path: {
                'threat_id': threatId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
