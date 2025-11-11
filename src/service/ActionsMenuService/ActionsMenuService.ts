import BuildingKind from "#src/types/BuildingKind.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import ActionsMenuOptionName, { ActionsMenuOption, BuildBuildingOption, BuildRailwayOption } from "./types.js";

class ActionsMenuService {

    state: {
        action: ActionsMenuOption | null
    } = {
            action: null
        }

    listeners: ((param: ActionsMenuService['state']) => void)[] = [];

    private setState(newState: Partial<ActionsMenuService['state']>) {
        this.state = {
            ...this.state,
            ...newState,
        };

        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach((listener) => listener(this.state));
    }

    constructor() {
        this.notifyListeners = this.notifyListeners.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.onBuildRailwayOption = this.onBuildRailwayOption.bind(this);
        this.onBuildBuildingOption = this.onBuildBuildingOption.bind(this);
        this.onTrainsListOption = this.onTrainsListOption.bind(this);
        this.onDestroyOption = this.onDestroyOption.bind(this);
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

    onBuildBuildingOption(params?: {
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

    onTrainsListOption() {
        this.setState({
            action: {
                type: ActionsMenuOptionName.TrainsList
            }
        })
    }

    onDestroyOption() {
        this.setState({
            action: {
                type: ActionsMenuOptionName.Destroy
            }
        })
    }

    public subscribe(listener: (param: ActionsMenuService['state']) => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
            listener(this.state);
        }
    }

    public unsubscribe(listener: (param: ActionsMenuService['state']) => void) {
        this.listeners = this.listeners.filter(l => l !== listener)
    }
}

export default ActionsMenuService;
