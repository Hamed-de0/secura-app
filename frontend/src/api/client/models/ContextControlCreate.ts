/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ContextControlCreate = {
    controlId: number;
    status: ContextControlCreate.status;
};
export namespace ContextControlCreate {
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

