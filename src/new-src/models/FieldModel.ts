import State from "../framework/State.js";
import Address from "../types/Address.js";
import FieldVisibility from "../enums/FieldVisibility.js";
import TerrainUtils from "../utils/TerrainUtils.js";
import { FieldState, utilFieldStateOnInit } from "./FieldModel.type.js";
import AddressUtils from "../utils/AddressUtils.js";
import PieceEnum from "./BoardModel.type.js";

class FieldModel extends State<FieldState> {
    constructor(data: Address | FieldState) {

        if (!FieldModel.game) {
            throw new Error('FieldModel: game is not initialized yet.')
        }

        const isFieldState = isFieldStateData(data);
        const isAddress = isAddressData(data);

        if (isFieldState) {
            super({
                initialState: data,
                store: PieceEnum.Fields
            })
        } else if (isAddress) {
            super({
                store: PieceEnum.Fields,
                initialState: {
                    _id: AddressUtils.toKey(data),
                    address: data,
                    visibility: FieldVisibility.Ready,
                    terrain: null,
                    terrainImageNumber: null,
                    terrainImageRotation: null,
                    resources: null,
                }
            });
        } else {
            throw new Error(`Invalid FieldModel initialization: ${JSON.stringify(data)}`);
        }

        this.handleUncover = this.handleUncover.bind(this);
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
}

export default FieldModel;

const isFieldStateData = (data: Address | FieldState): data is utilFieldStateOnInit => {
    if ((data as any)?.visibility && (data as any)?.address) {
        return true
    }
    return false;
}

const isAddressData = (data: Address | FieldState): data is Address => {
    if (typeof (data as any)?.column === 'number' && typeof (data as any)?.row === 'number') {
        return true
    }
    return false;
}
