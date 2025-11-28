import GameBoard from "#src/GameBoard.js";
import Direction from "#src/types/Direction.js";
import DirectionUtils from "#src/utils/DirectionUtils.js";

class TrainRunElement extends HTMLElement {
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
        this.setRoute = this.setRoute.bind(this);
        this.render = this.render.bind(this);
    }

    color: string = 'purple';

    setColor(c: string) {
        this.color = c;
        this.trainEl.setAttribute('data-color', c)
    }

    setRoute(params: { from: Direction | null, to: Direction | null }) {
        const { from, to } = params;
        this.from = from;
        this.to = to;
        this.render();
    }

    render() {

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
            //this.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.appendChild(this.stopEl);
            // this.startEl.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.stopEl.appendChild(this.trainEl);
            this.trainEl.classList.remove('--moving');
        }
    }


    connectedCallback() {

    }

    disconnectedCallback() {
        this.removeAttribute('class');
        this.innerHTML = '';
    }

    static trainSelector(trainId: string, parent?: Element): TrainRunElement | null {
        if (!trainId) {
            return null
        }
        return (parent ?? document).querySelector(`${TrainRunElement.componentName}[data-train="${trainId}"]`);
    }

    static createTrainElement(params: {
        trainId: string
    }): TrainRunElement | void {
        const train = GameBoard.getInstance().getTrain(params.trainId);
        if (train) {
            const trainAnimation = document.createElement(TrainRunElement.componentName) as TrainRunElement;
            trainAnimation.setRoute({
                from: train.state.direction,
                to: train.state.direction
            });
            trainAnimation.setAttribute('data-train', params.trainId)
            trainAnimation.setColor(train.state.randomColor);
            return trainAnimation;
        }
    }
}

export default TrainRunElement;