import BuildingKind from "../enums/BuildingKind.js"
import Address from "../types/Address.js"

type BuildingState = {
    _id: string;
    address: Address,
    kind: BuildingKind,
}

export type {
    BuildingState
}