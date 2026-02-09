import Direction, { OpositeDirection } from "../enums/Direction.js";
import Orientation, { TrackNode, TrackNodeConnections } from "../enums/Orientation.js";
import TerrainKind from "../enums/TerrainKind.js";
import TrackKind from "../enums/TrackKind.js";
import type BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import AdjacentFields from "./AdjacentFields.js";
import OrientationUtils from "./OrientationUtils.js";
import type { FALSE, NULL, TRUE } from "./true-false.js";

const connected: TRUE = true;
const not_connected: FALSE = false;
const empty: NULL = null;

enum SailOrientationName {
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

const SailVertical = {
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

const SailHorizontal = {
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

const SailTopRight = {
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

const SailRightBottom = {
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

const SailBottomLeft = {
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

const SailLeftTop = {
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

const SailCenterTop = {
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

const SailCenterRight = {
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

const SailCenterBottom = {
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

const SailCenterLeft = {
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

const SailVerticalLeft = {
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

const SailVerticalRight = {
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

const SailHorizontalTop = {
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

const SailHorizontalBottom = {
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

const SailHorizontalVertical = {
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

const SailOrientations = Object.freeze({
    [SailOrientationName.Vertical]: SailVertical,
    [SailOrientationName.Horizontal]: SailHorizontal,
    [SailOrientationName.TopRight]: SailTopRight,
    [SailOrientationName.RightBottom]: SailRightBottom,
    [SailOrientationName.BottomLeft]: SailBottomLeft,
    [SailOrientationName.LeftTop]: SailLeftTop,
    [SailOrientationName.CenterTop]: SailCenterTop,
    [SailOrientationName.CenterRight]: SailCenterRight,
    [SailOrientationName.CenterBottom]: SailCenterBottom,
    [SailOrientationName.CenterLeft]: SailCenterLeft,
    [SailOrientationName.VerticalLeft]: SailVerticalLeft,
    [SailOrientationName.VerticalRight]: SailVerticalRight,
    [SailOrientationName.HorizontalTop]: SailHorizontalTop,
    [SailOrientationName.HorizontalBottom]: SailHorizontalBottom,
    [SailOrientationName.HorizontalVertical]: SailHorizontalVertical,
});

const getIsSailOrientationAdjacentToWater = (params: {
    address: Address,
    sailOrientation: Orientation,
    game: BoardModel
}): boolean => {

    const { address, game, sailOrientation } = params;

    const adjacentFields = AdjacentFields.getAdjacentFields({ address });

    const someDirectionAdjacentToWaterOrSailTrack = Object.entries(sailOrientation).some(entry => {
        const [node, nodeConnections] = entry as [TrackNode, TrackNodeConnections];
        if (node === 'center' || OrientationUtils.isEmptyNodeConnections(nodeConnections)) {
            return false;
        }
        const adjacentField = adjacentFields[node];
        if (!adjacentField) {
            return false;
        }

        const isAdjacentWater = adjacentField.terrain
            ? [TerrainKind.Water, TerrainKind.WaterCold].includes(adjacentField.terrain)
            : false;
        if (isAdjacentWater) {
            return true;
        }

        let adjacentSailOrientation = game.getStateByAddress(adjacentField.address)?.tracks?.state.orientations[TrackKind.Sail] ?? null;
        adjacentSailOrientation = OrientationUtils.isEmptyOrientation(adjacentSailOrientation)
            ? OrientationUtils.NormalizedEmptyOrientation
            : adjacentSailOrientation!;

        const opositeNode = OpositeDirection[node];
        const waterConnections = adjacentSailOrientation[opositeNode];
        const hasAdjacentWaterConnections = !OrientationUtils.isEmptyNodeConnections(waterConnections);
        return hasAdjacentWaterConnections
    });

    return someDirectionAdjacentToWaterOrSailTrack;
}

const getAllowedSailOrientations = (sailOrientation: Orientation): SailOrientationName[] => {
    const whichVariant = Object.entries(SailOrientations).find((entry) => {
        const [variantName, orientationDefinition] = entry as [SailOrientationName, Orientation];
        const definitionToken = OrientationUtils.tokenizeOrientation(orientationDefinition);
        const sailOrientationToken = OrientationUtils.tokenizeOrientation(sailOrientation);
        if (definitionToken === sailOrientationToken) {
            return variantName;
        }
        return false;
    });

    if (!whichVariant) {
        return Object.values(SailOrientationName);
    }

    const [existingOrientationName, existingOrientationDefinition] = whichVariant as [SailOrientationName, Orientation];

    switch (existingOrientationName) {
        case SailOrientationName.Vertical: {
            return [
                SailOrientationName.HorizontalVertical,
                SailOrientationName.VerticalLeft,
                SailOrientationName.VerticalRight,
            ]
        }

        case SailOrientationName.Horizontal: {
            return [
                SailOrientationName.HorizontalVertical,
                SailOrientationName.HorizontalTop,
                SailOrientationName.HorizontalBottom,
            ]
        }

        case SailOrientationName.CenterTop: {
            return [
                SailOrientationName.HorizontalTop,
                SailOrientationName.HorizontalVertical,
                SailOrientationName.Vertical,
                SailOrientationName.TopRight,
                SailOrientationName.LeftTop,
                SailOrientationName.VerticalLeft,
                SailOrientationName.VerticalRight,
            ]
        }

        case SailOrientationName.CenterRight: {
            return [
                SailOrientationName.TopRight,
                SailOrientationName.RightBottom,
                SailOrientationName.Horizontal,
                SailOrientationName.HorizontalTop,
                SailOrientationName.HorizontalBottom,
                SailOrientationName.VerticalRight,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.CenterBottom: {
            return [
                SailOrientationName.RightBottom,
                SailOrientationName.BottomLeft,
                SailOrientationName.Vertical,
                SailOrientationName.VerticalLeft,
                SailOrientationName.VerticalRight,
                SailOrientationName.HorizontalBottom,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.CenterLeft: {
            return [
                SailOrientationName.BottomLeft,
                SailOrientationName.LeftTop,
                SailOrientationName.Horizontal,
                SailOrientationName.HorizontalTop,
                SailOrientationName.HorizontalBottom,
                SailOrientationName.VerticalLeft,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.HorizontalVertical: {
            return []
        }

        case SailOrientationName.TopRight: {
            return [
                SailOrientationName.VerticalRight,
                SailOrientationName.HorizontalVertical,
                SailOrientationName.HorizontalTop
            ]
        }

        case SailOrientationName.RightBottom: {
            return [
                SailOrientationName.HorizontalBottom,
                SailOrientationName.VerticalRight,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.BottomLeft: {
            return [
                SailOrientationName.HorizontalBottom,
                SailOrientationName.VerticalLeft,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.LeftTop: {
            return [
                SailOrientationName.HorizontalTop,
                SailOrientationName.VerticalLeft,
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.VerticalLeft: {
            return [
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.VerticalRight: {
            return [
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.HorizontalTop: {
            return [
                SailOrientationName.HorizontalVertical,
            ]
        }

        case SailOrientationName.HorizontalBottom: {
            return [SailOrientationName.HorizontalVertical]
        }
    }
}

interface sailUtils {
    game?: BoardModel,
    getAllowedSailOrientations: (sailOrientation: Orientation) => SailOrientationName[],
    Orientations: typeof SailOrientations,
    OrientationName: typeof SailOrientationName,
    getIsSailOrientationAdjacentToWater: (params: {
        address: Address;
        sailOrientation: Orientation;
        game: BoardModel;
    }) => boolean
}

const SailUtils: sailUtils = {
    getAllowedSailOrientations,
    Orientations: SailOrientations,
    OrientationName: SailOrientationName,
    getIsSailOrientationAdjacentToWater
}

export default SailUtils;

export type {
    SailOrientationName,
}