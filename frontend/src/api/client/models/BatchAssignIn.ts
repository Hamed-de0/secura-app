/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImpactRatingIn } from './ImpactRatingIn';
export type BatchAssignIn = {
    risk_scenario_id: number;
    scope_type: BatchAssignIn.scope_type;
    target_ids: Array<number>;
    likelihood?: (number | null);
    status?: (string | null);
    lifecycle_states?: (Array<string> | null);
    impact_ratings?: Array<ImpactRatingIn>;
    owner_id?: (number | null);
    next_review?: (string | null);
    on_conflict?: BatchAssignIn.on_conflict;
    idempotency_key?: (string | null);
};
export namespace BatchAssignIn {
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
    export enum on_conflict {
        SKIP = 'skip',
        UPDATE = 'update',
    }
}

