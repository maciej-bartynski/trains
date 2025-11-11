import BuildingKind from "#src/types/BuildingKind"
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js"

enum ActionsMenuOptionName {
    BuildRailway = 'build-railway',
    BuildBuilding = 'build-building',
    BuildTrain = 'build-train',
    TrainsList = 'trains-list',
    Destroy = 'destroy'
}

type BuildRailwayOption = {
    type: ActionsMenuOptionName.BuildRailway,
    payload?: {
        orientation: Orientation,
        orientationSquareVariant?: OrientationSquareVariant | undefined,
    } | undefined
}

type BuildBuildingOption = {
    type: ActionsMenuOptionName.BuildBuilding,
    payload?: {
        kind: BuildingKind,
        orientation: Orientation,
    } | undefined
}

type BuildTrainOption = {
    type: ActionsMenuOptionName.BuildTrain,
}

type TrainsListOption = {
    type: ActionsMenuOptionName.TrainsList,
}

type DestroyOption = {
    type: ActionsMenuOptionName.Destroy,
}

type ActionsMenuOption = BuildBuildingOption | BuildRailwayOption | TrainsListOption | DestroyOption | BuildTrainOption

export default ActionsMenuOptionName;

export type {
    BuildRailwayOption,
    BuildBuildingOption,
    TrainsListOption,
    DestroyOption,
    ActionsMenuOption
}