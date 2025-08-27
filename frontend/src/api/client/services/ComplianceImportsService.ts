/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_import_requirements_csv_id_api_imports_framework_versions__version_id__requirements_csv_id_post } from '../models/Body_import_requirements_csv_id_api_imports_framework_versions__version_id__requirements_csv_id_post';
import type { ImportResult } from '../models/ImportResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ComplianceImportsService {
    /**
     * Import Requirements Csv Id Api
     * @param versionId
     * @param formData
     * @param dryRun
     * @returns ImportResult Successful Response
     * @throws ApiError
     */
    public static importRequirementsCsvIdApiImportsFrameworkVersionsVersionIdRequirementsCsvIdPost(
        versionId: number,
        formData: Body_import_requirements_csv_id_api_imports_framework_versions__version_id__requirements_csv_id_post,
        dryRun: boolean = false,
    ): CancelablePromise<ImportResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/imports/framework_versions/{version_id}/requirements/csv-id',
            path: {
                'version_id': versionId,
            },
            query: {
                'dry_run': dryRun,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
