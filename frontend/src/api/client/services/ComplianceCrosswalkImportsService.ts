/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_import_crosswalks_csv_api_imports_framework_versions__version_id__crosswalks_csv_post } from '../models/Body_import_crosswalks_csv_api_imports_framework_versions__version_id__crosswalks_csv_post';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceCrosswalkImportsService {
    /**
     * Import Crosswalks Csv Api
     * @param versionId
     * @param formData
     * @param dryRun
     * @param upsert
     * @param defaultWeight
     * @returns any Successful Response
     * @throws ApiError
     */
    public static importCrosswalksCsvApiImportsFrameworkVersionsVersionIdCrosswalksCsvPost(
        versionId: number,
        formData: Body_import_crosswalks_csv_api_imports_framework_versions__version_id__crosswalks_csv_post,
        dryRun: boolean = false,
        upsert: boolean = true,
        defaultWeight: number = 100,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/imports/framework_versions/{version_id}/crosswalks/csv',
            path: {
                'version_id': versionId,
            },
            query: {
                'dry_run': dryRun,
                'upsert': upsert,
                'default_weight': defaultWeight,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
