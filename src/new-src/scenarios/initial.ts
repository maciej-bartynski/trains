import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainKind from "../enums/TerrainKind.js";
import { addresAsKey } from "../models/BoardModel.type.js";
import { FieldState } from "../models/FieldModel.type.js";
import TerrainUtils from "../utils/TerrainUtils.js";

const initialFields: Record<addresAsKey, FieldState> = {
    [`{row:10,column:10}`]: {
        address: { row: 10, column: 10 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Plain,
        terrainImageNumber: 1,
        terrainImageRotation: 1,
        railwayOrientation: null,
        railwayOrientationSquareVariant: null,
        building: null,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
        production: null,
        storage: null,
    },
    // [`{row:10,column:11}`]: {
    //     address: { row: 10, column: 11 },
    //     visibility: FieldVisibility.Visible,
    //     terrain: TerrainKind.Plain,
    //     terrainImageNumber: 1,
    //     terrainImageRotation: 1,
    //     railwayOrientation: null,
    //     railwayOrientationSquareVariant: null,
    //     building: null,
    //     resources: [...TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain], ...TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain]],
    //     production: null,
    //     storage: null,
    // },
    // [`{row:10,column:12}`]: {
    //     address: { row: 10, column: 12 },
    //     visibility: FieldVisibility.Visible,
    //     terrain: TerrainKind.Plain,
    //     terrainImageNumber: 1,
    //     terrainImageRotation: 1,
    //     railwayOrientation: null,
    //     railwayOrientationSquareVariant: null,
    //     building: null,
    //     resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
    //     production: null,
    //     storage: null,
    // }
}

// const defaultSetup = {
//     fields: initialFields,
//     events: {},
//     buildings: {},
//     trains: {}
// }
const defaultSetup = {
    fields: {},
    events: {},
    buildings: {},
    trains: {}
}

export default defaultSetup