import GameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";
import Direction from "#src/types/Direction.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import FieldModel from "./FieldModel.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "#src/components/GameFieldElement/GameFieldElement.js";

interface TrainState {
    id: string;
    name: string;
    location: Address; // if equall to route[0].address, it's departuring.
    direction: Direction | null; // if null, it's Awaiting on node center. If route[0].from is null, it's departuring.
    route: TrainRouteEvent[];
    journey: Array<TrainRouteEvent[]>;
    destination: Address | null;
    randomColor: string;
}

const colors = [
    'red',
    'green',
    'pink',
    "blueviolet",
    "rgb(226, 43, 192)",
    "rgb(0, 140, 255)",
    "rgb(0, 229, 255)",
    "rgb(0, 255, 174)",
    "rgb(0, 255, 98)",
    "rgb(72, 255, 0)",
    "rgb(183, 255, 0)",
    "rgb(255, 247, 0)",
    "rgb(255, 157, 0)",
    "rgb(255, 102, 0)",
    "burlywood",
    "rgb(222, 135, 135)",
    "rgb(222, 189, 135)",
    "rgb(147, 222, 135)",
    "rgb(135, 222, 195)",]

class TrainModel implements TrainState {
    private _id: string;
    private _name: string;
    private _route: TrainRouteEvent[];
    private _journey: Array<TrainRouteEvent[]>;
    private _location: Address;
    private _destination: Address | null;
    private _direction: Direction | null = null;
    private _randomColor: string;

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get route() {
        return this._route;
    }

    get journey() {
        return this._journey;
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

    get randomColor() {
        return this._randomColor;
    }

    get state(): TrainState {
        return {
            id: this._id,
            name: this._name,
            route: this._route,
            journey: this._journey,
            destination: this._destination,
            location: this._location,
            direction: this.direction,
            randomColor: this._randomColor,

        }
    }

    private constructor(params: TrainState) {
        this._id = params.id;
        this._name = params.name;
        this._route = params.route;
        this._journey = params.journey;
        this._location = params.location;
        this._destination = params.destination;
        this._randomColor = params.randomColor;
        this.onFieldListener = this.onFieldListener.bind(this);
        this.setRoute = this.setRoute.bind(this);
        this.onFieldListener = this.onFieldListener.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.setJourney = this.setJourney.bind(this);
    }

    _routeReady = false;

    private _trespassingInProgress: number | null = null;
    private async onFieldListener(field: FieldModel) {

        if (this._route.length === 0
            && this._destination
            && AddressUtils.isAddressEqual(this._destination, field.address)
            && this._trespassingInProgress === null
        ) {
            const nextRoute = this._journey.shift();
            if (nextRoute) this.setRoute({ route: nextRoute });
        }

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

                const nextField = this._route[1] ? GameBoard.getInstance().getField(this._route[1].address) : null;
                nextField?.signalTrespassing({ trainId: this._id });

                if (!this._route[1]) {
                    this._location = field.address;
                    this._route.shift();
                    field.signalTrespassed({ trainId: this._id });
                    field.unsubscribe(this.onFieldListener)
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

            const prevField = GameBoard.getInstance().getField(this._location);
            if (!prevField) {
                /** not possible */
                return
            }

            this._location = fieldEvent.address;
            this._direction = fieldEvent.from;
            this._route.shift();
            field.signalTrespassing({ trainId: this._id });
            prevField.signalTrespassed({ trainId: this._id });
            prevField.unsubscribe(this.onFieldListener)
        }
    }

    public setJourney(params: {
        journey: Array<TrainRouteEvent[]>
    }) {
        const journeyWithourFirstRoute = [...params.journey];
        const firstRoute = journeyWithourFirstRoute.shift();
        if (firstRoute) {
            this._journey = journeyWithourFirstRoute;
            this.setRoute(({ route: firstRoute }))
        }
    }

    public setRoute(params: { route: TrainRouteEvent[] }) {
        const { route } = params;
        this._route = route;
        this._routeReady = false;

        const destination = this._route[this._route.length - 1]?.address;
        if (!destination) return;
        this._destination = destination;

        this._route.forEach((event) => {
            const field = GameBoard.getInstance().getField(event.address);
            if (!field) {
                return;
            }
            field.subscribe(this.onFieldListener);
            field.bookTrainRoute({ event, id: this.id });
        });

        this._routeReady = true;
        const nextField = this.route[0] ? GameBoard.getInstance().getField(this.route[0].address) : null;
        if (nextField) {
            nextField.signalTrespassing({ trainId: this._id });
        }
    }

    static build(params: { address: Address }) {
        const { address } = params;

        const id = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

        const name = `Train ${(Object.entries(GameBoard.getInstance().trains).length ?? 0) + 1}`;

        const randomColor = colors[Math.round(Math.random() * (colors.length - 1))] ?? 'purple';

        const newModel = new TrainModel({
            id,
            name,
            location: address,
            route: [],
            journey: [],
            direction: null,
            destination: null,
            randomColor,
        });

        const field = GameBoard.getInstance().getField(params.address);
        if (field) {
            const fieldEl = GameBoard.getInstance().getFieldElement(params.address);
            fieldEl?.appendTrainAnimation({ from: newModel._direction, to: newModel._direction, trainId: newModel._id })
        }

        return newModel;
    }

    public toJSON(): TrainState {
        return JSON.parse(JSON.stringify(this.state));
    }

    static fromJSON(json: TrainState): TrainModel {
        const model = new TrainModel(json);
        const field = GameBoard.getInstance().getField(json.location);
        if (field) {
            const fieldEl = GameBoard.getInstance().getFieldElement(json.location);
            fieldEl?.appendTrainAnimation({ from: model.direction, to: model.direction, trainId: model.id })
        }
        return model;
    }
}

export default TrainModel;