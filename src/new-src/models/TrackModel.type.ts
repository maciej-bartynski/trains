import Orientation from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import Address from "../types/Address.js";

type TrackState = {
    _id: string,
    address: Address,
    orientations: Record<TrackKind, Orientation | null>
};

export type {
    TrackState
}