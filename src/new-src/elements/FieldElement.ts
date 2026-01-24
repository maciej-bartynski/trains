import FieldVisibility from "../enums/FieldVisibility.js";
import StatefullElement from "../framework/StatefullElement.js";
import PieceEnum from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import AddressUtils from "../utils/AddressUtils.js";
import FieldElementHelpers from "./FieldElement.helpers.js";
import WorldElement from "./WorldElement.js";

class FieldElement extends StatefullElement<{
    selected: boolean;
}, FieldModel['state'] & {
    isSelected?: boolean
}> {

    static tagName = 'x-field';

    static createElement() {
        return document.createElement('x-field') as FieldElement;
    }

    override state = {
        selected: false
    }

    private selectionLayer = (() => {
        const div = document.createElement('div');
        div.classList.add(`${FieldElement.tagName}_field-selection-layer`);
        return div;
    })();

    constructor() {
        super();
        this.onFieldClick = this.onFieldClick.bind(this);
        this.onFieldSelect = this.onFieldSelect.bind(this);
        this.subscribeSelectedField = this.subscribeSelectedField.bind(this);
    }

    private onFieldClick = () => {
        const params = FieldModel.game.getStateByAddress(this.props.address);
        if (params && this.props.visibility === FieldVisibility.Ready) {
            params.field.handleUncover();
        }
    }

    private onFieldSelect() {
        FieldModel.game.setSelectedField({
            selectedField: this.props.address
        })
    }

    override connected(): void {

    }

    override render({
        visibility,
        address,
        terrain
    }: FieldModel['state']) {

        const terrainColour = FieldElementHelpers.getTerrainColor(terrain)

        this.style.backgroundColor = terrainColour;
        this.innerHTML = `R:${address.row}<br/>C:${address.column}<br/>${terrain}`;
        this.style.left = `${50 * address.column}px`;
        this.style.top = `${50 * address.row}px`;

        this.selectionLayer.style.left = `${50 * address.column}px`;
        this.selectionLayer.style.top = `${50 * address.row}px`;

        if (!this.selectionLayer.isConnected) {
            const world = document.querySelector(WorldElement.tagName) as WorldElement;
            world.appendFrameChild(this.selectionLayer);
        }

        if (this.props.isSelected) {
            this.selectionLayer.style.outline = 'solid 1px blue'
        } else {
            this.selectionLayer.style.outline = 'none'
        }
    }

    private subscribeSelectedField() {
        const selectedFieldAddress = FieldModel.game.state[PieceEnum.SelectedField];
        const isSelected = selectedFieldAddress
            ? AddressUtils.isAddressEqual(selectedFieldAddress, this.props.address)
            : false;
        this.setProps({
            isSelected
        })
    }

    override changed(): void {
        this.selectionLayer.onclick = this.props.visibility === FieldVisibility.Visible
            ? this.onFieldSelect
            : this.onFieldClick
    }

    override mounted(): void {
        this.selectionLayer.onclick = this.onFieldClick
        const params = FieldModel.game.getStateByAddress(this.props.address);
        if (params) {
            params.field.subscribe(this.setProps);
            FieldModel.game.subscribePiece(this.subscribeSelectedField, { type: PieceEnum.SelectedField })
        }
    }

    disconnectedCallback() {
        const params = FieldModel.game.getStateByAddress(this.props.address);
        if (params) {
            params.field.unsubscribe(this.setProps);
        }
        FieldModel.game.unsubscribePiece(this.subscribeSelectedField, { type: PieceEnum.SelectedField })
    }
}

export default FieldElement;