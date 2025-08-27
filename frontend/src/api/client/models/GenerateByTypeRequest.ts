/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImpactRatingItem } from './ImpactRatingItem';
export type GenerateByTypeRequest = {
    default_likelihood: number;
    impact_ratings?: Array<ImpactRatingItem>;
    status?: string;
    dry_run?: boolean;
    recalc_scores?: boolean;
};

