/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskScenarioSubcategory } from './RiskScenarioSubcategory';
export type RiskScenarioCategory = {
    name_en: string;
    name_de?: (string | null);
    description_en?: (string | null);
    description_de?: (string | null);
    id: number;
    subcategories?: Array<RiskScenarioSubcategory>;
};

