import State from "../framework/State.js";
import Address from "../types/Address.js";
import BuildingKind from "../enums/BuildingKind.js";
import FieldVisibility from "../enums/FieldVisibility.js";
import Orientation, { OrientationSquareVariant } from "../enums/Orientation.js";
import TerrainUtils from "../utils/TerrainUtils.js";
import { FieldState, utilFieldStateOnInit } from "./FieldModel.type.js";
import BoardModel from "./BoardModel.js";

class FieldModel extends State<FieldState> {
    static game: BoardModel;

    constructor(data: Address | FieldState) {
        if (!FieldModel.game) {
            throw new Error('FieldModel: game is not initialized yet.')
        }

        const isFieldState = isFieldStateData(data);
        const isAddress = isAddressData(data);

        if (isFieldState) {
            super({
                initialState: data
            })
        } else if (isAddress) {
            super({
                initialState: {
                    address: data,
                    visibility: FieldVisibility.Ready,
                    terrain: null,
                    terrainImageNumber: null,
                    terrainImageRotation: null,
                    railwayOrientation: null,
                    railwayOrientationSquareVariant: null,
                    building: null,
                    resources: null,
                    production: null,
                    storage: null
                }
            });
        } else {
            throw new Error(`Invalid FieldModel initialization: ${JSON.stringify(data)}`);
        }

        this.handleUncover = this.handleUncover.bind(this);
        this.handleBuilding = this.handleBuilding.bind(this);
        this.handleTrack = this.handleTrack.bind(this);
    }

    public handleUncover() {
        if (this.state.visibility === FieldVisibility.Ready) {
            const terrainKind = TerrainUtils.getTerrainKind({ address: this.state.address });
            this.setState({
                visibility: FieldVisibility.Visible,
                terrain: terrainKind,
                terrainImageNumber: Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4,
                terrainImageRotation: Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4,
                resources: TerrainUtils.ResourcesByTerrainMap[terrainKind]
            });
            FieldModel.game.onUncoverField({ address: this.state.address });
        }
    }

    private handleBuilding(building: BuildingKind) {
        if (!this.state.building) {
            this.setState({
                building,
            })
        }
    }

    private handleTrack(orientation: Orientation, crossingVariant: OrientationSquareVariant) {

    }
}

export default FieldModel;

const isFieldStateData = (data: Address | FieldState): data is utilFieldStateOnInit => {
    if ((data as any)?.visibility && (data as any)?.address) {
        return true
    }
    return false;
}

const isAddressData = (data: Address | FieldState): data is Address => {
    if ((data as any)?.column && (data as any)?.row) {
        return true
    }
    return false;
}
