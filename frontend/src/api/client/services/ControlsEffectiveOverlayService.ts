/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EffectiveControlOut } from '../models/EffectiveControlOut';
import type { EffectiveControlsVerboseOut } from '../models/EffectiveControlsVerboseOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ControlsEffectiveOverlayService {
    /**
     * Effective Controls
     * @param scopeType
     * @param scopeId
     * @returns EffectiveControlOut Successful Response
     * @throws ApiError
     */
    public static effectiveControlsControlsEffectiveControlsOverlayGet(
        scopeType: string,
        scopeId: number,
    ): CancelablePromise<Array<EffectiveControlOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/effective-controls/overlay',
            query: {
                'scope_type': scopeType,
                'scope_id': scopeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Effective Controls Verbose
     * @param scopeType
     * @param scopeId
     * @returns EffectiveControlsVerboseOut Successful Response
     * @throws ApiError
     */
    public static effectiveControlsVerboseControlsEffectiveControlsVerboseGet(
        scopeType: string,
        scopeId: number,
    ): CancelablePromise<EffectiveControlsVerboseOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/controls/effective-controls/verbose',
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
