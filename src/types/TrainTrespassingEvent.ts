import Address from "./Address.js";
import Direction from "./Direction.js";
import TrainTresspasingLight from "./TrainTresspasingLight.js";

type TrainRouteEvent = {
    light: TrainTresspasingLight;
    from: Direction | null, // if null, it's departure
    to: Direction | null, // if null, it's arrival
    address: Address,
    durationMiliseconds: number,
    cost: number // only last one counts
};

type TrainDepartureEvent = TrainRouteEvent & {
    from: null;
    to: Direction
}

type TrainArrivalEvent = TrainRouteEvent & {
    to: null;
    from: Direction;
}

type TrainTrespassingEvent = TrainRouteEvent & {
    to: Direction;
    from: Direction;
}

export default TrainRouteEvent;

export type {
    TrainTrespassingEvent,
    TrainArrivalEvent,
    TrainDepartureEvent
}