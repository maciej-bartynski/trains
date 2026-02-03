import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import BuildingKind from "../enums/BuildingKind.js";
import TrackUtils from "./TrackUtils.js";
import TrackKind from "../enums/TrackKind.js";
import AdjacentFields from "./AdjacentFields.js";
import Orientation, { TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import Direction from "../enums/Direction.js";
import { FieldState } from "../models/FieldModel.type.js";
import AddressUtils from "./AddressUtils.js";

export function canBuildRailwayStation(address: Address, game: BoardModel) {
    const {
        field,
        buildings,
        tracks
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    if (
        TrackUtils.isTrackCenter(TrackKind.Railway, address, game) ||
        TrackUtils.isTrackStraight(TrackKind.Railway, address, game) ||
        TrackUtils.isTrackCross(TrackKind.Railway, address, game)
    ) {
        return true;
    }

    return false;
}

export function canBuildRailwayGarage(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    if (TrackUtils.isTrackCenter(TrackKind.Railway, address, game)) {
        return true;
    }

    return false;
}

export function canBuildRailwayTerminus(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    return TrackUtils.isTrackCenter(TrackKind.Railway, address, game);
}

export function canBuildRoadGarage(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    return TrackUtils.isTrackCenter(TrackKind.Road, address, game);
}

export function canBuildRoadWarehouse(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    return TrackUtils.isTrackCenter(TrackKind.Road, address, game);
}

const isSailStraight = (orientation: Orientation | null): 'horizontal' | 'vertical' | null => {
    if (!orientation || orientation.center) {
        return null;
    }

    const edges = new Set<string>();
    Object.entries(orientation).forEach(entry => {
        const [fromNode, connections] = entry as [TrackNode, TrackNodeConnections | null];
        if (fromNode === 'center' || !connections) return;
        Object.entries(connections).forEach(conn => {
            const [toNode, isConnected] = conn as [TrackNode, boolean];
            if (!isConnected || toNode === 'center') return;
            edges.add([fromNode, toNode].sort().join('|'));
        });
    });

    const hasVertical = edges.has([Direction.Top, Direction.Bottom].sort().join('|'));
    const hasHorizontal = edges.has([Direction.Left, Direction.Right].sort().join('|'));
    if (hasVertical === hasHorizontal) {
        return null;
    }
    if (edges.size !== 1) {
        return null;
    }
    return hasHorizontal ? 'horizontal' : 'vertical';
};

export function canBuildCargoPort(address: Address, game: BoardModel, side: 'top' | 'bottom' | 'left' | 'right') {
    const {
        field,
        buildings,
        tracks
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(field?.state.terrain)) {
        return false;
    }

    const sailOrientation = tracks?.state.orientations[TrackKind.Sail] ?? null;
    const straight = isSailStraight(sailOrientation);
    if (!straight) return false;

    if (straight === 'horizontal') {
        return side === 'top' || side === 'bottom';
    }
    return side === 'left' || side === 'right';
}

export function canBuildHarbour(address: Address, game: BoardModel, options: {
    seaAddress: Address
}): boolean {

    const { seaAddress } = options;

    const {
        field: landField,
        buildings: landBuildings,
        tracks: landTracks
    } = game.getStateByAddress(address) ?? {};

    if ([TerrainKind.Water, TerrainKind.WaterCold, undefined, null].includes(landField?.state.terrain)) {
        return false;
    }
    if (landBuildings) {
        return false;
    }
    const orientations = landTracks?.state.orientations;
    if (!orientations || orientations[TrackKind.Road]) return false;
    const railwayOrientation = orientations[TrackKind.Railway];
    if (!railwayOrientation) return false;

    if (
        !(TrackUtils.isTrackCenter(TrackKind.Railway, address, game) ||
            TrackUtils.isTrackStraight(TrackKind.Railway, address, game))
    ) {
        return false;
    }

    const adjacentFields = AdjacentFields.getAdjacentFields({ address });
    const seaFieldAndDirectionFound = Object.entries(adjacentFields).find(entry => {
        const [, possiblySeaField] = entry as [Direction, FieldState | undefined];
        const isSeaWithCorrectAddress = possiblySeaField?.address
            ? AddressUtils.isAddressEqual(possiblySeaField.address, seaAddress) && possiblySeaField.terrain && [TerrainKind.Water, TerrainKind.WaterCold].includes(possiblySeaField.terrain)
            : false

        if (isSeaWithCorrectAddress) {
            const isEmpty = !(game.getStateByAddress(seaAddress)?.buildings);
            return isEmpty;
        }

        return false
    });

    if (!seaFieldAndDirectionFound) return false;
    const [seaDirection, seaFieldFound] = seaFieldAndDirectionFound as [Direction, FieldState | undefined];
    if (!seaFieldFound) return false;

    const tracksToSea = railwayOrientation[seaDirection];
    const isSeaDirectionFreeOfTrack = !tracksToSea || Object.values(tracksToSea).filter(conn => conn).length === 0;
    return isSeaDirectionFreeOfTrack;
}

export function canBuildWoodFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings,
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (field?.state.terrain !== TerrainKind.Forest) {
        return false;
    }

    return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
}

export function canBuildStoneFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (field?.state.terrain !== TerrainKind.Hills) {
        return false;
    }

    return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
}

export function canBuildClayFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (field?.state.terrain !== TerrainKind.Hills) {
        return false;
    }

    return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
}

export function canBuildCoalFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (field?.state.terrain !== TerrainKind.Swamp) {
        return false;
    }

    return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
}

export function canBuildIronFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (field?.state.terrain !== TerrainKind.Hills) {
        return false;
    }

    return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
}

export function canBuildBuildingMaterialsFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Plain, TerrainKind.Desert, TerrainKind.Ice].includes(field.state.terrain)) {
        return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
    }

    return false
}

export function canBuildSteelFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Plain, TerrainKind.Desert].includes(field.state.terrain)) {
        return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
    }

    return false;
}

export function canBuildFuelFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }


    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Ice, TerrainKind.Desert].includes(field.state.terrain)) {
        return TrackUtils.isTrackStraight(TrackKind.Railway, address, game);
    }

    return false
}

export type CanBuildParams = ({
    address: Address,
    buildingKind: Exclude<BuildingKind, BuildingKind.Harbour>,
    options?: undefined
} | {
    address: Address,
    buildingKind: BuildingKind.Harbour,
    options: { seaAddress: Address }
})

interface buildingUtils {
    game?: BoardModel;
    canBuild(params: CanBuildParams): boolean;
    canBuildRailwayStation(address: Address, game: BoardModel): boolean;
    canBuildRailwayGarage(address: Address, game: BoardModel): boolean;
    canBuildRailwayTerminus(address: Address, game: BoardModel): boolean;
    canBuildRoadGarage(address: Address, game: BoardModel): boolean;
    canBuildRoadWarehouse(address: Address, game: BoardModel): boolean;
    canBuildCargoPort(address: Address, game: BoardModel, side: 'top' | 'bottom' | 'left' | 'right'): boolean;
    canBuildHarbour(address: Address, game: BoardModel, options: { seaAddress: Address }): boolean;
    canBuildWoodFactory(address: Address, game: BoardModel): boolean;
    canBuildIronFactory(address: Address, game: BoardModel): boolean;
    canBuildCoalFactory(address: Address, game: BoardModel): boolean;
    canBuildStoneFactory(address: Address, game: BoardModel): boolean;
    canBuildClayFactory(address: Address, game: BoardModel): boolean;
    canBuildBuildingMaterialsFactory(address: Address, game: BoardModel): boolean;
    canBuildFuelFactory(address: Address, game: BoardModel): boolean;
    canBuildSteelFactory(address: Address, game: BoardModel): boolean;
}

const BuildingUtils: buildingUtils = {
    canBuild(params: CanBuildParams) {
        if (!this.game) {
            throw new Error('BuildingUtils: Attempt to use utils before game is set.');
        }

        const {
            address,
            buildingKind,
            options
        } = params;

        switch (buildingKind) {
            // train buildings
            case BuildingKind.RailwayStation: {
                return this.canBuildRailwayStation(address, this.game);
            }
            case BuildingKind.RailwayGarage: {
                return this.canBuildRailwayGarage(address, this.game);
            }
            case BuildingKind.RailwayTerminus: {
                return this.canBuildRailwayTerminus(address, this.game);
            }

            // ship buildings
            case BuildingKind.Harbour: {
                return this.canBuildHarbour(address, this.game, options)
            }
            case BuildingKind.CargoPortTop: {
                return this.canBuildCargoPort(address, this.game, 'top');
            }
            case BuildingKind.CargoPortBottom: {
                return this.canBuildCargoPort(address, this.game, 'bottom');
            }
            case BuildingKind.CargoPortLeft: {
                return this.canBuildCargoPort(address, this.game, 'left');
            }
            case BuildingKind.CargoPortRight: {
                return this.canBuildCargoPort(address, this.game, 'right');
            }

            // road buildings
            case BuildingKind.RoadGarage: {
                return this.canBuildRoadGarage(address, this.game);
            }
            case BuildingKind.RoadWarehouse: {
                return this.canBuildRoadWarehouse(address, this.game);
            }

            // raw materials buildings
            case BuildingKind.WoodFactory: {
                return this.canBuildWoodFactory(address, this.game);
            }
            case BuildingKind.ClayFactory: {
                return this.canBuildClayFactory(address, this.game);
            }
            case BuildingKind.CoalFactory: {
                return this.canBuildCoalFactory(address, this.game);
            }
            case BuildingKind.IronFactory: {
                return this.canBuildIronFactory(address, this.game);
            }
            case BuildingKind.StoneFactory: {
                return this.canBuildStoneFactory(address, this.game);
            }

            //advanced materials factory
            case BuildingKind.BuildingMaterialsFactory: {
                return this.canBuildBuildingMaterialsFactory(address, this.game);
            }
            case BuildingKind.FuelFactory: {
                return this.canBuildFuelFactory(address, this.game);
            }
            case BuildingKind.SteelFactory: {
                return this.canBuildSteelFactory(address, this.game);
            }
            default: {
                return false;
            }
        }
    },
    canBuildRailwayStation,
    canBuildRailwayGarage,
    canBuildRailwayTerminus,
    canBuildRoadGarage,
    canBuildRoadWarehouse,
    canBuildCargoPort,
    canBuildHarbour,
    canBuildWoodFactory,
    canBuildIronFactory,
    canBuildCoalFactory,
    canBuildStoneFactory,
    canBuildClayFactory,
    canBuildBuildingMaterialsFactory,
    canBuildFuelFactory,
    canBuildSteelFactory
}

export default BuildingUtils;