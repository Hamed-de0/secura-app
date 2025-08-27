/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AssetRead = {
    name: string;
    description?: (string | null);
    type_id: number;
    group_id: number;
    location?: (string | null);
    details?: (Record<string, any> | null);
    id: number;
    created_at: string;
    updated_at: string;
    enabled: boolean;
    children?: (Array<AssetRead> | null);
};

