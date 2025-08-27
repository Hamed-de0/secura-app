/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlContextLinkOut = {
    id: number;
    risk_scenario_context_id: (number | null);
    scope_type: (string | null);
    scope_id: (number | null);
    control_id: number;
    assurance_status: ControlContextLinkOut.assurance_status;
    implemented_at: (string | null);
    status_updated_at: string;
    notes: (string | null);
};
export namespace ControlContextLinkOut {
    export enum assurance_status {
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

