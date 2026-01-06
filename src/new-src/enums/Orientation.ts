import Direction from "./Direction";

type Orientation = {
    [Direction.Top]: boolean,
    [Direction.Bottom]: boolean,
    [Direction.Left]: boolean,
    [Direction.Right]: boolean,
}

export default Orientation;

export type OrientationVertical = {
    [Direction.Top]: true,
    [Direction.Bottom]: true,
    [Direction.Left]: false,
    [Direction.Right]: false,
}

export type OrientationHorizontal = {
    [Direction.Left]: true,
    [Direction.Right]: true,
    [Direction.Top]: false,
    [Direction.Bottom]: false,
}

export type OrientationSquare = {
    [Direction.Top]: true,
    [Direction.Bottom]: true,
    [Direction.Left]: true,
    [Direction.Right]: true,
}

export enum OrientationSquareVariant {
    Cross = 'cross',
    Intersection = 'intersection',
}