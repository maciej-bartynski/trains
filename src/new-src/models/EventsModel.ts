import State from "../framework/State.js"
import PieceEnum from "./BoardModel.type.js";
import { EventState } from "./EventsModel.type";

class EventModel extends State<EventState> {
    constructor(data: EventState) {
        super({ initialState: data, store: PieceEnum.Events });
    }
}

export default EventModel