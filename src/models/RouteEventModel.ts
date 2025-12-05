import Service from "#src/framework/Service/Service.js";
import Address from "#src/types/Address";
import Direction from "#src/types/Direction";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";

type RouteEventState = TrainRouteEvent & {
    trainId: string,
    state: 'before' | 'progress' | 'after',
    order: number,
    locator: string,
}

class RouteEventModel extends Service<RouteEventState> {

    state: RouteEventState;

    private constructor(params: RouteEventState) {
        super();
        this.state = params;

        this.state.state = 'before';
        this.state.light = TrainTrespassingLight.Red;

        this.clearSelf = this.clearSelf.bind(this);
        this.onAfter = this.onAfter.bind(this);
        this.onBefore = this.onBefore.bind(this);
    }

    static bookEvent(params: {
        trainId: string,
        order: number
    } & TrainRouteEvent): RouteEventModel | void {
        const train = Service.gameBoard.getTrain(params.trainId);
        const field = Service.gameBoard.getField(params.address);
        if (train && field) {
            const event = new RouteEventModel({
                locator: 'constructor',
                state: 'before',
                ...params,
            });
            Service.gameBoard.setEvent(event);
            field.registerEvent(event);
            // train.registerEvent(event);
            // event.subscribe(train.onEventUpdate);
            event.subscribe(field.onEventUpdate);
            // event.setState({
            //     state: 'before'
            // });
            return event;
        }

    }

    public clearSelf() {
        const train = Service.gameBoard.getTrain(this.state.trainId);
        const field = Service.gameBoard.getField(this.state.address);

        if (train) {
            // this.unsubscribe(train.onEventUpdate);
            // train.setState({
            //     // locator: 'clearSelf',
            //     events: train.state.events.filter((ev) => {
            //         return ev !== this
            //     })
            // })
        }

        if (field) {
            this.unsubscribe(field.onEventUpdate);
            field.setState({
                events: field.state.events.filter((ev) => ev !== this)
            })
        }

        Service.gameBoard.deleteEvent(this.state.trainId);
    }

    public lightRed() {
        this.setState({
            locator: 'lightRed',
            light: TrainTrespassingLight.Red
        })
    }

    public lightGreen() {
        this.setState({
            locator: 'lightGreen',
            light: TrainTrespassingLight.Green
        })
    }

    public onBefore() {
        if (this.state.light === TrainTrespassingLight.Green) {
            this.setState({
                locator: 'onBefore',
                state: 'progress'
            })
        }
    }

    public onAfter() {
        if (this.state.state === 'progress') {
            this.setState({
                locator: 'onAfter',
                state: 'after'
            });
        }
    }

    static fromJSON(json: RouteEventState): RouteEventModel {
        return new RouteEventModel(json);
    }

    public toJSON(): RouteEventState {
        return this.state
    }
}

export default RouteEventModel;

