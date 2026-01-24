import Orientation from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import State from "../framework/State.js";
import PieceEnum from "./BoardModel.type.js";
import { TrackState } from "./TrackModel.type.js";

class TrackModel extends State<TrackState> {
    constructor(data: TrackState) {
        super({ initialState: data, store: PieceEnum.Tracks });
        this.updateOrientation = this.updateOrientation.bind(this);
    }

    public updateOrientation(updatedOrientations: Record<TrackKind, Orientation | null>) {
        this.setState({
            orientations: updatedOrientations
        })
    }

}

export default TrackModel