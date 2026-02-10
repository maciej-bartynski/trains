import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import TrackKind from "../enums/TrackKind.js";
import Orientation, { OrientationGeneral, TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import Direction from "../enums/Direction.js";
import OrientationUtils from "./OrientationUtils.js";
import SailUtils from "./SailUtils.js";
import RoadUtils from "./RoadUtils.js";
import RailwayUtils from "./RailwayUtils.js";

function canBuildRailway(
    address: Address,
    game: BoardModel,
    options: {
        orientation: Orientation
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

    const canBuild = RailwayUtils.canBuildRailway(
        options.orientation,
        address,
        game
    );

    return canBuild;
}

function canBuildRoad(
    address: Address,
    game: BoardModel,
    options: {
        orientation: Orientation
    }
): boolean {
    const fieldData = game.getStateByAddress(address);
    const field = fieldData?.field;
    const tracks = fieldData?.tracks;
    const buildings = fieldData?.buildings;
    if (buildings) return false;
    if (!field || !field.state.terrain) {
        return false;
    }
    const disallowedTerrain = [TerrainKind.Water, TerrainKind.WaterCold];
    if (disallowedTerrain.includes(field.state.terrain)) {
        return false;
    }

    const existingRoadOrientation = getOrientationOfKind({
        kind: TrackKind.Road,
        orientations: tracks?.state.orientations,
    }) ?? OrientationUtils.NormalizedEmptyOrientation;

    const allowedSailOrientations = RoadUtils.getAllowedRoadOrientations(existingRoadOrientation, address, game);

    if (!allowedSailOrientations.length) {
        return false;
    }

    const demandedOrientation = options.orientation;
    const nothingChanged = OrientationUtils.tokenizeOrientation(demandedOrientation) === OrientationUtils.tokenizeOrientation(existingRoadOrientation);

    if (nothingChanged) {
        return false;
    }

    const isNewOrientationAllowed = allowedSailOrientations.some(allowedOrientationName => {
        const allowedOrientation = RoadUtils.Orientations[allowedOrientationName];
        const allowedTokenized = OrientationUtils.tokenizeOrientation(allowedOrientation);
        const demandedTokenized = OrientationUtils.tokenizeOrientation(demandedOrientation);
        return demandedTokenized === allowedTokenized;
    });

    return isNewOrientationAllowed;
}

const getOrientationOfKind = (params: {
    kind: TrackKind,
    orientations: Record<TrackKind, Orientation | null> | undefined
}): Orientation | null => {
    const orientations = params.orientations || OrientationUtils.NormalizedEmptyAllOrientations;
    const orientation = orientations[params.kind];
    return orientation;
}

function canBuildSail(
    address: Address,
    game: BoardModel,
    options: {
        orientation: Orientation
    }
): boolean {

    const {
        field,
        tracks,
        buildings
    } = game.getStateByAddress(address) ?? {};

    if (!field?.state.terrain) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold].includes(field.state.terrain)) {
        return false;
    }

    if (buildings) {
        return false
    }

    const existingSailOrientation = getOrientationOfKind({
        kind: TrackKind.Sail,
        orientations: tracks?.state.orientations,
    }) ?? OrientationUtils.NormalizedEmptyOrientation;

    const allowedSailOrientations = SailUtils.getAllowedSailOrientations(existingSailOrientation);

    if (!allowedSailOrientations.length) {
        return false;
    }

    if (tracks) {
        const otherTrackFound = Object.values(TrackKind).some(kind => {
            return kind !== TrackKind.Sail && getOrientationOfKind({
                kind,
                orientations: tracks?.state.orientations,
            })
        })

        if (otherTrackFound) {
            return false;
        }
    }

    const demandedOrientation = options.orientation;

    const nothingChanged = OrientationUtils.tokenizeOrientation(demandedOrientation) === OrientationUtils.tokenizeOrientation(existingSailOrientation);

    if (nothingChanged) {
        return false;
    }

    const isNewOrientationAllowed = allowedSailOrientations.some(allowedOrientationName => {
        const allowedOrientation = SailUtils.Orientations[allowedOrientationName];
        const allowedTokenized = OrientationUtils.tokenizeOrientation(allowedOrientation);
        const demandedTokenized = OrientationUtils.tokenizeOrientation(demandedOrientation);
        return demandedTokenized === allowedTokenized;
    });

    if (isNewOrientationAllowed) {
        const isAdjacentToWater = SailUtils.getIsSailOrientationAdjacentToWater({
            game,
            address,
            sailOrientation: demandedOrientation
        });

        return isAdjacentToWater;
    }

    return false;
}

type CanBuildParams = {
    address: Address,
    trackKind: TrackKind,
    options: {
        orientation: Orientation
    }
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
    game?: BoardModel;
    isTrackCross(kind: TrackKind, address: Address, game: BoardModel): boolean;
    isTrackCenter(kind: TrackKind, address: Address, game: BoardModel): boolean;
    isTrackStraight(kind: TrackKind, address: Address, game: BoardModel): boolean;
    canBuild(params: CanBuildParams): boolean;
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
                return canBuildRailway(address, this.game, options);
            }

            case TrackKind.Road: {
                return canBuildRoad(address, this.game, options);
            }

            case TrackKind.Sail: {
                return canBuildSail(address, this.game, options);
            }

            default: {
                return false;
            }

        }
    },
    isTrackCross,
    isTrackCenter,
    isTrackStraight,
}

export default TrackUtils;