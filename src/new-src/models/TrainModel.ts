import State from "../framework/State.js";
import PieceEnum from "./BoardModel.type.js";
import { TrainState } from "./TrainModel.type.js";

class TrainModel extends State<TrainState> {
    constructor(data: TrainState) {
        super({ initialState: data, store: PieceEnum.Trains })
    }
}

export default TrainModel