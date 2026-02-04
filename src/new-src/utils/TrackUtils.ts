import TerrainKind from "../enums/TerrainKind.js";
import Config from "#src/config.js";
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
    const existingSailOrientation = (existingOrientations as Record<TrackKind, Orientation | null>)[TrackKind.Sail] ?? null;
    if (existingSailOrientation && !existingSailOrientation.center) {
        const sailNodes = getOccupiedNodes(existingSailOrientation);
        const hasAllNodes = [Direction.Top, Direction.Right, Direction.Bottom, Direction.Left].every(node => sailNodes.has(node));
        if (hasAllNodes) {
            return false;
        }
    }

    const isEdgeToCenter = (orientation?: Orientation | null): Direction | null => {
        if (!orientation || !orientation.center) return null;
        const centerDirections = Object.entries(orientation.center)
            .filter(([, isConnected]) => isConnected)
            .map(([dir]) => dir as Direction);
        if (centerDirections.length !== 1) return null;
        const edgeDir = centerDirections[0] ?? null;
        if (!edgeDir) return null;
        const edgeConnections = orientation[edgeDir];
        if (!edgeConnections) return null;
        const edgeHasOnlyCenter = Object.entries(edgeConnections).every(([key, value]) => {
            if (key === 'center') return value === true;
            return value === false;
        });
        if (!edgeHasOnlyCenter) return null;
        return edgeDir;
    };

    // Center always occupies whole field (except for the 1x edge-to-center merge case).
    let allowCenterMerge = false;
    if (newNodes.has('center') && hasAnyExistingTrack) {
        const existingSameKind = (existingOrientations as Record<TrackKind, Orientation | null>)[trackKind] ?? null;
        const existingEdgeDir = isEdgeToCenter(existingSameKind);
        const newEdgeDir = isEdgeToCenter(options.orientations);
        const otherKindsExist = Object.entries(existingNodesByKind).some(([kind, nodes]) => {
            if (kind === trackKind) return false;
            return nodes.size > 0;
        });
        if (otherKindsExist || !existingEdgeDir || !newEdgeDir || existingEdgeDir === newEdgeDir) {
            return false;
        }
        allowCenterMerge = true;
    }

    // If something already uses center, nothing else can be built.
    if (anyExistingCenter && !allowCenterMerge) {
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
        const key = [a, b].sort().join('|');
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

const normalizeSailOrientation = (orientation: Orientation): Orientation => {
    if (orientation.center) {
        return orientation;
    }

    const nodes = [...getOccupiedNodes(orientation)].filter(node => node !== 'center') as Direction[];
    const allConnections: OrientationGeneral = {
        [Direction.Top]: null,
        [Direction.Right]: null,
        [Direction.Bottom]: null,
        [Direction.Left]: null,
        'center': null,
    };

    nodes.forEach(node => {
        const connections: TrackNodeConnections = {};
        nodes.forEach(other => {
            if (other !== node) {
                connections[other] = true;
            }
        });
        connections.center = false;
        allConnections[node] = connections;
    });

    return allConnections as Orientation;
};

const isEdgeToCenter = (orientation: Orientation | null): Direction | null => {
    if (!orientation || !orientation.center) return null;
    const centerDirections = Object.entries(orientation.center)
        .filter(([, isConnected]) => isConnected)
        .map(([dir]) => dir as Direction);
    if (centerDirections.length !== 1) return null;
    const edgeDir = centerDirections[0] ?? null;
    if (!edgeDir) return null;
    const edgeConnections = orientation[edgeDir];
    if (!edgeConnections) return null;
    const edgeHasOnlyCenter = Object.entries(edgeConnections).every(([key, value]) => {
        if (key === 'center') return value === true;
        return value === false;
    });
    if (!edgeHasOnlyCenter) return null;
    return edgeDir;
};

const buildEdgeToEdgeOrientation = (a: Direction, b: Direction): Orientation => {
    const connectionsFor = (other: Direction) => ({
        [Direction.Top]: false,
        [Direction.Right]: false,
        [Direction.Bottom]: false,
        [Direction.Left]: false,
        center: false,
        [other]: true,
    } as Record<Direction | 'center', boolean>);

    return {
        [Direction.Top]: a === Direction.Top || b === Direction.Top
            ? connectionsFor(a === Direction.Top ? b : a)
            : null,
        [Direction.Right]: a === Direction.Right || b === Direction.Right
            ? connectionsFor(a === Direction.Right ? b : a)
            : null,
        [Direction.Bottom]: a === Direction.Bottom || b === Direction.Bottom
            ? connectionsFor(a === Direction.Bottom ? b : a)
            : null,
        [Direction.Left]: a === Direction.Left || b === Direction.Left
            ? connectionsFor(a === Direction.Left ? b : a)
            : null,
        center: null,
    } as Orientation;
};

const mergeEdgeToCenter = (existing: Orientation | null, incoming: Orientation): Orientation | null => {
    const prevEdgeDir = isEdgeToCenter(existing);
    const newEdgeDir = isEdgeToCenter(incoming);
    if (prevEdgeDir && newEdgeDir && prevEdgeDir !== newEdgeDir) {
        return buildEdgeToEdgeOrientation(prevEdgeDir, newEdgeDir);
    }
    return null;
};

export function canBuildSail(
    address: Address,
    game: BoardModel,
    options: {
        orientations: Orientation
    }
) {
    const {
        field,
        tracks,
    } = game.getStateByAddress(address) ?? {};

    if (!field?.state.terrain) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold].includes(field.state.terrain)) {
        return false;
    }

    const newOrientation = options.orientations;

    const isWaterField = (addr: Address | null | undefined) => {
        if (!addr) return false;
        const state = game.getStateByAddress(addr)?.field?.state;
        if (!state?.terrain) return false;
        return [TerrainKind.Water, TerrainKind.WaterCold].includes(state.terrain);
    };

    const directionToAddress = (from: Address, direction: Direction): Address | null => {
        const max = Config.boardSize - 1;
        if (direction === Direction.Top) {
            return from.row - 1 >= 0 ? { row: from.row - 1, column: from.column } : null;
        }
        if (direction === Direction.Bottom) {
            return from.row + 1 <= max ? { row: from.row + 1, column: from.column } : null;
        }
        if (direction === Direction.Left) {
            return from.column - 1 >= 0 ? { row: from.row, column: from.column - 1 } : null;
        }
        if (direction === Direction.Right) {
            return from.column + 1 <= max ? { row: from.row, column: from.column + 1 } : null;
        }
        return null;
    };

    const newNodes = getOccupiedNodes(newOrientation);
    const newEdges = getEdges(newOrientation);

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

    // Center always occupies whole field (except for 1x edge-to-center merge case).
    let allowCenterMerge = false;
    if (newNodes.has('center') && hasAnyExistingTrack) {
        const existingSameKind = (existingOrientations as Record<TrackKind, Orientation | null>)[TrackKind.Sail] ?? null;
        const existingEdgeDir = isEdgeToCenter(existingSameKind);
        const newEdgeDir = isEdgeToCenter(newOrientation);
        const otherKindsExist = Object.entries(existingNodesByKind).some(([kind, nodes]) => {
            if (kind === TrackKind.Sail) return false;
            return nodes.size > 0;
        });
        if (otherKindsExist || !existingEdgeDir || !newEdgeDir || existingEdgeDir === newEdgeDir) {
            return false;
        }
        allowCenterMerge = true;
    }

    // If something already uses center, nothing else can be built.
    if (anyExistingCenter && !allowCenterMerge) {
        return false;
    }

    // Duplicate only if ALL new edges already exist for SAME kind.
    const sameKindEdges = existingEdgesByKind[TrackKind.Sail];
    const newIsVertical = newEdges.size === 1 && newEdges.has([Direction.Top, Direction.Bottom].sort().join('|'));
    const newIsHorizontal = newEdges.size === 1 && newEdges.has([Direction.Left, Direction.Right].sort().join('|'));
    const existingHasVertical = sameKindEdges?.has([Direction.Top, Direction.Bottom].sort().join('|')) ?? false;
    const existingHasHorizontal = sameKindEdges?.has([Direction.Left, Direction.Right].sort().join('|')) ?? false;
    const isPerpendicularStraight = (newIsVertical && existingHasHorizontal) || (newIsHorizontal && existingHasVertical);
    if (sameKindEdges && isSubset(newEdges, sameKindEdges) && !isPerpendicularStraight) {
        return false;
    }

    // If sail is not straight, no other kinds are allowed.
    const sailHasVertical = newEdges.has([Direction.Top, Direction.Bottom].sort().join('|'));
    const sailHasHorizontal = newEdges.has([Direction.Left, Direction.Right].sort().join('|'));
    const sailIsStraight = (sailHasVertical && !sailHasHorizontal) || (!sailHasVertical && sailHasHorizontal);
    const otherKindsExist = Object.entries(existingNodesByKind).some(([kind, nodes]) => {
        if (kind === TrackKind.Sail) return false;
        return nodes.size > 0;
    });
    if (!sailIsStraight && otherKindsExist) {
        return false;
    }

    // Different track kinds cannot share any node.
    for (const [existingKind, existingNodes] of Object.entries(existingNodesByKind)) {
        if (existingKind === TrackKind.Sail) continue;
        const overlaps = [...newNodes].some(node => existingNodes.has(node));
        if (overlaps) return false;
    }

    // Must connect to water or existing sail (cardinal only).
    const centerDirections = newOrientation.center
        ? (Object.entries(newOrientation.center)
            .filter(([, isConnected]) => isConnected)
            .map(([dir]) => dir as Direction))
        : [];
    const connectionDirections: Direction[] = newNodes.has('center')
        ? centerDirections
        : ([...newNodes].filter(node => node !== 'center') as Direction[]);

    const connectsToWater = connectionDirections.some((dir) => {
        const neighbor = directionToAddress(address, dir);
        return isWaterField(neighbor);
    });
    const existingSailNodes = existingNodesByKind[TrackKind.Sail] ?? new Set<TrackNode>();
    const connectsToSailOnSameTile = !newNodes.has('center') && connectionDirections.some((dir) => {
        return existingSailNodes.has(dir);
    });
    const connectsToSailFromNeighbor = connectionDirections.some((dir) => {
        const neighbor = directionToAddress(address, dir);
        if (!neighbor) return false;
        const neighborSail = game.getStateByAddress(neighbor)?.tracks?.state.orientations[TrackKind.Sail] ?? null;
        if (!neighborSail) return false;
        const neighborNodes = getOccupiedNodes(neighborSail);
        const opposite = OrientationUtils.OpositeDirections[dir];
        return neighborNodes.has(opposite);
    });
    if (newNodes.has('center')) {
        if (allowCenterMerge) {
            return true;
        }
        return connectsToWater || connectsToSailFromNeighbor;
    }

    if (isPerpendicularStraight) {
        return true;
    }

    if (!connectsToWater && !connectsToSailOnSameTile && !connectsToSailFromNeighbor) {
        return false;
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
    canBuildSail(address: Address, game: BoardModel, options: { orientations: Orientation }): boolean;
    normalizeSailOrientation(orientation: Orientation): Orientation;
    mergeEdgeToCenter(existing: Orientation | null, incoming: Orientation): Orientation | null;
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

            case TrackKind.Sail: {
                return canBuildSail(address, this.game, options);
            }

            default: {
                return false;
            }

        }
    },
    canBuildLandTrack,
    canBuildSail,
    isTrackCross,
    isTrackCenter,
    isTrackStraight,
    TrackVariants,
    normalizeSailOrientation,
    mergeEdgeToCenter
}

export default TrackUtils;