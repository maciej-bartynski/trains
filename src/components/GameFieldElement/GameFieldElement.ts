import Config from "#src/config.js";
import gameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuOptionName, { BuildBuildingOption, BuildRailwayOption } from "#src/service/ActionsMenuService/types.js";
import pointerOperations from "#src/service/PointerOperations/PointerOperations.js";
import OperationType from "#src/service/PointerOperations/types.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ConstructionState from "#src/types/ConstructionState.js";
import Direction from "#src/types/Direction.js";
import FieldVisibility from "#src/types/FieldVisibility.js";
import { OrientationHorizontal, OrientationSquare, OrientationVertical } from "#src/types/Orientation.js";
import TerrainKind from "#src/types/TerrainKind.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import AdjacentFields from "#src/utils/AdjacentFields.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import TrainRunElement from "../TrainRun/TrainRun.js";
import BuildOperationIndicatorElement from "./BuildOperationIndicator.js";
import ConstructionProgressElement from "./ConstructionProgress.js";

class GameFieldElement extends HTMLElement {

    static componentName = 'game-field-element';

    private address: Address | null = null;

    private operationIndicatorElement: BuildOperationIndicatorElement = document.createElement(BuildOperationIndicatorElement.componentName) as BuildOperationIndicatorElement;

    private constructionProgressElement: ConstructionProgressElement = document.createElement(ConstructionProgressElement.componentName) as ConstructionProgressElement;

    private backgroundElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;

    private presentationVariant = false;

    private topEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private bottomEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private leftEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private rightEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private trainAnimationElement: TrainRunElement = document.createElement(TrainRunElement.componentName) as TrainRunElement;

    private buildingElement: HTMLImageElement = (() => {
        const element = document.createElement('img') as HTMLImageElement;
        element.classList.add('building-image');
        return element;
    })()

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.onClick = this.onClick.bind(this);
        this.addEventListener('click', this.onClick);
        this.renderConstructionSite = this.renderConstructionSite.bind(this);
        this.renderBuilding = this.renderBuilding.bind(this);
        this.renderOperationIndicator = this.renderOperationIndicator.bind(this);
        this.renderEdges = this.renderEdges.bind(this);
        this.renderBackground = this.renderBackground.bind(this);
        this.subscribeAdjacnetFields = this.subscribeAdjacnetFields.bind(this);
        this.appendTrainAnimation = this.appendTrainAnimation.bind(this);
        this.removeTrainAnimation = this.removeTrainAnimation.bind(this);
    }

    public appendTrainAnimation(params: { from: Direction | null, to: Direction | null, trainId: string }) {
        const train = gameBoard.trains[params.trainId];
        const color = train?.randomColor ?? 'purple';

        const prevAnimation = document.querySelector(`[data-train="${params.trainId}"]`);
        prevAnimation?.remove();

        const trainAnimation = document.createElement(TrainRunElement.componentName) as TrainRunElement;
        trainAnimation.setRoute(params);
        trainAnimation.setAttribute('data-train', params.trainId)
        trainAnimation.setColor(color);
        this.appendChild(trainAnimation);
    }

    public removeTrainAnimation(params: { trainId: string }) {
        const trainAnimation = this.querySelector(`[data-train="${params.trainId}"`);
        trainAnimation?.remove();
    }

    public setPresentationVariant(variant: boolean) {
        this.presentationVariant = variant;
        this.render();
    }

    public setAddress(address: Address) {
        this.address = address;
        this.render();
    }

    onClick() {
        const address = this.address;
        const field = address ? gameBoard.getField(address) : null;

        if (field?.visibility === FieldVisibility.Ready && address) {
            gameBoard.uncoverField(address);
        } else if ((field?.visibility === FieldVisibility.Visible) && address) {

            const buildOperations: (ActionsMenuOptionName | undefined)[] = [
                ActionsMenuOptionName.BuildBuilding,
                ActionsMenuOptionName.BuildRailway
            ]

            if (buildOperations.includes(actionsMenuService.state.action?.type)) {

                let { kind } = (actionsMenuService.state.action as any)?.payload ?? { kind: null };

                if (actionsMenuService.state.action?.type === ActionsMenuOptionName.BuildRailway) {
                    kind = BuildingKind.RailwayTrack
                }

                switch (kind) {
                    case BuildingKind.RailwayTrack: {
                        const action = actionsMenuService.state.action as BuildRailwayOption;
                        if (!action.payload) {
                            return;
                        }
                        field.buildRailway({
                            orientation: action.payload.orientation,
                            orientationSquareVariant: action.payload.orientationSquareVariant ?? null,
                        });
                        break;
                    }
                    case BuildingKind.RailwayStation: {
                        const action = actionsMenuService.state.action as BuildBuildingOption;
                        if (!action.payload) {
                            return;
                        }
                        field.buildRailwayStation({
                            orientation: action.payload.orientation as OrientationVertical | OrientationHorizontal | OrientationSquare,
                        });
                        break;
                    }
                    case BuildingKind.RailwayGarage: {
                        const action = actionsMenuService.state.action as BuildBuildingOption;
                        const payload = action?.payload;
                        if (!payload) {
                            return;
                        }
                        const direction = Object.keys(payload.orientation).find(key => payload.orientation[key as keyof typeof payload.orientation]) as Direction;
                        field.buildRailwayGarage({
                            direction
                        });
                        break;
                    }
                }
            } else if (!pointerOperations.operation && field.building === BuildingKind.RailwayGarage) {
                /**
                 * TODO: Implement the logic to build a train
                 */

                pointerOperations.onSetOperation({
                    type: OperationType.SelectCell,
                    payload: {
                        address: field.address
                    }
                });
            }
        }
    }

    renderConstructionSite(field: FieldModel) {
        if (this.presentationVariant) {
            this.constructionProgressElement.remove();
            return;
        }
        switch (field.constructionSite?.state) {
            case ConstructionState.Awaiting:
                this.appendChild(this.constructionProgressElement);
                break;
            case ConstructionState.Started:
                break;
            case ConstructionState.InProgress:
                this.constructionProgressElement.setProgress(Math.floor(field.constructionSite.progressPercentage ?? 0));
                break;
            case ConstructionState.Completed:
                this.constructionProgressElement.remove();
                break;
        }
    }

    renderBuilding(field: FieldModel) {
        if (
            field.constructionSite?.state === ConstructionState.Completed &&
            field.building
        ) {
            this.constructionProgressElement.remove();
            const src = BuildingOrientationUtils.orientationToImage({
                kind: field.building,
                orientation: field.railwayOrientation,
                orientationSquareVariant: field.railwayOrientationSquareVariant
            }) ?? "";

            if (this.buildingElement.src === src) {
                return;
            }
            this.buildingElement.src = src;
            this.appendChild(this.buildingElement);
        } else {
            this.buildingElement.remove();
        }
    }

    renderOperationIndicator(field: FieldModel) {
        if (this.presentationVariant) {
            this.operationIndicatorElement.remove();
            return;
        }
        if (field.visibility === FieldVisibility.Visible && this.address) {
            this.appendChild(this.operationIndicatorElement);
            this.operationIndicatorElement.setAddress(this.address);
        } else {
            this.operationIndicatorElement.remove();
        }
    }

    renderEdges(field: FieldModel) {

        const iceEdges = shouldRenderAdjacentTerrainEdge(field);

        Object.entries(iceEdges).forEach(([dir, edge]) => {
            const direction = dir as Direction;

            const elementsMap = {
                [Direction.Top]: this.topEdgeElement,
                [Direction.Bottom]: this.bottomEdgeElement,
                [Direction.Left]: this.leftEdgeElement,
                [Direction.Right]: this.rightEdgeElement,
            }

            const element = elementsMap[direction];

            if (edge && !element.classList.contains(`edge-${direction}`)) {
                this.appendChild(element);
                element.style.backgroundImage = `url('images/terrain/${terrainKindToEdgeImage(edge)}-edge.png')`;
                element.style.backgroundSize = 'contain';
                element.style.backgroundRepeat = 'no-repeat';
                element.style.backgroundPosition = 'center';
                element.classList.add(`edge-${direction}`);
                element.style.zIndex = '1';
                element.style.position = 'absolute';
            }

        });
    }

    private renderBackground(field: FieldModel) {
        this.backgroundElement.style.backgroundImage = `url('images/terrain/${field.terrain}-${field.terrainImageNumber}.png')`;
        this.backgroundElement.style.transform = `rotate(${field.terrainImageRotation * 90}deg)`;
        this.appendChild(this.backgroundElement);
        this.backgroundElement.style.width = '100%';
        this.backgroundElement.style.height = '100%';
        this.backgroundElement.style.backgroundSize = 'contain';
        this.backgroundElement.style.backgroundRepeat = 'no-repeat';
        this.backgroundElement.style.backgroundPosition = 'center';
        this.backgroundElement.style.zIndex = '0';
        this.backgroundElement.style.position = 'absolute';
        this.backgroundElement.style.top = '0';
        this.backgroundElement.style.left = '0';
    }

    render() {
        const address = this.address;
        const field = address ? gameBoard.getField(address) : null;
        if (!field || !address) {
            this.innerHTML = 'Error';
            return;
        }

        this.style.left = `${address.column * Config.cellSizePx}px`;
        this.style.top = `${address.row * Config.cellSizePx}px`;
        this.style.width = `${Config.cellSizePx}px`;
        this.style.height = `${Config.cellSizePx}px`;
        this.classList.add(`--${field.visibility}`);

        if (field) {
            this.renderBackground(field);
            this.renderBuilding(field);
            this.renderConstructionSite(field);
            this.renderOperationIndicator(field);
            this.renderEdges(field);
        }
    }

    subscribeAdjacnetFields() {
        const field = this.address ? gameBoard.getField(this.address) : null;
        if (!field) {
            return;
        }
        const adjacentFields = AdjacentFields.getAdjacentFields({ address: field.address });
        adjacentFields.top?.subscribe(this.render);
        adjacentFields.bottom?.subscribe(this.render);
        adjacentFields.left?.subscribe(this.render);
        adjacentFields.right?.subscribe(this.render);
    }

    connectedCallback() {
        const address = this.address;
        const field = address ? gameBoard.getField(address) : null;
        if (field) {
            field.subscribe(this.render);
            gameBoard.subscribe(this.subscribeAdjacnetFields);
        }
    }

    disconnectedCallback() {
        const address = this.address;
        const field = address ? gameBoard.getField(address) : null;
        if (field) {
            field.unsubscribe(this.render);
        }
    }

    static selectFieldByAddress(address: Address) {
        return document.querySelector(`[data-key="${AddressUtils.toKey(address)}"]`)
    }
}

customElements.define(GameFieldElement.componentName, GameFieldElement);

export default GameFieldElement;

const shouldRenderAdjacentTerrainEdge = (field: FieldModel) => {

    const terrainsThatCoverEdges: TerrainKind[] = [];

    switch (field.terrain) {
        case null:
        case TerrainKind.Desert:
        case TerrainKind.Ice:
            break;
        case TerrainKind.Plain:
        case TerrainKind.Hills:
        case TerrainKind.Forest:
        case TerrainKind.Swamp:
            terrainsThatCoverEdges.push(TerrainKind.Ice, TerrainKind.Desert);
            break;
        case TerrainKind.Water:
        case TerrainKind.WaterCold:
            terrainsThatCoverEdges.push(TerrainKind.Ice, TerrainKind.Desert, TerrainKind.Plain, TerrainKind.Hills, TerrainKind.Forest, TerrainKind.Swamp);
            break;
    }

    const adjacentFields = AdjacentFields.getAdjacentFields({ address: field.address });

    const adjacentTerrainEdges = {
        [Direction.Top]: (adjacentFields.top?.terrain && terrainsThatCoverEdges.includes(adjacentFields.top?.terrain))
            ? adjacentFields.top.terrain : null,
        [Direction.Bottom]: (adjacentFields.bottom?.terrain && terrainsThatCoverEdges.includes(adjacentFields.bottom?.terrain))
            ? adjacentFields.bottom.terrain : null,
        [Direction.Left]: (adjacentFields.left?.terrain && terrainsThatCoverEdges.includes(adjacentFields.left?.terrain))
            ? adjacentFields.left.terrain : null,
        [Direction.Right]: (adjacentFields.right?.terrain && terrainsThatCoverEdges.includes(adjacentFields.right?.terrain))
            ? adjacentFields.right.terrain : null,
    }

    return adjacentTerrainEdges
}

const terrainKindToEdgeImage = (terrain: TerrainKind): string => {
    switch (terrain) {
        case TerrainKind.Ice:
            return 'ice';
        case TerrainKind.Desert:
            return 'desert';
        case TerrainKind.Plain:
        case TerrainKind.Hills:
        case TerrainKind.Forest:
        case TerrainKind.Swamp:
            return 'plain';
    }

    return 'plain';
}