/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlEvidenceOut = {
    id: number;
    control_context_link_id: number;
    title: string;
    description: (string | null);
    evidence_type: ControlEvidenceOut.evidence_type;
    evidence_url: (string | null);
    file_path: (string | null);
    collected_at: string;
    valid_until: (string | null);
    status: ControlEvidenceOut.status;
    created_by: (string | null);
    created_at: string;
};
export namespace ControlEvidenceOut {
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

