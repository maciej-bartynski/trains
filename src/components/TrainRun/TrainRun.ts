import GameBoard from "#src/GameBoard.js";
import TrainModel from "#src/models/TrainModel.js";
// import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import Direction from "#src/types/Direction.js";
import DirectionUtils from "#src/utils/DirectionUtils.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";

class TrainRunElement extends HTMLElement {
    static dataTrainAttr = 'data-train';

    static observedAttributes = [TrainRunElement.dataTrainAttr];

    static componentName = 'train-run-element';

    private from: Direction | null = null;
    private to: Direction | null = null;

    private strightRouteEl = (() => {
        const el = document.createElement('div');
        el.classList.add('stright-route');
        return el;
    })()

    private turnLeftRouteEl = (() => {
        const el = document.createElement('div');
        el.classList.add('turn-left-route');
        return el;
    })();

    private turnRightRouteEl = (() => {
        const el = document.createElement('div');
        el.classList.add('turn-right-route');
        return el;
    })();

    private stopEl = (() => {
        const el = document.createElement('div');
        el.classList.add('stright-stop');
        return el;
    })();

    private startEl = (() => {
        const el = document.createElement('div');
        el.classList.add('stright-start');
        return el;
    })();

    private trainEl = (() => {
        const el = document.createElement('train-atom');
        el.classList.add('train');
        return el;
    })();

    constructor() {
        super();
        this.render = this.render.bind(this);
    }

    render(trainState: TrainModel['state']) {

        this.trainEl.setAttribute('data-color', trainState.randomColor);

        this.trainEl.onclick = () => {
            GameBoard.ServicesRegistry.actionsMenu.onTrainSetRoute({ trainId: trainState.id })
        }

        const event = trainState.events.find(ev => ev.state.order === trainState.routeCurrentEvent);
        const progressPercentage = trainState.trespassingProgress;
        this.from = event?.state.from ?? null;
        this.to = event?.state.to ?? null;

        const fieldModel = event
            ? GameBoard.getInstance().getField(event?.state.address)
            : GameBoard.getInstance().getField(trainState.location);
        const field = event
            ? GameFieldElement.selectFieldByAddress(event?.state.address)
            : GameFieldElement.selectFieldByAddress(trainState.location);

        if (!field) return;

        if (!event && fieldModel) {
            this.from = null;
            this.to = Object.entries(fieldModel.state.railwayOrientation)
                .find(([, hasRailway]) => hasRailway)?.[0] as Direction;
        }

        field.appenTrainElement(this);

        if (this.from && this.to) {

            this.classList.add(`from-${this.from}`);
            this.trainEl.classList.add('--moving');

            if (DirectionUtils.isTurnLeft(this.from, this.to)) {
                if (!this.contains(this.turnLeftRouteEl)) {
                    this.appendChild(this.turnLeftRouteEl);
                }
                if (!this.turnLeftRouteEl.contains(this.trainEl)) {
                    this.turnLeftRouteEl.appendChild(this.trainEl);
                }


                this.turnLeftRouteEl.classList.add(`from-${this.from}`);
                this.turnLeftRouteEl.style.transform = `rotate(${-90 * (progressPercentage / 100)}deg)`;
            }

            else if (DirectionUtils.isTurnRight(this.from, this.to)) {
                if (!this.contains(this.turnRightRouteEl)) {
                    this.appendChild(this.turnRightRouteEl);
                }
                if (!this.turnRightRouteEl.contains(this.trainEl)) {
                    this.turnRightRouteEl.appendChild(this.trainEl);
                }
                this.turnRightRouteEl.classList.add(`from-${this.from}`);
                this.turnRightRouteEl.style.transform = `rotate(${90 * (progressPercentage / 100)}deg)`;
            }

            else if (DirectionUtils.isHorizontalAxis(this.from, this.to)) {
                if (!this.contains(this.strightRouteEl)) {
                    this.appendChild(this.strightRouteEl);
                }
                if (!this.strightRouteEl.contains(this.trainEl)) {
                    this.strightRouteEl.appendChild(this.trainEl);
                }
                this.strightRouteEl.classList.add(`from-${this.from}`);
                this.strightRouteEl.style.transform = `translateX(${progressPercentage}%)`;
            }

            else if (DirectionUtils.isVerticalAxis(this.from, this.to)) {
                if (!this.contains(this.strightRouteEl)) {
                    this.appendChild(this.strightRouteEl);
                }
                if (!this.strightRouteEl.contains(this.trainEl)) {
                    this.strightRouteEl.appendChild(this.trainEl);
                }
                this.strightRouteEl.classList.add(`from-${this.from}`);
                this.strightRouteEl.style.transform = `translateX(${progressPercentage}%)`;
            }
        }

        if (this.from && !this.to) {
            this.classList.add(`from-${this.from}`);
            if (!this.contains(this.stopEl)) {
                this.appendChild(this.stopEl);
            }
            this.stopEl.classList.add(`from-${this.from}`);
            if (!this.stopEl.contains(this.trainEl)) {
                this.stopEl.appendChild(this.trainEl);
            }
            this.stopEl.style.transform = `translateX(${progressPercentage / 2}%)`;
            if (progressPercentage >= 100) {
                this.trainEl.classList.remove('--moving');
            }
        }

        if (this.to && !this.from) {
            this.trainEl.classList.add('--moving');
            this.classList.remove('from-top', 'from-bottom', 'from-left', 'from-right');
            this.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            if (!this.contains(this.startEl)) {
                this.appendChild(this.startEl);
            }
            this.startEl.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            if (!this.startEl.contains(this.trainEl)) {
                this.startEl.appendChild(this.trainEl);
            }
            this.startEl.style.transform = `translateX(${50 + (progressPercentage / 2)}%)`;
        }

        if (!this.to && !this.from) {
            this.appendChild(this.stopEl);
            this.stopEl.appendChild(this.trainEl);
            this.trainEl.classList.remove('--moving');
        }

        if (!event && this.trainEl.isConnected) {
            this.trainEl.classList.remove('--moving');
        }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === TrainRunElement.dataTrainAttr) {
            const train = GameBoard.getInstance().getTrain(newValue);
            const prevTrain = GameBoard.getInstance().getTrain(oldValue);
            if (train) {
                train.subscribe(this.render)
            }

            if (prevTrain) {
                prevTrain.unsubscribe(this.render)
            }
        }
    }

    connectedCallback() {
        const trainId = this.getAttribute(TrainRunElement.dataTrainAttr);
        const train = trainId ? GameBoard.getInstance().getTrain(trainId) : null;
        if (train) {
            train.subscribe(this.render);
        }
    }

    disconnectedCallback() {
        const trainId = this.getAttribute(TrainRunElement.dataTrainAttr);
        const train = trainId ? GameBoard.getInstance().getTrain(trainId) : null;
        if (train) {
            train.subscribe(this.render)
        }

        this.removeAttribute('class');
        this.innerHTML = '';
    }

    static trainSelector(trainId: string, parent?: Element): TrainRunElement | null {
        if (!trainId) {
            return null
        }
        return (parent ?? document).querySelector(`${TrainRunElement.componentName}[${TrainRunElement.dataTrainAttr}="${trainId}"]`);
    }

    static createTrainElement(params: {
        trainId: string
    }): TrainRunElement | void {
        const train = GameBoard.getInstance().getTrain(params.trainId);
        if (train) {
            const trainAnimation = document.createElement(TrainRunElement.componentName) as TrainRunElement;
            trainAnimation.setAttribute(TrainRunElement.dataTrainAttr, params.trainId)
            return trainAnimation;
        }
    }
}

export default TrainRunElement;