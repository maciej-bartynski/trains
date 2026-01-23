import ResourceKind from "../enums/ResourceKind.js";
import Address from "../types/Address.js";

type TrainState = {
    _id: string,
    location: Address,
    speed: number,
    storage: null | Partial<Record<ResourceKind, {
        qty: number,
        max: number
    }>>
};

export type {
    TrainState
}