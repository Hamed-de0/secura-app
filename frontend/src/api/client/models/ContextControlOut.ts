/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ContextControlOut = {
    id: number;
    contextId: number;
    controlId: number;
    code?: (string | null);
    title?: (string | null);
    status: ContextControlOut.status;
    lastEvidenceAt?: (string | null);
};
export namespace ContextControlOut {
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

