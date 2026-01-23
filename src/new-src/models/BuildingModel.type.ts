import BuildingKind from "../enums/BuildingKind.js"
import ResourceKind from "../enums/ResourceKind.js";
import Address from "../types/Address.js";

type BuildingState = {
    _id: string,
    address: Address,
    kind: BuildingKind,
    production: null | Record<ResourceKind, {
        qty: number,
        progress: number,
    }>,
    storage: null | Record<ResourceKind, {
        qty: number,
        max: number,
    }>,
}

export type {
    BuildingState
}