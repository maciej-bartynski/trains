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

const station: Orientation = {
    [Direction.Top]: {
        [Direction.Bottom]: false,
        [Direction.Right]: false,
        [Direction.Left]: false,
        'center': true
    },
    [Direction.Right]: {
        [Direction.Bottom]: false,
        [Direction.Left]: false,
        [Direction.Top]: false,
        'center': true
    },
    [Direction.Bottom]: null,
    [Direction.Left]: null,
    'center': {
        [Direction.Top]: true,
        [Direction.Bottom]: false,
        [Direction.Left]: false,
        [Direction.Right]: true,
    }
}

const no_station: Orientation = {
    [Direction.Top]: null,
    [Direction.Right]: {
        [Direction.Bottom]: false,
        [Direction.Left]: true,
        [Direction.Top]: false,
        'center': false
    },
    [Direction.Bottom]: null,
    [Direction.Left]: {
        [Direction.Bottom]: false,
        [Direction.Top]: false,
        [Direction.Right]: true,
        'center': false
    },
    'center': null
}

export default Orientation;
