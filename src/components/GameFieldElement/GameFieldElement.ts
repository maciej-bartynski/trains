import Config from "#src/config.js";
import GameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import ActionsMenuOptionName, { BuildBuildingOption, BuildRailwayOption } from "#src/service/ActionsMenuService/types.js";
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
import OperationIndicatorElement from "./OperationIndicatorElement.js";
import ConstructionProgressElement from "./ConstructionProgressElement.js";
import FloatersService from "#src/service/FloatersService/FloatersService.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import FieldMenuElement from "../FieldMenuElement/FieldMenuElement.js";

class GameFieldElement extends HTMLElement {

    static componentName = 'game-field-element';

    private address: Address | null = null;
    private presentationVariant = false;

    private operationIndicatorElement: OperationIndicatorElement = document.createElement(OperationIndicatorElement.componentName) as OperationIndicatorElement;
    private constructionProgressElement: ConstructionProgressElement = document.createElement(ConstructionProgressElement.componentName) as ConstructionProgressElement;
    private layerTerrainBgElement = document.createElement('div') as HTMLDivElement;
    private layerTerrainEdgesElement = document.createElement('div') as HTMLDivElement;
    private layerTrackElement = document.createElement('div') as HTMLDivElement;
    private layerRouteAnimationElement = document.createElement('div') as HTMLDivElement;
    private layerBuildingElement = document.createElement('div') as HTMLDivElement;
    private layerOperationIndicatorElement = document.createElement('div') as HTMLDivElement;
    private layerTerrainItemsElement = document.createElement('div') as HTMLDivElement;

    private topEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private bottomEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private leftEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private rightEdgeElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;

    private topLightElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private bottomLightElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private leftLightElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;
    private rightLightElement: HTMLDivElement = document.createElement('div') as HTMLDivElement;

    private buildingElement: HTMLImageElement = (() => {
        const element = document.createElement('img') as HTMLImageElement;
        element.classList.add('building-image');
        return element;
    })()

    private trackElement: HTMLImageElement = (() => {
        const element = document.createElement('img') as HTMLImageElement;
        element.classList.add('track-image');
        return element;
    })()

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.onClick = this.onClick.bind(this);
        this.addEventListener('click', this.onClick);
        this.renderConstructionSite = this.renderConstructionSite.bind(this);
        this.renderTrackOrBuilding = this.renderTrackOrBuilding.bind(this);
        this.renderOperationIndicator = this.renderOperationIndicator.bind(this);
        this.renderEdges = this.renderEdges.bind(this);
        this.renderBackground = this.renderBackground.bind(this);
        this.subscribeAdjacnetFields = this.subscribeAdjacnetFields.bind(this);
        this.appenTrainElement = this.appenTrainElement.bind(this);
        this.subscribeTrafficLights = this.subscribeTrafficLights.bind(this);
    }

    public appenTrainElement(trainElement: TrainRunElement) {
        const trainId = trainElement.getAttribute('data-train');
        const contains = this.layerRouteAnimationElement.contains(trainElement);
        if (trainId && !contains) {
            this.layerRouteAnimationElement.appendChild(trainElement);
        }
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
        const field = address ? GameBoard.getInstance().getField(address) : null;

        const skippedActions = [ActionsMenuOptionName.BuildTrain, ActionsMenuOptionName.TrainSetRoute, ActionsMenuOptionName.TrainsList]

        if (skippedActions.includes(GameBoard.ServicesRegistry.actionsMenu.state.action?.type as any)) {
            return;
        }

        if (field?.state.visibility === FieldVisibility.Ready && address) {
            GameBoard.getInstance().uncoverField(address);
            FloatersService.getInstance().onNewAddressUncovered(address);
        } else if ((field?.state.visibility === FieldVisibility.Visible) && address) {

            const buildOperations: (ActionsMenuOptionName | undefined)[] = [
                ActionsMenuOptionName.BuildBuilding,
                ActionsMenuOptionName.BuildRailway
            ]

            if (buildOperations.includes(GameBoard.ServicesRegistry.actionsMenu.state.action?.type)) {

                let { kind } = (GameBoard.ServicesRegistry.actionsMenu.state.action as any)?.payload ?? { kind: null };

                if (GameBoard.ServicesRegistry.actionsMenu.state.action?.type === ActionsMenuOptionName.BuildRailway) {
                    kind = BuildingKind.RailwayTrack
                }

                switch (kind) {
                    case BuildingKind.RailwayTrack: {
                        const action = GameBoard.ServicesRegistry.actionsMenu.state.action as BuildRailwayOption;
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
                        const action = GameBoard.ServicesRegistry.actionsMenu.state.action as BuildBuildingOption;
                        if (!action.payload) {
                            return;
                        }
                        field.buildRailwayStation({
                            orientation: action.payload.orientation as OrientationVertical | OrientationHorizontal | OrientationSquare,
                        });
                        break;
                    }
                    case BuildingKind.RailwayGarage: {
                        const action = GameBoard.ServicesRegistry.actionsMenu.state.action as BuildBuildingOption;
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
                    case BuildingKind.Timber: {
                        const action = GameBoard.ServicesRegistry.actionsMenu.state.action as BuildBuildingOption;
                        const payload = action?.payload;
                        if (!payload) {
                            return;
                        }
                        field.buildTimber();
                        break;
                    }
                }
            } else if (field.state.building === BuildingKind.RailwayGarage) {
                GameBoard.ServicesRegistry.actionsMenu.onTrainGarageOption({ address: field.state.address });
            } else {
                const fieldMenu = FieldMenuElement.selectFieldMenu();
                fieldMenu.onOpenMenu({ fieldAddress: address })
            }
        }
    }

    renderConstructionSite(field: FieldModel) {
        if (this.presentationVariant) {
            this.constructionProgressElement.remove();
            return;
        }
        switch (field.state.constructionSite?.state) {
            case ConstructionState.Awaiting:
                this.appendChild(this.constructionProgressElement);
                break;
            case ConstructionState.Started:
                break;
            case ConstructionState.InProgress:
                this.constructionProgressElement.setProgress(Math.floor(field.state.constructionSite.progressPercentage ?? 0));
                break;
            case ConstructionState.Completed: {
                this.constructionProgressElement.remove();
                break;
            }
        }
    }

    renderOperationIndicator(field: FieldModel) {
        if (this.presentationVariant) {
            this.operationIndicatorElement.remove();
            return;
        }
        if (field.state.visibility === FieldVisibility.Visible && this.address) {
            this.layerOperationIndicatorElement.appendChild(this.operationIndicatorElement);
            this.operationIndicatorElement.setAddress(this.address);
        } else {
            this.operationIndicatorElement.remove();
        }
    }

    private renderTrackOrBuilding(field: FieldModel) {
        if (field.state.constructionSite?.state === ConstructionState.Completed && field.state.building) {
            const isTrackConstructed = field.state.building;
            const isBuildingConstructed = field.state.building && field.state.building !== BuildingKind.RailwayTrack;

            const nextBuildingImageSrc = BuildingOrientationUtils.orientationToImage({
                kind: field.state.building,
                orientation: field.state.railwayOrientation,
                orientationSquareVariant: field.state.railwayOrientationSquareVariant
            }) ?? "";

            const nextTrackImageSrc = BuildingOrientationUtils.orientationToImage({
                kind: BuildingKind.RailwayTrack,
                orientation: field.state.railwayOrientation,
                orientationSquareVariant: field.state.railwayOrientationSquareVariant
            }) ?? "";

            const buildingAlreadyRendered = this.buildingElement.src.includes(nextBuildingImageSrc) && (
                this.buildingElement.isConnected
            )

            const trackAlreadyRendered = this.trackElement.src.includes(nextTrackImageSrc) && (
                this.trackElement.isConnected
            )

            if (isTrackConstructed && !trackAlreadyRendered) {
                this.constructionProgressElement.remove();
                this.trackElement.src = nextTrackImageSrc;
                this.layerTrackElement.appendChild(this.trackElement);

            }

            if (isBuildingConstructed && !buildingAlreadyRendered) {
                this.constructionProgressElement.remove();
                this.buildingElement.src = nextBuildingImageSrc;
                this.layerBuildingElement.appendChild(this.buildingElement);
            }
        }
    }

    private renderEdges(field: FieldModel) {
        const edgeLayer = this.layerTerrainEdgesElement;
        const edges = shouldRenderAdjacentTerrainEdge(field);



        const elementsMap = {
            [Direction.Top]: this.topEdgeElement,
            [Direction.Bottom]: this.bottomEdgeElement,
            [Direction.Left]: this.leftEdgeElement,
            [Direction.Right]: this.rightEdgeElement,
        }

        Object.entries(edges).forEach(([dir, edge]) => {
            const direction = dir as Direction;
            const element = elementsMap[direction];
            if (edge && !element.isConnected) {
                edgeLayer.appendChild(element);
                element.style.backgroundImage = `url('images/terrain/${terrainKindToEdgeImage(edge)}-edge.png')`;
                element.style.backgroundSize = 'contain';
                element.style.backgroundRepeat = 'no-repeat';
                element.style.backgroundPosition = 'center';
                element.classList.add(`edge-${direction}`);
                element.style.position = 'absolute';
            }
        });
    }

    private renderBackground(field: FieldModel) {
        const bgLayer = this.layerTerrainBgElement;
        const backgroundRendered = bgLayer.hasChildNodes()
        if (!backgroundRendered && field.state.terrain && field.state.terrainImageNumber) {
            const bgImg = document.createElement('img');
            bgImg.src = `images/terrain/${field.state.terrain}-${field.state.terrainImageNumber}.png`;
            bgImg.style.transform = `rotate(${field.state.terrainImageRotation * 90}deg)`;
            bgImg.style.width = '100%';
            bgImg.style.height = '100%';
            bgImg.style.objectFit = 'contain';
            bgImg.style.objectPosition = 'center';
            bgLayer.appendChild(bgImg);
        }
    }

    render() {

        const address = this.address;
        const field = address ? GameBoard.getInstance().getField(address) : null;

        if (!field || !address) {
            this.innerHTML = 'Error';
            return;
        }

        this.style.left = `${(address.column * Config.cellSizePx) + FloatersService.getInstance().state.left}px`;
        this.style.top = `${(address.row * Config.cellSizePx) + FloatersService.getInstance().state.top}px`;
        this.style.width = `${Config.cellSizePx}px`;
        this.style.height = `${Config.cellSizePx}px`;
        this.classList.add(`--${field.state.visibility}`);

        if (this.presentationVariant) {
            this.style.position = 'relative';
            this.style.left = 'unset';
            this.style.top = 'unset';
        }

        if (field) {
            this.renderBackground(field);
            this.renderEdges(field);
            this.renderTrackOrBuilding(field);
            this.renderConstructionSite(field);
            this.renderOperationIndicator(field);
            this.subscribeTrafficLights(field)
        }
    }

    subscribeTrafficLights(field: FieldModel) {
        const lightsMap = {
            [Direction.Bottom]: this.bottomLightElement,
            [Direction.Top]: this.topLightElement,
            [Direction.Left]: this.leftLightElement,
            [Direction.Right]: this.rightLightElement
        }

        const directionsAmount = Object.values(field.state.railwayOrientation).filter((hasRailway) => hasRailway).length;

        if (directionsAmount <= 2) {
            Object.values(lightsMap).forEach(light => {
                light.style.display = 'none'
            });
            return;
        }

        Object.entries(field.state.railwayOrientation).forEach((entry, _, self) => {
            const [key, hasRailway] = entry;
            const direction = key as Direction;
            if (!hasRailway) {
                lightsMap[direction].style.display = 'none';
                delete lightsMap[direction];
            } else {
                lightsMap[direction].style.display = 'none';
                lightsMap[direction].classList.remove('--go')
                lightsMap[direction].classList.remove('--stop')
            }
        })

        field.state.events.forEach(event => {
            if (event.state.light === TrainTrespassingLight.Green) {
                Object.values(lightsMap).forEach((light) => {
                    light.style.display = 'block';
                    light.classList.remove('--go')
                    light.classList.add('--stop')
                })
                if (event.state.from) {
                    const light = lightsMap[event.state.from];
                    light.style.display = 'block';
                    light.classList.add('--go')
                    light.classList.remove('--stop');
                }
            }
        })
    }

    subscribeAdjacnetFields() {
        const field = this.address ? GameBoard.getInstance().getField(this.address) : null;
        if (!field) {
            return;
        }
        const adjacentFields = AdjacentFields.getAdjacentFields({ address: field.state.address });
        adjacentFields.top?.subscribe(this.render);
        adjacentFields.bottom?.subscribe(this.render);
        adjacentFields.left?.subscribe(this.render);
        adjacentFields.right?.subscribe(this.render);
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="GameFieldElement_layer" data-selector="terrain-background"></div>
            <div class="GameFieldElement_layer" data-selector="terrain-edges"></div>
            <div class="GameFieldElement_layer" data-selector="track"></div>
            <div class="GameFieldElement_layer" data-selector="route-animation"></div>
            <div class="GameFieldElement_layer" data-selector="building"></div>
            <div class="GameFieldElement_layer" data-selector="terrain-items">
                <traffic-light data-direction="top"></traffic-light>
                <traffic-light data-direction="bottom"></traffic-light>
                <traffic-light data-direction="left"></traffic-light>
                <traffic-light data-direction="right"></traffic-light>
            </div>
            <div class="GameFieldElement_layer" data-selector="operation-indicator"></div>
        `

        this.layerTerrainBgElement = this.querySelector('[data-selector="terrain-background"]') as HTMLDivElement;
        this.layerTerrainEdgesElement = this.querySelector('[data-selector="terrain-edges"]') as HTMLDivElement;
        this.layerTrackElement = this.querySelector('[data-selector="track"]') as HTMLDivElement;
        this.layerRouteAnimationElement = this.querySelector('[data-selector="route-animation"]') as HTMLDivElement;
        this.layerBuildingElement = this.querySelector('[data-selector="building"]') as HTMLDivElement;
        this.layerOperationIndicatorElement = this.querySelector('[data-selector="operation-indicator"]') as HTMLDivElement;
        this.layerTerrainItemsElement = this.querySelector('[data-selector="terrain-items"]') as HTMLDivElement;

        this.topLightElement = this.querySelector('traffic-light[data-direction="top"]') as HTMLDivElement;
        this.bottomLightElement = this.querySelector('traffic-light[data-direction="bottom"]') as HTMLDivElement;
        this.leftLightElement = this.querySelector('traffic-light[data-direction="left"]') as HTMLDivElement;
        this.rightLightElement = this.querySelector('traffic-light[data-direction="right"]') as HTMLDivElement;

        const address = this.address;
        const field = address ? GameBoard.getInstance().getField(address) : null;
        if (field) {
            field.subscribe(this.render);
            GameBoard.getInstance().subscribe(this.subscribeAdjacnetFields);
            FloatersService.getInstance().subscribe(this.render)
        }
    }

    disconnectedCallback() {
        const address = this.address;
        const field = address ? GameBoard.getInstance().getField(address) : null;
        if (field) {
            field.unsubscribe(this.render);
            GameBoard.getInstance().unsubscribe(this.subscribeAdjacnetFields);
            FloatersService.getInstance().unsubscribe(this.render);
            const adjacentFields = AdjacentFields.getAdjacentFields({ address: field.state.address });
            adjacentFields.top?.unsubscribe(this.render);
            adjacentFields.bottom?.unsubscribe(this.render);
            adjacentFields.left?.unsubscribe(this.render);
            adjacentFields.right?.unsubscribe(this.render);
        }
    }

    static selectFieldByAddress(address: Address): GameFieldElement | null {
        return document.querySelector(`[data-key="${AddressUtils.toKey(address)}"]`)
    }

    static renderPreviewDuplicate(address: Address) {
        const stringAddress = AddressUtils.toKey(address);
        const gameField = document.querySelector(`[data-key="${stringAddress}"]`) as GameFieldElement;

        if (gameField) {
            const preview = document.createElement(GameFieldElement.componentName) as GameFieldElement;
            preview.setAddress(address);
            preview.setPresentationVariant(true);
            return preview;
        }

        return null;
    }
}

export default GameFieldElement;

const shouldRenderAdjacentTerrainEdge = (field: FieldModel) => {

    const terrainsThatCoverEdges: TerrainKind[] = [];

    switch (field.state.terrain) {
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

    const adjacentFields = AdjacentFields.getAdjacentFields({ address: field.state.address });

    const adjacentTerrainEdges = {
        [Direction.Top]: (adjacentFields.top?.state.terrain && terrainsThatCoverEdges.includes(adjacentFields.top?.state.terrain))
            ? adjacentFields.top.state.terrain : null,
        [Direction.Bottom]: (adjacentFields.bottom?.state.terrain && terrainsThatCoverEdges.includes(adjacentFields.bottom?.state.terrain))
            ? adjacentFields.bottom.state.terrain : null,
        [Direction.Left]: (adjacentFields.left?.state.terrain && terrainsThatCoverEdges.includes(adjacentFields.left?.state.terrain))
            ? adjacentFields.left.state.terrain : null,
        [Direction.Right]: (adjacentFields.right?.state.terrain && terrainsThatCoverEdges.includes(adjacentFields.right?.state.terrain))
            ? adjacentFields.right.state.terrain : null,
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