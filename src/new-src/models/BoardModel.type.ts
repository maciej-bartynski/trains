import Address from "../types/Address.js";
import BuildingModel from "./BuildingModel.js";
import { BuildingState } from "./BuildingModel.type.js";
import EventModel from "./EventsModel.js";
import { EventState } from "./EventsModel.type.js";
import FieldModel from "./FieldModel.js";
import { FieldState } from "./FieldModel.type.js";
import TrackModel from "./TrackModel.js";
import { TrackState } from "./TrackModel.type.js";
import TrainModel from "./TrainModel.js";
import { TrainState } from "./TrainModel.type.js";

type addresAsKey = string;
type uniqueIdAsKey = string;

enum PieceEnum {
    Fields = 'fields',
    Buildings = 'buildings',
    Events = 'events',
    Trains = 'trains',
    Tracks = 'tracks',
    SelectedField = 'selectedField',
}

type BoardState = {
    [PieceEnum.Fields]: Map<addresAsKey, FieldModel>,
    [PieceEnum.Events]: Map<addresAsKey, EventModel>,
    [PieceEnum.Buildings]: Map<addresAsKey, BuildingModel>,
    [PieceEnum.Trains]: Map<uniqueIdAsKey, TrainModel>,
    [PieceEnum.Tracks]: Map<uniqueIdAsKey, TrackModel>,
    [PieceEnum.SelectedField]: null | Address,
}

type SetupState = {
    [PieceEnum.Fields]: Record<addresAsKey, FieldState>,
    [PieceEnum.Events]: Record<addresAsKey, EventState>,
    [PieceEnum.Buildings]: Record<addresAsKey, BuildingState>,
    [PieceEnum.Trains]: Record<uniqueIdAsKey, TrainState>,
    [PieceEnum.Tracks]: Record<uniqueIdAsKey, TrackState>,
    [PieceEnum.SelectedField]: null | Address,
}

export default PieceEnum;

export type {
    BoardState,
    addresAsKey,
    uniqueIdAsKey,
    SetupState
}

