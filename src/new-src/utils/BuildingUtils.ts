import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import BuildingKind from "../enums/BuildingKind.js";

export async function canBuildRailwayStation(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildRailwayGarage(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildWoodFactory(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildStoneFactory(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildClayFactory(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildCoalFactory(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildIronFactory(address: Address, game: BoardModel) {
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

    return true;
}

export async function canBuildBuildingMaterialsFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Plain, TerrainKind.Desert, TerrainKind.Ice].includes(field.state.terrain)) {
        return true;
    }

    return false;
}

export async function canBuildSteelFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }

    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Plain, TerrainKind.Desert].includes(field.state.terrain)) {
        return true;
    }

    return false;
}

export async function canBuildFuelFactory(address: Address, game: BoardModel) {
    const {
        field,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (buildings) {
        return false;
    }


    if (!field || !field.state.terrain) return false;

    if ([TerrainKind.Ice, TerrainKind.Desert].includes(field.state.terrain)) {
        return true;
    }

    return false;
}

type CanBuildParams = {
    address: Address,
    buildingKind: BuildingKind,
    options?: undefined | {}
}

interface buildingUtils {
    game?: BoardModel;
    canBuild(params: CanBuildParams): Promise<boolean>;
    canBuildRailwayStation(address: Address, game: BoardModel): Promise<boolean>;
    canBuildRailwayGarage(address: Address, game: BoardModel): Promise<boolean>;
    canBuildWoodFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildIronFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildCoalFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildStoneFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildClayFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildBuildingMaterialsFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildFuelFactory(address: Address, game: BoardModel): Promise<boolean>;
    canBuildSteelFactory(address: Address, game: BoardModel): Promise<boolean>;
}

const BuildingUtils: buildingUtils = {
    async canBuild({
        address,
        buildingKind,
    }: CanBuildParams) {
        if (!this.game) return false;
        await this.game.configured;

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