import BuildingKind from "#src/types/BuildingKind.js";
import Direction from "#src/types/Direction.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";

const FALSY_MARKER = '0';
const TRUTHY_MARKER = '1';

const orientationToDisplayString = (orientation: Orientation, orientationSquareVariant?: OrientationSquareVariant | null) => {
    let result = '';

    if (orientationSquareVariant === OrientationSquareVariant.Cross) {
        result = 'Left-Right or Top-Bottom';
    } else {
        Object.entries(orientation).forEach(entry => {
            const [direction, hasRailway] = entry as [Direction, boolean];
            if (hasRailway) {
                const separator = result.length ? ', ' : '';
                const firstCharacter = direction.charAt(0);
                const charactersMap = direction.split('');
                charactersMap.shift();
                const directionTail = charactersMap.join('');
                result += `${separator}${firstCharacter.toUpperCase()}${directionTail}`
            }
        })
    }

    return result;
}

const orientationToTRBLString = (orientation: Orientation, orientationSquareVariant?: OrientationSquareVariant | null) => {
    const trblString = `${orientation[Direction.Top] ? TRUTHY_MARKER : FALSY_MARKER}-${orientation[Direction.Right] ? TRUTHY_MARKER : FALSY_MARKER}-${orientation[Direction.Bottom] ? TRUTHY_MARKER : FALSY_MARKER}-${orientation[Direction.Left] ? TRUTHY_MARKER : FALSY_MARKER}`;
    if (orientationSquareVariant && trblString) {
        return `${trblString}_${orientationSquareVariant}`;
    }
    return trblString;
}

const stringTRBLtoOrientation = (orientationString: string): {
    orientation: Orientation,
    orientationSquareVariant: OrientationSquareVariant | null,
} => {

    const orientation = {
        [Direction.Top]: orientationString.includes(Direction.Top),
        [Direction.Right]: orientationString.includes(Direction.Right),
        [Direction.Bottom]: orientationString.includes(Direction.Bottom),
        [Direction.Left]: orientationString.includes(Direction.Left),
    }

    let orientationSquareVariant: OrientationSquareVariant | null = null;

    orientationString.split('-').forEach((direction, index) => {
        switch (index) {
            case 0:
                orientation[Direction.Top] = direction === TRUTHY_MARKER;
                break;
            case 1:
                orientation[Direction.Right] = direction === TRUTHY_MARKER;
                break;
            case 2:
                orientation[Direction.Bottom] = direction === TRUTHY_MARKER;
                break;
            case 3:
                const [lastDirection, _orientationSquareVariant] = direction.split('_') as [typeof TRUTHY_MARKER | typeof FALSY_MARKER, OrientationSquareVariant | undefined];
                orientation[Direction.Left] = lastDirection === TRUTHY_MARKER;
                orientationSquareVariant = _orientationSquareVariant ?? null;
                break;
        }
    });

    return {
        orientation,
        orientationSquareVariant
    };
}

const orientationToImage = (
    params: {
        kind: BuildingKind,
        orientation: Orientation,
        orientationSquareVariant: OrientationSquareVariant | null
    }
): string | null => {
    const { kind, orientation, orientationSquareVariant } = params;
    const orientationString = orientationToTRBLString(orientation, orientationSquareVariant);
    const imageUrl = BuildingKindToOrientationImage[kind][orientationString as keyof typeof BuildingKindToOrientationImage[typeof kind]] ?? null;
    return imageUrl;
}

const BuildingKindToOrientationImage: Record<BuildingKind, Record<string, string>> = {
    [BuildingKind.RailwayStation]: {
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/station_t-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/station_l-r.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/station_intersection.svg',
    },
    [BuildingKind.RailwayTrack]: {
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_t-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_l-r.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: true,
        }, OrientationSquareVariant.Cross)]: 'images/buildings/railway/track_cross.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: true,
        }, OrientationSquareVariant.Intersection)]: 'images/buildings/railway/track_intersection.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_curve_r-t.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_curve_r-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_curve_l-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_curve_l-t.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_tshape_r-t-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_tshape_l-r-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_tshape_l-t-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_tshape_l-r-t.svg',
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_end_t.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/track_end_r.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_end_b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/track_end_l.svg',
    },
    [BuildingKind.RailwayGarage]: {
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/garage_t.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: true,
        })]: 'images/buildings/railway/garage_r.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/garage_b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: false,
        })]: 'images/buildings/railway/garage_l.svg',
    },
    [BuildingKind.Timber]: {
        [orientationToTRBLString({
            [Direction.Top]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
            [Direction.Right]: false,
        })]: 'images/buildings/production/timber_t-b.svg',
        [orientationToTRBLString({
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
            [Direction.Right]: true,
        })]: 'images/buildings/production/timber_l-r.svg',
    }
}

const BuildingOrientationUtils = {
    BuildingKindToOrientationImage,
    orientationToTRBLString,
    orientationToImage,
    stringTRBLtoOrientation,
    orientationToDisplayString
}

export default BuildingOrientationUtils;    