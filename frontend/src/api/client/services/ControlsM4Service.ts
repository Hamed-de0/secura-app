/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlsCatalogListOut } from '../models/ControlsCatalogListOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlsM4Service {
    /**
     * Controls Catalog
     * @param q Search by code or title
     * @param offset
     * @param limit
     * @param sortBy
     * @param sortDir
     * @returns ControlsCatalogListOut Successful Response
     * @throws ApiError
     */
    public static controlsCatalogControlsControlsCatalogGet(
        q: string = '',
        offset?: number,
        limit: number = 20,
        sortBy: string = 'code',
        sortDir: string = 'asc',
    ): CancelablePromise<ControlsCatalogListOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/controls/catalog/',
            query: {
                'q': q,
                'offset': offset,
                'limit': limit,
                'sort_by': sortBy,
                'sort_dir': sortDir,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
