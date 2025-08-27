/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LostTo } from './LostTo';
export type EffectiveControlCandidate = {
    control_id: number;
    link_id?: (number | null);
    source: EffectiveControlCandidate.source;
    assurance_status: string;
    scope_type: string;
    scope_id: number;
    provider_service_id?: (number | null);
    inheritance_type?: ('direct' | 'conditional' | 'advisory' | null);
    responsibility?: ('provider_owner' | 'consumer_owner' | 'shared' | null);
    notes?: (string | null);
    lost_to?: (LostTo | null);
};
export namespace EffectiveControlCandidate {
    export enum source {
        DIRECT = 'direct',
        PROVIDER = 'provider',
        BASELINE = 'baseline',
    }
}

