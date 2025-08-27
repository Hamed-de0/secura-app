/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrgServiceConsumerUpdate = {
    consumer_entity_id?: (number | null);
    consumer_bu_id?: (number | null);
    inheritance_type?: ('direct' | 'conditional' | 'advisory' | null);
    responsibility?: ('provider_owner' | 'consumer_owner' | 'shared' | null);
    residual_consumer_tasks?: null;
    agreement_type?: (string | null);
    agreement_ref?: (string | null);
    start_date?: (string | null);
    end_date?: (string | null);
    notes?: (string | null);
};

