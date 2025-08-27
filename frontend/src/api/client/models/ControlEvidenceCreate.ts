/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlEvidenceCreate = {
    control_context_link_id: number;
    title: string;
    description?: (string | null);
    evidence_type?: ControlEvidenceCreate.evidence_type;
    evidence_url?: (string | null);
    file_path?: (string | null);
    collected_at: string;
    valid_until?: (string | null);
    status?: ControlEvidenceCreate.status;
    created_by?: (string | null);
};
export namespace ControlEvidenceCreate {
    export enum evidence_type {
        FILE = 'file',
        URL = 'url',
        SCREENSHOT = 'screenshot',
        REPORT = 'report',
        OTHER = 'other',
    }
    export enum status {
        VALID = 'valid',
        NEEDS_REVIEW = 'needs_review',
        INVALID = 'invalid',
        EXPIRED = 'expired',
    }
}

