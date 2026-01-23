import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainKind from "../enums/TerrainKind.js";
import { addresAsKey } from "../models/BoardModel.type.js";
import { FieldState } from "../models/FieldModel.type.js";
import TerrainUtils from "../utils/TerrainUtils.js";

const baseFields: Record<addresAsKey, FieldState> = {
    [`{row:10,column:10}`]: {
        _id: `{row:10,column:10}`,
        address: { row: 10, column: 10 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Plain,
        terrainImageNumber: 1,
        terrainImageRotation: 1,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
    },
    [`{row:9,column:10}`]: {
        _id: `{row:9,column:10}`,
        address: { row: 9, column: 10 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{row:11,column:10}`]: {
        _id: `{row:1,column:10}`,
        address: { row: 11, column: 10 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{row:10,column:11}`]: {
        _id: `{row:10,column:11}`,
        address: { row: 10, column: 11 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{row:10,column:9}`]: {
        _id: `{row:10,column:9}`,
        address: { row: 10, column: 9 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    }
}

export default {
    fields: baseFields,
    events: {},
    trains: {},
    buildings: {},
    tracks: {},
    selectedField: null,
};