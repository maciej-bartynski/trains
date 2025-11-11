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
        const el = document.createElement('div');
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
        this.trainEl.style.backgroundColor = this.color;
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
        }

        if (this.to && !this.from) {
            this.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.appendChild(this.startEl);
            this.startEl.classList.add(`from-${DirectionUtils.OpositeDirection[this.to]}`);
            this.startEl.appendChild(this.trainEl);
        }
    }


    connectedCallback() {

    }

    disconnectedCallback() {
        this.removeAttribute('class');
        this.innerHTML = '';
    }

    static selectTrainByTrainId(trainId: string) {
        if (trainId) {
            return null
        }
        return document.querySelector(`[data-train="${trainId}"]`);
    }
}

customElements.define(TrainRunElement.componentName, TrainRunElement);

export default TrainRunElement;