import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainKind from "../enums/TerrainKind.js";
import { addresAsKey } from "../models/BoardModel.type.js";
import { FieldState } from "../models/FieldModel.type.js";
import TerrainUtils from "../utils/TerrainUtils.js";

const baseFields: Record<addresAsKey, FieldState> = {
    [`{"row":10,"column":10}`]: {
        _id: `{"row":10,"column":10}`,
        address: { row: 10, column: 10 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Plain,
        terrainImageNumber: 1,
        terrainImageRotation: 1,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
    },
    [`{"row":9,"column":10}`]: {
        _id: `{"row":9,"column":10}`,
        address: { row: 9, column: 10 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{"row":11,"column":10}`]: {
        _id: `{"row":11,"column":10}`,
        address: { row: 11, column: 10 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{"row":10,"column":11}`]: {
        _id: `{"row":10,"column":11}`,
        address: { row: 10, column: 11 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    },
    [`{"row":10,"column":9}`]: {
        _id: `{"row":10,"column":9}`,
        address: { row: 10, column: 9 },
        visibility: FieldVisibility.Ready,
        terrain: null,
        terrainImageNumber: null,
        terrainImageRotation: null,
        resources: null,
    }
}

function validateSeed() {
    Object.entries(baseFields).forEach(entry => {
        const [key, data] = entry;
        const dataFromId = JSON.parse(data._id);
        const dataFromKey = JSON.parse(key);
        const allColsEquall = (dataFromId.column === dataFromKey.column) && (dataFromId.column === data.address.column);
        const allRowsEquall = (dataFromId.row === dataFromKey.row) && (dataFromId.row === data.address.row);
        if (!allColsEquall || !allRowsEquall) {
            throw new Error(`Seed invalid for key ${key}, _id: ${data._id} and address: C:${data.address.column}, R: ${data.address.row}`)
        }
    })
}

validateSeed();

export default {
    fields: baseFields,
    events: {},
    trains: {},
    buildings: {},
    tracks: {},
    selectedField: null,
};