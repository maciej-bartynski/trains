import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import TrackKind from "../enums/TrackKind.js";
import State from "../framework/State.js"
import PieceEnum from "./BoardModel.type.js";
import { BuildingState } from "./BuildingModel.type.js";

class BuildingModel extends State<BuildingState> {
    constructor(data: BuildingState) {
        if (!BuildingModel.game) {
            throw new Error('FieldModel: game is not initialized yet.')
        }

        super({ initialState: data, store: PieceEnum.Buildings });
    }
}

export default BuildingModel

const RailwayStationConfigs = {
    [BuildingKind.RailwayStation]: {
        "vertical-left": {
            variant: 'vertical-left',
            description: 'Vertically oriented rails to central station, with road to the left.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Left]: null,
                    [Direction.Right]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                }
            }
        },
        "vertical-right": {
            variant: "vertical-right",
            description: 'Vertically oriented rails to central station, with road to the right.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Left]: null,
                    [Direction.Right]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: true,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
        "horizontal-top": {
            variant: "horizontal-top",
            description: 'Horizontally oriented rails to central station, with road to the top.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: true,
                    },
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Top]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Bottom]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                    [Direction.Bottom]: null,
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Right]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
        "horizontal-bottom": {
            variant: "horizontal-bottom",
            description: 'Horizontally oriented rails to central station, with road to the bottom.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: true,
                    },
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Top]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Bottom]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                    [Direction.Top]: null,
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Right]: false,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
    }
}

const RailwayGarageConfigs = {
    [BuildingKind.RailwayStation]: {
        "vertical-left": {
            variant: 'vertical-left',
            description: 'Vertically oriented rails to central station, with road to the left.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Left]: null,
                    [Direction.Right]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Right]: null,
                }
            }
        },
        "vertical-right": {
            variant: "vertical-right",
            description: 'Vertically oriented rails to central station, with road to the right.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Left]: null,
                    [Direction.Right]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: true,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
        "horizontal-top": {
            variant: "horizontal-top",
            description: 'Horizontally oriented rails to central station, with road to the top.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: true,
                    },
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Top]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Bottom]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: true,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                    [Direction.Bottom]: null,
                    [Direction.Top]: {
                        "center": true,
                        [Direction.Right]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
        "horizontal-bottom": {
            variant: "horizontal-bottom",
            description: 'Horizontally oriented rails to central station, with road to the bottom.',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: true,
                    },
                    [Direction.Left]: {
                        "center": true,
                        [Direction.Bottom]: false,
                        [Direction.Top]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: {
                        "center": true,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                        [Direction.Bottom]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                },
                [TrackKind.Road]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: true,
                        [Direction.Left]: false,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                    [Direction.Top]: null,
                    [Direction.Bottom]: {
                        "center": true,
                        [Direction.Right]: false,
                        [Direction.Top]: false,
                        [Direction.Left]: false,
                    },
                    [Direction.Left]: null,
                }
            }
        },
    },
    [BuildingKind.RailwayGarage]: {
        "left": {
            variant: 'left',
            description: 'Rails from the left, to the centrally oriented garage',
            orientation: {
                [TrackKind.Railway]: {
                    "center": {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        [Direction.Left]: true,
                        [Direction.Right]: false,
                    },
                    [Direction.Top]: null,
                    [Direction.Bottom]: null,
                    [Direction.Left]: {
                        [Direction.Top]: false,
                        [Direction.Bottom]: false,
                        "center": true,
                        [Direction.Right]: false,
                    },
                    [Direction.Right]: null,
                },
            }
        },
        "right": {
            variant: 'right',
            description: 'Rails from the right, to the centrally oriented garage',
            orientation: {
                [TrackKind.Railway]: {},
            }
        },
        "top": {
            variant: 'top',
            description: 'Rails from the top, to the centrally oriented garage',
            orientation: {
                [TrackKind.Railway]: {},
            }
        },
        "bottom": {
            variant: 'bottom',
            description: 'Rails from the bottom, to the centrally oriented garage',
            orientation: {
                [TrackKind.Railway]: {},
            }
        },
    }
}