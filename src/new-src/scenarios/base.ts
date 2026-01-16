import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainKind from "../enums/TerrainKind.js";
import { addresAsKey } from "../models/BoardModel.type.js";
import { FieldState } from "../models/FieldModel.type.js";
import TerrainUtils from "../utils/TerrainUtils.js";

const baseFields: Record<addresAsKey, FieldState> = {
    [`{row:1,column:1}`]: {
        _id: `{row:1,column:1}`,
        address: { row: 1, column: 1 },
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
    [`{row:0,column:1}`]: {
        _id: `{row:0,column:1}`,
        address: { row: 0, column: 1 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        railwayOrientation: null,
        railwayOrientationSquareVariant: null,
        building: null,
        resources: null,
        production: null,
        storage: null,
    },
    [`{row:2,column:1}`]: {
        _id: `{row:2,column:1}`,
        address: { row: 2, column: 1 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        railwayOrientation: null,
        railwayOrientationSquareVariant: null,
        building: null,
        resources: null,
        production: null,
        storage: null,
    },
    [`{row:1,column:2}`]: {
        _id: `{row:1,column:2}`,
        address: { row: 1, column: 2 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        railwayOrientation: null,
        railwayOrientationSquareVariant: null,
        building: null,
        resources: null,
        production: null,
        storage: null,
    },
    [`{row:1,column:0}`]: {
        _id: `{row:1,column:0}`,
        address: { row: 1, column: 0 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        railwayOrientation: null,
        railwayOrientationSquareVariant: null,
        building: null,
        resources: null,
        production: null,
        storage: null,
    }
}

export default {
    fields: baseFields,
    events: {},
    trains: {},
    buildings: {}
};