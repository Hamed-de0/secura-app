/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlContextLinkUpdate = {
    risk_scenario_context_id?: (number | null);
    scope_type?: ('asset' | 'tag' | 'asset_group' | 'asset_type' | 'bu' | 'site' | 'entity' | 'service' | 'org_group' | null);
    scope_id?: (number | null);
    assurance_status?: ('proposed' | 'mapped' | 'planning' | 'implementing' | 'implemented' | 'monitoring' | 'analyzing' | 'evidenced' | 'fresh' | 'expired' | null);
    implemented_at?: (string | null);
    notes?: (string | null);
};

