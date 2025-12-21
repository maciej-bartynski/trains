import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import TrainModel from "#src/models/TrainModel.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ResourceKind from "#src/types/ResourceKind.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import classify from "#src/utils/classify.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";

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
    }

    private trainListener(trainState: TrainModel['state']) {

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

    override render() {
        const props = this.getProps();
        const train = props?.trainId ? GameBoard.getInstance().getTrain(props.trainId) : null;
        const trainAtom = this.querySelector(TrainAtom.elementName) as TrainAtom;

        if (train) {
            this.style.display = 'block';
            trainAtom?.setAttribute('data-color', train.state.randomColor);
            this.desinationsList.innerHTML = '';

            const routesToRender = train.state.events.length
                ? [[
                    ...train.state.events, //.map(e => e.state)
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

                            console.log('r, ', route)
                        }
                    } else {
                        loadButton?.remove();
                    }

                    if (takesResources.length) {
                        unloadButton.innerText = `Unload`;
                        unloadButton.onclick = () => {

                            console.log('r-, ', route)
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
    header: 'header',
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
            <header class="${classNames.header}">
                <train-atom class="--presentation"></train-atom>
                <h2 class="list_header">Set route by picking next destination on map</h2>
            </header>
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