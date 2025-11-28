import GameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";
import Direction from "#src/types/Direction.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import FieldModel from "./FieldModel.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "#src/components/GameFieldElement/GameFieldElement.js";
import Service from "#src/framework/Service/Service.js";

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

class TrainModel extends Service<TrainState> {
    state: TrainState;

    private constructor(params: TrainState) {
        super();
        this.state = params;
        this.onFieldListener = this.onFieldListener.bind(this);
        this.setRoute = this.setRoute.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.setJourney = this.setJourney.bind(this);
    }

    _routeReady = false;

    private _trespassingInProgress: number | null = null;

    private async onFieldListener(field: FieldModel['state']) {
        const fieldModel = GameBoard.getInstance().getField(field.address);
        if (!fieldModel) return;
        if (this.state.route.length === 0
            && this.state.destination
            && AddressUtils.isAddressEqual(this.state.destination, field.address)
            && this._trespassingInProgress === null
        ) {
            const nextRoute = this.state.journey.shift();
            if (nextRoute) this.setRoute({ route: nextRoute });
        }

        if (!this._routeReady || this._trespassingInProgress !== null) {
            /** Possibly still preparing or already moving*/
            return;
        }

        const fieldEvent = field.events.find(event => event.id === this.state.id);

        if (!fieldEvent) {
            return
        }

        const isCurrEv = this.state.route[0] && AddressUtils.isAddressEqual(fieldEvent.address, this.state.route[0]!.address);
        const isNextEv = this.state.route[1] && AddressUtils.isAddressEqual(fieldEvent.address, this.state.route[1]!.address);

        if (isCurrEv) {
            const isAlreadyResolved = fieldEvent.to === this.state.direction;
            if (isAlreadyResolved) {
                return;
            }
            const hasGreenLight = fieldEvent.light === TrainTrespassingLight.Green;
            if (!hasGreenLight) {
                return;
            }

            const fieldElement = document.querySelector(`[data-key="${AddressUtils.toKey(this.state.location)}"]`) as GameFieldElement;
            fieldElement.appendTrainAnimation({ from: fieldEvent.from, to: fieldEvent.to, trainId: this.state.id });

            this._trespassingInProgress = setTimeout(() => {

                this.state.direction = fieldEvent.to;
                this._trespassingInProgress = null;

                const nextField = this.state.route[1] ? GameBoard.getInstance().getField(this.state.route[1].address) : null;
                nextField?.signalTrespassing({ trainId: this.state.id });

                if (!this.state.route[1]) {
                    this.state.location = field.address;
                    this.state.route.shift();
                    fieldModel.signalTrespassed({ trainId: this.state.id });
                    fieldModel.unsubscribe(this.onFieldListener)
                }
            }, fieldEvent.durationMiliseconds);
        }

        if (isNextEv) {


            const prevEv = this.state.route[0];
            if (!prevEv) {
                /** already handled */
                return;
            }
            const isPrevResolved = prevEv.to === this.state.direction && AddressUtils.isAddressEqual(prevEv.address, this.state.location);
            if (!isPrevResolved) {
                /** Not yet here */
                return;
            }
            const hasGreenLight = fieldEvent.light === TrainTrespassingLight.Green;
            if (!hasGreenLight) {
                return;
            }

            const prevField = GameBoard.getInstance().getField(this.state.location);
            if (!prevField) {
                /** not possible */
                return
            }

            this.state.location = fieldEvent.address;
            this.state.direction = fieldEvent.from;
            this.state.route.shift();
            fieldModel.signalTrespassing({ trainId: this.state.id });
            prevField.signalTrespassed({ trainId: this.state.id });
            prevField.unsubscribe(this.onFieldListener)
        }
    }

    public setJourney(params: {
        journey: Array<TrainRouteEvent[]>
    }) {
        const journeyWithourFirstRoute = [...params.journey];
        const firstRoute = journeyWithourFirstRoute.shift();
        if (firstRoute) {
            this.setState({ journey: journeyWithourFirstRoute })
            this.setRoute(({ route: firstRoute }))
        }
    }

    public setRoute(params: { route: TrainRouteEvent[] }) {
        const { route } = params;
        this.setState({
            route
        })
        this._routeReady = false;

        const destination = this.state.route[this.state.route.length - 1]?.address;
        if (!destination) return;
        this.setState({
            destination
        })

        this.state.route.forEach((event) => {
            const field = GameBoard.getInstance().getField(event.address);
            if (!field) {
                return;
            }
            field.subscribe(this.onFieldListener);
            field.bookTrainRoute({ event, id: this.state.id });
        });

        this._routeReady = true;

        const nextField = this.state.route[0] ? GameBoard.getInstance().getField(this.state.route[0].address) : null;
        if (nextField) {
            nextField.signalTrespassing({ trainId: this.state.id });
        }
    }

    static build(params: { address: Address }) {
        const { address } = params;

        const id = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

        const name = `Train ${(Object.entries(GameBoard.getInstance().state.trains).length ?? 0) + 1}`;

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

        return newModel;
    }

    public toJSON(): TrainState {
        return JSON.parse(JSON.stringify(this.state));
    }

    static fromJSON(json: TrainState): TrainModel {
        const model = new TrainModel(json);
        return model;
    }
}

export default TrainModel;