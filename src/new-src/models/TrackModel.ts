import State from "../framework/State.js";
import PieceEnum from "./BoardModel.type.js";
import { TrackState } from "./TrackModel.type.js";

class TrackModel extends State<TrackState> {
    constructor(data: TrackState) {
        super({ initialState: data, store: PieceEnum.Tracks })
    }
}

export default TrackModel