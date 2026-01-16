import State from "../framework/State.js"
import { EventState } from "./EventsModel.type";

class EventModel extends State<EventState> {
    constructor(data: EventState) {
        super({ initialState: data, store: 'events' });
    }
}

export default EventModel