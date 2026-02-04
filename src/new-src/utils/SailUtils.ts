import Direction from "../enums/Direction.js";
import Orientation from "../enums/Orientation.js";
import type { FALSE, NULL, TRUE } from "./true-false.js";

const connected: TRUE = true;
const not_connected: FALSE = false;
const empty: NULL = null;

enum SailOrientationVariantName {
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
}

enum SailOrientationCombinedVariantName {
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
        [Direction.Bottom]: connected,
        [Direction.Top]: connected,
        [Direction.Right]: connected,
        'center': not_connected,
    },
    [Direction.Right]: {
        [Direction.Bottom]: connected,
        [Direction.Left]: connected,
        [Direction.Top]: connected,
        'center': not_connected,
    },
    'center': empty,
}

const SailTopRight = {
    [Direction.Left]: empty,
    [Direction.Bottom]: empty,
    [Direction.Top]: {
        [Direction.Bottom]: not_connected,
        [Direction.Top]: not_connected,
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

const SailVerticalRight: Orientation = {
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
        [Direction.Left]: connected,
        [Direction.Top]: connected,
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