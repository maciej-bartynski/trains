import Direction from "./Direction";

type TresspasingDirectionsFromEdgeTrackNode<From extends Direction> = Omit<{
    'center': false,
    [Direction.Bottom]: boolean,
    [Direction.Left]: boolean,
    [Direction.Right]: boolean,
    [Direction.Top]: boolean
}, From>

type ArrivingDirectionsFromEdgeTrackNode<From extends Direction> = Omit<{
    'center': boolean,
    [Direction.Bottom]: false,
    [Direction.Left]: false,
    [Direction.Right]: false,
    [Direction.Top]: false,
}, From>

type DeparturingDirectionsFromCenterTrackNode = {
    [Direction.Bottom]: boolean,
    [Direction.Left]: boolean,
    [Direction.Right]: boolean,
    [Direction.Top]: boolean,
}

type TrespassingTrackOrientation = {
    'center': null,
    [Direction.Bottom]: null | TresspasingDirectionsFromEdgeTrackNode<Direction.Bottom>,
    [Direction.Left]: null | TresspasingDirectionsFromEdgeTrackNode<Direction.Left>,
    [Direction.Right]: null | TresspasingDirectionsFromEdgeTrackNode<Direction.Right>,
    [Direction.Top]: null | TresspasingDirectionsFromEdgeTrackNode<Direction.Top>
}
type WithCenterTrackOrientation = {
    'center': DeparturingDirectionsFromCenterTrackNode,
    [Direction.Bottom]: null | ArrivingDirectionsFromEdgeTrackNode<Direction.Bottom>,
    [Direction.Left]: null | ArrivingDirectionsFromEdgeTrackNode<Direction.Left>,
    [Direction.Right]: null | ArrivingDirectionsFromEdgeTrackNode<Direction.Right>,
    [Direction.Top]: null | ArrivingDirectionsFromEdgeTrackNode<Direction.Top>
}

type Orientation = TrespassingTrackOrientation | WithCenterTrackOrientation

export default Orientation;

type TrackNode = Direction | 'center';
type TrackNodeConnections = Partial<Record<TrackNode, boolean>>;
type OrientationGeneral = Record<TrackNode, TrackNodeConnections | null>;

export type {
    TrackNode,
    TrackNodeConnections,
    OrientationGeneral
}
