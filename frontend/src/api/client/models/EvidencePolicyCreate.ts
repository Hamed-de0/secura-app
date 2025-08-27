/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EvidencePolicyCreate = {
    /**
     * Target control OR requirement
     */
    control_id?: (number | null);
    /**
     * Mutually exclusive with control_id
     */
    framework_requirement_id?: (number | null);
    freshness_days: number;
    notes?: (string | null);
};

