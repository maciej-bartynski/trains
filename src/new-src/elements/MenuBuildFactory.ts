import BuildingKind from "../enums/BuildingKind";
import StatefullElement from "../framework/StatefullElement.js";
import PieceEnum from "../models/BoardModel.type.js";
import BuildingModel from "../models/BuildingModel.js";
import FieldModel from "../models/FieldModel.js";

class MenuBuildFactoryElement extends StatefullElement<{}, {
    building: BuildingModel | null,
    field: FieldModel | null,
}> {
    static tagName = 'x-build-factory';

    static createElement(): MenuBuildFactoryElement {
        return document.createElement(MenuBuildFactoryElement.tagName) as MenuBuildFactoryElement;
    }

    static selectElement(parent: HTMLElement): MenuBuildFactoryElement | null {
        return parent.querySelector(MenuBuildFactoryElement.tagName)
    }

    protected override state: Partial<{}> = {}

    constructor() {
        super();
        this.onSelectedField = this.onSelectedField.bind(this);
    }

    private onSelectedField() {
        const selectedAddress = StatefullElement.game.state[PieceEnum.SelectedField];
        if (selectedAddress) {
            const stateOfAddress = StatefullElement.game.getStateByAddress(selectedAddress);
            this.setProps({
                building: stateOfAddress?.buildings ?? null,
                field: stateOfAddress?.field ?? null,
            })
        } else {
            this.setProps({
                building: null,
                field: null,
            })
        }
    }

    override connected(): void {
        BuildingKind
        this.innerHTML = `
            <ul>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        `;
    }

    override render(props: {}): void {

    }

    override mounted(): void {
        StatefullElement.game.subscribePiece(() => { }, { type: PieceEnum.SelectedField })
    }

    override changed(): void {

    }
}

export default MenuBuildFactoryElement;