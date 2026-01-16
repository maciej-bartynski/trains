import State from "../framework/State.js"
import { BuildingState } from "./BuildingModel.type.js";

class BuildingModel extends State<BuildingState> {
    constructor(data: BuildingState) {
        super({ initialState: data, store: 'buildings' });
    }
}

export default BuildingModel