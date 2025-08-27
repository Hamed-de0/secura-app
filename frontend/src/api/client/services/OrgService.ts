/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgBUCreate } from '../models/OrgBUCreate';
import type { OrgBUOut } from '../models/OrgBUOut';
import type { OrgBUUpdate } from '../models/OrgBUUpdate';
import type { OrgEntityCreate } from '../models/OrgEntityCreate';
import type { OrgEntityOut } from '../models/OrgEntityOut';
import type { OrgEntityUpdate } from '../models/OrgEntityUpdate';
import type { OrgGroupCreate } from '../models/OrgGroupCreate';
import type { OrgGroupOut } from '../models/OrgGroupOut';
import type { OrgGroupUpdate } from '../models/OrgGroupUpdate';
import type { OrgServiceConsumerCreate } from '../models/OrgServiceConsumerCreate';
import type { OrgServiceConsumerOut } from '../models/OrgServiceConsumerOut';
import type { OrgServiceConsumerUpdate } from '../models/OrgServiceConsumerUpdate';
import type { OrgServiceCreate } from '../models/OrgServiceCreate';
import type { OrgServiceOut } from '../models/OrgServiceOut';
import type { OrgServiceUpdate } from '../models/OrgServiceUpdate';
import type { OrgSiteCreate } from '../models/OrgSiteCreate';
import type { OrgSiteOut } from '../models/OrgSiteOut';
import type { OrgSiteUpdate } from '../models/OrgSiteUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrgService {
    /**
     * List Groups
     * @returns OrgGroupOut Successful Response
     * @throws ApiError
     */
    public static listGroupsOrgGroupsGet(): CancelablePromise<Array<OrgGroupOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/groups',
        });
    }
    /**
     * Create Group
     * @param requestBody
     * @returns OrgGroupOut Successful Response
     * @throws ApiError
     */
    public static createGroupOrgGroupsPost(
        requestBody: OrgGroupCreate,
    ): CancelablePromise<OrgGroupOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/groups',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Group
     * @param groupId
     * @returns OrgGroupOut Successful Response
     * @throws ApiError
     */
    public static getGroupOrgGroupsGroupIdGet(
        groupId: number,
    ): CancelablePromise<OrgGroupOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/groups/{group_id}',
            path: {
                'group_id': groupId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Group
     * @param groupId
     * @param requestBody
     * @returns OrgGroupOut Successful Response
     * @throws ApiError
     */
    public static updateGroupOrgGroupsGroupIdPut(
        groupId: number,
        requestBody: OrgGroupUpdate,
    ): CancelablePromise<OrgGroupOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/groups/{group_id}',
            path: {
                'group_id': groupId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Group
     * @param groupId
     * @returns void
     * @throws ApiError
     */
    public static deleteGroupOrgGroupsGroupIdDelete(
        groupId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/groups/{group_id}',
            path: {
                'group_id': groupId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Entities
     * @param groupId
     * @returns OrgEntityOut Successful Response
     * @throws ApiError
     */
    public static listEntitiesOrgEntitiesGet(
        groupId?: (number | null),
    ): CancelablePromise<Array<OrgEntityOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/entities',
            query: {
                'group_id': groupId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Entity
     * @param requestBody
     * @returns OrgEntityOut Successful Response
     * @throws ApiError
     */
    public static createEntityOrgEntitiesPost(
        requestBody: OrgEntityCreate,
    ): CancelablePromise<OrgEntityOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/entities',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Entity
     * @param entityId
     * @returns OrgEntityOut Successful Response
     * @throws ApiError
     */
    public static getEntityOrgEntitiesEntityIdGet(
        entityId: number,
    ): CancelablePromise<OrgEntityOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/entities/{entity_id}',
            path: {
                'entity_id': entityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Entity
     * @param entityId
     * @param requestBody
     * @returns OrgEntityOut Successful Response
     * @throws ApiError
     */
    public static updateEntityOrgEntitiesEntityIdPut(
        entityId: number,
        requestBody: OrgEntityUpdate,
    ): CancelablePromise<OrgEntityOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/entities/{entity_id}',
            path: {
                'entity_id': entityId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Entity
     * @param entityId
     * @returns void
     * @throws ApiError
     */
    public static deleteEntityOrgEntitiesEntityIdDelete(
        entityId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/entities/{entity_id}',
            path: {
                'entity_id': entityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Bus
     * @param entityId
     * @returns OrgBUOut Successful Response
     * @throws ApiError
     */
    public static listBusOrgBusinessUnitsGet(
        entityId?: (number | null),
    ): CancelablePromise<Array<OrgBUOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/business-units',
            query: {
                'entity_id': entityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Bu
     * @param requestBody
     * @returns OrgBUOut Successful Response
     * @throws ApiError
     */
    public static createBuOrgBusinessUnitsPost(
        requestBody: OrgBUCreate,
    ): CancelablePromise<OrgBUOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/business-units',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Bu
     * @param buId
     * @returns OrgBUOut Successful Response
     * @throws ApiError
     */
    public static getBuOrgBusinessUnitsBuIdGet(
        buId: number,
    ): CancelablePromise<OrgBUOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/business-units/{bu_id}',
            path: {
                'bu_id': buId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Bu
     * @param buId
     * @param requestBody
     * @returns OrgBUOut Successful Response
     * @throws ApiError
     */
    public static updateBuOrgBusinessUnitsBuIdPut(
        buId: number,
        requestBody: OrgBUUpdate,
    ): CancelablePromise<OrgBUOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/business-units/{bu_id}',
            path: {
                'bu_id': buId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Bu
     * @param buId
     * @returns void
     * @throws ApiError
     */
    public static deleteBuOrgBusinessUnitsBuIdDelete(
        buId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/business-units/{bu_id}',
            path: {
                'bu_id': buId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Services
     * @param providerEntityId
     * @returns OrgServiceOut Successful Response
     * @throws ApiError
     */
    public static listServicesOrgServicesGet(
        providerEntityId?: (number | null),
    ): CancelablePromise<Array<OrgServiceOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/services',
            query: {
                'provider_entity_id': providerEntityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Service
     * @param requestBody
     * @returns OrgServiceOut Successful Response
     * @throws ApiError
     */
    public static createServiceOrgServicesPost(
        requestBody: OrgServiceCreate,
    ): CancelablePromise<OrgServiceOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/services',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Service
     * @param serviceId
     * @returns OrgServiceOut Successful Response
     * @throws ApiError
     */
    public static getServiceOrgServicesServiceIdGet(
        serviceId: number,
    ): CancelablePromise<OrgServiceOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/services/{service_id}',
            path: {
                'service_id': serviceId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Service
     * @param serviceId
     * @param requestBody
     * @returns OrgServiceOut Successful Response
     * @throws ApiError
     */
    public static updateServiceOrgServicesServiceIdPut(
        serviceId: number,
        requestBody: OrgServiceUpdate,
    ): CancelablePromise<OrgServiceOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/services/{service_id}',
            path: {
                'service_id': serviceId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Service
     * @param serviceId
     * @returns void
     * @throws ApiError
     */
    public static deleteServiceOrgServicesServiceIdDelete(
        serviceId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/services/{service_id}',
            path: {
                'service_id': serviceId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Service Consumers
     * @param serviceId
     * @param consumerEntityId
     * @param consumerBuId
     * @returns OrgServiceConsumerOut Successful Response
     * @throws ApiError
     */
    public static listServiceConsumersOrgServiceConsumersGet(
        serviceId?: (number | null),
        consumerEntityId?: (number | null),
        consumerBuId?: (number | null),
    ): CancelablePromise<Array<OrgServiceConsumerOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/service-consumers',
            query: {
                'service_id': serviceId,
                'consumer_entity_id': consumerEntityId,
                'consumer_bu_id': consumerBuId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Service Consumer
     * @param requestBody
     * @returns OrgServiceConsumerOut Successful Response
     * @throws ApiError
     */
    public static createServiceConsumerOrgServiceConsumersPost(
        requestBody: OrgServiceConsumerCreate,
    ): CancelablePromise<OrgServiceConsumerOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/service-consumers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Service Consumer
     * @param linkId
     * @returns OrgServiceConsumerOut Successful Response
     * @throws ApiError
     */
    public static getServiceConsumerOrgServiceConsumersLinkIdGet(
        linkId: number,
    ): CancelablePromise<OrgServiceConsumerOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/service-consumers/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Service Consumer
     * @param linkId
     * @param requestBody
     * @returns OrgServiceConsumerOut Successful Response
     * @throws ApiError
     */
    public static updateServiceConsumerOrgServiceConsumersLinkIdPut(
        linkId: number,
        requestBody: OrgServiceConsumerUpdate,
    ): CancelablePromise<OrgServiceConsumerOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/service-consumers/{link_id}',
            path: {
                'link_id': linkId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Service Consumer
     * @param linkId
     * @returns void
     * @throws ApiError
     */
    public static deleteServiceConsumerOrgServiceConsumersLinkIdDelete(
        linkId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/service-consumers/{link_id}',
            path: {
                'link_id': linkId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Sites
     * @param entityId
     * @returns OrgSiteOut Successful Response
     * @throws ApiError
     */
    public static listSitesOrgSitesGet(
        entityId?: (number | null),
    ): CancelablePromise<Array<OrgSiteOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/sites',
            query: {
                'entity_id': entityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Site
     * @param requestBody
     * @returns OrgSiteOut Successful Response
     * @throws ApiError
     */
    public static createSiteOrgSitesPost(
        requestBody: OrgSiteCreate,
    ): CancelablePromise<OrgSiteOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/org/sites',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Site
     * @param siteId
     * @returns OrgSiteOut Successful Response
     * @throws ApiError
     */
    public static getSiteOrgSitesSiteIdGet(
        siteId: number,
    ): CancelablePromise<OrgSiteOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Site
     * @param siteId
     * @param requestBody
     * @returns OrgSiteOut Successful Response
     * @throws ApiError
     */
    public static updateSiteOrgSitesSiteIdPut(
        siteId: number,
        requestBody: OrgSiteUpdate,
    ): CancelablePromise<OrgSiteOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/org/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Site
     * @param siteId
     * @returns void
     * @throws ApiError
     */
    public static deleteSiteOrgSitesSiteIdDelete(
        siteId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/org/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
