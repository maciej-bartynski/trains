import State from "../framework/State.js"
import PieceEnum from "./BoardModel.type.js";
import { BuildingState } from "./BuildingModel.type.js";

class BuildingModel extends State<BuildingState> {
    constructor(data: BuildingState) {
        if (!BuildingModel.game) {
            throw new Error('FieldModel: game is not initialized yet.')
        }

        super({ initialState: data, store: PieceEnum.Buildings });
    }
}

export default BuildingModel