import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import RouteEventModel from "#src/models/RouteEventModel.js";
import TrainModel from "#src/models/TrainModel.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ResourceKind from "#src/types/ResourceKind.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import BuildingUtils from "#src/utils/BuildingUtils.js";
import classify from "#src/utils/classify.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";
import TrainRunElement from "../TrainRun/TrainRun.js";

type ElementProps = {
    trainId: string,
    routes?: Array<TrainRouteEvent[]> | undefined
} | undefined;

type ElementState = {
    destination: Address;
} | undefined;

class MenuTrainSetRoute extends StatefullComponent<ElementState, ElementProps> {
    static componentName = 'menu-train-set-route';

    private desinationsList: HTMLUListElement = document.createElement('ul');
    private destinationsListItem: HTMLLIElement = document.createElement('li');
    private playerMessage: HTMLParagraphElement = document.createElement('p');
    private goCta: HTMLButtonElement = document.createElement('button');
    private contentSection = document.createElement('section');
    private trainNameEl = document.createElement('span');
    private trainLocationEl = document.createElement('span');
    private trainStateEl = document.createElement('span');
    private locationFieldWrapperEl: HTMLDivElement = document.createElement('div');
    private cargoList: HTMLUListElement = document.createElement('ul');

    connectedCallback() {
        this.innerHTML = innerHtmlText;
        const button = this.querySelector('button.close-button') as HTMLButtonElement;
        if (button) {
            button.onclick = GameBoard.ServicesRegistry.actionsMenu.onClear;
        }

        this.desinationsList = this.querySelector(`.${classNames.destinations.root}`) as HTMLUListElement;
        const destinationsListItem = this.querySelector(`.${classNames.destinations.item}`) as HTMLLIElement;
        this.destinationsListItem = destinationsListItem.cloneNode(true) as HTMLLIElement;
        this.playerMessage = this.querySelector(`.${classNames.empty}`) as HTMLParagraphElement;
        this.goCta = this.querySelector(`.${classNames.routeDoneAction}`) as HTMLButtonElement;
        this.contentSection = this.querySelector(`.${classNames.content}`) as HTMLElement;
        this.trainNameEl = this.querySelector(`.${classNames.header.name}`) as HTMLSpanElement;
        this.locationFieldWrapperEl = this.querySelector(`.${classNames.header.previewWrapper}`) as HTMLDivElement;
        this.trainLocationEl = this.querySelector(`.${classNames.header.location}`) as HTMLSpanElement;
        this.trainStateEl = this.querySelector(`.${classNames.header.state}`) as HTMLSpanElement;
        this.cargoList = this.querySelector(`.${classNames.header.cargo.list}`) as HTMLUListElement;
    }

    private trainListener(trainState: TrainModel['state']) {

    }

    static getCargoListItem(params: {
        resourceKind: ResourceKind,
        qty: number
    }) {
        return `
            <li class="${classNames.header.cargo.listItem} list_item">
                <img src="images/resources/${params.resourceKind}.png" class="${classNames.header.cargo.listItemImage}"/>
                <span class="${classNames.header.cargo.listItemLabel}">${params.qty}/10</span>
            </li>
        `;
    }

    constructor() {
        super();
        this.trainListener = this.trainListener.bind(this);
        this.render = this.render.bind(this)

        GameBoard.ServicesRegistry.actionsMenu.subscribe((actions) => {
            if (actions.action?.type === ActionsMenuOptionName.TrainSetRoute) {
                const currentTrain = GameBoard.getInstance().getTrain(actions.action.payload.trainId);
                let previousTrain: TrainModel | undefined;
                const prevTrainId = this.getProps()?.trainId;

                if (prevTrainId) {
                    previousTrain = GameBoard.getInstance().getTrain(prevTrainId);
                }

                if (previousTrain) {
                    previousTrain.unsubscribe(this.render);
                }

                if (currentTrain) {
                    this.setProps({
                        trainId: actions.action.payload.trainId
                    })
                    currentTrain.subscribe(this.render);
                    actions.action.payload.routes?.forEach(route => {
                        currentTrain.addRoute({
                            route
                        })
                    })
                }
            } else {
                this.setProps(undefined)
            }
        })
    }

    renderTrainShort(props: {
        train: TrainModel,
        field: FieldModel,
    }) {
        const { train, field } = props;
        const destinationEvent = (train.state.events ?? [])[(train.state.events ?? []).length - 1];
        const currentEvent = train.state.events[0];

        const destinationLabel = destinationEvent
            ? `C:${destinationEvent?.state.address.column ?? '(?)'} &#10005; R:${destinationEvent?.state.address.row ?? '(?)'}`
            : 'destination';

        const eventStateToLabelMap = {
            progress: `moving to ${destinationLabel}`,
            before: 'starting',
            after: 'awaiting',
        }

        const buildingName = field?.state.building
            ? BuildingUtils.BuildingKindToDisplayName[field.state.building]
            : null;

        const locationLabel = `${buildingName ?? field?.state.terrain ?? '-'}`;
        const locationGridLabel = `<span style="box-sizing: border-box; font-size: 8px; border: solid 1px var(--tertiary); color: var(--primary); border-radius: 4px; padding: 0 4px; line-height: 18px">C:${field?.state.address.column ?? '(?)'} &#10005; R:${field?.state.address.row ?? '(?)'}</span>`

        this.style.display = 'block';
        this.trainNameEl.innerText = train.state.name;
        this.trainLocationEl.innerHTML = `<span class="indicator-address" style="display: inline-block"></span>${locationLabel}${locationGridLabel}`;
        this.trainStateEl.innerHTML = currentEvent?.state.state
            ? `<span class="indicator-blue" style="display: inline-block"></span>&nbsp;${eventStateToLabelMap[currentEvent.state.state]}`
            : '<span class="indicator-blue" style="display: inline-block"></span>&nbsp;&nbsp;Train ready...';

        if (this.locationFieldWrapperEl.getAttribute('data-address') !== AddressUtils.toKey(train.state.location)) {
            const fieldPreview = GameFieldElement.renderPreviewDuplicate(train.state.location);
            this.locationFieldWrapperEl.innerHTML = ''
            this.locationFieldWrapperEl.setAttribute('data-address', AddressUtils.toKey(train.state.location));
            if (fieldPreview) {
                this.locationFieldWrapperEl.appendChild(fieldPreview);
            }
        }

        const hasTrainId = this.locationFieldWrapperEl.querySelector(`${TrainRunElement.componentName}`)?.getAttribute(TrainRunElement.dataTrainAttr);
        if (hasTrainId !== train.state.id) {
            const nodeList = this.locationFieldWrapperEl.querySelectorAll(`${TrainRunElement.componentName}`) ?? [];
            [...nodeList].forEach(node => node.remove());
            const trainAnimation = TrainRunElement.createTrainElement({ trainId: train.state.id, preview: true }) as HTMLElement;
            this.locationFieldWrapperEl.appendChild(trainAnimation);
        }

    }

    override render() {
        const props = this.getProps();
        const train = props?.trainId ? GameBoard.getInstance().getTrain(props.trainId) : null;
        const currentField = train ? GameBoard.getInstance().getField(train.state.location) : null;

        if (train && currentField) {
            this.renderTrainShort({
                train,
                field: currentField,
            })

            this.cargoList.innerHTML = Object.entries(train.state.cargo ?? {}).map(cargo => {
                const [resourceKind, qty] = cargo as [ResourceKind, number];
                return MenuTrainSetRoute.getCargoListItem({
                    resourceKind,
                    qty
                })
            }).join();

            this.desinationsList.innerHTML = '';

            const routesToRender = train.state.events.length
                ? [[
                    ...train.state.events,
                ], ...train.state.journey]
                : train.state.journey;

            routesToRender.forEach(route => {
                const destinationAddress = route[route.length - 1]?.state.address;
                const destinationEvent = route[route.length - 1];
                const fieldModel = destinationAddress ? GameBoard.getInstance().getField(destinationAddress) : null;

                if (destinationAddress && fieldModel && destinationEvent) {
                    const producedResources: ResourceKind[] = [];
                    const takesResources: ResourceKind[] = [];
                    Object.entries(fieldModel.state.production ?? {}).forEach(entry => {
                        const [key, data] = entry as [ResourceKind, any];
                        if (data) {
                            producedResources.push(key);
                        }
                    });

                    if (fieldModel.state.building === BuildingKind.RailwayStation) {
                        Object.entries(ResourceKind).forEach(entry => {
                            takesResources.push(entry[1])
                        });
                    }

                    const listItem = this.destinationsListItem.cloneNode(true) as HTMLLIElement;
                    listItem.innerHTML = `
                        <div class="${classNames.destinations.destination} list_item">
                            <div class="${classNames.destinations.field}"></div>
                            <div class="${classNames.destinations.address}">
                                R: ${destinationAddress.row}, C: ${destinationAddress.column}
                            </div>
                            <div class="${classNames.destinations.distance}">
                                Distance: ${route.length}
                            </div>
                            <button data-load class="${classNames.destinations.act}">
                                Act
                            </button>
                            <button data-unload class="${classNames.destinations.act}">
                                Act 2
                            </button>
                        </div>
                        <div class="${classNames.destinations.operations}">
                            No operations available yet
                        </div>
                    `;
                    const fieldCell = listItem.querySelector(`.${classNames.destinations.field}`) as HTMLDivElement;
                    const fieldEl = GameFieldElement.renderPreviewDuplicate(destinationAddress);
                    const loadButton = listItem.querySelector('[data-load]') as HTMLButtonElement;
                    const unloadButton = listItem.querySelector('[data-unload]') as HTMLButtonElement;
                    if (producedResources.length) {
                        loadButton.innerText = `Load`;
                        loadButton.onclick = () => {
                            destinationEvent.defineOperations([{
                                resource: ResourceKind.Wood,
                                type: 'pick-up'
                            }]);
                        }
                    } else {
                        loadButton?.remove();
                    }

                    if (takesResources.length) {
                        unloadButton.innerText = `Unload`;
                        unloadButton.onclick = () => {
                            destinationEvent.defineOperations([{
                                resource: ResourceKind.Wood,
                                type: 'dump'
                            }]);
                        }
                    } else {
                        unloadButton?.remove();
                    }
                    if (fieldEl) fieldCell.appendChild(fieldEl);
                    this.desinationsList.appendChild(listItem);
                }
            });

            if (train.state.journey.length) {
                this.contentSection.appendChild(this.goCta);
                this.goCta.onclick = () => {
                    const firstRoute = train.state.journey[0];
                    const firstDestination = firstRoute
                        ? firstRoute[firstRoute.length - 1]?.state.address
                        : null;
                    if (firstDestination && train.state.journey.length) {
                        train.setJourney({ journey: train.state.journey })
                    }
                }
            } else {
                this.goCta.remove();
            }

        } else {
            this.style.display = 'none';
        }

    }

}

const classNames = classify('MenuTrainSetRoute', {
    content: 'content',
    header: {
        preview: 'preview',
        previewWrapper: 'preview-wrapper',
        name: 'name',
        location: 'location',
        state: 'state',
        cargo: {
            list: 'list',
            listItem: 'list-item',
            listItemImage: 'list-item-image',
            listItemLabel: 'list-item-label'
        }
    },
    empty: 'empty',
    destinations: {
        destination: 'destination',
        operations: 'operations',
        act: 'act',
        item: 'item',
        field: 'field',
        address: 'address',
        distance: 'distance'
    },
    routeDoneAction: 'route-done-action'
})

const innerHtmlText = `
    <div class="box-secondary card-primary">
        <button class="close-button box-tertiary"></button>
        <section class="${classNames.content}">
            <header class="${classNames.header.root}">
                <div class="${classNames.header.preview}">
                    <div class="${classNames.header.previewWrapper}">
                        <train-atom class="--presentation"></train-atom>
                    </div>
                    <span class="${classNames.header.name}">Name</span>
                    <span class="${classNames.header.location}">
                        <span class="indicator-address"></span>
                    </span>
                    <span class="${classNames.header.state}">Awaiting</span>
                </div>
            </header>

            <div class="${classNames.header.cargo.root}">
                <div class="list_header">Cargo</div>
                <ul class="${classNames.header.cargo.list}">
                    <li class="${classNames.header.cargo.listItem} list_item">
                        <img src="images/resources/wood.png" class="${classNames.header.cargo.listItemImage}"/>
                        <span class="${classNames.header.cargo.listItemLabel}">4/10</span>
                    </li>
                    <li class="${classNames.header.cargo.listItem} list_item">
                        <img src="images/resources/iron.png" class="${classNames.header.cargo.listItemImage}"/>
                        <span class="${classNames.header.cargo.listItemLabel}">4/10</span>
                    </li>
                    <li class="${classNames.header.cargo.listItem} list_item">
                        <img src="images/resources/clay.png" class="${classNames.header.cargo.listItemImage}"/>
                        <span class="${classNames.header.cargo.listItemLabel}">4/10</span>
                    </li>
                </ul>
            </div>

            <h2 class="list_header">Set route by picking next destination on map</h2>
            <ul class="${classNames.destinations.root}">
                <li class="${classNames.destinations.item}">
                    <div class="${classNames.destinations.destination} list_item">
                        <div class="${classNames.destinations.field}"></div>
                        <div class="${classNames.destinations.address}"></div>
                        <div class="${classNames.destinations.distance}"></div>
                        <button class="${classNames.destinations.act} box-primary">
                            Act
                        </button>
                    </div>
                    <div class="${classNames.destinations.operations}">
                        No operations available yet
                    </div>
                </li>
            </ul>
            <p class="${classNames.empty}">
                Pick next destination on map
            </p>
            <button class="${classNames.routeDoneAction} box-primary">
                Go!
            </button>
        </section>
    </div>
`;

export default MenuTrainSetRoute;