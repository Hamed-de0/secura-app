/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScenarioRead = {
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
    id: number;
    threat_name?: (string | null);
    vulnerability_name?: (string | null);
    subcategory_name_en?: (string | null);
    subcategory_name_de?: (string | null);
    category_name_en?: (string | null);
    category_name_de?: (string | null);
    created_at: string;
    updated_at: string;
    enabled: boolean;
};

