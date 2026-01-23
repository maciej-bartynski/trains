import TerrainKind from "../enums/TerrainKind.js";
import Address from "../types/Address.js";
import FieldVisibility from "../enums/FieldVisibility.js";
import ResourceKind from "../enums/ResourceKind.js";
import Orientation from "../enums/Orientation.js";
import BuildingKind from "../enums/BuildingKind.js";

type utilFieldStateOnInit = {
    _id: string,
    address: Address,
    visibility: FieldVisibility.Ready | FieldVisibility.Hidden,
    terrain: null,
    terrainImageNumber: null,
    terrainImageRotation: null,
    resources: null,
};

type utilFieldStateExisting = {
    _id: string,
    address: Address,
    visibility: FieldVisibility.Visible,
    terrain: TerrainKind,
    terrainImageNumber: 1 | 2 | 3 | 4,
    terrainImageRotation: 1 | 2 | 3 | 4,
    resources: ResourceKind[],
};

type FieldState = {
    _id: string,
    address: Address,
    visibility: FieldVisibility,
    terrain: TerrainKind | null,
    terrainImageNumber: 1 | 2 | 3 | 4 | null,
    terrainImageRotation: 1 | 2 | 3 | 4 | null,
    resources: ResourceKind[] | null,
} & (utilFieldStateOnInit | utilFieldStateExisting);

export type {
    FieldState,
    utilFieldStateExisting,
    utilFieldStateOnInit
}
