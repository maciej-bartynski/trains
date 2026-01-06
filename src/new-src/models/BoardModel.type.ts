import BuildingModel from "./BuildingModel.js";
import EventsModel from "./EventsModel.js";
import FieldModel from "./FieldModel.js";
import TrainModel from "./TrainModel.js";

type addresAsKey = string;
type uniqueIdAsKey = string;

type BoardState = {
    fields: Map<addresAsKey, FieldModel>,
    events: Map<addresAsKey, EventsModel[]>,
    buildings: Map<addresAsKey, BuildingModel>,
    trains: Map<uniqueIdAsKey, TrainModel>,
}

export type {
    BoardState,
    addresAsKey,
    uniqueIdAsKey,
}

