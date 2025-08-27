/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonCreate } from '../models/PersonCreate';
import type { PersonRead } from '../models/PersonRead';
import type { PersonUpdate } from '../models/PersonUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PersonsService {
    /**
     * Read Persons
     * @param skip
     * @param limit
     * @returns PersonRead Successful Response
     * @throws ApiError
     */
    public static readPersonsPersonsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<PersonRead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons/',
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
     * Create New Person
     * @param requestBody
     * @returns PersonRead Successful Response
     * @throws ApiError
     */
    public static createNewPersonPersonsPost(
        requestBody: PersonCreate,
    ): CancelablePromise<PersonRead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/persons/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Person
     * @param personId
     * @returns PersonRead Successful Response
     * @throws ApiError
     */
    public static readPersonPersonsPersonIdGet(
        personId: number,
    ): CancelablePromise<PersonRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Existing Person
     * @param personId
     * @param requestBody
     * @returns PersonRead Successful Response
     * @throws ApiError
     */
    public static updateExistingPersonPersonsPersonIdPut(
        personId: number,
        requestBody: PersonUpdate,
    ): CancelablePromise<PersonRead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/persons/{person_id}',
            path: {
                'person_id': personId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Existing Person
     * @param personId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteExistingPersonPersonsPersonIdDelete(
        personId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/persons/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
