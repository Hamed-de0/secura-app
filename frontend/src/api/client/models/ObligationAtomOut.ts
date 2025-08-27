/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ObligationAtomOut = {
    /**
     * FK to framework_requirements.id
     */
    framework_requirement_id: number;
    /**
     * Stable key within the article, e.g. 'Art.32(1)(b)' or 'A2'
     */
    atom_key: string;
    /**
     * controller | processor | both
     */
    role?: (string | null);
    /**
     * Short paraphrase of the 'shall' obligation
     */
    obligation_text: string;
    condition?: (string | null);
    outcome?: (string | null);
    citation?: (string | null);
    /**
     * Freeform JSON flags, e.g. { 'xborder': False }
     */
    applicability?: (Record<string, any> | null);
    /**
     * List of suggested evidence types
     */
    evidence_hint?: (Array<string> | null);
    sort_index?: number;
    id: number;
};

