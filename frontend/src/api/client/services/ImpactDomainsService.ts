/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImpactDomainCreate } from '../models/ImpactDomainCreate';
import type { ImpactDomainRead } from '../models/ImpactDomainRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImpactDomainsService {
    /**
     * Create
     * @param requestBody
     * @returns ImpactDomainRead Successful Response
     * @throws ApiError
     */
    public static createRisksImpactDomainsPost(
        requestBody: ImpactDomainCreate,
    ): CancelablePromise<ImpactDomainRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/impact-domains/',
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
     * @returns ImpactDomainRead Successful Response
     * @throws ApiError
     */
    public static readAllRisksImpactDomainsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ImpactDomainRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/impact-domains/',
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
     * @param domainId
     * @returns ImpactDomainRead Successful Response
     * @throws ApiError
     */
    public static readRisksImpactDomainsDomainIdGet(
        domainId: number,
    ): CancelablePromise<ImpactDomainRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/impact-domains/{domain_id}',
            path: {
                'domain_id': domainId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete
     * @param domainId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteRisksImpactDomainsDomainIdDelete(
        domainId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/impact-domains/{domain_id}',
            path: {
                'domain_id': domainId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
