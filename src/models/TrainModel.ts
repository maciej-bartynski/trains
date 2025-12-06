import GameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";
import Direction from "#src/types/Direction.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import Service from "#src/framework/Service/Service.js";
import RouteEventModel from "./RouteEventModel.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";

interface TrainState {
    id: string;
    name: string;
    location: Address; // if equall to route[0].address, it's departuring.
    direction: Direction | null; // if null, it's Awaiting on node center. If route[0].from is null, it's departuring.
    journey: Array<TrainRouteEvent[]>;
    routeCurrentEvent: number;
    events: RouteEventModel[];
    destination: Address | null;
    randomColor: string;
    trespassingProgress: number;
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
        this.setJourney = this.setJourney.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.requestTrespassingCurrentEvent = this.requestTrespassingCurrentEvent.bind(this);
        this.onProgressEventListener = this.onProgressEventListener.bind(this);
        this.addRoute = this.addRoute.bind(this);
    }

    private trespassingInterval: number | null = null;

    private async onProgressEventListener(eventState: RouteEventModel['state']) {
        if (this.trespassingInterval) {
            /** 
             * Already in progress.
            */
            return;
        }

        const events = this.state.events;
        const index = this.state.routeCurrentEvent;

        const updatedEvent = events.find(ev => ev.state.order === eventState.order);
        const currentEvent = events.find(ev => ev.state.order === index);

        if (!currentEvent || (currentEvent !== updatedEvent)) {
            /**
             * Something went wrong.
             */
            return
        }

        if (currentEvent.state.light !== TrainTrespassingLight.Green) {
            /** wait */
            return;
        }

        /**
         * Clearing previous event:
        */
        this.setState({
            events: events.filter((ev, idx) => {
                const isPastEvent = ev.state.order < index;
                if (isPastEvent) {
                    ev.clearSelf();
                    return false;
                }
                return true;
            })
        })

        this.setState({
            direction: currentEvent.state.from,
            location: currentEvent.state.address
        });

        if (this.trespassingInterval === null) {
            const trespassingIntervalMilisec = currentEvent.state.durationMiliseconds / 100;
            let nextProgress = this.state.trespassingProgress ?? 0;
            this.trespassingInterval = setInterval(() => {
                nextProgress++;
                this.setState({
                    trespassingProgress: nextProgress
                });
                if ((nextProgress >= 100) && this.trespassingInterval) {
                    clearInterval(this.trespassingInterval);
                    currentEvent.unsubscribe(this.onProgressEventListener);
                    currentEvent.onAfter();
                    nextProgress = 0;
                    this.setState({
                        direction: currentEvent.state.to,
                        routeCurrentEvent: index + 1,
                        trespassingProgress: 0
                    });
                    this.trespassingInterval = null;
                    this.requestTrespassingCurrentEvent();

                }
            }, trespassingIntervalMilisec);
        }
    }

    public addRoute(params: {
        route: TrainRouteEvent[]
    }) {
        this.setState({
            journey: [
                ...this.state.journey,
                params.route
            ]
        })
    }

    public setJourney(params: {
        journey: Array<TrainRouteEvent[]>
    }) {
        const journeyWithoutFirstRoute = [...params.journey];
        const firstRoute = journeyWithoutFirstRoute.shift();

        if (firstRoute && !this.state.events.length) {

            const destination = firstRoute[firstRoute.length - 1]?.address;
            if (!destination) return;

            const events = firstRoute.map((data, order) => {
                const event = RouteEventModel.bookEvent({
                    ...data,
                    trainId: this.state.id,
                    order,
                });
                return event;
            });

            if (events.every(ev => !!ev)) {
                this.setState({
                    events,
                    journey: journeyWithoutFirstRoute,
                    routeCurrentEvent: 0,
                    destination,
                })

                setTimeout(() => {
                    this.requestTrespassingCurrentEvent();
                }, 150)
            }
        }
    }

    private requestTrespassingCurrentEvent() {
        const currentEvent = this.state.events.find(ev => ev.state.order === this.state.routeCurrentEvent);
        if (currentEvent) {
            currentEvent.subscribe(this.onProgressEventListener);
            currentEvent.onBefore();
        } else {
            this.state.events.forEach(ev => ev.clearSelf())
            this.setState({
                events: []
            })
            this.setJourney({
                journey: this.state.journey
            })
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
            events: [],
            routeCurrentEvent: 0,
            journey: [],
            direction: null,
            destination: null,
            randomColor,
            trespassingProgress: 0
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