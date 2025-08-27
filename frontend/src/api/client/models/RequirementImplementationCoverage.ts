/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ControlHit } from './ControlHit';
export type RequirementImplementationCoverage = {
    requirement_id: number;
    code: string;
    title?: (string | null);
    score: number;
    hits: Array<ControlHit>;
};

