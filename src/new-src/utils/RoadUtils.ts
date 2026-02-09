import Direction from "../enums/Direction.js";
import Orientation, { TrackNodeConnections } from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import type BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import OrientationUtils from "./OrientationUtils.js";
import SailUtils from "./SailUtils.js";
import type { FALSE, NULL, TRUE } from "./true-false.js";

const connected: TRUE = true;
const not_connected: FALSE = false;
const empty: NULL = null;

enum RoadOrientationName {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
    TopRight = 'top-right',
    RightBottom = 'right-bottom',
    BottomLeft = 'bottom-left',
    LeftTop = 'left-top',
    CenterTop = 'center-top',
    CenterRight = 'center-right',
    CenterBottom = 'center-bottom',
    CenterLeft = 'center-left',
    // combined orientations
    VerticalLeft = 'vertical-left',
    VerticalRight = 'vertical-right',
    HorizontalTop = 'horizontal-top',
    HorizontalBottom = 'horizontal-bottom',
    HorizontalVertical = 'horizontal-vertical',
}

const RoadVertical = {
    [Direction.Top]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: not_connected,
        [Direction.Right]: not_connected,
        'center': not_connected,
    },
    [Direction.Bottom]: {
        [Direction.Top]: connected,
        [Direction.Left]: not_connected,
        [Direction.Right]: not_connected,
        'center': not_connected,
    },
    [Direction.Left]: empty,
    [Direction.Right]: empty,
    'center': empty,
}

const RoadHorizontal = {
    [Direction.Top]: empty,
    [Direction.Bottom]: empty,
    [Direction.Left]: {
        [Direction.Bottom]: not_connected,
        [Direction.Top]: not_connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Bottom]: not_connected,
        [Direction.Left]: connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadTopRight = {
    [Direction.Left]: empty,
    [Direction.Bottom]: empty,
    [Direction.Top]: {
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
        [Direction.Top]: connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadRightBottom = {
    [Direction.Top]: empty,
    [Direction.Left]: empty,
    [Direction.Right]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: not_connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    [Direction.Bottom]: {
        [Direction.Right]: connected,
        [Direction.Left]: not_connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadBottomLeft = {
    [Direction.Top]: empty,
    [Direction.Right]: empty,
    [Direction.Bottom]: {
        [Direction.Left]: connected,
        [Direction.Right]: not_connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    [Direction.Left]: {
        [Direction.Bottom]: connected,
        [Direction.Right]: not_connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadLeftTop = {
    [Direction.Bottom]: empty,
    [Direction.Right]: empty,
    [Direction.Left]: {
        [Direction.Top]: connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: not_connected,
        'center': not_connected,
    },
    [Direction.Top]: {
        [Direction.Left]: connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadCenterTop = {
    [Direction.Top]: {
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
        [Direction.Right]: not_connected,
        'center': connected,
    },
    [Direction.Right]: empty,
    [Direction.Bottom]: empty,
    [Direction.Left]: empty,
    'center': {
        [Direction.Top]: connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
    }
}

const RoadCenterRight = {
    [Direction.Top]: empty,
    [Direction.Right]: {
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
        [Direction.Top]: not_connected,
        'center': connected,
    },
    [Direction.Bottom]: empty,
    [Direction.Left]: empty,
    'center': {
        [Direction.Top]: not_connected,
        [Direction.Right]: connected,
        [Direction.Bottom]: not_connected,
        [Direction.Left]: not_connected,
    }
}

const RoadCenterBottom = {
    [Direction.Top]: empty,
    [Direction.Right]: empty,
    [Direction.Bottom]: {
        [Direction.Top]: not_connected,
        [Direction.Left]: not_connected,
        [Direction.Right]: not_connected,
        'center': connected,
    },
    [Direction.Left]: empty,
    'center': {
        [Direction.Top]: not_connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: connected,
        [Direction.Left]: not_connected,
    }
}

const RoadCenterLeft = {
    [Direction.Top]: empty,
    [Direction.Right]: empty,
    [Direction.Bottom]: empty,
    [Direction.Left]: {
        [Direction.Top]: not_connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: not_connected,
        'center': connected,
    },
    'center': {
        [Direction.Top]: not_connected,
        [Direction.Right]: not_connected,
        [Direction.Bottom]: not_connected,
        [Direction.Left]: connected,
    }
}

const RoadVerticalLeft = {
    [Direction.Right]: empty,
    [Direction.Top]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: connected,
        [Direction.Right]: not_connected,
        'center': not_connected,
    },
    [Direction.Bottom]: {
        [Direction.Top]: connected,
        [Direction.Left]: connected,
        [Direction.Right]: not_connected,
        'center': not_connected,
    },
    [Direction.Left]: {
        [Direction.Top]: connected,
        [Direction.Bottom]: connected,
        [Direction.Right]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadVerticalRight = {
    [Direction.Left]: empty,
    [Direction.Bottom]: {
        [Direction.Left]: not_connected,
        [Direction.Top]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Top]: {
        [Direction.Left]: not_connected,
        [Direction.Bottom]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: not_connected,
        [Direction.Top]: connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadHorizontalTop = {
    [Direction.Bottom]: empty,
    [Direction.Left]: {
        [Direction.Right]: connected,
        [Direction.Top]: connected,
        [Direction.Bottom]: not_connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Left]: connected,
        [Direction.Top]: connected,
        [Direction.Bottom]: not_connected,
        'center': not_connected,
    },
    [Direction.Top]: {
        [Direction.Left]: connected,
        [Direction.Right]: connected,
        [Direction.Bottom]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadHorizontalBottom = {
    [Direction.Top]: empty,
    [Direction.Left]: {
        [Direction.Right]: connected,
        [Direction.Top]: not_connected,
        [Direction.Bottom]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Left]: connected,
        [Direction.Top]: not_connected,
        [Direction.Bottom]: connected,
        'center': not_connected,
    },
    [Direction.Bottom]: {
        [Direction.Left]: connected,
        [Direction.Right]: connected,
        [Direction.Top]: not_connected,
        'center': not_connected,
    },
    'center': empty,
}

const RoadHorizontalVertical = {
    [Direction.Top]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: connected,
        [Direction.Top]: connected,
        'center': not_connected,
    },
    [Direction.Bottom]: {
        [Direction.Top]: connected,
        [Direction.Left]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Left]: {
        [Direction.Bottom]: connected,
        [Direction.Top]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    'center': empty
}

const RoadOrientations = Object.freeze({
    [RoadOrientationName.Vertical]: RoadVertical,
    [RoadOrientationName.Horizontal]: RoadHorizontal,
    [RoadOrientationName.TopRight]: RoadTopRight,
    [RoadOrientationName.RightBottom]: RoadRightBottom,
    [RoadOrientationName.BottomLeft]: RoadBottomLeft,
    [RoadOrientationName.LeftTop]: RoadLeftTop,
    [RoadOrientationName.CenterTop]: RoadCenterTop,
    [RoadOrientationName.CenterRight]: RoadCenterRight,
    [RoadOrientationName.CenterBottom]: RoadCenterBottom,
    [RoadOrientationName.CenterLeft]: RoadCenterLeft,
    [RoadOrientationName.VerticalLeft]: RoadVerticalLeft,
    [RoadOrientationName.VerticalRight]: RoadVerticalRight,
    [RoadOrientationName.HorizontalTop]: RoadHorizontalTop,
    [RoadOrientationName.HorizontalBottom]: RoadHorizontalBottom,
    [RoadOrientationName.HorizontalVertical]: RoadHorizontalVertical,
});

const narrowAllowedRoadOrientationsOnOccupiedField = (
    allowedRoadOrientations: RoadOrientationName[],
    address: Address,
    game: BoardModel,
): RoadOrientationName[] => {

    let roadOrientations: RoadOrientationName[] = [
        ...allowedRoadOrientations
    ]

    const fieldData = game.getStateByAddress(address);
    const tracks = fieldData?.tracks;

    if (tracks) {

        const sail = tracks.state.orientations[TrackKind.Sail];
        const railway = tracks.state.orientations[TrackKind.Railway];

        if (!OrientationUtils.isEmptyOrientation(sail) && sail) {
            const sailVariantName = SailUtils.findSailVariantNameByOrientation(sail);
            if (sailVariantName) {
                switch (sailVariantName) {
                    case SailUtils.OrientationName.Horizontal: {
                        return [
                            RoadOrientationName.Vertical
                        ];
                    }
                    case SailUtils.OrientationName.Vertical: {
                        return [
                            RoadOrientationName.Horizontal
                        ];
                    }
                }
                return [];
            }
        }


        if (railway) {
            allowedRoadOrientations.forEach(roadOrientationName => {
                const roadOrientation = RoadOrientations[roadOrientationName];
                const currentOrientationOverlapsWithRails = Object
                    .entries(roadOrientation)
                    .some(entry => {
                        const [roadNode, roadConnections] = entry as [Direction, TrackNodeConnections];
                        const roadWantToBeConnectedHere = !OrientationUtils.isEmptyNodeConnections(roadConnections);
                        const possiblyRailNodeConnections = railway[roadNode];
                        const butRailwayWasAlreadyConnectedHere = !OrientationUtils.isEmptyNodeConnections(possiblyRailNodeConnections);
                        return roadWantToBeConnectedHere && butRailwayWasAlreadyConnectedHere;
                    });

                if (currentOrientationOverlapsWithRails) {
                    roadOrientations = roadOrientations.filter(item => {
                        return item !== roadOrientationName;
                    });
                }
            });
        }

    }

    return roadOrientations;
}

const getAllowedRoadOrientations = (
    roadOriantation: Orientation,
    address: Address,
    game: BoardModel,
): RoadOrientationName[] => {

    const whichVariant = Object.entries(RoadOrientations).find((entry) => {
        const [variantName, orientationDefinition] = entry as [RoadOrientationName, Orientation];
        const definitionToken = OrientationUtils.tokenizeOrientation(orientationDefinition);
        const roadOrientationToken = OrientationUtils.tokenizeOrientation(roadOriantation);
        if (definitionToken === roadOrientationToken) {
            return variantName;
        }
        return false;
    });

    if (!whichVariant) {
        const roadOrientationsDueToOtherTrackKinds: RoadOrientationName[] = narrowAllowedRoadOrientationsOnOccupiedField(
            Object.values(RoadOrientationName),
            address,
            game
        );
        return roadOrientationsDueToOtherTrackKinds;
    }

    const [existingOrientationName] = whichVariant as [RoadOrientationName, Orientation];

    let roadOrientationsDueToExistingOrientation: RoadOrientationName[] = [];

    switch (existingOrientationName) {
        case RoadOrientationName.Vertical: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalVertical,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.VerticalRight,
            ];
            break;
        }

        case RoadOrientationName.Horizontal: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalVertical,
                RoadOrientationName.HorizontalTop,
                RoadOrientationName.HorizontalBottom,
            ];
            break;
        }

        case RoadOrientationName.CenterTop: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalTop,
                RoadOrientationName.HorizontalVertical,
                RoadOrientationName.Vertical,
                RoadOrientationName.TopRight,
                RoadOrientationName.LeftTop,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.VerticalRight,
            ];
            break;
        }

        case RoadOrientationName.CenterRight: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.TopRight,
                RoadOrientationName.RightBottom,
                RoadOrientationName.Horizontal,
                RoadOrientationName.HorizontalTop,
                RoadOrientationName.HorizontalBottom,
                RoadOrientationName.VerticalRight,
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.CenterBottom: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.RightBottom,
                RoadOrientationName.BottomLeft,
                RoadOrientationName.Vertical,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.VerticalRight,
                RoadOrientationName.HorizontalBottom,
                RoadOrientationName.HorizontalVertical,
            ]; break;
        }

        case RoadOrientationName.CenterLeft: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.BottomLeft,
                RoadOrientationName.LeftTop,
                RoadOrientationName.Horizontal,
                RoadOrientationName.HorizontalTop,
                RoadOrientationName.HorizontalBottom,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.HorizontalVertical,
            ]; break;
        }

        case RoadOrientationName.HorizontalVertical: {
            roadOrientationsDueToExistingOrientation = []; break;
        }

        case RoadOrientationName.TopRight: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.VerticalRight,
                RoadOrientationName.HorizontalVertical,
                RoadOrientationName.HorizontalTop
            ]; break;
        }

        case RoadOrientationName.RightBottom: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalBottom,
                RoadOrientationName.VerticalRight,
                RoadOrientationName.HorizontalVertical,
            ]; break;
        }

        case RoadOrientationName.BottomLeft: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalBottom,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.LeftTop: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalTop,
                RoadOrientationName.VerticalLeft,
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.VerticalLeft: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.VerticalRight: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.HorizontalTop: {
            roadOrientationsDueToExistingOrientation = [
                RoadOrientationName.HorizontalVertical,
            ];
            break;
        }

        case RoadOrientationName.HorizontalBottom: {
            roadOrientationsDueToExistingOrientation = [RoadOrientationName.HorizontalVertical];
            break;
        }
    }

    const roadOrientationsDueToOtherTrackKinds: RoadOrientationName[] = narrowAllowedRoadOrientationsOnOccupiedField(
        roadOrientationsDueToExistingOrientation,
        address,
        game
    );

    return roadOrientationsDueToOtherTrackKinds;
}

interface roadUtils {
    game?: BoardModel,
    getAllowedRoadOrientations: (
        roadOrientation: Orientation,
        address: Address,
        game: BoardModel
    ) => RoadOrientationName[],
    Orientations: typeof RoadOrientations,
    OrientationName: typeof RoadOrientationName,
}

const RoadUtils: roadUtils = {
    getAllowedRoadOrientations,
    Orientations: RoadOrientations,
    OrientationName: RoadOrientationName,
}

export default RoadUtils;

export type {
    RoadOrientationName,
}