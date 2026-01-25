import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import BuildingKind from "../enums/BuildingKind.js";
import TrackUtils from "./TrackUtils.js";
import TrackKind from "../enums/TrackKind.js";

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

export function canBuildWoodFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
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

type CanBuildParams = {
    address: Address,
    buildingKind: BuildingKind,
    options?: undefined | {}
}

interface buildingUtils {
    game?: BoardModel;
    canBuild(params: CanBuildParams): boolean;
    canBuildRailwayStation(address: Address, game: BoardModel): boolean;
    canBuildRailwayGarage(address: Address, game: BoardModel): boolean;
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
    canBuild({
        address,
        buildingKind,
    }: CanBuildParams) {
        if (!this.game) {
            throw new Error('BuildingUtils: Attempt to use utils before game is set.');
        }

        switch (buildingKind) {
            // train buildings
            case BuildingKind.RailwayStation: {
                return this.canBuildRailwayStation(address, this.game);
            }
            case BuildingKind.RailwayGarage: {
                return this.canBuildRailwayGarage(address, this.game);
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
        }
    },
    canBuildRailwayStation,
    canBuildRailwayGarage,
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