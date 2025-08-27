/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScenarioContextUpdate = {
    risk_scenario_id?: (number | null);
    scope_type?: ('asset' | 'asset_type' | 'asset_group' | 'asset_tag' | 'bu' | 'site' | 'entity' | 'service' | 'org_group' | null);
    scope_id?: (number | null);
    asset_id?: (number | null);
    asset_group_id?: (number | null);
    asset_tag_id?: (number | null);
    asset_type_id?: (number | null);
    owner_id?: (number | null);
    lifecycle_states?: (Array<string> | null);
    status?: (string | null);
    threat_id?: (number | null);
    vulnerability_id?: (number | null);
    likelihood?: (number | null);
};

