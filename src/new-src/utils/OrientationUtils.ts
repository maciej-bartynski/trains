import Direction from "../enums/Direction.js";
import Orientation, { OrientationGeneral, TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";

const mergeConnections = (params: {
    direction: TrackNode,
    connections: TrackNodeConnections | null,
    connectionsUpdate: TrackNodeConnections | null,
}) => {
    const { direction, connections, connectionsUpdate } = params;

    if (!connections && !connectionsUpdate) {
        return null;
    } else if (connections && !connectionsUpdate) {
        return connections;
    } else if (!connections && connectionsUpdate) {
        return connectionsUpdate;
    }

    const getValueOrFalse = (param: TrackNodeConnections | null, value: TrackNode) => {
        if (!param) return false;
        return param[value] ?? false;
    }

    const mergedConnections = {
        [Direction.Top]: getValueOrFalse(connections, Direction.Top) || getValueOrFalse(connectionsUpdate, Direction.Top),
        [Direction.Right]: getValueOrFalse(connections, Direction.Right) || getValueOrFalse(connectionsUpdate, Direction.Right),
        [Direction.Bottom]: getValueOrFalse(connections, Direction.Bottom) || getValueOrFalse(connectionsUpdate, Direction.Bottom),
        [Direction.Left]: getValueOrFalse(connections, Direction.Left) || getValueOrFalse(connectionsUpdate, Direction.Left),
        "center": getValueOrFalse(connections, 'center') || getValueOrFalse(connectionsUpdate, 'center'),
    }

    delete mergedConnections[direction];

    return mergedConnections;
}

const mergeOrientationOfSameKind = (params: {
    orientation: Orientation,
    orientationUpdate: Orientation
}) => {

    const { orientation, orientationUpdate } = params;

    const mergedOrientation: OrientationGeneral = {
        [Direction.Top]: mergeConnections({
            direction: Direction.Top,
            connections: orientation[Direction.Top],
            connectionsUpdate: orientationUpdate[Direction.Top]
        }),
        [Direction.Right]: mergeConnections({
            direction: Direction.Right,
            connections: orientation[Direction.Right],
            connectionsUpdate: orientationUpdate[Direction.Right]
        }),
        [Direction.Bottom]: mergeConnections({
            direction: Direction.Bottom,
            connections: orientation[Direction.Bottom],
            connectionsUpdate: orientationUpdate[Direction.Bottom]
        }),
        [Direction.Left]: mergeConnections({
            direction: Direction.Left,
            connections: orientation[Direction.Left],
            connectionsUpdate: orientationUpdate[Direction.Left]
        }),
        'center': mergeConnections({
            direction: 'center',
            connections: orientation['center'],
            connectionsUpdate: orientationUpdate['center']
        })
    };

    return mergedOrientation;
}

const mergeOrientations = (params: {
    orientations: Record<TrackKind, Orientation | null>,
    orientationsUpdate: Partial<Record<TrackKind, Orientation | null>>,
}) => {
    const { orientations, orientationsUpdate } = params;

    const mergedOrientations: Record<TrackKind, Orientation | null> = {
        [TrackKind.Railway]: null,
        [TrackKind.Road]: null,
        [TrackKind.Sail]: null,
        [TrackKind.Fly]: null,
    }

    Object.values(TrackKind).forEach((trackKind) => {
        const fromOrientations = orientations[trackKind];
        const fromUpdation = orientationsUpdate[trackKind] ?? null;

        if (!fromOrientations) {
            mergedOrientations[trackKind] = fromUpdation;
            return;
        }

        if (!fromUpdation) {
            mergedOrientations[trackKind] = fromOrientations;
            return;
        }

        mergedOrientations[trackKind] = mergeOrientationOfSameKind({
            orientation: fromOrientations,
            orientationUpdate: fromUpdation
        }) as Orientation
    });

    return mergedOrientations;
}

const NormalizedEmptyConnections: TrackNodeConnections = {
    [Direction.Top]: false,
    [Direction.Right]: false,
    [Direction.Bottom]: false,
    [Direction.Left]: false,
    'center': false,
}

const NormalizedEmptyOrientation: Orientation = {
    [Direction.Top]: null,
    [Direction.Right]: null,
    [Direction.Bottom]: null,
    [Direction.Left]: null,
    'center': null,
}

const NormalizedEmptyAllOrientations = {
    [TrackKind.Railway]: null,
    [TrackKind.Road]: null,
    [TrackKind.Fly]: null,
    [TrackKind.Sail]: null,
}

const isEmptyNodeConnections = (nodeConnections: TrackNodeConnections | null) => {
    if (nodeConnections) {
        return Object
            .entries(nodeConnections)
            .every(connectionEntry => {
                const [direction, isConnected] = connectionEntry as [TrackNode, boolean];
                return !isConnected;
            })
    }
    return true;
}

const isEmptyOrientation = (orientation: Orientation | null) => {
    if (orientation) {
        return Object
            .entries(orientation)
            .every(entry => {
                const [direction, nodeConnections] = entry as [TrackNode, TrackNodeConnections | null];
                return isEmptyNodeConnections(nodeConnections)
            });
    }

    return true;
}

const tokenizeNodeConnections = (nodeConnections: null | TrackNodeConnections): string => {
    const normalizedConnections = isEmptyNodeConnections(nodeConnections)
        ? NormalizedEmptyConnections
        : nodeConnections!

    const connectionsToken = Object.entries(normalizedConnections).map(entry => {
        const [direction, isConnected] = entry as [Direction, boolean];
        return `${direction}:${isConnected}`;
    }).sort().join(',');

    return connectionsToken;
}
const tokenizeOrientation = (orientation: Orientation | null): string => {

    const orientationDefinition = isEmptyOrientation(orientation)
        ? NormalizedEmptyOrientation
        : orientation!;

    const orientationToken = Object.entries(orientationDefinition).map(entry => {
        const [direction, nodeConnections] = entry as [TrackNode, TrackNodeConnections];
        return `[${direction}]:{${tokenizeNodeConnections(nodeConnections)}}`;
    }).sort().join(',');

    return orientationToken;
}


const OpositeDirections = {
    [Direction.Bottom]: Direction.Top,
    [Direction.Left]: Direction.Right,
    [Direction.Top]: Direction.Bottom,
    [Direction.Right]: Direction.Left,
}

const OrientationUtils = {
    mergeConnections,
    mergeOrientations,
    mergeOrientationOfSameKind,
    OpositeDirections,

    isEmptyNodeConnections,
    isEmptyOrientation,
    NormalizedEmptyAllOrientations,
    NormalizedEmptyOrientation,
    tokenizeNodeConnections,
    tokenizeOrientation
}

export default OrientationUtils;