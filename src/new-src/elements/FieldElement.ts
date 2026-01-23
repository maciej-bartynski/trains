import FieldVisibility from "../enums/FieldVisibility.js";
import StatefullElement from "../framework/StatefullElement.js";
import PieceEnum from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import AddressUtils from "../utils/AddressUtils.js";
import FieldElementHelpers from "./FieldElement.helpers.js";

class FieldElement extends StatefullElement<{
    selected: boolean;
}, FieldModel['state'] & {
    isSelected?: boolean
}> {

    static tagName = 'x-field';

    static createElement() {
        return document.createElement('x-field') as FieldElement;
    }

    private styleEl!: HTMLStyleElement;

    override state = {
        selected: false
    }

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
        this.innerHTML = `
            <style>
                x-field {
                    width: 50px;
                    height: 50px;
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-family: sans-serif;
                    color: black;
                    user-select: none;
                    cursor: pointer;
                }
            </style>
        `;

        this.styleEl = this.querySelector('style') as HTMLStyleElement;
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

        if (this.props.isSelected) {
            this.style.zIndex = '1'
            this.style.outline = 'solid 1px blue'
        } else {
            this.style.outline = 'unset'
            this.style.zIndex = '0'
        }

        this.appendChild(this.styleEl)
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
        this.onclick = this.props.visibility === FieldVisibility.Visible
            ? this.onFieldSelect
            : this.onFieldClick
    }

    override mounted(): void {
        this.onclick = this.onFieldClick
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