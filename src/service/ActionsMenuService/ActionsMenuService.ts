import Service from "#src/framework/Service/Service.js";
import GameBoard from "#src/GameBoard.js";
import RouteEventModel from "#src/models/RouteEventModel.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import ActionsMenuOptionName, { ActionsMenuOption, BuildBuildingOption, BuildRailwayOption, TrainSetRouteOption } from "./types.js";

type ActionsMenuServiceState = {
    action: ActionsMenuOption | null
}

class ActionsMenuService extends Service<ActionsMenuServiceState> {

    private static instance: ActionsMenuService;

    static getInstance(): ActionsMenuService {
        if (!Service.gameBoard) {
            throw new Error('ActionsMenuService not registered')
        }

        if (ActionsMenuService.instance) {
            return ActionsMenuService.instance
        }

        ActionsMenuService.instance = new ActionsMenuService();
        return ActionsMenuService.instance;
    }

    state: ActionsMenuServiceState = {
        action: null
    }

    constructor() {
        super();
        this.onBuildRailwayOption = this.onBuildRailwayOption.bind(this);
        this.onBuildTrackBuildingOption = this.onBuildTrackBuildingOption.bind(this);
        this.onBuildProductionBuildingOption = this.onBuildProductionBuildingOption.bind(this);
        this.onTrainsListOption = this.onTrainsListOption.bind(this);
        this.onDestroyOption = this.onDestroyOption.bind(this);
        this.onTrainSetRoute = this.onTrainSetRoute.bind(this);
        this.onClear = this.onClear.bind(this);
    }

    onClear() {
        this.setState({
            action: null
        });
    }

    onBuildRailwayOption(params?: {
        orientation: Orientation,
        orientationSquareVariant?: OrientationSquareVariant | undefined
    }) {

        const buildRailwayAction: BuildRailwayOption = {
            type: ActionsMenuOptionName.BuildRailway,
            payload: params
        }

        this.setState({
            action: buildRailwayAction
        })
    }

    onBuildProductionBuildingOption(params?: {
        kind: BuildingKind,
        orientation: Orientation
    }) {

        const buildBuildingAction: BuildBuildingOption = {
            type: ActionsMenuOptionName.BuildBuilding,
            payload: params
        }

        this.setState({
            action: buildBuildingAction
        })
    }

    onBuildTrackBuildingOption(params?: {
        kind: BuildingKind,
        orientation: Orientation
    }) {

        const buildBuildingAction: BuildBuildingOption = {
            type: ActionsMenuOptionName.BuildBuilding,
            payload: params
        }

        this.setState({
            action: buildBuildingAction
        })
    }

    onBuildTrainOption() {
        this.setState({
            action: {
                type: ActionsMenuOptionName.BuildTrain,
            }
        })
    }

    onTrainGarageOption(params: {
        address: Address
    }) {
        this.setState({
            action: {
                type: ActionsMenuOptionName.BuildTrain,
                payload: {
                    address: params.address
                }
            }
        })
    }

    onTrainsListOption() {
        this.setState({
            action: {
                type: ActionsMenuOptionName.TrainsList
            }
        })
    }

    onTrainSetRoute(params: { trainId: string, route?: RouteEventModel[] }) {
        let nextRoutes: undefined | Array<RouteEventModel[]> = undefined;
        const currentState = this.state.action;

        if (params.route && this.isTrainSetRoute(currentState)) {
            nextRoutes = [...(currentState?.payload?.routes ?? []), params.route];
        }

        const train = GameBoard.getInstance().getTrain(params.trainId);
        if (train && params.route) {
            train.addRoute({ route: params.route })
        }
        this.setState({
            action: {
                type: ActionsMenuOptionName.TrainSetRoute,
                payload: {
                    trainId: params.trainId,
                }
            }
        });
    }

    onDestroyOption() {
        this.setState({
            action: {
                type: ActionsMenuOptionName.Destroy
            }
        })
    }

    /** helpers */
    isTrainSetRoute(action: ActionsMenuOption | null): action is TrainSetRouteOption {
        if (!action) return false;
        return action.type === ActionsMenuOptionName.TrainSetRoute;
    }
}

export default ActionsMenuService;
