import BuildingKind from "#src/types/BuildingKind.js";

const BuildingKindToDisplayName: Record<BuildingKind, string> = {
    [BuildingKind.RailwayGarage]: 'Train garage',
    [BuildingKind.RailwayStation]: 'Train station',
    [BuildingKind.RailwayTrack]: 'Rails'
}

const BuildingUtils = {
    BuildingKindToDisplayName
}

export default BuildingUtils