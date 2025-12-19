import Direction from "#src/types/Direction.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";

const getNormalizedOrientation = (orientation: Orientation): Orientation => {
    return {
        [Direction.Top]: orientation[Direction.Top],
        [Direction.Bottom]: orientation[Direction.Bottom],
        [Direction.Left]: orientation[Direction.Left],
        [Direction.Right]: orientation[Direction.Right],
    }
}

const isSquare = (orientation: Orientation): boolean => {
    const defaultOrientation: Orientation = getNormalizedOrientation(orientation);
    return Object.values(defaultOrientation).every(value => value);
}

const isSameOrientation = (orientation1: Orientation, orientation2: Orientation): boolean => {
    const defaultOrientation1 = getNormalizedOrientation(orientation1);
    const defaultOrientation2 = getNormalizedOrientation(orientation2);
    return Object.entries(defaultOrientation1).every(([direction, value]) => value === defaultOrientation2[direction as Direction]);
}

const isAtLeastOneNewDirection = (newOrientation: Orientation, prevOrientation: Orientation): boolean => {
    const _new = getNormalizedOrientation(newOrientation);
    const _prev = getNormalizedOrientation(prevOrientation);
    return Object.entries(_new).some(([direction, value]) => value && !_prev[direction as Direction]);
}

const getNewDirections = (newOrientation: Orientation, prevOrientation: Orientation): Direction[] => {
    const _new = getNormalizedOrientation(newOrientation);
    const _prev = getNormalizedOrientation(prevOrientation);
    const hasNewDirections = isAtLeastOneNewDirection(_new, _prev);

    if (!hasNewDirections) {
        return [];
    }

    return Object.entries(_new)
        .filter(([direction, value]) => value && !_prev[direction as Direction])
        .map(([direction, _]) => direction as Direction);
}

const mergeOrientations = (orientation1: Orientation, orientation2: Orientation): Orientation => {
    return {
        [Direction.Top]: orientation1[Direction.Top] || orientation2[Direction.Top] || false,
        [Direction.Bottom]: orientation1[Direction.Bottom] || orientation2[Direction.Bottom] || false,
        [Direction.Left]: orientation1[Direction.Left] || orientation2[Direction.Left] || false,
        [Direction.Right]: orientation1[Direction.Right] || orientation2[Direction.Right] || false,
    }
}

const canUpgradeToIntersection = (params: {
    newOrientation: Orientation,
    newOrientationSquareVariant: OrientationSquareVariant | null,
    prevOrientation: Orientation,
    prevOrientationSquareVariant: OrientationSquareVariant | null
}): boolean => {

    const { newOrientation, newOrientationSquareVariant, prevOrientation, prevOrientationSquareVariant } = params;

    if (isSquare(prevOrientation)) {
        const isUpgradeRequest = isSquare(newOrientation) && newOrientationSquareVariant === OrientationSquareVariant.Intersection;
        const isNotUpgradedYet = prevOrientationSquareVariant !== OrientationSquareVariant.Intersection;
        return isUpgradeRequest && isNotUpgradedYet;
    } else {
        const resultIsSquare = isSquare(mergeOrientations(newOrientation, prevOrientation));
        const isUpgradeRequest = newOrientationSquareVariant === OrientationSquareVariant.Intersection;
        return isUpgradeRequest && resultIsSquare;
    }

}

const isVerticalOnly = (orientation: Orientation) => {
    const defaultOrientation: Orientation = getNormalizedOrientation(orientation);
    let isVerticalOnly = true;
    Object.entries(defaultOrientation).forEach(entry => {
        const [dir, hasRoute] = entry as [Direction, boolean];
        switch (dir) {
            case Direction.Bottom:
            case Direction.Top: {
                isVerticalOnly = isVerticalOnly && hasRoute;
                break;
            }
            case Direction.Left:
            case Direction.Right: {
                isVerticalOnly = isVerticalOnly && !hasRoute;
                break;
            }
        }
    });

    return isVerticalOnly
}

const isHorizontalOnly = (orientation: Orientation) => {
    const defaultOrientation: Orientation = getNormalizedOrientation(orientation);
    let isHorizontalOnly = true;
    Object.entries(defaultOrientation).forEach(entry => {
        const [dir, hasRoute] = entry as [Direction, boolean];
        switch (dir) {
            case Direction.Bottom:
            case Direction.Top: {
                isHorizontalOnly = isHorizontalOnly && !hasRoute;
                break;
            }
            case Direction.Left:
            case Direction.Right: {
                isHorizontalOnly = isHorizontalOnly && hasRoute;
                break;
            }
        }
    });

    return isHorizontalOnly;
}

const OrientationUtils = {
    canUpgradeToIntersection,
    isSquare,
    isSameOrientation,
    isAtLeastOneNewDirection,
    getNewDirections,
    mergeOrientations,
    getNormalizedOrientation,
    isHorizontalOnly,
    isVerticalOnly,
}

export default OrientationUtils;