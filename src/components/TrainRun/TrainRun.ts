import GameBoard from "#src/GameBoard.js";
import TrainModel from "#src/models/TrainModel.js";
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
        const event = trainState.events.find(ev => ev.state.order === trainState.routeCurrentEvent);

        this.from = event?.state.from ?? null;
        this.to = event?.state.to ?? null;

        const field = event?.state.address ? GameFieldElement.selectFieldByAddress(event?.state.address) : null;
        if (!field) return;
        field.appenTrainElement(this)

        if (this.from && this.to) {
            this.classList.add(`from-${this.from}`);
            this.trainEl.classList.add('--moving');

            if (DirectionUtils.isTurnLeft(this.from, this.to)) {
                this.appendChild(this.turnLeftRouteEl);
                this.turnLeftRouteEl.classList.add(`from-${this.from}`);
                this.turnLeftRouteEl.appendChild(this.trainEl);
            }

            else if (DirectionUtils.isTurnRight(this.from, this.to)) {
                this.appendChild(this.turnRightRouteEl);
                this.turnRightRouteEl.classList.add(`from-${this.from}`);
                this.turnRightRouteEl.appendChild(this.trainEl);
            }

            else if (DirectionUtils.isHorizontalAxis(this.from, this.to)) {
                this.appendChild(this.strightRouteEl);
                this.strightRouteEl.classList.add(`from-${this.from}`);
                this.strightRouteEl.appendChild(this.trainEl);
            }

            else if (DirectionUtils.isVerticalAxis(this.from, this.to)) {
                this.appendChild(this.strightRouteEl);
                this.strightRouteEl.classList.add(`from-${this.from}`);
                this.strightRouteEl.appendChild(this.trainEl);
            }
        }

        if (this.from && !this.to) {
            this.classList.add(`from-${this.from}`);
            this.appendChild(this.stopEl);
            this.stopEl.classList.add(`from-${this.from}`);
            this.stopEl.appendChild(this.trainEl);
            this.trainEl.classList.remove('--moving');
        }

        if (this.to && !this.from) {
            this.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.appendChild(this.startEl);
            this.startEl.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.startEl.appendChild(this.trainEl);
            this.trainEl.classList.add('--moving');
        }

        if (!this.to && !this.from) {
            this.appendChild(this.stopEl);
            this.stopEl.appendChild(this.trainEl);
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