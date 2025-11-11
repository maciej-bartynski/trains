import Direction from "#src/types/Direction.js";

const OpositeDirection = {
    [Direction.Top]: Direction.Bottom,
    [Direction.Bottom]: Direction.Top,
    [Direction.Left]: Direction.Right,
    [Direction.Right]: Direction.Left,
}

const ToLeftDirection = {
    [Direction.Top]: Direction.Right,
    [Direction.Bottom]: Direction.Left,
    [Direction.Left]: Direction.Top,
    [Direction.Right]: Direction.Bottom,
}

const ToRightDirection = {
    [Direction.Top]: Direction.Left,
    [Direction.Bottom]: Direction.Right,
    [Direction.Left]: Direction.Bottom,
    [Direction.Right]: Direction.Top,
}

const isAroundCorner = (from: Direction, to: Direction) => {
    if (to === OpositeDirection[from]) {
        return false;
    }

    return true;
}

const isStraight = (from: Direction, to: Direction) => {
    if (to === OpositeDirection[from]) {
        return true;
    }

    return false;
}

const isHorizontalAxis = (from: Direction, to: Direction) => {
    if (isStraight(from, to)) {
        return [Direction.Left, Direction.Right].includes(from);
    }

    return false;
}

const isVerticalAxis = (from: Direction, to: Direction) => {
    if (isStraight(from, to)) {
        return [Direction.Top, Direction.Bottom].includes(from);
    }

    return false;
}

const isTurnLeft = (from: Direction, to: Direction) => {
    return to === ToLeftDirection[from];
}

const isTurnRight = (from: Direction, to: Direction) => {
    return to === ToRightDirection[from];
}

const isOpposite = (directionA: Direction, directionB: Direction) => {
    return OpositeDirection[directionA] === directionB;
}

const DirectionUtils = {
    isAroundCorner,
    isStraight,
    isHorizontalAxis,
    isVerticalAxis,
    isTurnLeft,
    isTurnRight,
    isOpposite,
    OpositeDirection,
    ToLeftDirection,
    ToRightDirection,
}

export default DirectionUtils;