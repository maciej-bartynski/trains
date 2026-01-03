import GameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import Pathfinder from "#src/utils/Pathfinder.js";
import RouteEventModel from "#src/models/RouteEventModel.js";

class OperationIndicatorElement extends HTMLElement {
    static componentName = 'operation-indicator-element';

    private operationImgElement: HTMLImageElement = document.createElement('img') as HTMLImageElement;

    private address: Address | null = null;

    private applyOperation = false;

    constructor() {
        super();
        this.onHover = this.onHover.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.onActionMenu = this.onActionMenu.bind(this);
        this.setAddress = this.setAddress.bind(this);
        this.onSelectDestination = this.onSelectDestination.bind(this);
    }

    public setAddress(address: Address) {
        this.address = address;
        this.onActionMenu();
    }

    private onHover() {
        if (!this.applyOperation) {
            return;
        }
        this.appendChild(this.operationImgElement);
    }

    private onLeave() {
        if (!this.applyOperation) {
            return;
        }
        this.operationImgElement.remove();
    }

    private async onSelectDestination() {
        const state = GameBoard.ServicesRegistry.actionsMenu.state;
        if (state.action?.type === ActionsMenuOptionName.TrainSetRoute && this.address) {
            const setRouteAction = state.action.payload;
            const currentTrain = GameBoard.getInstance().getTrain(setRouteAction.trainId);
            const currentField = GameBoard.getInstance().getField(this.address);
            if (!currentTrain || !currentField) {
                return;
            }
            // const lastRoute = currentTrain.state.journey[currentTrain.state.journey.length - 1] ?? null;
            const lastRoute = currentTrain.state.originalJurney[currentTrain.state.originalJurney.length - 1] ?? null;
            const lastDesination = lastRoute
                ? lastRoute[lastRoute.length - 1]
                : null;
            const location = lastDesination
                ? lastDesination.state.address
                : currentTrain.state.location;
            const routeParams = {
                location,
                destination: currentField.state.address,
            }

            const _route = Pathfinder.performAStarRouteSearching(routeParams);
            if (!_route) return;
            const route = _route.map((routeState, idx) => RouteEventModel.fromJSON({
                ...routeState,
                trainId: currentTrain.state.id,
                order: idx,
                state: 'before',
            }))
            GameBoard.ServicesRegistry.actionsMenu.onTrainSetRoute({
                trainId: currentTrain.state.id,
                route
            })
        }
    }

    private onActionMenu() {
        const state = GameBoard.ServicesRegistry.actionsMenu.state

        const currentActionType = state?.action?.type;
        const buildActions = [ActionsMenuOptionName.BuildBuilding, ActionsMenuOptionName.BuildRailway];

        if (state.action?.type === ActionsMenuOptionName.TrainSetRoute && this.address) {
            const setRouteAction = state.action.payload;
            const currentTrain = GameBoard.getInstance().getTrain(setRouteAction.trainId);
            const currentField = GameBoard.getInstance().getField(this.address);
            if (!currentTrain || !currentField) {
                this.classList.remove('--can-go');
                this.removeEventListener('click', this.onSelectDestination)
                return;
            }
            if (AddressUtils.isAddressEqual(currentTrain.state.location, this.address)) {
                this.classList.remove('--can-go');
                this.removeEventListener('click', this.onSelectDestination)
                return;
            }
            const isRouteEnd = currentField.state.building && currentField.state.building === BuildingKind.RailwayTrack && Object.values(currentField.state.railwayOrientation).filter(item => !!item).length === 1;
            if (currentField.state.building && [BuildingKind.RailwayGarage, BuildingKind.RailwayStation, BuildingKind.Timber].includes(currentField.state.building)) {
                this.classList.add('--can-go');
                this.addEventListener('click', this.onSelectDestination)

            } else if (isRouteEnd) {
                this.classList.add('--can-go');
                this.addEventListener('click', this.onSelectDestination)
            } else {
                this.classList.remove('--can-go');
                this.removeEventListener('click', this.onSelectDestination)
            }

            return;
        } else {
            this.classList.remove('--can-go');
            this.removeEventListener('click', this.onSelectDestination)
        }

        const isBuildAction = currentActionType ? buildActions.includes(currentActionType) : false;

        if (!isBuildAction) {
            this.applyOperation = false;
            this.operationImgElement.remove();
            this.classList.remove('--can-build', '--cannot-build');
            this.operationImgElement.removeAttribute('src');
            return;
        }

        const actionData = state?.action;

        let kind: BuildingKind | undefined;
        let orientation: Orientation | undefined;
        let orientationSquareVariant: OrientationSquareVariant | null = null;

        if (actionData?.type === ActionsMenuOptionName.BuildBuilding) {
            kind = actionData.payload?.kind;
            orientation = actionData.payload?.orientation;
            if ([BuildingKind.Timber].includes(kind as BuildingKind)) {
                const _field = this.address ? GameBoard.getInstance().getField(this.address) : null;
                orientation = _field?.state.railwayOrientation;
            }
        }

        if (actionData?.type === ActionsMenuOptionName.BuildRailway) {
            kind = BuildingKind.RailwayTrack;
            orientationSquareVariant = actionData.payload?.orientationSquareVariant ?? null;
            orientation = actionData.payload?.orientation;
        }

        if (!kind || !orientation) {
            return;
        }

        this.applyOperation = true;

        const src = BuildingOrientationUtils.orientationToImage({ kind, orientation, orientationSquareVariant });
        const field = this.address ? GameBoard.getInstance().getField(this.address) : null;

        if (!field) {
            return;
        }

        if (!src && ![BuildingKind.Timber].includes(kind)) {
            return;
        }

        let canBuild = true;
        switch (kind) {
            case BuildingKind.RailwayTrack:
                canBuild = field.canBuildRailway(orientation, orientationSquareVariant);
                break;
            case BuildingKind.RailwayStation:
                canBuild = field.canBuildRailwayStation(orientation);
                break;
            case BuildingKind.RailwayGarage:
                canBuild = field.canBuildRailwayGarage(orientation);
                break;
            case BuildingKind.Timber:
                canBuild = field.canBuildProductionBuilding(BuildingKind.Timber);
                break;
        }

        if (src && canBuild) {
            this.operationImgElement.style.visibility = 'visible'
            this.operationImgElement.src = src;
        } else {
            this.operationImgElement.style.visibility = 'hidden'
        }
        this.classList.remove('--can-build', '--cannot-build');
        this.classList.add(canBuild ? '--can-build' : '--cannot-build');
    }

    connectedCallback() {

        const field = this.address ? GameBoard.getInstance().getField(this.address) : null;
        if (field) {
            field.subscribe(this.onActionMenu);
        }
        GameBoard.ServicesRegistry.actionsMenu.subscribe(this.onActionMenu);

        this.addEventListener('mouseenter', this.onHover);
        this.addEventListener('mouseleave', this.onLeave);
    }

    disconnectedCallback() {
        this.removeEventListener('mouseenter', this.onHover);
        this.removeEventListener('mouseleave', this.onLeave);
    }
}

export default OperationIndicatorElement;