/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RiskScenarioContextCreate = {
    risk_scenario_id: number;
    scope_type: RiskScenarioContextCreate.scope_type;
    scope_id: number;
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
export namespace RiskScenarioContextCreate {
    export enum scope_type {
        ASSET = 'asset',
        ASSET_TYPE = 'asset_type',
        ASSET_GROUP = 'asset_group',
        ASSET_TAG = 'asset_tag',
        BU = 'bu',
        SITE = 'site',
        ENTITY = 'entity',
        SERVICE = 'service',
        ORG_GROUP = 'org_group',
    }
}

