/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskAppetitePolicyUpdate = {
    scope?: ('org' | 'entity' | 'business_unit' | 'site' | 'asset' | 'asset_group' | 'asset_type' | 'asset_tag' | null);
    scope_id?: (number | null);
    domain?: (string | null);
    green_max?: (number | null);
    amber_max?: (number | null);
    domain_caps_json?: (Record<string, number> | null);
    sla_days_amber?: (number | null);
    sla_days_red?: (number | null);
    priority?: (number | null);
    effective_from?: (string | null);
    effective_to?: (string | null);
    notes?: (string | null);
};

