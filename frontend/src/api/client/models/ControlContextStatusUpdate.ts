/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlContextStatusUpdate = {
    status?: ControlContextStatusUpdate.status;
    implemented_at?: (string | null);
    notes?: (string | null);
};
export namespace ControlContextStatusUpdate {
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

