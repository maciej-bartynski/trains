import TerrainKind from "../enums/TerrainKind.js";
import Address from "../types/Address.js";
import FieldVisibility from "../enums/FieldVisibility.js";
import ResourceKind from "../enums/ResourceKind.js";
import Orientation, { OrientationSquareVariant } from "../enums/Orientation.js";
import BuildingKind from "../enums/BuildingKind.js";

type utilFieldStateOnInit = {
    address: Address,
    visibility: FieldVisibility.Ready | FieldVisibility.Hidden,
    terrain: null,
    terrainImageNumber: null,
    terrainImageRotation: null,
    railwayOrientation: null,
    railwayOrientationSquareVariant: null,
    building: null,
    resources: null,
    production: null;
    storage: null
};

type utilFieldStateExisting = {
    address: Address,
    visibility: FieldVisibility.Visible,
    terrain: TerrainKind,
    terrainImageNumber: 1 | 2 | 3 | 4,
    terrainImageRotation: 1 | 2 | 3 | 4,
    railwayOrientation: Orientation | null,
    railwayOrientationSquareVariant: OrientationSquareVariant | null,
    building: BuildingKind | null,
    resources: ResourceKind[],
    production: Partial<Record<ResourceKind, ({
        qty: number,
        progress: number,
    } | null)>> | null;
    storage: Partial<Record<ResourceKind, (number | null)>> | null;
};

type FieldState = {
    address: Address,
    visibility: FieldVisibility,
    terrain: TerrainKind | null,
    terrainImageNumber: 1 | 2 | 3 | 4 | null,
    terrainImageRotation: 1 | 2 | 3 | 4 | null,
    railwayOrientation: Orientation | null,
    railwayOrientationSquareVariant: OrientationSquareVariant | null,
    building: BuildingKind | null,
    resources: ResourceKind[] | null,
    production: Partial<Record<ResourceKind, ({
        qty: number,
        progress: number,
    } | null)>> | null;
    storage: Partial<Record<ResourceKind, (number | null)>> | null;
} & (utilFieldStateOnInit | utilFieldStateExisting);

export type {
    FieldState,
    utilFieldStateExisting,
    utilFieldStateOnInit
}
