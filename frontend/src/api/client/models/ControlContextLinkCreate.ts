/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlContextLinkCreate = {
    risk_scenario_context_id?: (number | null);
    scope_type?: ('asset' | 'tag' | 'asset_group' | 'asset_type' | 'bu' | 'site' | 'entity' | 'service' | 'org_group' | null);
    scope_id?: (number | null);
    control_id: number;
    status?: ControlContextLinkCreate.status;
    implemented_at?: (string | null);
    notes?: (string | null);
};
export namespace ControlContextLinkCreate {
    export enum status {
        PROPOSED = 'proposed',
        MAPPED = 'mapped',
        PLANNING = 'planning',
        IMPLEMENTING = 'implementing',
        IMPLEMENTED = 'implemented',
        MONITORING = 'monitoring',
        ANALYZING = 'analyzing',
        EVIDENCED = 'evidenced',
        FRESH = 'fresh',
        EXPIRED = 'expired',
    }
}

