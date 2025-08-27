/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlRiskLinkCreate } from '../models/ControlRiskLinkCreate';
import type { ControlRiskLinkRead } from '../models/ControlRiskLinkRead';
import type { ControlRiskLinkUpdate } from '../models/ControlRiskLinkUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlRiskLinksService {
    /**
     * Read All Links
     * @returns ControlRiskLinkRead Successful Response
     * @throws ApiError
     */
    public static readAllLinksControlsControlRiskLinksGet(): CancelablePromise<Array<ControlRiskLinkRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-risk-links/',
        });
    }
    /**
     * Create Link
     * @param requestBody
     * @returns ControlRiskLinkRead Successful Response
     * @throws ApiError
     */
    public static createLinkControlsControlRiskLinksPost(
        requestBody: ControlRiskLinkCreate,
    ): CancelablePromise<ControlRiskLinkRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-risk-links/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Links By Risk Scenario
     * @param scenarioId
     * @returns ControlRiskLinkRead Successful Response
     * @throws ApiError
     */
    public static readLinksByRiskScenarioControlsControlRiskLinksByScenarioScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<Array<ControlRiskLinkRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-risk-links/by-scenario/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Links By Risk Control
     * @param controlId
     * @returns ControlRiskLinkRead Successful Response
     * @throws ApiError
     */
    public static readLinksByRiskControlControlsControlRiskLinksByControlControlIdGet(
        controlId: number,
    ): CancelablePromise<Array<ControlRiskLinkRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-risk-links/by-control/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Link
     * @param linkId
     * @param requestBody
     * @returns ControlRiskLinkRead Successful Response
     * @throws ApiError
     */
    public static updateLinkControlsControlRiskLinksLinkIdPut(
        linkId: number,
        requestBody: ControlRiskLinkUpdate,
    ): CancelablePromise<ControlRiskLinkRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/controls/control-risk-links/{link_id}',
            path: {
                'link_id': linkId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Link
     * @param linkId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLinkControlsControlRiskLinksLinkIdDelete(
        linkId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-risk-links/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
