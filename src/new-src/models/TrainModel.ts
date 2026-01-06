import State from "../framework/State.js";
import { TrainState } from "./TrainModel.type.js";

class TrainModel extends State<TrainState> {
    constructor(data: TrainState) {
        super({ initialState: data })
    }
}

export default TrainModel