/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskScenarioCategory } from '../models/RiskScenarioCategory';
import type { RiskScenarioCategoryCreate } from '../models/RiskScenarioCategoryCreate';
import type { RiskScenarioCategoryUpdate } from '../models/RiskScenarioCategoryUpdate';
import type { RiskScenarioSubcategory } from '../models/RiskScenarioSubcategory';
import type { RiskScenarioSubcategoryCreate } from '../models/RiskScenarioSubcategoryCreate';
import type { RiskScenarioSubcategoryUpdate } from '../models/RiskScenarioSubcategoryUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RiskCategoriesService {
    /**
     * List Categories
     * @returns RiskScenarioCategory Successful Response
     * @throws ApiError
     */
    public static listCategoriesRisksRiskCategoriesGet(): CancelablePromise<Array<RiskScenarioCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-categories/',
        });
    }
    /**
     * Create Category
     * @param requestBody
     * @returns RiskScenarioCategory Successful Response
     * @throws ApiError
     */
    public static createCategoryRisksRiskCategoriesPost(
        requestBody: RiskScenarioCategoryCreate,
    ): CancelablePromise<RiskScenarioCategory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk-categories/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Category
     * @param categoryId
     * @returns RiskScenarioCategory Successful Response
     * @throws ApiError
     */
    public static getCategoryRisksRiskCategoriesCategoryIdGet(
        categoryId: number,
    ): CancelablePromise<RiskScenarioCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-categories/{category_id}',
            path: {
                'category_id': categoryId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Category
     * @param categoryId
     * @param requestBody
     * @returns RiskScenarioCategory Successful Response
     * @throws ApiError
     */
    public static updateCategoryRisksRiskCategoriesCategoryIdPut(
        categoryId: number,
        requestBody: RiskScenarioCategoryUpdate,
    ): CancelablePromise<RiskScenarioCategory> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/risk-categories/{category_id}',
            path: {
                'category_id': categoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Category
     * @param categoryId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCategoryRisksRiskCategoriesCategoryIdDelete(
        categoryId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risk-categories/{category_id}',
            path: {
                'category_id': categoryId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Subcategories
     * @returns RiskScenarioSubcategory Successful Response
     * @throws ApiError
     */
    public static listSubcategoriesRisksRiskCategoriesSubcategoriesGet(): CancelablePromise<Array<RiskScenarioSubcategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-categories/subcategories/',
        });
    }
    /**
     * Create Subcategory
     * @param requestBody
     * @returns RiskScenarioSubcategory Successful Response
     * @throws ApiError
     */
    public static createSubcategoryRisksRiskCategoriesSubcategoriesPost(
        requestBody: RiskScenarioSubcategoryCreate,
    ): CancelablePromise<RiskScenarioSubcategory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/risks/risk-categories/subcategories/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Subcategory
     * @param subcategoryId
     * @returns RiskScenarioSubcategory Successful Response
     * @throws ApiError
     */
    public static getSubcategoryRisksRiskCategoriesSubcategoriesSubcategoryIdGet(
        subcategoryId: number,
    ): CancelablePromise<RiskScenarioSubcategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/risks/risk-categories/subcategories/{subcategory_id}',
            path: {
                'subcategory_id': subcategoryId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Subcategory
     * @param subcategoryId
     * @param requestBody
     * @returns RiskScenarioSubcategory Successful Response
     * @throws ApiError
     */
    public static updateSubcategoryRisksRiskCategoriesSubcategoriesSubcategoryIdPut(
        subcategoryId: number,
        requestBody: RiskScenarioSubcategoryUpdate,
    ): CancelablePromise<RiskScenarioSubcategory> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/risks/risk-categories/subcategories/{subcategory_id}',
            path: {
                'subcategory_id': subcategoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Subcategory
     * @param subcategoryId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteSubcategoryRisksRiskCategoriesSubcategoriesSubcategoryIdDelete(
        subcategoryId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/risks/risk-categories/subcategories/{subcategory_id}',
            path: {
                'subcategory_id': subcategoryId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
