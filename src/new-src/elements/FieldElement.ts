import FieldVisibility from "../enums/FieldVisibility.js";
import StatefullElement from "../framework/StatefullElement.js";
import FieldModel from "../models/FieldModel.js";
import Address from "../types/Address.js";
import AddressUtils from "../utils/AddressUtils.js";

class FieldElement extends StatefullElement<{
    selected: boolean;
}, FieldModel['state']> {

    static tagName = 'x-field';

    static createElement() {
        return document.createElement('x-field') as FieldElement;
    }

    private layer1!: HTMLDivElement;

    private layer2!: HTMLDivElement;

    override state = {
        selected: false
    }

    constructor() {
        super();
        this.onFieldClick = this.onFieldClick.bind(this);
    }

    private onFieldClick = () => {
        const params = FieldModel.game.getStateByAddress(this.props.address);
        if (params && this.props.visibility === FieldVisibility.Ready) {
            params.field.handleUncover();
        }
    }

    override connected(): void {
        this.innerHTML = `
            <style>
                x-field {
                    width: 50px;
                    height: 50px;
                    position: absolute;
                    display: block;
                    border: solid 1px black;
                }

                x-field [data-selector] {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                x-field [data-selector="1"] {
                    background-color: gray;
                }

                x-field [data-selector="2"] {
                    background-color: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-family: sans-serif;
                    color: black;
                }
            </style>
            <div data-selector="1"></div>
            <div data-selector="2">R:??<br/>C:??</div>
        `;

        this.layer1 = this.querySelector('[data-selector="1"]') as HTMLDivElement;
        this.layer2 = this.querySelector('[data-selector="2"]') as HTMLDivElement;
    }

    override render({
        visibility,
        address,
    }: FieldModel['state']) {
        this.layer1.style.backgroundColor = visibility === FieldVisibility.Visible ? 'green' : 'gray';
        this.layer2.innerHTML = `R:${address.row}<br/>C:${address.column}`;
        this.style.left = `${50 * address.column}px`;
        this.style.top = `${50 * address.row}px`;
    }

    override changed(): void { }

    override mounted(): void {
        this.onclick = this.onFieldClick
        const params = FieldModel.game.getStateByAddress(this.props.address);
        if (params) {
            params.field.subscribe(this.setProps);
        }
    }
}

export default FieldElement;