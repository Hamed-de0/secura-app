/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScenarioContext = {
    risk_scenario_id: number;
    scope_type: string;
    scope_id: number;
    asset_id?: (number | null);
    asset_group_id?: (number | null);
    asset_tag_id?: (number | null);
    asset_type_id?: (number | null);
    owner_id?: (number | null);
    lifecycle_states?: (Array<string> | null);
    status: string;
    threat_id?: (number | null);
    vulnerability_id?: (number | null);
    likelihood: (number | null);
    id: number;
    created_at: string;
    updated_at: string;
    enabled: boolean;
};

