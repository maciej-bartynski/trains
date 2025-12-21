import Service from "#src/framework/Service/Service.js";
import ResourceKind from "#src/types/ResourceKind";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";

type RouteEventState = TrainRouteEvent & {
    trainId: string,
    state: 'before' | 'progress' | 'after',
    order: number,
    operations?: ({
        type: 'pick-up' | 'dump',
        resource: ResourceKind,
    }[]) | undefined
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
        this.defineOperations = this.defineOperations.bind(this)
    }

    static bookEvent(event: RouteEventModel): RouteEventModel | void {
        const train = Service.gameBoard.getTrain(event.state.trainId);
        const field = Service.gameBoard.getField(event.state.address);
        if (train && field) {
            // const event = new RouteEventModel({
            //     state: 'before',
            //     ...params,
            // });
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

    public defineOperations(operations: RouteEventModel['state']['operations']) {
        this.setState({
            operations: operations!
        })
    }

    static fromJSON(json: RouteEventState): RouteEventModel {
        return new RouteEventModel(json);
    }

    public toJSON(): RouteEventState {
        return this.state
    }
}

export default RouteEventModel;

