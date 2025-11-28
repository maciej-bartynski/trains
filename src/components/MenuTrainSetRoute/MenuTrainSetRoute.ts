import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import Address from "#src/types/Address.js";
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
            button.onclick = actionsMenuService.onClear;
        }

        this.desinationsList = this.querySelector(`.${classNames.destinations.root}`) as HTMLUListElement;
        const destinationsListItem = this.querySelector(`.${classNames.destinations.item}`) as HTMLLIElement;
        this.destinationsListItem = destinationsListItem.cloneNode(true) as HTMLLIElement;
        this.playerMessage = this.querySelector(`.${classNames.empty}`) as HTMLParagraphElement;
        this.goCta = this.querySelector(`.${classNames.routeDoneAction}`) as HTMLButtonElement;
        this.contentSection = this.querySelector(`.${classNames.content}`) as HTMLElement;
    }

    constructor() {
        super();
        actionsMenuService.subscribe((actions) => {
            if (actions.action?.type === ActionsMenuOptionName.TrainSetRoute) {
                this.setProps({
                    trainId: actions.action.payload.trainId,
                    routes: actions.action.payload.routes
                })
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
            props?.routes?.forEach(route => {
                const destinationAddress = route[route.length - 1]?.address;
                if (destinationAddress) {
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
                            <button class="${classNames.destinations.act}">
                                Act
                            </button>
                        </div>
                        <div class="${classNames.destinations.operations}">
                            No operations available yet
                        </div>
                    `;
                    const fieldCell = listItem.querySelector(`.${classNames.destinations.field}`) as HTMLDivElement;
                    const fieldEl = GameFieldElement.renderPreviewDuplicate(destinationAddress);
                    if (fieldEl) fieldCell.appendChild(fieldEl);
                    this.desinationsList.appendChild(listItem);
                }
            });

            if (props?.routes?.length) {
                this.contentSection.appendChild(this.goCta);
                this.goCta.onclick = () => {
                    const firstRoute = props.routes?.[0];
                    const firstDestination = firstRoute
                        ? firstRoute[firstRoute.length - 1]?.address
                        : null;
                    if (firstDestination && props.routes) {
                        train.setJourney({ journey: props.routes })
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