/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComplianceExceptionCommentCreate } from '../models/ComplianceExceptionCommentCreate';
import type { ComplianceExceptionCommentOut } from '../models/ComplianceExceptionCommentOut';
import type { ComplianceExceptionCreate } from '../models/ComplianceExceptionCreate';
import type { ComplianceExceptionOut } from '../models/ComplianceExceptionOut';
import type { ComplianceExceptionUpdate } from '../models/ComplianceExceptionUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceExceptionsService {
    /**
     * Create Exception
     * @param requestBody
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static createExceptionExceptionsPost(
        requestBody: ComplianceExceptionCreate,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Exception
     * @param contextId
     * @param status
     * @param controlId
     * @param frameworkRequirementId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static listExceptionExceptionsGet(
        contextId?: (number | null),
        status?: (string | null),
        controlId?: (number | null),
        frameworkRequirementId?: (number | null),
    ): CancelablePromise<Array<ComplianceExceptionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/exceptions',
            query: {
                'context_id': contextId,
                'status': status,
                'control_id': controlId,
                'framework_requirement_id': frameworkRequirementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Exception
     * @param excId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static getExceptionExceptionsExcIdGet(
        excId: number,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/exceptions/{exc_id}',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Exception
     * @param excId
     * @param requestBody
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static updateExceptionExceptionsExcIdPatch(
        excId: number,
        requestBody: ComplianceExceptionUpdate,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/exceptions/{exc_id}',
            path: {
                'exc_id': excId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Exception
     * @param excId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static submitExceptionExceptionsExcIdSubmitPost(
        excId: number,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions/{exc_id}/submit',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Approve Exception
     * @param excId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static approveExceptionExceptionsExcIdApprovePost(
        excId: number,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions/{exc_id}/approve',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reject Exception
     * @param excId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static rejectExceptionExceptionsExcIdRejectPost(
        excId: number,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions/{exc_id}/reject',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Withdraw Exception
     * @param excId
     * @returns ComplianceExceptionOut Successful Response
     * @throws ApiError
     */
    public static withdrawExceptionExceptionsExcIdWithdrawPost(
        excId: number,
    ): CancelablePromise<ComplianceExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions/{exc_id}/withdraw',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Comment
     * @param excId
     * @param requestBody
     * @returns ComplianceExceptionCommentOut Successful Response
     * @throws ApiError
     */
    public static addCommentExceptionsExcIdCommentsPost(
        excId: number,
        requestBody: ComplianceExceptionCommentCreate,
    ): CancelablePromise<ComplianceExceptionCommentOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/exceptions/{exc_id}/comments',
            path: {
                'exc_id': excId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Comment
     * @param excId
     * @returns ComplianceExceptionCommentOut Successful Response
     * @throws ApiError
     */
    public static listCommentExceptionsExcIdCommentsGet(
        excId: number,
    ): CancelablePromise<Array<ComplianceExceptionCommentOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/exceptions/{exc_id}/comments',
            path: {
                'exc_id': excId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
