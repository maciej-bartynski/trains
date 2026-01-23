import TerrainKind from "../enums/TerrainKind.js";

function getTerrainColor(terrainKind: TerrainKind |
    null
): string {
    let terrainColor = 'gray';

    switch (terrainKind) {
        case TerrainKind.Forest: {
            terrainColor = 'forestgreen';
            break;
        }
        case TerrainKind.Hills: {
            terrainColor = 'darkgreen';
            break;
        }
        case TerrainKind.Plain: {
            terrainColor = 'greenyellow';
            break;
        }
        case TerrainKind.Swamp: {
            terrainColor = 'olive';
            break;
        }
        case TerrainKind.Desert: {
            terrainColor = 'sandybrown';
            break;
        }
        case TerrainKind.Ice: {
            terrainColor = 'skyblue';
            break;
        }
        case TerrainKind.Water: {
            terrainColor = 'blue';
            break;
        }
        case TerrainKind.WaterCold: {
            terrainColor = 'cornflowerblue';
            break;
        }
        default: {
            terrainColor = 'gray'
        }
    }

    return terrainColor;
}

const FieldElementHelpers = {
    getTerrainColor,
}

export default FieldElementHelpers;