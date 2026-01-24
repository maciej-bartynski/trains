import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import RouteEventModel from "#src/models/RouteEventModel.js";
import TrainModel from "#src/models/TrainModel.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ResourceKind from "#src/types/ResourceKind.js";
import elementHelpers from "#src/utils/elementHelpers.js";
import BuildingUtils from "#src/utils/BuildingUtils.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";
import { classNames, getLocationGridLabel } from "./helpers.js";

type State = {
    pickupMenuOpened: boolean;
    unloadMenuOpened: boolean;
}

type Props = {
    route: RouteEventModel[],
    routeIndex: number,
    journey: RouteEventModel[][],
    train: TrainModel,
    journeyDepartureStation: FieldModel | null;
}

class RouteItem extends StatefullComponent<State, Props> {
    static componentName = 'route-item';

    static createRouteItem() {
        return document.createElement(RouteItem.componentName) as RouteItem;
    }

    constructor() {
        super();
        this.hydrateUpperTrespassingBlock = this.hydrateUpperTrespassingBlock.bind(this);
        this.hydrateContentBlock = this.hydrateContentBlock.bind(this);
        this.hydrateLoadBlock = this.hydrateLoadBlock.bind(this);
        this.hydrateUnloadBlock = this.hydrateUnloadBlock.bind(this);

        this.state = {
            pickupMenuOpened: false,
            unloadMenuOpened: false,
        }
    }

    override render() {

        console.log("why i render", arguments)

        const { route, routeIndex, journey, train, journeyDepartureStation } = this.getProps();

        const destinationAddress = route[route.length - 1]?.state.address;
        const destinationEvent = route[route.length - 1];
        let destinationField = destinationAddress
            ? GameBoard.getInstance().getField(destinationAddress)
            : null;

        if (journeyDepartureStation) {
            destinationField = journeyDepartureStation;
        }

        const listItem = this.ListItemElement;

        if ((!destinationField)) {
            listItem.innerHTML = `<div class="${classNames.destinations.destination} list_item">Invalid route</div>`;
            return;
        }

        if (journeyDepartureStation) {
            this.UpperTrespassingBlock.remove();
            this.IndicatorBlock.remove();
            elementHelpers.appendChild(listItem, this.UpperStartingBlock);
        } else {
            this.UpperStartingBlock.remove();
            elementHelpers.appendChild(listItem, this.UpperTrespassingBlock);
            elementHelpers.appendChild(listItem, this.IndicatorBlock);
            this.hydrateUpperTrespassingBlock(route.length - 1);
        }

        const lastDestination = (routeIndex === journey.length - 1) && !journeyDepartureStation;

        this.hydrateLoadBlock({
            field: destinationField,
            event: destinationEvent
        });

        this.hydrateUnloadBlock({
            field: destinationField,
            event: destinationEvent
        });

        elementHelpers.appendChild(listItem, this.ContentBlock)
        this.hydrateContentBlock(destinationField);

        if (journeyDepartureStation && !journey.length) {
            this.LowerTrespassingBlock.remove();
            this.LowerFinalBlock.remove();
            listItem.appendChild(this.LowerStartingBlock);
        } else {
            if (lastDestination) {
                this.LowerTrespassingBlock.remove();
                this.LowerStartingBlock.remove();
                listItem.appendChild(this.LowerFinalBlock);
                listItem.appendChild(this.IndicatorRedBlock);
            } else {
                this.LowerFinalBlock.remove();
                this.LowerStartingBlock.remove();
                listItem.appendChild(this.LowerTrespassingBlock);
            }
        }

        const lowerBlock = listItem.querySelector('[data-selector="lower-block"]');

        if (lowerBlock && (this.state.unloadMenuOpened || destinationEvent?.state.operations?.some(o => o.type === 'dump'))) {
            elementHelpers.insertBefore(listItem, this.UnloadBlock, lowerBlock);
        } else {
            this.UnloadBlock.remove();
        }

        if (lowerBlock && (this.state.pickupMenuOpened || destinationEvent?.state.operations?.some(o => o.type === 'pick-up'))) {
            elementHelpers.insertBefore(listItem, this.LoadBlock, lowerBlock)
        } else {
            this.LoadBlock.remove();
        }
    }

    private ListItemElement = (() => {
        const element = document.createElement('li');
        element.classList.add(classNames.destinations.item);
        return element;
    })();

    private UpperStartingBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.standingBy.root, "list_item");
        element.innerHTML = `<div class="${classNames.standingBy.label}">Standing by at:</div>`;
        return element;
    })();

    private UpperTrespassingBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.root, "list_item");
        element.innerHTML = `
            <div class="${classNames.distance.label}">Moving</div>
            <div class="${classNames.distance.content}">
                <span class="indicator-address" style="display: inline-block"></span>
                <span class="${classNames.distance.data}"><b>?? fields</b></span>
            </div>
        `;
        return element;
    })();

    private hydrateUpperTrespassingBlock(x: number) {
        const dataElement = this.UpperTrespassingBlock.querySelector(`.${classNames.distance.data}`) as HTMLSpanElement;
        dataElement.innerHTML = `<b>${x} fields</b>`;
    }

    private IndicatorBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.arrivalIndicatorWrapper);
        element.innerHTML = `<div class="indicator-blue"></div>`;
        return element;
    })();

    private LowerFinalBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.root, "list_item");
        element.setAttribute('data-selector', 'lower-block');
        element.innerHTML = `<div class="${classNames.distance.label}">Journey ends</div>`;
        return element;
    })();

    private IndicatorRedBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.departureIndicatorWrapper);
        element.innerHTML = `<div class="indicator-red"></div>`;
        return element;
    })();

    private LowerTrespassingBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.departureIndicatorWrapper);
        element.innerHTML = `<div class="indicator-blue"></div>`;
        element.setAttribute('data-selector', 'lower-block');
        return element;
    })();

    private LowerStartingBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.distance.root, "list_item");
        element.setAttribute('data-selector', 'lower-block');
        element.innerHTML = `<div class="${classNames.distance.label}">Pick next destination on map</div>`;
        return element;
    })();

    private ContentBlock = (() => {
        const element = document.createElement('div');
        element.classList.add(classNames.destinations.destination, "list_item");
        element.innerHTML = `
            <div class="${classNames.destinations.field}" data-selector="field-preview"></div>
            <div class="${classNames.destinations.fieldData}">
                <div class="${classNames.destinations.address}" data-selector="label">
                    <b>Label</b>
                </div>
                <div class="${classNames.destinations.address}">
                    at <span class="${classNames.locationGridLabel} --dark" data-selector="address">Location</span>
                </div>
            </div>
            <button data-load class="${classNames.destinations.act}">
                Act
            </button>
            <button data-unload class="${classNames.destinations.act}">
                Act 2
            </button>
        `;
        return element;
    })();

    private hydrationHelperState = '';
    private hydrationHelperLoadButonState = '';
    private hydrationHelperUnLoadButonState = '';

    private hydrateContentBlock(field: FieldModel) {
        const label = field.state.building ? BuildingUtils.BuildingKindToDisplayName[field.state.building] : 'Field';
        const displayAddress = getLocationGridLabel(field.state.address);
        const labelElement = this.ContentBlock.querySelector('[data-selector="label"]');
        const addressElement = this.ContentBlock.querySelector('[data-selector="address"]');
        const previewWrapperElement = this.ContentBlock.querySelector('[data-selector="field-preview"]');

        if (labelElement) labelElement.innerHTML = `<b>${label}</b>`;
        if (addressElement) addressElement.innerHTML = `${displayAddress}`;

        const prevHydrationState = JSON.stringify(field.state);
        if (prevHydrationState !== this.hydrationHelperState) {
            this.hydrationHelperState = prevHydrationState;
            const fieldPreviewElement = GameFieldElement.renderPreviewDuplicate(field.state.address);
            if (fieldPreviewElement && previewWrapperElement) {
                elementHelpers.appendChild(previewWrapperElement, fieldPreviewElement);
            }
        }

        const loadButton = this.ContentBlock.querySelector('[data-load]') as HTMLButtonElement;
        const unloadButton = this.ContentBlock.querySelector('[data-unload]') as HTMLButtonElement;

        const producedResources: ResourceKind[] = [];
        const takesResources: ResourceKind[] = [];
        Object.entries(field.state.production ?? {}).forEach(entry => {
            const [key, data] = entry as [ResourceKind, any];
            if (data) {
                producedResources.push(key);
            }
        });
        if (field.state.building === BuildingKind.RailwayStation) {
            Object.entries(ResourceKind).forEach(entry => {
                takesResources.push(entry[1])
            });
        }

        const nextLoadHydrationState = JSON.stringify([...producedResources].sort());
        if (producedResources.length) {
            if (nextLoadHydrationState !== this.hydrationHelperLoadButonState) {
                this.hydrationHelperLoadButonState = nextLoadHydrationState;
                loadButton.innerText = `Load`;
                loadButton.onclick = () => {
                    this.setState({
                        pickupMenuOpened: !this.state.pickupMenuOpened
                    })
                }
            }
        } else {
            loadButton?.remove();
        }

        const nextUnloadHydrationState = JSON.stringify([...takesResources].sort());
        if (takesResources.length) {
            if (nextUnloadHydrationState !== this.hydrationHelperUnLoadButonState) {
                this.hydrationHelperUnLoadButonState = nextUnloadHydrationState;
                unloadButton.innerText = `Unload`;
                unloadButton.onclick = () => {
                    this.setState({
                        unloadMenuOpened: !this.state.unloadMenuOpened
                    })
                }
            }
        } else {
            unloadButton?.remove();
        }
    }

    private LoadBlock = (() => {
        const element = document.createElement('div');
        element.innerHTML = `
        <div class="${classNames.loadCargo.root} list_item">
            <div class="${classNames.loadCargo.label}">
                Load cargo
            </div>
            <div class="${classNames.loadCargo.list}" data-cargo></div>
        </div>`;
        return element;
    })();

    private hydrateLoadBlock(params: {
        field: FieldModel,
        event?: RouteEventModel | undefined
    }) {
        const { field, event } = params;
        if (event) {
            const producedResources = field.state.production;
            const itemsList: HTMLElement[] = [];

            Object.entries(producedResources ?? {}).forEach(entry => {
                const [resourceKind, productionData] = entry as [ResourceKind, {
                    qty: number,
                    progress: number
                } | undefined]
                if (productionData) {
                    const allOperations = (event.state.operations ?? []);

                    let pickupOperationFound: (NonNullable<RouteEventModel['state']['operations']>[number] & {
                        type: 'pick-up'
                    }) | null = null;

                    allOperations.forEach(operation => {
                        if (operation.resource === resourceKind) {
                            if (operation.type === 'pick-up') {
                                pickupOperationFound = operation as any;
                            }
                        }

                        return (operation.resource === resourceKind) && (operation.type === 'pick-up');
                    });

                    const addQty = () => {
                        if (pickupOperationFound) {
                            pickupOperationFound.maxQty += 1;
                            event.defineOperations(allOperations)
                        } else {
                            event.defineOperations([...allOperations, {
                                type: 'pick-up',
                                resource: resourceKind,
                                maxQty: 1,
                            }])
                        }
                    }

                    const removeQty = () => {
                        if (pickupOperationFound) {
                            pickupOperationFound.maxQty -= 1;
                            event.defineOperations(allOperations)
                        } else {
                            event.defineOperations([...allOperations, {
                                type: 'pick-up',
                                resource: resourceKind,
                                maxQty: 0,
                            }])
                        }
                    }

                    const { cargoSlots, maxSlotLoad } = TrainModel;
                    const { qty, progress } = productionData;

                    const slotItem = document.createElement('div');
                    slotItem.classList.add(`${classNames.loadCargo.listItem}`, `list_item`);
                    slotItem.innerHTML = `
                            <img src="images/resources/${resourceKind}.png" class="${classNames.header.cargo.listItemImage}"/>
                            <span class="${classNames.header.cargo.listItemLabel}">${(pickupOperationFound as any)?.maxQty ?? 0}/${maxSlotLoad * cargoSlots}</span>
                            <div class="${classNames.loadCargo.listItemActions}">
                                <button data-removeqty>-</button>
                                <button data-addqty>+</button>
                            </div>
                    `;

                    const removeBtn = slotItem.querySelector('[data-removeqty]') as HTMLButtonElement;
                    const addBtn = slotItem.querySelector('[data-addqty]') as HTMLButtonElement;

                    removeBtn.onclick = removeQty;
                    addBtn.onclick = addQty;

                    itemsList.push(slotItem);
                }
            });

            const dynamicSection = this.LoadBlock.querySelector('[data-cargo]') as HTMLDivElement;
            if (dynamicSection) {
                dynamicSection.innerHTML = '';
                itemsList.forEach(item => {
                    dynamicSection.appendChild(item);
                });
            }
        }
    }

    private UnloadBlock = (() => {
        const element = document.createElement('div');
        element.innerHTML = `
        <div class="${classNames.loadCargo.root} list_item">
            <div class="${classNames.loadCargo.label}">
                Unload cargo
            </div>
            <div class="${classNames.loadCargo.list}" data-cargo></div>
        </div>`;
        return element;
    })();

    private hydrateUnloadBlock(params: {
        field: FieldModel,
        event?: RouteEventModel | undefined
    }) {
        const { field, event } = params;

        if (event) {
            const storedResources = field.state.storage;
            const itemsList: HTMLElement[] = [];

            Object.entries(storedResources ?? {}).forEach(entry => {
                const [resourceKind,] = entry as [ResourceKind, number]

                const allOperations = (event.state.operations ?? []);

                let dumpOperationFound: (NonNullable<RouteEventModel['state']['operations']>[number] & {
                    type: 'dump'
                }) | null = null;

                allOperations.forEach(operation => {
                    if (operation.resource === resourceKind) {
                        if (operation.type === 'dump') {
                            dumpOperationFound = operation as any;
                        }
                    }

                    return (operation.resource === resourceKind) && (operation.type === 'pick-up');
                });

                if (!dumpOperationFound) {
                    dumpOperationFound = {
                        type: 'dump',
                        resource: resourceKind,
                        maxQty: 0,
                    }
                    allOperations.push(dumpOperationFound)
                }

                const addQty = () => {
                    if (dumpOperationFound) {
                        dumpOperationFound.maxQty += 1;
                        event.defineOperations(allOperations)
                    } else {
                        event.defineOperations([...allOperations, {
                            type: 'dump',
                            resource: resourceKind,
                            maxQty: 1,
                        }])
                    }
                }

                const removeQty = () => {
                    if (dumpOperationFound) {
                        dumpOperationFound.maxQty -= 1;
                        event.defineOperations(allOperations)
                    } else {
                        event.defineOperations([...allOperations, {
                            type: 'dump',
                            resource: resourceKind,
                            maxQty: 0,
                        }])
                    }
                }

                const { cargoSlots, maxSlotLoad } = TrainModel;

                const slotItem = document.createElement('div');
                slotItem.classList.add(`${classNames.loadCargo.listItem}`, `list_item`);
                slotItem.innerHTML = `
                            <img src="images/resources/${resourceKind}.png" class="${classNames.header.cargo.listItemImage}"/>
                            <span class="${classNames.header.cargo.listItemLabel}">${(dumpOperationFound as any)?.maxQty ?? 0}/${maxSlotLoad * cargoSlots}</span>
                            <div class="${classNames.loadCargo.listItemActions}">
                                <button data-removeqty>-</button>
                                <button data-addqty>+</button>
                            </div>
                    `;

                const removeBtn = slotItem.querySelector('[data-removeqty]') as HTMLButtonElement;
                const addBtn = slotItem.querySelector('[data-addqty]') as HTMLButtonElement;

                removeBtn.onclick = removeQty;
                addBtn.onclick = addQty;

                itemsList.push(slotItem);

            });

            const dynamicSection = this.UnloadBlock.querySelector('[data-cargo]') as Element;
            if (dynamicSection) {
                dynamicSection.innerHTML = '';
                itemsList.forEach(item => {
                    dynamicSection.appendChild(item);
                });
            }
        }
    }

    private subscriptionHelper: RouteEventModel | undefined;

    connectedCallback() {
        const { route } = this.getProps();
        const destinationEvent = route[route.length - 1];
        if (this.subscriptionHelper) {
            this.subscriptionHelper.unsubscribe(this.render);
            this.subscriptionHelper = undefined;
        }
        if (destinationEvent) {
            this.subscriptionHelper = destinationEvent;
            destinationEvent.subscribe(this.render);
        }
        this.appendChild(this.ListItemElement);
    }

    disconnectedCallback() {
        const { route } = this.getProps();
        const destinationEvent = route[route.length - 1];
        if (destinationEvent) {
            destinationEvent.unsubscribe(this.render);
        }
        if (this.subscriptionHelper) {
            this.subscriptionHelper.unsubscribe(this.render);
            this.subscriptionHelper = undefined;
        }
    }
}

export default RouteItem