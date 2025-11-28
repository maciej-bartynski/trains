import GameBoard from "#src/GameBoard.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import Pathfinder from "#src/utils/Pathfinder.js";

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
        const state = actionsMenuService.state
        if (state.action?.type === ActionsMenuOptionName.TrainSetRoute && this.address) {
            const setRouteAction = state.action.payload;
            const currentTrain = GameBoard.getInstance().getTrain(setRouteAction.trainId);
            const currentField = GameBoard.getInstance().getField(this.address);
            if (!currentTrain || !currentField) {
                return;
            }
            const lastRoute = (setRouteAction.routes && setRouteAction.routes.length)
                ? setRouteAction.routes[setRouteAction.routes.length - 1]
                : null;
            const lastDesination = lastRoute
                ? lastRoute[lastRoute.length - 1]
                : null;
            const location = lastDesination
                ? lastDesination.address
                : currentTrain.location;
            const routeParams = {
                location,
                destination: currentField.address,
            }
            const route = Pathfinder.performAStarRouteSearching(routeParams);
            if (!route) return;
            actionsMenuService.onTrainSetRoute({
                trainId: currentTrain.id,
                route
            })
        }
    }

    private onActionMenu() {
        const state = actionsMenuService.state

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
            if (AddressUtils.isAddressEqual(currentTrain.location, this.address)) {
                this.classList.remove('--can-go');
                this.removeEventListener('click', this.onSelectDestination)
                return;
            }
            const isRouteEnd = currentField.building && currentField.building === BuildingKind.RailwayTrack && Object.values(currentField.railwayOrientation).filter(item => !!item).length === 1;
            if (currentField.building && [BuildingKind.RailwayGarage, BuildingKind.RailwayStation].includes(currentField.building)) {
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

        if (!src || !field) {
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
        }

        this.operationImgElement.src = src;
        this.classList.remove('--can-build', '--cannot-build');
        this.classList.add(canBuild ? '--can-build' : '--cannot-build');
    }

    connectedCallback() {

        const field = this.address ? GameBoard.getInstance().getField(this.address) : null;
        if (field) {
            field.subscribe(this.onActionMenu);
        }
        actionsMenuService.subscribe(this.onActionMenu);

        this.addEventListener('mouseenter', this.onHover);
        this.addEventListener('mouseleave', this.onLeave);
    }

    disconnectedCallback() {
        this.removeEventListener('mouseenter', this.onHover);
        this.removeEventListener('mouseleave', this.onLeave);
    }
}

// customElements.define(OperationIndicatorElement.componentName, OperationIndicatorElement);

export default OperationIndicatorElement;