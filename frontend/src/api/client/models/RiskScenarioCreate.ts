/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScenarioCreate = {
    title_en: string;
    title_de: string;
    description_en?: (string | null);
    description_de?: (string | null);
    status?: (string | null);
    likelihood?: (number | null);
    impact?: (Record<string, any> | null);
    threat_id: number;
    vulnerability_id: number;
    subcategory_id: number;
};

