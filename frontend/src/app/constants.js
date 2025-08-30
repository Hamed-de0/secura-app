// src/app/constants.js

export const SCOPE_TYPES = ["asset", "group", "tag", "type"];

export const STATUSES = ["Open", "Accepted", "Mitigated"];

export const LIFECYCLE_OPTIONS = ["in_use", "maintenance", "offline"];

export const IMPACT_DOMAINS = [
    { id: 1, name: "Confidentiality" },
    { id: 2, name: "Integrity" },
    { id: 3, name: "Availability" },
    { id: 4, name: "Legal" },
    { id: 5, name: "Reputation" }
];

export const LOOKUP_ENDPOINTS = {
    asset: "/assets",
    group: "/asset-groups",
    tag: "/asset-tags",
    type: "/asset-types"
};

export const DEFAULT_SCOPE = { scopeType: 'org', scopeId: 1 };

