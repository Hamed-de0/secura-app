/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ComplianceExceptionOut = {
    id: number;
    risk_scenario_context_id: number;
    control_id: (number | null);
    framework_requirement_id: (number | null);
    title: string;
    description: (string | null);
    reason: (string | null);
    risk_acceptance_ref: (string | null);
    compensating_controls: (string | null);
    requested_by: (string | null);
    owner: (string | null);
    start_date: string;
    end_date: string;
    status: ComplianceExceptionOut.status;
    created_at: string;
    updated_at: string;
};
export namespace ComplianceExceptionOut {
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        APPROVED = 'approved',
        REJECTED = 'rejected',
        ACTIVE = 'active',
        EXPIRED = 'expired',
        WITHDRAWN = 'withdrawn',
    }
}

