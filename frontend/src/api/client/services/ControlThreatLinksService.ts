/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlThreatLinkCreate } from '../models/ControlThreatLinkCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlThreatLinksService {
    /**
     * Create Link
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createLinkControlsControlThreatLinksPost(
        requestBody: ControlThreatLinkCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-threat-links/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Link
     * @param controlId
     * @param threatId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLinkControlsControlThreatLinksDelete(
        controlId: number,
        threatId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-threat-links/',
            query: {
                'control_id': controlId,
                'threat_id': threatId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
