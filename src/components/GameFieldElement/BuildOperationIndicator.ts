import gameBoard from "#src/GameBoard.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuService from "#src/service/ActionsMenuService/ActionsMenuService.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";

class BuildOperationIndicatorElement extends HTMLElement {
    static componentName = 'build-operation-indicator-element';

    private operationImgElement: HTMLImageElement = document.createElement('img') as HTMLImageElement;

    private address: Address | null = null;

    private applyOperation = false;

    constructor() {
        super();
        this.onHover = this.onHover.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.onPointerOperation = this.onPointerOperation.bind(this);
        actionsMenuService.subscribe(this.onPointerOperation);
    }

    public setAddress(address: Address) {
        this.address = address;
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

    private onPointerOperation(state: ActionsMenuService['state'] | null) {

        const currentActionType = state?.action?.type;
        const buildActions = [ActionsMenuOptionName.BuildBuilding, ActionsMenuOptionName.BuildRailway]

        const isBuildAction = currentActionType ? buildActions.includes(currentActionType) : false;

        if (!isBuildAction) {
            this.applyOperation = false;
            this.operationImgElement.remove();
            this.classList.remove('--can-build', '--cannot-build');
            this.operationImgElement.src = '';
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
        const field = this.address ? gameBoard.getField(this.address) : null;

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
        this.addEventListener('mouseenter', this.onHover);
        this.addEventListener('mouseleave', this.onLeave);
    }

    disconnectedCallback() {
        this.removeEventListener('mouseenter', this.onHover);
        this.removeEventListener('mouseleave', this.onLeave);
    }
}

customElements.define(BuildOperationIndicatorElement.componentName, BuildOperationIndicatorElement);

export default BuildOperationIndicatorElement;