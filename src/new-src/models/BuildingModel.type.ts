import BuildingKind from "../enums/BuildingKind.js"
import Address from "../types/Address.js"

type BuildingState = {
    address: Address,
    kind: BuildingKind,
}

export type {
    BuildingState
}