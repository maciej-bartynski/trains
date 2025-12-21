import RouteEventModel from "#src/models/RouteEventModel"
import Address from "#src/types/Address"
import BuildingKind from "#src/types/BuildingKind"
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js"
import TrainRouteEvent from "#src/types/TrainTrespassingEvent"

enum ActionsMenuOptionName {
    BuildRailway = 'build-railway',
    BuildBuilding = 'build-building',
    BuildTrain = 'build-train',
    TrainsList = 'trains-list',
    TrainSetRoute = 'train-set-route',
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
    payload?: {
        address: Address;
    }
}

type TrainsListOption = {
    type: ActionsMenuOptionName.TrainsList,
}

type DestroyOption = {
    type: ActionsMenuOptionName.Destroy,
}

type TrainSetRouteOption = {
    type: ActionsMenuOptionName.TrainSetRoute,
    payload: {
        trainId: string,
        routes?: Array<RouteEventModel[]> | undefined
    }
}

type ActionsMenuOption = BuildBuildingOption | BuildRailwayOption | TrainsListOption | DestroyOption | BuildTrainOption | TrainSetRouteOption

export default ActionsMenuOptionName;

export type {
    BuildRailwayOption,
    BuildBuildingOption,
    TrainsListOption,
    DestroyOption,
    ActionsMenuOption,
    TrainSetRouteOption
}