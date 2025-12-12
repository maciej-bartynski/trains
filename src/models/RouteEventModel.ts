import Service from "#src/framework/Service/Service.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";

type RouteEventState = TrainRouteEvent & {
    trainId: string,
    state: 'before' | 'progress' | 'after',
    order: number,
}

class RouteEventModel extends Service<RouteEventState> {

    state: RouteEventState;

    private constructor(params: RouteEventState) {
        super();
        this.state = params;

        this.state.state = params.state ?? 'before';
        this.state.light = TrainTrespassingLight.Red;

        this.clearSelf = this.clearSelf.bind(this);
        this.onAfter = this.onAfter.bind(this);
        this.onBefore = this.onBefore.bind(this);
        this.lightGreen = this.lightGreen.bind(this);
        this.lightRed = this.lightRed.bind(this);
    }

    static bookEvent(params: {
        trainId: string,
        order: number
    } & TrainRouteEvent): RouteEventModel | void {
        const train = Service.gameBoard.getTrain(params.trainId);
        const field = Service.gameBoard.getField(params.address);
        if (train && field) {
            const event = new RouteEventModel({
                state: 'before',
                ...params,
            });
            field.registerEvent(event);
            return event;
        }

    }

    public clearSelf() {
        const field = Service.gameBoard.getField(this.state.address);
        if (field) {
            field.unregisterEvent(this);
        }
    }

    public lightRed() {
        this.setState({
            light: TrainTrespassingLight.Red
        })
    }

    public lightGreen() {
        this.setState({
            light: TrainTrespassingLight.Green
        })
    }

    public onBefore() {
        if (this.state.light === TrainTrespassingLight.Green) {
            this.setState({
                state: 'progress'
            })
        }
    }

    public onAfter() {
        if (this.state.state === 'progress') {
            this.setState({
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

