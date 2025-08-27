/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlEffectRatingCreate } from '../models/ControlEffectRatingCreate';
import type { ControlEffectRatingOut } from '../models/ControlEffectRatingOut';
import type { ControlEffectRatingUpdate } from '../models/ControlEffectRatingUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlEffectRatingService {
    /**
     * Create Rating
     * @param requestBody
     * @returns ControlEffectRatingOut Successful Response
     * @throws ApiError
     */
    public static createRatingControlsControlEffectRatingsPost(
        requestBody: Array<ControlEffectRatingCreate>,
    ): CancelablePromise<Array<ControlEffectRatingOut>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-effect-ratings/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Scenario
     * @param scenarioId
     * @returns ControlEffectRatingOut Successful Response
     * @throws ApiError
     */
    public static getByScenarioControlsControlEffectRatingsByScenarioScenarioIdGet(
        scenarioId: number,
    ): CancelablePromise<Array<ControlEffectRatingOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-effect-ratings/by-scenario/{scenario_id}',
            path: {
                'scenario_id': scenarioId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Control
     * @param controlId
     * @returns ControlEffectRatingOut Successful Response
     * @throws ApiError
     */
    public static getByControlControlsControlEffectRatingsByControlControlIdGet(
        controlId: number,
    ): CancelablePromise<Array<ControlEffectRatingOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/control-effect-ratings/by-control/{control_id}',
            path: {
                'control_id': controlId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @param ratingId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateControlsControlEffectRatingsBulkInsertPost(
        ratingId: number,
        requestBody: ControlEffectRatingUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/controls/control-effect-ratings/bulk_insert',
            query: {
                'rating_id': ratingId,
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
     * @param ratingId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteControlsControlEffectRatingsRatingIdDelete(
        ratingId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/controls/control-effect-ratings/{rating_id}',
            path: {
                'rating_id': ratingId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
