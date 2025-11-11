import ActionsMenuService from "#src/service/ActionsMenuService/ActionsMenuService.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import pointerOperations from "#src/service/PointerOperations/PointerOperations.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Direction from "#src/types/Direction.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import BuildingUtils from "#src/utils/BuildingUtils.js";
import BuildingButtonElement from "./BuildingButton.js";

class MenuBottomElement extends HTMLElement {

    static componentName = 'menu-bottom-element';
    static defaultRailwaysImageAddress = 'images/icons/build-railway.png';
    static defaultBuildingsImageAddress = 'images/icons/build-building.png';

    private ulElement: HTMLUListElement = document.createElement('ul');
    private operationElement: HTMLDivElement = document.createElement('div');
    private operationImage: HTMLImageElement = document.createElement('img');
    private titleElement: HTMLHeadingElement = document.createElement('h2');
    private wrapper: HTMLElement = document.createElement('aside');
    private kind: HTMLSpanElement = document.createElement('span');
    private directions: HTMLSpanElement = document.createElement('span');
    private orientation: HTMLSpanElement = document.createElement('span');
    private leftNode: HTMLDivElement = document.createElement('div');
    private topNode: HTMLDivElement = document.createElement('div');
    private rightNode: HTMLDivElement = document.createElement('div');
    private bottomNode: HTMLDivElement = document.createElement('div');

    private populateButtonElements(buildingKinds: BuildingKind[]) {
        const buttonElements: BuildingButtonElement[] = [];
        Object.entries(BuildingOrientationUtils.BuildingKindToOrientationImage)
            .forEach((entry) => {
                const [kind, orientationStrings] = entry as [BuildingKind, Record<string, string>];
                if (buildingKinds.includes(kind)) {
                    Object.entries(orientationStrings)
                        .forEach(([orientationString, imageUrl]) => {
                            const orientationAndAdditionalInfo = BuildingOrientationUtils.stringTRBLtoOrientation(orientationString);
                            const buttonElement = document.createElement(BuildingButtonElement.componentName) as BuildingButtonElement;

                            buttonElement.setState({
                                buildingKind: kind as BuildingKind,
                                ...orientationAndAdditionalInfo,
                            });

                            buttonElements.push(buttonElement);
                        });
                }
            });
        return buttonElements;
    }

    private buildingButtonElements: BuildingButtonElement[] = this.populateButtonElements([BuildingKind.RailwayGarage, BuildingKind.RailwayStation])

    private railwayButtonElements: BuildingButtonElement[] = this.populateButtonElements([BuildingKind.RailwayTrack]);

    connectedCallback() {
        this.innerHTML = `
            <aside class="menu-buildings">
                <div class="menu-buildings_selected-building">
                    <div class="menu-buildings_preview">
                        <img class="menu-buildings_preview-image" alt="" />
                        <div class="menu-buildings_preview-node" data-top></div>
                        <div class="menu-buildings_preview-node" data-left></div>
                        <div class="menu-buildings_preview-node" data-bottom></div>
                        <div class="menu-buildings_preview-node" data-right></div>
                    </div>
                    <span class="menu-buildings_kind">Garage</span>
                    <span class="menu-buildings_orientation">Orientation:</span>
                    <span class="menu-buildings_directions">Left, Top, Right, Bottom</span>
                </div>
                <div class="menu-buildings_all-buildings">
                    <h2>Select option</h2>
                    <ul></ul>
                </div>
            </aside>
        `;

        this.ulElement = this.querySelector('ul') as HTMLUListElement;
        this.operationElement = this.querySelector('div.menu-buildings_preview') as HTMLDivElement;
        this.operationImage = this.querySelector('img.menu-buildings_preview-image') as HTMLImageElement;
        this.titleElement = this.querySelector('h2') as HTMLHeadingElement;
        this.wrapper = this.querySelector('aside') as HTMLElement;
        this.kind = this.querySelector('.menu-buildings_kind') as HTMLSpanElement;
        this.directions = this.querySelector('.menu-buildings_directions') as HTMLSpanElement;
        this.orientation = this.querySelector('.menu-buildings_orientation') as HTMLSpanElement;
        this.topNode = this.querySelector('.menu-buildings_preview-node[data-top]') as HTMLDivElement;
        this.rightNode = this.querySelector('.menu-buildings_preview-node[data-right]') as HTMLDivElement;
        this.bottomNode = this.querySelector('.menu-buildings_preview-node[data-bottom]') as HTMLDivElement;
        this.leftNode = this.querySelector('.menu-buildings_preview-node[data-left]') as HTMLDivElement;
    }

    constructor() {
        super();
        this.onActionsMenu = this.onActionsMenu.bind(this);
        this.onSelectedBuilding = this.onSelectedBuilding.bind(this);
        actionsMenuService.subscribe(this.onActionsMenu)
    }

    private getDefaultImage() {
        let defaultImg = '';
        const currentAction = actionsMenuService.state.action?.type;
        switch (currentAction) {
            case ActionsMenuOptionName.BuildRailway: {
                defaultImg = MenuBottomElement.defaultRailwaysImageAddress;
                break;
            }

            case ActionsMenuOptionName.BuildBuilding: {
                defaultImg = MenuBottomElement.defaultBuildingsImageAddress;
                break;
            }
        }

        return defaultImg;
    }

    onActionsMenu(state: ActionsMenuService['state']) {

        const currentAction = state.action?.type;

        let selectedBuilding: null | {
            kind: BuildingKind,
            orientation: Orientation,
            orientationSquareVariant?: OrientationSquareVariant | undefined;
        } = null;

        let currentBuildings: BuildingButtonElement[] = [];

        if (currentAction === ActionsMenuOptionName.BuildBuilding) {
            this.titleElement.innerText = 'Railway buildings'
            currentBuildings = this.buildingButtonElements;
            selectedBuilding = state.action?.payload ? {
                kind: state.action.payload.kind,
                orientation: state.action.payload.orientation,
            } : null;
        }

        if (currentAction === ActionsMenuOptionName.BuildRailway) {
            this.titleElement.innerText = 'Railway track variants'
            currentBuildings = this.railwayButtonElements;
            selectedBuilding = state.action?.payload ? {
                kind: BuildingKind.RailwayTrack,
                orientation: state.action.payload.orientation,
                orientationSquareVariant: state.action.payload.orientationSquareVariant,
            } : null;
        }

        this.onSelectedBuilding(selectedBuilding)

        if (this.ulElement.getAttribute('data-variant') !== currentAction) {
            this.ulElement.setAttribute('data-variant', currentAction ?? '')
            this.ulElement.innerHTML = '';
            currentBuildings.forEach(buttonElement => {
                const liElement = document.createElement('li') as HTMLLIElement;
                this.ulElement.appendChild(liElement);
                liElement.appendChild(buttonElement);
                buttonElement.onclick = () => {
                    const currentKind = buttonElement.state.buildingKind;
                    const currentOrientation = buttonElement.state.orientation;
                    const currentOrientationVariant = buttonElement.state.orientationSquareVariant;

                    if (!currentKind || !currentOrientation) {
                        /** error */
                    } else if ([BuildingKind.RailwayGarage, BuildingKind.RailwayStation].includes(currentKind)) {
                        actionsMenuService.onBuildBuildingOption({
                            kind: currentKind,
                            orientation: currentOrientation
                        })
                    } else if ([BuildingKind.RailwayTrack].includes(currentKind)) {
                        actionsMenuService.onBuildRailwayOption({
                            orientation: currentOrientation,
                            orientationSquareVariant: currentOrientationVariant ?? undefined
                        })
                    }
                }
            });
        }

        if (currentAction === ActionsMenuOptionName.BuildBuilding || currentAction === ActionsMenuOptionName.BuildRailway) {
            this.wrapper.style.bottom = '0px';
            this.operationElement.appendChild(this.operationImage)
        } else {
            this.titleElement.innerText = 'Select option'
            this.wrapper.style.bottom = '-100%';
            this.operationImage.remove();
        }

    }

    onSelectedBuilding(selectedBuilding: {
        kind: BuildingKind,
        orientation: Orientation,
        orientationSquareVariant?: OrientationSquareVariant | undefined;
    } | null) {

        if (selectedBuilding) {
            const { kind, orientation, orientationSquareVariant } = selectedBuilding;

            const nextSrc = BuildingOrientationUtils.orientationToImage({
                kind,
                orientation,
                orientationSquareVariant: orientationSquareVariant ?? null
            });
            const currentSrc = this.operationImage.src;

            if (nextSrc !== currentSrc) {
                if (nextSrc) {
                    this.operationImage.src = nextSrc
                } else {
                    this.operationImage.src = this.getDefaultImage();
                }

                if (orientationSquareVariant === OrientationSquareVariant.Cross) {
                    this.operationElement.classList.add('--non-turnable');
                } else {
                    this.operationElement.classList.remove('--non-turnable');
                }

                this.kind.innerText = BuildingUtils.BuildingKindToDisplayName[kind];
                this.orientation.innerText = 'Orientation:'
                this.directions.innerText = BuildingOrientationUtils.orientationToDisplayString(orientation, orientationSquareVariant)
            }

            Object.entries(orientation).forEach(entry => {
                const [direction, hasRailway] = entry as [Direction, boolean];
                const directionsToElementAttributes = {
                    [Direction.Top]: this.topNode,
                    [Direction.Right]: this.rightNode,
                    [Direction.Bottom]: this.bottomNode,
                    [Direction.Left]: this.leftNode,
                }
                const currentNode = directionsToElementAttributes[direction];
                if (hasRailway) {
                    currentNode.classList.add('--active');
                } else {
                    currentNode.classList.remove('--active');
                }
            })

        } else {
            this.operationImage.src = this.getDefaultImage();
            this.kind.innerText = '';
            this.directions.innerText = '';
            this.orientation.innerText = '';
            this.operationElement.classList.remove('--non-turnable');
            this.leftNode.classList.remove('--active');
            this.rightNode.classList.remove('--active');
            this.bottomNode.classList.remove('--active');
            this.topNode.classList.remove('--active');
        }
    }
}

customElements.define(MenuBottomElement.componentName, MenuBottomElement);

export default MenuBottomElement;