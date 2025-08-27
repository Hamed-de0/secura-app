/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LostTo = {
    scope_type: string;
    scope_id: number;
    reason: LostTo.reason;
};
export namespace LostTo {
    export enum reason {
        MORE_SPECIFIC = 'more_specific',
        BETTER_STATUS = 'better_status',
        SOURCE_PREFERENCE = 'source_preference',
    }
}

