import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainKind from "../enums/TerrainKind.js";
import { addresAsKey } from "../models/BoardModel.type.js";
import { BuildingState } from "../models/BuildingModel.type.js";
import { FieldState } from "../models/FieldModel.type.js";
import { TrackState } from "../models/TrackModel.type.js";
import Address from "../types/Address.js";
import AdjacentFields from "../utils/AdjacentFields.js";
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
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Plain,
        terrainImageNumber: 2,
        terrainImageRotation: 2,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
    },
    [`{"row":11,"column":10}`]: {
        _id: `{"row":11,"column":10}`,
        address: { row: 11, column: 10 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Forest,
        terrainImageNumber: 4,
        terrainImageRotation: 2,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Forest],
    },
    [`{"row":11,"column":9}`]: {
        _id: `{"row":11,"column":9}`,
        address: { row: 11, column: 9 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Water,
        terrainImageNumber: 4,
        terrainImageRotation: 2,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Water],
    },
    [`{"row":11,"column":11}`]: {
        _id: `{"row":11,"column":11}`,
        address: { row: 11, column: 11 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Plain,
        terrainImageNumber: 4,
        terrainImageRotation: 2,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Plain],
    },
    [`{"row":10,"column":11}`]: {
        _id: `{"row":10,"column":11}`,
        address: { row: 10, column: 11 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Forest,
        terrainImageNumber: 2,
        terrainImageRotation: 2,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Forest],
    },
    [`{"row":10,"column":9}`]: {
        _id: `{"row":10,"column":9}`,
        address: { row: 10, column: 9 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Hills,
        terrainImageNumber: 1,
        terrainImageRotation: 1,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Hills],
    },
    [`{"row":12,"column":10}`]: {
        _id: `{"row":12,"column":10}`,
        address: { row: 12, column: 10 },
        visibility: FieldVisibility.Visible,
        terrain: TerrainKind.Water,
        terrainImageNumber: 1,
        terrainImageRotation: 1,
        resources: TerrainUtils.ResourcesByTerrainMap[TerrainKind.Water],
    },
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

function populateReady() {
    Object.values(baseFields).forEach(field => {
        const { address } = field;
        const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address });

        Object.entries(adjacentAddresses).forEach(addrEntry => {
            const [dir, addr] = addrEntry as [Direction, Address];
            const fieldExist = baseFields[`{"row":${addr.row},"column":${addr.column}}`]
            if (!fieldExist) {
                baseFields[`{"row":${addr.row},"column":${addr.column}}`] = {
                    _id: `{"row":${addr.row},"column":${addr.column}}`,
                    address: { row: addr.row, column: addr.column },
                    visibility: FieldVisibility.Ready,
                    terrain: null,
                    terrainImageNumber: null,
                    terrainImageRotation: null,
                    resources: null,
                }
            }
        })
    })
}

validateSeed();

populateReady();

const baseBuildings: Record<addresAsKey, BuildingState> = {
    [`{"row":10,"column":10}`]: {
        _id: `{"row":10,"column":10}`,
        address: { row: 10, column: 10 },
        kind: BuildingKind.CentralWarehouse,
        production: null,
        storage: null,
    },
}

const baseTracks: Record<addresAsKey, TrackState> = {
    [`{"row":10,"column":10}`]: {
        _id: `{"row":10,"column":10}`,
        address: { row: 10, column: 10 },
        orientations: {
            road: null,
            sail: null,
            fly: null,
            railway: {
                "center": {
                    top: true,
                    bottom: true,
                    left: true,
                    right: true,
                },
                top: {
                    center: true,
                    bottom: false,
                    left: false,
                    right: false,
                },
                bottom: {
                    center: true,
                    top: false,
                    left: false,
                    right: false,
                },
                left: {
                    center: true,
                    top: false,
                    bottom: false,
                    right: false,
                },
                right: {
                    center: true,
                    top: false,
                    bottom: false,
                    left: false,
                },
            }
        }
    },
}

export default {
    fields: baseFields,
    events: {},
    trains: {},
    buildings: baseBuildings,
    tracks: baseTracks,
    selectedField: null,
};