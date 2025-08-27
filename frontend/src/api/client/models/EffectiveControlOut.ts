/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EffectiveControlOut = {
    control_id: number;
    link_id?: (number | null);
    /**
     * direct|provider|baseline
     */
    source: EffectiveControlOut.source;
    assurance_status: string;
    scope_type: string;
    scope_id: number;
    provider_service_id?: (number | null);
    inheritance_type?: ('direct' | 'conditional' | 'advisory' | null);
    responsibility?: ('provider_owner' | 'consumer_owner' | 'shared' | null);
    notes?: (string | null);
};
export namespace EffectiveControlOut {
    /**
     * direct|provider|baseline
     */
    export enum source {
        DIRECT = 'direct',
        PROVIDER = 'provider',
        BASELINE = 'baseline',
    }
}

