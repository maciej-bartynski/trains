import State from "../framework/State.js"
import { EventsState } from "./EventsModel.type";

class EventsModel extends State<EventsState> {
    constructor(data: EventsState) {
        super({ initialState: data });
    }
}

export default EventsModel