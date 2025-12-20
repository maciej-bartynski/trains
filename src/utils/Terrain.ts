import AdjacentFields from "#src/utils/AdjacentFields.js";
import TerrainKind from "#src/types/TerrainKind.js";
import Address from "#src/types/Address";
import FieldModel from "#src/models/FieldModel.js";
import ResourceKind from "#src/types/ResourceKind.js";

const isWater = (terrain: TerrainKind): boolean => {
    return terrain === TerrainKind.Water || terrain === TerrainKind.WaterCold;
}

const getDominantWatersCount = (dominantTerrains: Record<TerrainKind, number>): number => {
    return Object.entries(dominantTerrains).reduce((acc, entry) => {
        const [terrain, count] = entry as [TerrainKind, number];
        if (isWater(terrain)) {
            return acc + count;
        }
        return acc;
    }, 0);
}

const getDominantTerrains = (fields: Record<string, FieldModel | undefined>): Record<TerrainKind, number> => {

    let neighbours: TerrainKind[] = [];

    for (const dir in fields) {
        const field = fields[dir as keyof typeof fields];
        if (field && field.state.terrain !== null) {
            neighbours.push(field.state.terrain);
        }
    }

    const dominantTerrains = neighbours.reduce((acc, terrain) => {
        acc[terrain] = (acc[terrain] || 0) + 1;
        return acc;
    }, {} as Record<TerrainKind, number>);

    return dominantTerrains;
}

const getDominantTerrain = (dominantTerrains: Record<TerrainKind, number>): TerrainKind => {
    let dominantTerrain = Object.entries(dominantTerrains).reduce((result, [_terr, count]) => {
        const terrain = _terr as TerrainKind;

        if (!dominantTerrains[result]) {
            return terrain;
        }

        const resultTerrain = dominantTerrains[result] > count
            ? result
            : terrain;

        return resultTerrain;
    }, TerrainKind.Plain);

    return dominantTerrain;
}

const getTemperateTerrainProbabilites = (dominantTerrain: TerrainKind): {
    baseTerrainVariant: TerrainKind;
    secondaryTerrainVariant: TerrainKind;
    tertiaryTerrainVariant: TerrainKind;
    quaternaryTerrainVariant: TerrainKind;
} => {
    let baseTerrainVariant = TerrainKind.Plain;
    let secondaryTerrainVariant = TerrainKind.Forest;
    let tertiaryTerrainVariant = TerrainKind.Hills;
    let quaternaryTerrainVariant = TerrainKind.Swamp;

    switch (dominantTerrain) {
        case TerrainKind.Plain:
            baseTerrainVariant = TerrainKind.Plain;
            secondaryTerrainVariant = TerrainKind.Forest;
            tertiaryTerrainVariant = TerrainKind.Hills;
            quaternaryTerrainVariant = TerrainKind.Swamp;
            break;
        case TerrainKind.Forest:
            baseTerrainVariant = TerrainKind.Forest;
            secondaryTerrainVariant = TerrainKind.Plain;
            tertiaryTerrainVariant = TerrainKind.Swamp;
            quaternaryTerrainVariant = TerrainKind.Hills;
            break;
        case TerrainKind.Hills:
            baseTerrainVariant = TerrainKind.Plain;
            secondaryTerrainVariant = TerrainKind.Hills;
            tertiaryTerrainVariant = TerrainKind.Forest;
            quaternaryTerrainVariant = TerrainKind.Swamp;
            break;
        case TerrainKind.Swamp:
            baseTerrainVariant = TerrainKind.Forest;
            secondaryTerrainVariant = TerrainKind.Swamp;
            tertiaryTerrainVariant = TerrainKind.Hills;
            quaternaryTerrainVariant = TerrainKind.Plain;
            break;
        default:
            baseTerrainVariant = TerrainKind.Plain;
            secondaryTerrainVariant = TerrainKind.Forest;
            tertiaryTerrainVariant = TerrainKind.Hills;
            quaternaryTerrainVariant = TerrainKind.Swamp;
            break;
    }

    return {
        baseTerrainVariant,
        secondaryTerrainVariant,
        tertiaryTerrainVariant,
        quaternaryTerrainVariant,
    }
}

const getPolarTerrainProbabilites = (dominantTerrain: TerrainKind): {
    baseTerrainVariant: TerrainKind;
    secondaryTerrainVariant: TerrainKind;
    tertiaryTerrainVariant: TerrainKind;
    quaternaryTerrainVariant: TerrainKind;
} => {
    return {
        baseTerrainVariant: TerrainKind.Ice,
        secondaryTerrainVariant: TerrainKind.Ice,
        tertiaryTerrainVariant: TerrainKind.Ice,
        quaternaryTerrainVariant: TerrainKind.Ice,
    }
}

const getTropicalTerrainProbabilites = (dominantTerrain: TerrainKind): {
    baseTerrainVariant: TerrainKind;
    secondaryTerrainVariant: TerrainKind;
    tertiaryTerrainVariant: TerrainKind;
    quaternaryTerrainVariant: TerrainKind;
} => {
    let baseTerrainVariant = TerrainKind.Desert;
    let secondaryTerrainVariant = TerrainKind.Desert;
    let tertiaryTerrainVariant = TerrainKind.Plain;
    let quaternaryTerrainVariant = TerrainKind.Plain;

    switch (dominantTerrain) {
        case TerrainKind.Desert:
            baseTerrainVariant = TerrainKind.Desert;
            secondaryTerrainVariant = TerrainKind.Desert;
            tertiaryTerrainVariant = TerrainKind.Plain;
            quaternaryTerrainVariant = TerrainKind.Hills;
            break;
        case TerrainKind.Plain:
            baseTerrainVariant = TerrainKind.Plain;
            secondaryTerrainVariant = TerrainKind.Desert;
            tertiaryTerrainVariant = TerrainKind.Hills;
            quaternaryTerrainVariant = TerrainKind.Desert;
            break;
        case TerrainKind.Hills:
            baseTerrainVariant = TerrainKind.Hills;
            secondaryTerrainVariant = TerrainKind.Desert;
            tertiaryTerrainVariant = TerrainKind.Plain;
            quaternaryTerrainVariant = TerrainKind.Desert;
            break;
        default:
            baseTerrainVariant = TerrainKind.Desert;
            secondaryTerrainVariant = TerrainKind.Desert;
            tertiaryTerrainVariant = TerrainKind.Plain;
            quaternaryTerrainVariant = TerrainKind.Hills;
            break;
    }

    return {
        baseTerrainVariant,
        secondaryTerrainVariant,
        tertiaryTerrainVariant,
        quaternaryTerrainVariant,
    }
}

function getTerrainKind(params: {
    address: Address
}): TerrainKind {
    const { address } = params;

    const isPole = address.row < 8 || address.row > 92;
    const isTropical = address.row >= 45 && address.row <= 55;
    const isTemperate = !isPole && !isTropical;


    const adjacentFields = AdjacentFields.getAdjacentFields({ address: address });
    const diagonalFields = AdjacentFields.getDiagonalFields({ address: address });
    const dominantNeighbourTerrains = getDominantTerrains({ ...adjacentFields, ...diagonalFields });
    const adjacentWatersCount = getDominantWatersCount(getDominantTerrains({ ...adjacentFields }))
    const diagonalWatersCount = getDominantWatersCount(getDominantTerrains({ ...diagonalFields }))

    const forceWater = (adjacentWatersCount === 2 && diagonalWatersCount === 0) || (adjacentWatersCount === 0 && diagonalWatersCount === 2);
    const preferWater = (adjacentWatersCount === 1 && diagonalWatersCount === 1) || (adjacentWatersCount === 1 && diagonalWatersCount === 0);
    const avoidWater = false;

    const dominantTerrain = getDominantTerrain(dominantNeighbourTerrains);

    delete (dominantNeighbourTerrains as Partial<Record<TerrainKind, number>>)[TerrainKind.Water];
    delete (dominantNeighbourTerrains as Partial<Record<TerrainKind, number>>)[TerrainKind.WaterCold];

    if (forceWater) {
        return isPole ? TerrainKind.WaterCold : TerrainKind.Water;
    }

    const base: Record<TerrainKind, number> = {
        [TerrainKind.Plain]: 0,
        [TerrainKind.Forest]: 0,
        [TerrainKind.Hills]: 0,
        [TerrainKind.Water]: 0,
        [TerrainKind.WaterCold]: 0,
        [TerrainKind.Swamp]: 0,
        [TerrainKind.Ice]: 0,
        [TerrainKind.Desert]: 0,
    };

    const waterVariant = isPole ? TerrainKind.WaterCold : TerrainKind.Water;

    let mainProbabilityPercentage = 75;
    let secondaryProbabilityPercentage = 10;
    let tertiaryProbabilityPercentage = 7;
    let quaternaryProbabilityPercentage = 5;
    let waterProbabilityPercentage = 3;

    let baseTerrainVariant = TerrainKind.Plain;
    let secondaryTerrainVariant = TerrainKind.Forest;
    let tertiaryTerrainVariant = TerrainKind.Hills;
    let quaternaryTerrainVariant = TerrainKind.Swamp;

    if (isTemperate) {

        ({ baseTerrainVariant, secondaryTerrainVariant, tertiaryTerrainVariant, quaternaryTerrainVariant } = getTemperateTerrainProbabilites(dominantTerrain));

        const dominatesAnyNotTemperateLandTerrain = ![TerrainKind.Plain, TerrainKind.Forest, TerrainKind.Hills, TerrainKind.Swamp, TerrainKind.Water, TerrainKind.WaterCold].includes(dominantTerrain);

        if (dominatesAnyNotTemperateLandTerrain) {
            mainProbabilityPercentage = 50;
            secondaryProbabilityPercentage = 25;
            tertiaryProbabilityPercentage = 15;
            quaternaryProbabilityPercentage = 10;
            waterProbabilityPercentage = 0;

            baseTerrainVariant = TerrainKind.Plain;
            secondaryTerrainVariant = dominantTerrain;
            tertiaryTerrainVariant = dominantTerrain;
            quaternaryTerrainVariant = dominantTerrain;
        }
    }

    if (isPole) {
        ({ baseTerrainVariant, secondaryTerrainVariant, tertiaryTerrainVariant, quaternaryTerrainVariant } = getPolarTerrainProbabilites(dominantTerrain));
        const dominatesAnyNotPolarLandTerrain = ![TerrainKind.Ice, TerrainKind.Water, TerrainKind.WaterCold].includes(dominantTerrain);

        if (dominatesAnyNotPolarLandTerrain) {
            mainProbabilityPercentage = 50;
            secondaryProbabilityPercentage = 25;
            tertiaryProbabilityPercentage = 15;
            quaternaryProbabilityPercentage = 10;
            waterProbabilityPercentage = 0;

            baseTerrainVariant = TerrainKind.Ice;
            secondaryTerrainVariant = dominantTerrain;
            tertiaryTerrainVariant = dominantTerrain;
            quaternaryTerrainVariant = dominantTerrain;
        }
    }

    if (isTropical) {
        ({ baseTerrainVariant, secondaryTerrainVariant, tertiaryTerrainVariant, quaternaryTerrainVariant } = getTropicalTerrainProbabilites(dominantTerrain));

        const dominatesAnyNotTropicalLandTerrain = ![TerrainKind.Desert, TerrainKind.Plain, TerrainKind.Hills, TerrainKind.Water, TerrainKind.WaterCold].includes(dominantTerrain);
        if (dominatesAnyNotTropicalLandTerrain) {
            mainProbabilityPercentage = 50;
            secondaryProbabilityPercentage = 25;
            tertiaryProbabilityPercentage = 15;
            quaternaryProbabilityPercentage = 10;
            waterProbabilityPercentage = 0;

            baseTerrainVariant = TerrainKind.Desert;
            secondaryTerrainVariant = dominantTerrain;
            tertiaryTerrainVariant = dominantTerrain;
            quaternaryTerrainVariant = dominantTerrain;
        }
    }

    if (preferWater) {
        secondaryTerrainVariant = TerrainKind.Water;

        if (isPole) {
            secondaryTerrainVariant = TerrainKind.WaterCold;
        }

        if (isTropical) {
            secondaryTerrainVariant = TerrainKind.Water;
        }
    }

    base[baseTerrainVariant] = mainProbabilityPercentage;
    base[secondaryTerrainVariant] = base[secondaryTerrainVariant] + secondaryProbabilityPercentage;
    base[tertiaryTerrainVariant] = base[tertiaryTerrainVariant] + tertiaryProbabilityPercentage;
    base[quaternaryTerrainVariant] = base[quaternaryTerrainVariant] + quaternaryProbabilityPercentage;
    base[waterVariant] = base[waterVariant] + (avoidWater ? 0 : waterProbabilityPercentage);

    const dice: TerrainKind[] = [];

    for (let i = 0; i < Object.values(base).length; i++) {
        const terrain = Object.keys(base)[i] as TerrainKind;
        const amount = base[terrain];
        dice.push(...Array(amount).fill(terrain));
    }

    const roll = Math.floor(Math.random() * (dice.length - 1));

    return dice[roll] ?? TerrainKind.Plain;
}

const ResourcesByTerrainMap: Record<TerrainKind, ResourceKind[]> = {
    [TerrainKind.Forest]: [ResourceKind.Wood, ResourceKind.Coal],
    [TerrainKind.Plain]: [ResourceKind.Clay],
    [TerrainKind.Hills]: [ResourceKind.Iron, ResourceKind.Stone, ResourceKind.Clay],
    [TerrainKind.Desert]: [],
    [TerrainKind.Swamp]: [ResourceKind.Coal],
    [TerrainKind.Water]: [],
    [TerrainKind.WaterCold]: [],
    [TerrainKind.Ice]: [ResourceKind.Iron]
}

const Terrain = {
    getTerrainKind,
    ResourcesByTerrainMap
}

export default Terrain;