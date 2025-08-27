/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrgServiceConsumerCreate = {
    service_id: number;
    consumer_entity_id: number;
    consumer_bu_id?: (number | null);
    inheritance_type?: OrgServiceConsumerCreate.inheritance_type;
    responsibility?: OrgServiceConsumerCreate.responsibility;
    residual_consumer_tasks?: Array<Record<string, any>>;
    /**
     * ICA|DPA|MSA|SLA|OTHER
     */
    agreement_type?: (string | null);
    agreement_ref?: (string | null);
    start_date?: (string | null);
    end_date?: (string | null);
    notes?: (string | null);
};
export namespace OrgServiceConsumerCreate {
    export enum inheritance_type {
        DIRECT = 'direct',
        CONDITIONAL = 'conditional',
        ADVISORY = 'advisory',
    }
    export enum responsibility {
        PROVIDER_OWNER = 'provider_owner',
        CONSUMER_OWNER = 'consumer_owner',
        SHARED = 'shared',
    }
}

