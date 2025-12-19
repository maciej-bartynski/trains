import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import ActionsMenuService from "#src/service/ActionsMenuService/ActionsMenuService.js";
import ActionsMenuOptionName, { ActionsMenuOption, BuildBuildingOption } from "#src/service/ActionsMenuService/types.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Direction from "#src/types/Direction.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";
import BuildingUtils from "#src/utils/BuildingUtils.js";
import BuildingButtonElement from "./BuildingButton.js";

type Category = 'Railway track variants' | 'Railway buildings' | 'Production buildings';

const RAILWAY_TRACK_CATEGORY: Category = 'Railway track variants';
const RAILWAY_BUILDINGS_CATEGORY: Category = 'Railway buildings';
const PRODUCTION_BUILDINGS_CATEGORY: Category = 'Production buildings';

type S = {
    category: Category
}

type P = {
    currentAction: ActionsMenuOption | null
}

class MenuBottomElement extends StatefullComponent<S, P> {

    static componentName = 'menu-bottom-element';
    static defaultRailwaysImageAddress = 'images/icons/build-railway.png';
    static defaultBuildingsImageAddress = 'images/icons/build-building.png';

    private ulElement: HTMLUListElement = document.createElement('ul');
    private operationElement: HTMLDivElement = document.createElement('div');
    private operationImage: HTMLImageElement = document.createElement('img');
    private titleElement: HTMLHeadingElement = document.createElement('h2');
    private closeButton: HTMLButtonElement = document.createElement('button');
    private kind: HTMLSpanElement = document.createElement('span');
    private directions: HTMLSpanElement = document.createElement('span');
    private orientation: HTMLSpanElement = document.createElement('span');
    private leftNode: HTMLDivElement = document.createElement('div');
    private topNode: HTMLDivElement = document.createElement('div');
    private rightNode: HTMLDivElement = document.createElement('div');
    private bottomNode: HTMLDivElement = document.createElement('div');
    private railwayBuildingsCategoryButton: HTMLButtonElement = document.createElement('button');
    private railwayCategoryButton: HTMLButtonElement = document.createElement('button');
    private productionBuildingsCategoryButton: HTMLButtonElement = document.createElement('button');

    private populateButtonElements(buildingKinds: BuildingKind[]) {
        const buttonElements: BuildingButtonElement[] = [];
        const kindsSeen: BuildingKind[] = [];
        const kindsNotToBeDoubled: BuildingKind[] = [BuildingKind.Timber];
        Object.entries(BuildingOrientationUtils.BuildingKindToOrientationImage)
            .forEach((entry) => {
                const [kind, orientationStrings] = entry as [BuildingKind, Record<string, string>];
                if (buildingKinds.includes(kind)) {
                    Object.entries(orientationStrings)
                        .forEach(([orientationString, imageUrl]) => {
                            if (kindsSeen.includes(kind) && kindsNotToBeDoubled.includes(kind)) {
                                return;
                            }
                            const orientationAndAdditionalInfo = BuildingOrientationUtils.stringTRBLtoOrientation(orientationString);
                            const buttonElement = document.createElement(BuildingButtonElement.componentName) as BuildingButtonElement;

                            buttonElement.setState({
                                buildingKind: kind as BuildingKind,
                                ...orientationAndAdditionalInfo,
                            });

                            buttonElements.push(buttonElement);

                            kindsSeen.push(kind);
                        });
                }
            });
        return buttonElements;
    }

    private trackBuildingButtonElements: BuildingButtonElement[] = this.populateButtonElements([BuildingKind.RailwayGarage, BuildingKind.RailwayStation])
    private productionBuildingButtonElements: BuildingButtonElement[] = this.populateButtonElements([BuildingKind.Timber])
    private railwayButtonElements: BuildingButtonElement[] = this.populateButtonElements([BuildingKind.RailwayTrack]);

    connectedCallback() {
        this.innerHTML = `
            <aside class="menu-buildings">
                <button class="close-button box-secondary"></button>
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
                    <div class="menu-buildings_categories">
                        <button class="box-secondary" data-category="${RAILWAY_TRACK_CATEGORY}">Tracks</button>
                        <button class="box-secondary" data-category="${RAILWAY_BUILDINGS_CATEGORY}">Trains</button>
                        <button class="box-secondary" data-category="${PRODUCTION_BUILDINGS_CATEGORY}">Production</button>
                    </div>
                    <ul></ul>
                </div>
            </aside>
        `;

        this.ulElement = this.querySelector('ul') as HTMLUListElement;
        this.operationElement = this.querySelector('div.menu-buildings_preview') as HTMLDivElement;
        this.operationImage = this.querySelector('img.menu-buildings_preview-image') as HTMLImageElement;
        this.titleElement = this.querySelector('h2') as HTMLHeadingElement;
        this.closeButton = this.querySelector('button.close-button') as HTMLButtonElement;
        this.kind = this.querySelector('.menu-buildings_kind') as HTMLSpanElement;
        this.directions = this.querySelector('.menu-buildings_directions') as HTMLSpanElement;
        this.orientation = this.querySelector('.menu-buildings_orientation') as HTMLSpanElement;
        this.topNode = this.querySelector('.menu-buildings_preview-node[data-top]') as HTMLDivElement;
        this.rightNode = this.querySelector('.menu-buildings_preview-node[data-right]') as HTMLDivElement;
        this.bottomNode = this.querySelector('.menu-buildings_preview-node[data-bottom]') as HTMLDivElement;
        this.leftNode = this.querySelector('.menu-buildings_preview-node[data-left]') as HTMLDivElement;
        this.railwayBuildingsCategoryButton = this.querySelector(`[data-category="${RAILWAY_BUILDINGS_CATEGORY}"]`) as HTMLButtonElement;
        this.productionBuildingsCategoryButton = this.querySelector(`[data-category="${PRODUCTION_BUILDINGS_CATEGORY}"]`) as HTMLButtonElement;
        this.railwayCategoryButton = this.querySelector(`[data-category="${RAILWAY_TRACK_CATEGORY}"]`) as HTMLButtonElement;

        this.closeButton.onclick = GameBoard.ServicesRegistry.actionsMenu.onClear;

        this.railwayBuildingsCategoryButton.onclick = () => {
            this.setState({
                category: RAILWAY_BUILDINGS_CATEGORY
            })
        };
        this.railwayCategoryButton.onclick = () => {
            this.setState({
                category: RAILWAY_TRACK_CATEGORY
            })
        };
        this.productionBuildingsCategoryButton.onclick = () => {
            this.setState({
                category: PRODUCTION_BUILDINGS_CATEGORY
            })
        };
    }

    constructor() {
        super();

        this.state = {
            category: 'Railway buildings'
        }

        this.render = this.render.bind(this);
        this.onActionsMenu = this.onActionsMenu.bind(this);
        this.onSelectedBuilding = this.onSelectedBuilding.bind(this);
        GameBoard.ServicesRegistry.actionsMenu.subscribe(this.onActionsMenu)
        GameBoard.ServicesRegistry.actionsMenu.subscribe((data) => {
            this.setProps({
                currentAction: data.action
            })
        })
    }

    private getDefaultImage() {
        let defaultImg = '';
        const currentAction = GameBoard.ServicesRegistry.actionsMenu.state.action?.type;
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

    override render() {
        this.titleElement.innerText = `${this.state.category}`

        const categoryButtonsMap = {
            [RAILWAY_BUILDINGS_CATEGORY]: this.railwayBuildingsCategoryButton,
            [RAILWAY_TRACK_CATEGORY]: this.railwayCategoryButton,
            [PRODUCTION_BUILDINGS_CATEGORY]: this.productionBuildingsCategoryButton,
        };

        const categoryOptionListsMap = {
            [RAILWAY_BUILDINGS_CATEGORY]: this.trackBuildingButtonElements,
            [RAILWAY_TRACK_CATEGORY]: this.railwayButtonElements,
            [PRODUCTION_BUILDINGS_CATEGORY]: this.productionBuildingButtonElements
        }

        const selectedCategoryButton = categoryButtonsMap[this.state.category];

        const currentBuildings: (BuildingButtonElement[] | undefined) = categoryOptionListsMap[this.state.category];

        if (selectedCategoryButton) {
            Object.entries(categoryButtonsMap).forEach(entry => {
                const [category, btn] = entry as [Category, HTMLButtonElement];
                btn.style.display = 'none';
                btn.classList.remove('box-primary');
                btn.classList.add('box-secondary');

                if (this.state.category !== RAILWAY_TRACK_CATEGORY) {
                    if (category !== RAILWAY_TRACK_CATEGORY) {
                        btn.style.display = 'unset'
                    }
                }
            });

            selectedCategoryButton.classList.add('box-primary');
            selectedCategoryButton.classList.remove('box-secondary');
        }

        if (currentBuildings && currentBuildings.length) {
            const currentAction = this.getProps().currentAction;

            let selectedBuilding: null | {
                kind: BuildingKind,
                orientation: Orientation,
                orientationSquareVariant?: OrientationSquareVariant | undefined;
            } = null;

            if (currentAction?.type === ActionsMenuOptionName.BuildBuilding) {
                selectedBuilding = currentAction?.payload ? {
                    kind: currentAction.payload.kind,
                    orientation: currentAction.payload.orientation,
                } : null;
            }

            if (currentAction?.type === ActionsMenuOptionName.BuildRailway) {
                selectedBuilding = currentAction?.payload ? {
                    kind: BuildingKind.RailwayTrack,
                    orientation: currentAction.payload.orientation,
                    orientationSquareVariant: currentAction.payload.orientationSquareVariant,
                } : null;
            }

            this.onSelectedBuilding(selectedBuilding)

            if (this.ulElement.getAttribute('data-variant') !== currentAction) {
                this.ulElement.setAttribute('data-variant', currentAction?.type ?? '')
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
                        } else if ([
                            BuildingKind.RailwayGarage,
                            BuildingKind.RailwayStation
                        ].includes(currentKind)) {
                            GameBoard.ServicesRegistry.actionsMenu.onBuildTrackBuildingOption({
                                kind: currentKind,
                                orientation: currentOrientation
                            })
                        } else if ([BuildingKind.RailwayTrack].includes(currentKind)) {
                            GameBoard.ServicesRegistry.actionsMenu.onBuildRailwayOption({
                                orientation: currentOrientation,
                                orientationSquareVariant: currentOrientationVariant ?? undefined
                            })
                        } else if ([BuildingKind.Timber].includes(currentKind)) {
                            GameBoard.ServicesRegistry.actionsMenu.onBuildProductionBuildingOption({
                                kind: currentKind,
                                orientation: currentOrientation
                            })
                        }
                    }
                });
            }

            if (currentAction?.type === ActionsMenuOptionName.BuildBuilding || currentAction?.type === ActionsMenuOptionName.BuildRailway) {
                this.style.transform = 'translateY(0px)';
                this.operationElement.appendChild(this.operationImage)
            } else {
                this.titleElement.innerText = 'Select option'
                this.style.transform = 'translateY(calc(100% + 50px))';
                this.operationImage.remove();
            }
        }

    }

    onActionsMenu(state: ActionsMenuService['state']) {

        const currentAction = state.action?.type;
        const currentPayload = (state.action as BuildBuildingOption)?.payload

        if (currentAction === ActionsMenuOptionName.BuildBuilding) {
            const isProductionBuilding = [BuildingKind.Timber].includes(currentPayload?.kind as BuildingKind)
            this.setState({
                category: isProductionBuilding ? PRODUCTION_BUILDINGS_CATEGORY : RAILWAY_BUILDINGS_CATEGORY
            })
        }

        if (currentAction === ActionsMenuOptionName.BuildRailway) {
            this.setState({
                category: RAILWAY_TRACK_CATEGORY
            })
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

export default MenuBottomElement;