/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ControlFrameworkMappingNamesOut = {
    framework_requirement_id: number;
    control_id: number;
    /**
     * If set, this mapping targets a specific obligation atom; otherwise article-level
     */
    obligation_atom_id?: (number | null);
    /**
     * satisfies | supports | enables
     */
    relation_type?: (string | null);
    /**
     * full | partial | conditional
     */
    coverage_level?: (string | null);
    applicability?: (Record<string, any> | null);
    evidence_hint?: (Array<string> | null);
    rationale?: (string | null);
    weight?: number;
    notes?: (string | null);
    id: number;
    control_title: (string | null);
    control_code: (string | null);
    framework_requirement_title?: (string | null);
    framework_requirement_code?: (string | null);
    obligation_atom_name?: (string | null);
    obligation_atom_code?: (string | null);
};

