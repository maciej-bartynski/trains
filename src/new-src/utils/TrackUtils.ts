import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import TrackKind from "../enums/TrackKind.js";
import Orientation, { OrientationGeneral, TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import Direction from "../enums/Direction.js";
import OrientationUtils from "./OrientationUtils.js";

export function canBuildLandTrack(
    address: Address,
    game: BoardModel,
    trackKind: TrackKind,
    options: {
        orientations: Orientation
    }) {

    const {
        field,
        buildings,
        tracks,
    } = game.getStateByAddress(address) ?? {};

    if (buildings || !field?.state.terrain) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold].includes(field.state.terrain)) {
        return false;
    }

    type TrackNode = Direction | 'center';

    const getOccupiedNodes = (orientation?: Orientation | null): Set<TrackNode> => {
        const occupied = new Set<TrackNode>();
        if (!orientation) return occupied;

        if (orientation.center) {
            occupied.add('center');
            Object.entries(orientation.center).forEach(([dir, isConnected]) => {
                if (isConnected) occupied.add(dir as Direction);
            });
        }

        Object.entries(orientation).forEach(([node, connections]) => {
            if (node === 'center' || !connections) return;
            const hasConnection = Object.values(connections).some(Boolean);
            if (hasConnection) occupied.add(node as Direction);
            if ((connections as Record<string, boolean>)['center']) occupied.add('center');
        });

        return occupied;
    };

    const getEdges = (orientation?: Orientation | null): Set<string> => {
        const edges = new Set<string>();
        if (!orientation) return edges;

        const addEdge = (a: TrackNode, b: TrackNode) => {
            const key = [a, b].sort().join('|'); // left-top == top-left
            edges.add(key);
        };

        if (orientation.center) {
            Object.entries(orientation.center).forEach(([dir, isConnected]) => {
                if (isConnected) addEdge('center', dir as Direction);
            });
        }

        Object.entries(orientation).forEach(([fromNode, connections]) => {
            if (fromNode === 'center' || !connections) return;
            Object.entries(connections).forEach(([toNode, isConnected]) => {
                if (isConnected) addEdge(fromNode as Direction, toNode as TrackNode);
            });
        });

        return edges;
    };

    const isSubset = (subset: Set<string>, superset: Set<string>) => {
        for (const v of subset) {
            if (!superset.has(v)) return false;
        }
        return true;
    };

    const newNodes = getOccupiedNodes(options.orientations);
    const newEdges = getEdges(options.orientations);
    const existingOrientations = Object.assign({}, tracks?.state.orientations ?? {});

    const existingNodesByKind = Object.entries(existingOrientations).reduce<Record<string, Set<TrackNode>>>(
        (acc, [kind, orientation]) => {
            acc[kind] = getOccupiedNodes(orientation as Orientation | null);
            return acc;
        },
        {}
    );

    const existingEdgesByKind = Object.entries(existingOrientations).reduce<Record<string, Set<string>>>(
        (acc, [kind, orientation]) => {
            acc[kind] = getEdges(orientation as Orientation | null);
            return acc;
        },
        {}
    );

    const hasAnyExistingTrack = Object.values(existingNodesByKind).some(nodes => nodes.size > 0);
    const anyExistingCenter = Object.values(existingNodesByKind).some(nodes => nodes.has('center'));

    // Center always occupies whole field.
    if (newNodes.has('center')) {
        return !hasAnyExistingTrack;
    }

    // If something already uses center, nothing else can be built.
    if (anyExistingCenter) {
        return false;
    }

    // Duplicate only if ALL new edges already exist for SAME kind.
    const sameKindEdges = existingEdgesByKind[trackKind];
    if (sameKindEdges && isSubset(newEdges, sameKindEdges)) {
        return false;
    }

    // Different track kinds cannot share any node.
    for (const [existingKind, existingNodes] of Object.entries(existingNodesByKind)) {
        if (existingKind === trackKind) continue;
        const overlaps = [...newNodes].some(node => existingNodes.has(node));
        if (overlaps) return false;
    }

    return true;
}

type CanBuildParams = {
    address: Address,
    trackKind: TrackKind,
    options: {
        orientations: Orientation
    }
}

enum TrackVariantName {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
    TopRight = 'top-right',
    RightBottom = 'right-bottom',
    BottomLeft = 'bottom-left',
    LeftTop = 'left-top',
    CenterTop = 'center-top',
    CenterRight = 'center-right',
    CenterBottom = 'center-bottom',
    CenterLeft = 'center-left'
}

const TRUE = true as true;
const FALSE = false as false;

const TrackVariantVertical = {
    variant: TrackVariantName.Vertical,
    orientation: {
        [Direction.Top]: {
            [Direction.Right]: FALSE,
            [Direction.Bottom]: TRUE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Right]: null,
        [Direction.Bottom]: {
            [Direction.Top]: TRUE,
            [Direction.Right]: FALSE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Left]: null,
        'center': null,
    }
}
const TrackVariantHorizontal = {
    variant: TrackVariantName.Horizontal,
    orientation: {
        [Direction.Top]: null,
        [Direction.Bottom]: null,
        [Direction.Right]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: TRUE,
            'center': FALSE,
        },
        [Direction.Left]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Right]: TRUE,
            'center': FALSE,
        },
        'center': null,
    }
}
const TrackVariantTR = {
    variant: TrackVariantName.TopRight,
    orientation: {
        [Direction.Top]: {
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            [Direction.Right]: TRUE,
            'center': FALSE,
        },
        [Direction.Bottom]: null,
        [Direction.Right]: {
            [Direction.Top]: TRUE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Left]: null,
        'center': null,
    }
}
const TrackVariantRB = {
    variant: TrackVariantName.RightBottom,
    orientation: {
        [Direction.Top]: null,
        [Direction.Right]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: TRUE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Bottom]: {
            [Direction.Top]: FALSE,
            [Direction.Right]: TRUE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Left]: null,
        'center': null,
    }
}
const TrackVariantBL = {
    variant: TrackVariantName.BottomLeft,
    orientation: {
        [Direction.Top]: null,
        [Direction.Right]: null,
        [Direction.Bottom]: {
            [Direction.Top]: FALSE,
            [Direction.Right]: FALSE,
            [Direction.Left]: TRUE,
            'center': FALSE,
        },
        [Direction.Left]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: TRUE,
            [Direction.Right]: FALSE,
            'center': FALSE,
        },
        'center': null,
    }
}
const TrackVariantLT = {
    variant: TrackVariantName.LeftTop,
    orientation: {
        [Direction.Top]: {
            [Direction.Right]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: TRUE,
            'center': FALSE,
        },
        [Direction.Right]: null,
        [Direction.Bottom]: null,
        [Direction.Left]: {
            [Direction.Top]: TRUE,
            [Direction.Bottom]: FALSE,
            [Direction.Right]: FALSE,
            'center': FALSE,
        },
        'center': null,
    }
}
const TrackVariantCenterTop = {
    variant: TrackVariantName.CenterTop,
    orientation: {
        [Direction.Top]: {
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            [Direction.Right]: FALSE,
            'center': TRUE,
        },
        [Direction.Right]: null,
        [Direction.Bottom]: null,
        [Direction.Left]: null,
        'center': {
            [Direction.Top]: TRUE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            [Direction.Right]: FALSE,
        }
    }
}
const TrackVariantCenterRight = {
    variant: TrackVariantName.CenterRight,
    orientation: {
        [Direction.Top]: null,
        [Direction.Right]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            'center': TRUE,
        },
        [Direction.Bottom]: null,
        [Direction.Left]: null,
        'center': {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            [Direction.Right]: TRUE,
        }
    }
}
const TrackVariantCenterBottom = {
    variant: TrackVariantName.CenterBottom,
    orientation: {
        [Direction.Top]: null,
        [Direction.Right]: null,
        [Direction.Bottom]: {
            [Direction.Top]: FALSE,
            [Direction.Right]: FALSE,
            [Direction.Left]: FALSE,
            'center': TRUE,
        },
        [Direction.Left]: null,
        'center': {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: TRUE,
            [Direction.Left]: FALSE,
            [Direction.Right]: FALSE,
        }
    }
}
const TrackVariantCenterLeft = {
    variant: TrackVariantName.CenterLeft,
    orientation: {
        [Direction.Top]: null,
        [Direction.Right]: null,
        [Direction.Bottom]: null,
        [Direction.Left]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Right]: FALSE,
            'center': TRUE,
        },
        'center': {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: TRUE,
            [Direction.Right]: FALSE,
        }
    }
}

const TrackVariants = {
    TrackVariantVertical,
    TrackVariantHorizontal,
    TrackVariantTR,
    TrackVariantRB,
    TrackVariantBL,
    TrackVariantLT,
    TrackVariantCenterTop,
    TrackVariantCenterRight,
    TrackVariantCenterBottom,
    TrackVariantCenterLeft,
}

function isTrackCross(kind: TrackKind, address: Address, game: BoardModel): boolean {
    const data = game.getStateByAddress(address);
    if (!data) {
        return false;
    }

    const track = data.tracks?.state.orientations[kind];

    if (!track) {
        return false;
    }

    const otherKindsNotExist = Object.values(TrackKind).every(trackKind => {
        if (trackKind === kind) {
            return true;
        }
        const notExist = !(data.tracks?.state.orientations[trackKind]);
        return notExist;
    });

    if (!otherKindsNotExist) {
        return false;
    }

    if (track.center) {
        return false;
    }

    const edges = new Set<string>();
    const addEdge = (a: TrackNode, b: TrackNode) => {
        const key = [a, b].sort().join('|');
        edges.add(key);
    };

    Object.entries(track as OrientationGeneral).forEach(directionConnection => {
        const [direction, connections] = directionConnection as [TrackNode, TrackNodeConnections | null];
        if (direction === 'center' || !connections) {
            return;
        }
        Object.entries(connections).forEach(entry => {
            const [connectedDirection, isConnected] = entry as [TrackNode, boolean];
            if (!isConnected || connectedDirection === 'center') {
                return;
            }
            addEdge(direction, connectedDirection);
        });
    });

    const hasVertical = edges.has([Direction.Top, Direction.Bottom].sort().join('|'));
    const hasHorizontal = edges.has([Direction.Left, Direction.Right].sort().join('|'));

    return hasVertical && hasHorizontal;
}

function isTrackStraight(kind: TrackKind, address: Address, game: BoardModel) {
    const data = game.getStateByAddress(address);
    if (!data) {
        return false;
    }

    const track = data.tracks?.state.orientations[kind];

    if (!track) {
        return false;
    }

    const otherKindsNotExist = Object.values(TrackKind).every(trackKind => {
        if (trackKind === kind) {
            return true;
        }
        const notExist = !(data.tracks?.state.orientations[trackKind]);
        return notExist;
    });

    const otherKindsExist = !otherKindsNotExist;

    if (otherKindsExist) {
        return false;
    }

    let firstFound: TrackNode | null = null;
    let secondFound: TrackNode | null = null;

    for (const _dir in track as OrientationGeneral) {
        const direction = _dir as TrackNode;
        const connections = track[direction] as null | Record<TrackNode, boolean>;

        if (direction === 'center' && connections) {
            break;
        } else if (direction === 'center') {
            continue;
        } else if (!connections) {
            continue;
        }

        let connectedDirection: TrackNode | null = null;

        const connectionsAmount = Object.entries(connections).filter(entry => {
            const [dir, conn] = entry as [TrackNode, boolean];
            const connected = dir !== 'center' && conn;
            if (connected) {
                connectedDirection = dir;
                return true;
            }
            return false
        }).length;

        if (connectionsAmount > 1) {
            break;
        }

        if (direction && connectedDirection && OrientationUtils.OpositeDirections[direction] === connectedDirection) {
            firstFound = direction;
            secondFound = connectedDirection;
            break;
        }
    }

    if (!firstFound || !secondFound) {
        return false;
    }

    return Object.entries(track).every(entry => {
        const [key, value] = entry as [TrackNode, TrackNodeConnections | null];

        if (key === 'center') {
            return value
                ? Object.values(value).filter(bool => bool).length === 0
                : true;
        }

        if (key === firstFound || key === secondFound) {
            return value ? Object.values(value).filter(bool => bool).length === 1 : false;
        }

        return value ? Object.values(value).filter(bool => bool).length === 0 : true;
    })
}

function isTrackCenter(kind: TrackKind, address: Address, game: BoardModel) {
    const data = game.getStateByAddress(address);
    if (!data) {
        return false;
    }

    const track = data.tracks?.state.orientations[kind];

    if (!track) {
        return false;
    }

    const otherKindsNotExist = Object.values(TrackKind).every(trackKind => {
        if (trackKind === kind) {
            return true;
        }
        const notExist = !(data.tracks?.state.orientations[trackKind]);
        return notExist;
    });

    const otherKindsExist = !otherKindsNotExist;

    if (otherKindsExist) {
        return false;
    }

    if (!track.center) {
        return false;
    }

    let centerEdges = 0;
    let nonCenterEdges = 0;

    Object.entries(track as OrientationGeneral).forEach(connectionEntry => {
        const [key, value] = connectionEntry as [TrackNode, TrackNodeConnections | null];
        if (key === 'center' || !value) {
            return;
        }
        Object.entries(value).forEach(entry => {
            const [connectedDirection, isConnected] = entry as [TrackNode, boolean];
            if (!isConnected) {
                return;
            }
            if (connectedDirection === 'center') {
                centerEdges += 1;
            } else {
                nonCenterEdges += 1;
            }
        });
    });

    return centerEdges === 1 && nonCenterEdges === 0;
}

interface trackUtils {
    TrackVariants: typeof TrackVariants;
    game?: BoardModel;
    isTrackCross(kind: TrackKind, address: Address, game: BoardModel): boolean;
    isTrackCenter(kind: TrackKind, address: Address, game: BoardModel): boolean;
    isTrackStraight(kind: TrackKind, address: Address, game: BoardModel): boolean;
    canBuild(params: CanBuildParams): boolean;
    canBuildLandTrack(address: Address, game: BoardModel, trackKind: TrackKind, options: { orientations: Orientation }): boolean;
}

const TrackUtils: trackUtils = {
    canBuild({
        address,
        trackKind,
        options
    }: CanBuildParams) {
        if (!this.game) return false;

        switch (trackKind) {

            case TrackKind.Railway: {
                return this.canBuildLandTrack(address, this.game, trackKind, options);
            }

            case TrackKind.Road: {
                return this.canBuildLandTrack(address, this.game, trackKind, options);
            }

            default: {
                return false;
            }

        }
    },
    canBuildLandTrack,
    isTrackCross,
    isTrackCenter,
    isTrackStraight,
    TrackVariants
}

export default TrackUtils;