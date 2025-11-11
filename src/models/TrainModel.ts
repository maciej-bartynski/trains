import gameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";
import Direction from "#src/types/Direction.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import FieldModel from "./FieldModel.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "#src/components/GameFieldElement/GameFieldElement.js";
import TrainRunElement from "#src/components/TrainRun/TrainRun.js";
import TrainTrespassingEvent from "#src/types/TrainTrespassingEvent.js";

interface TrainState {
    id: string;
    location: Address; // if equall to route[0].address, it's departuring.
    direction: Direction | null; // if null, it's Awaiting on node center. If route[0].from is null, it's departuring.
    route: TrainRouteEvent[];
    destination: Address | null;
}

const colors = ['red', 'green', 'blue', 'black', 'pink', 'yellow']

class TrainModel implements TrainState {
    private _id: string;
    private _route: TrainRouteEvent[];
    private _location: Address;
    private _destination: Address | null;
    private _direction: Direction | null = null;

    get id() {
        return this._id;
    }

    get route() {
        return this._route;
    }

    get destination() {
        return this._destination
    }
    get location() {
        return this._location;
    }

    get direction() {
        return this._direction;
    }

    randomColor = 'purple';

    private constructor(params: TrainState) {
        this._id = params.id;
        this._route = params.route;
        this._location = params.location;
        this._destination = params.destination;


        this.onFieldListener = this.onFieldListener.bind(this);
        this.setRoute = this.setRoute.bind(this);
        this.onFieldListener = this.onFieldListener.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.clearPrevAnimation = this.clearPrevAnimation.bind(this);
        this.startNextAnimation = this.startNextAnimation.bind(this);

        const randomColor = colors[Math.round(Math.random() * 5)];
        this.randomColor = randomColor!;

    }

    _routeReady = false;

    private clearPrevAnimation(address: Address) {
        const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(address)}"]`) as GameFieldElement;
        const animationElement = fieldElement?.querySelector(TrainRunElement.componentName) as TrainRunElement;
        if (animationElement) {
            console.log("the 3")
            animationElement.remove();
        }
    }

    private startNextAnimation() {
        const field = gameBoard.getField(this.location);
        if (!field) {
            return;
        }

        const event = field.events.find(event => event.id === this.id);
        if (!event) {
            return;
        }

        const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(this.location)}"]`) as GameFieldElement;
        const animationEl = document.createElement(TrainRunElement.componentName) as TrainRunElement;
        animationEl.setRoute({ from: event.from, to: event.to });
        fieldElement.appendChild(animationEl)
    }

    private _trespassingInProgress: number | null = null;
    private async onFieldListener(field: FieldModel) {


        if (!this._routeReady || this._trespassingInProgress !== null) {
            /** Possibly still preparing or already moving*/
            return;
        }

        const fieldEvent = field.events.find(event => event.id === this.id);

        if (!fieldEvent) {
            return
        }

        const isCurrEv = this.route[0] && AddressUtils.isAddressEqual(fieldEvent.address, this._route[0]!.address);
        const isNextEv = this.route[1] && AddressUtils.isAddressEqual(fieldEvent.address, this._route[1]!.address);

        if (isCurrEv) {

            const isAlreadyResolved = fieldEvent.to === this._direction;
            if (isAlreadyResolved) {
                return;
            }
            const hasGreenLight = fieldEvent.light === TrainTrespassingLight.Green;
            if (!hasGreenLight) {
                return;
            }

            const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(this.location)}"]`) as GameFieldElement;
            fieldElement.appendTrainAnimation({ from: fieldEvent.from, to: fieldEvent.to, trainId: this._id });

            this._trespassingInProgress = setTimeout(() => {

                this._direction = fieldEvent.to;
                this._trespassingInProgress = null;

                const nextField = this._route[1] ? gameBoard.getField(this._route[1].address) : null;
                nextField?.signalTrespassing({ trainId: this._id });

                if (!this._route[1]) {
                    this._location = field.address;
                    this._route.shift();
                    field.signalTrespassed({ trainId: this._id })
                    // const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(field.address)}"]`) as GameFieldElement;
                    // console.log("the 2", fieldElement)
                    // fieldElement.removeTrainAnimation({ trainId: this._id });

                }
            }, fieldEvent.durationMiliseconds);
        }

        if (isNextEv) {
            const prevEv = this.route[0];
            if (!prevEv) {
                /** already handled */
                return;
            }
            const isPrevResolved = prevEv.to === this._direction && AddressUtils.isAddressEqual(prevEv.address, this._location);
            if (!isPrevResolved) {
                /** Not yet here */
                return;
            }
            const hasGreenLight = fieldEvent.light === TrainTrespassingLight.Green;
            if (!hasGreenLight) {
                return;
            }

            const prevField = gameBoard.getField(this._location);
            if (!prevField) {
                /** not possible */
                return
            }

            this._location = fieldEvent.address;
            this._direction = fieldEvent.from;
            this._route.shift();
            field.signalTrespassing({ trainId: this._id });
            prevField.signalTrespassed({ trainId: this._id });

            // const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(prevField.address)}"]`) as GameFieldElement;
            // fieldElement.removeTrainAnimation({ trainId: this._id });
        }


    }

    public setRoute(params: { route: TrainRouteEvent[] }) {
        const { route } = params;
        this._route = route;
        this._routeReady = false;

        this._route.forEach((event) => {
            const field = gameBoard.getField(event.address);
            if (!field) {
                return;
            }
            field.subscribe(this.onFieldListener);
            field.bookTrainRoute({ event, id: this.id });
        });

        this._routeReady = true;
        const nextField = this.route[0] ? gameBoard.getField(this.route[0].address) : null;
        if (nextField) {
            nextField.signalTrespassing({ trainId: this._id });
        }
    }

    static build(params: { address: Address }) {
        const { address } = params;

        const id = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

        return new TrainModel({
            id,
            location: address,
            route: [],
            direction: null,
            destination: null,
        });
    }

    public toJSON(): TrainState {
        return JSON.parse(JSON.stringify(this));
    }

    static fromJSON(json: TrainState): TrainModel {
        return new TrainModel(json);
    }
}

export default TrainModel;