/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlEvidenceUpdate = {
    title?: (string | null);
    description?: (string | null);
    evidence_type?: ('file' | 'url' | 'screenshot' | 'report' | 'other' | null);
    evidence_url?: (string | null);
    file_path?: (string | null);
    collected_at?: (string | null);
    valid_until?: (string | null);
    status?: ('valid' | 'needs_review' | 'invalid' | 'expired' | null);
};

