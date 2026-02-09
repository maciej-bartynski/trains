import Direction from "../enums/Direction.js";
import Orientation, { TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";

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
    OpositeDirections,
    isEmptyNodeConnections,
    isEmptyOrientation,
    NormalizedEmptyAllOrientations,
    NormalizedEmptyOrientation,
    tokenizeNodeConnections,
    tokenizeOrientation
}

export default OrientationUtils;