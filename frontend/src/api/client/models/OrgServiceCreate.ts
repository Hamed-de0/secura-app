/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrgServiceCreate = {
    provider_entity_id: number;
    provider_bu_id?: (number | null);
    code: string;
    name: string;
    /**
     * accounting|soc|it_platform|hr|legal|dpo|other
     */
    service_type?: (string | null);
    is_active?: boolean;
    meta?: Record<string, any>;
};

