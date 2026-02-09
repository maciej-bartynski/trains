import Direction from "../enums/Direction.js";
import Orientation, { OrientationGeneral, TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import type BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import OrientationUtils from "./OrientationUtils.js";

enum BaseRailwayTrackVariantName {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
    TopRight = 'top-right',
    RightBottom = 'right-bottom',
    BottomLeft = 'bottom-left',
    LeftTop = 'left-top',
}

const TRUE = true as true;
const FALSE = false as false;

const TrackVariantVertical = {
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
const TrackVariantHorizontal = {

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
const TrackVariantTR = {

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
const TrackVariantRB = {

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
const TrackVariantBL = {

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

const TrackVariantLT = {

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

const RailwayBaseVariants = {
    [BaseRailwayTrackVariantName.Vertical]: TrackVariantVertical,
    [BaseRailwayTrackVariantName.Horizontal]: TrackVariantHorizontal,
    [BaseRailwayTrackVariantName.TopRight]: TrackVariantTR,
    [BaseRailwayTrackVariantName.RightBottom]: TrackVariantRB,
    [BaseRailwayTrackVariantName.BottomLeft]: TrackVariantBL,
    [BaseRailwayTrackVariantName.LeftTop]: TrackVariantLT,
}

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

const mergeRailwayOrientations = (params: {
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

const isBaseVariantAllowed = (
    variant: typeof RailwayBaseVariants[keyof typeof RailwayBaseVariants],
    address: Address,
    game: BoardModel
): boolean => {
    const fieldData = game.getStateByAddress(address);
    if (!fieldData || !fieldData?.field) return false;
    if (!fieldData?.tracks) return true;
    const tracks = fieldData.tracks.state.orientations;
    const allBlockingOrientationsAreEmpty = Object.values(TrackKind).every(kind => {
        if (kind === TrackKind.Fly) {
            return true;
        }
        if (kind === TrackKind.Railway) {
            return true;
        }
        return OrientationUtils.isEmptyOrientation(tracks[kind]);
    });
    if (allBlockingOrientationsAreEmpty) return true;

    let isOccupied = false;
    Object.entries(variant).forEach(entry => {
        const [demandedNode, demandedConnections] = entry as [Direction, TrackNodeConnections];
        const isDemanded = !OrientationUtils.isEmptyNodeConnections(demandedConnections);
        if (isDemanded) {
            Object.entries(tracks).forEach(trackEntry => {
                if (isOccupied) {
                    return;
                }

                const [kind, orientationOfKind] = trackEntry as [TrackKind, Orientation | null];

                if (kind === TrackKind.Fly) {
                    return;
                }
                if (OrientationUtils.isEmptyOrientation(orientationOfKind) || !orientationOfKind) {
                    return;
                }
                isOccupied = isOccupied || !OrientationUtils.isEmptyNodeConnections(orientationOfKind[demandedNode]);
            });
        }
    });
    return !isOccupied;
}

function canBuildRailway(
    nextBaseRailOriantation: typeof RailwayBaseVariants[keyof typeof RailwayBaseVariants],
    address: Address,
    game: BoardModel,
): boolean {
    const demandedBaseOrientationToken = OrientationUtils.tokenizeOrientation(nextBaseRailOriantation);
    const demandedVariantName = Object.entries(RailwayBaseVariants).find(entry => {
        const [variantName, variantConfig] = entry as [BaseRailwayTrackVariantName, Orientation];
        const tokenConfig = OrientationUtils.tokenizeOrientation(variantConfig);
        if (tokenConfig === demandedBaseOrientationToken) {
            return true;
        }
        return false;
    })
    if (!demandedVariantName) {
        return false;
    }
    const isAllowed = isBaseVariantAllowed(nextBaseRailOriantation, address, game);
    const _currentRail = game.getStateByAddress(address)?.tracks?.state.orientations.railway;
    const currentRail = OrientationUtils.isEmptyOrientation(_currentRail ?? null)
        ? OrientationUtils.NormalizedEmptyOrientation
        : _currentRail;

    const updatedRailOrientation = mergeRailwayOrientations({
        orientation: currentRail!,
        orientationUpdate: nextBaseRailOriantation,
    });

    const anythingChanged = OrientationUtils.tokenizeOrientation(updatedRailOrientation as any) !==
        OrientationUtils.tokenizeOrientation(currentRail!);

    return anythingChanged && isAllowed;
}

interface railwayUtils {
    Variants: typeof RailwayBaseVariants,
    mergeRailwayOrientations: (params: {
        orientation: Orientation;
        orientationUpdate: Orientation;
    }) => OrientationGeneral;
    canBuildRailway(orientation: Orientation, address: Address, game: BoardModel): boolean;
}

const RailwayUtils: railwayUtils = {
    Variants: RailwayBaseVariants,
    canBuildRailway,
    mergeRailwayOrientations
}

export default RailwayUtils;