import BuildingKind from "../enums/BuildingKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import BuildingModel from "../models/BuildingModel.js";
import FieldModel from "../models/FieldModel.js";
import Address from "../types/Address.js";
import BuildingUtils from "../utils/BuildingUtils.js";

type FieldMenuState = {
    buildingsToBuild: Array<BuildingKind>
}

type FieldMenuProps = {
    selectedField: Address | null;
} & FieldModel['state'] & (BuildingModel['state'] | null)

class FieldMenuElement extends StatefullElement<FieldMenuState, FieldMenuProps> {

    static tagName = 'x-field-menu';

    static createElement() {
        return document.createElement('x-field') as FieldMenuElement;
    }

    private styleEl!: HTMLStyleElement;

    private buttonsList!: HTMLDivElement;

    override state: FieldMenuState = {
        buildingsToBuild: []
    }

    constructor() {
        super();
        this.subscribeBoardModel = this.subscribeBoardModel.bind(this);
    }

    private subscribeBoardModel() {
        const game = BoardModel.I();
        const selectedField = game.state[PieceEnum.SelectedField];
        const previousSelectedField = this.props.selectedField;

        if (previousSelectedField) {
            const prevFieldData = game.getStateByAddress(previousSelectedField);
            prevFieldData?.field.unsubscribe(this.setProps);
            prevFieldData?.buildings?.unsubscribe(this.setProps)
        }

        if (selectedField) {
            const currFieldData = game.getStateByAddress(selectedField);
            currFieldData?.field.subscribe(this.setProps);
            currFieldData?.buildings?.subscribe(this.setProps);
        }

        this.setProps({
            selectedField,
        })
    }

    override connected(): void {
        this.innerHTML = `
            <style>
                x-field-menu {
                    width: 90%;
                    height: 50px;
                    border: solid 1px black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
            <div class="building-buttons-list"></div>
        `;

        this.styleEl = this.querySelector('style') as HTMLStyleElement;
        this.buttonsList = this.querySelector('.building-buttons-list') as HTMLDivElement;
    }

    override render({
        selectedField,
        kind,
        terrain,
    }: FieldMenuProps) {

        this.buttonsList.innerHTML = '';

        if (selectedField) {
            this.state.buildingsToBuild.forEach(kind => {
                const btn = document.createElement('button');
                btn.innerText = kind;
                btn.onclick = () => {
                    BoardModel.I().onBuildBuilding({
                        address: selectedField, kind: kind,
                    })
                }
                this.buttonsList.appendChild(btn);
            })
        }

        this.appendChild(this.styleEl)
    }

    override changed(): void {
        const getListOfBuildingsPossibleToBuild = async () => {
            const address = this.props.selectedField;
            if (address) {
                const buildingsToBuild: Array<BuildingKind> = [];
                for (const buildingKind of Object.values(BuildingKind)) {
                    const canBuild = await BuildingUtils.canBuild({
                        address,
                        buildingKind,
                        options: undefined
                    });
                    if (canBuild) {
                        buildingsToBuild.push(buildingKind);
                    }
                }
                this.setState({
                    buildingsToBuild
                })
            }
        }

        getListOfBuildingsPossibleToBuild()
    }

    override mounted(): void {
        FieldModel.game.subscribePiece(this.subscribeBoardModel, { type: PieceEnum.SelectedField });
        FieldModel.game.subscribePiece(this.subscribeBoardModel, { type: PieceEnum.Tracks });
        FieldModel.game.subscribePiece(this.subscribeBoardModel, { type: PieceEnum.Buildings });
    }

    disconnectedCallback() {
        FieldModel.game.unsubscribePiece(this.subscribeBoardModel);
    }
}

export default FieldMenuElement;