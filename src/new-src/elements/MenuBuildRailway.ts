import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import Orientation from "../enums/Orientation.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum, { BoardState } from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import { FieldState } from "../models/FieldModel.type.js";
import Address from "../types/Address.js";
import AddressUtils from "../utils/AddressUtils.js";
import BuildingUtils from "../utils/BuildingUtils.js";

type PropsMenuBuildRailway = {
    selectedField: Address | null,
}

class MenuBuildRailway extends StatefullElement<{}, PropsMenuBuildRailway> {

    static tagName = 'x-menu-build-railway';

    static createElement() {
        return document.createElement(MenuBuildRailway.tagName) as MenuBuildRailway;
    }

    private styleEl!: HTMLStyleElement;

    private buttonsList!: HTMLDivElement;

    override state = {}

    constructor() {
        super();
        this.subscribeBoardModel = this.subscribeBoardModel.bind(this);
    }

    private subscribeBoardModel() {
        const game = BoardModel.I();
        this.setProps({ selectedField: game.state[PieceEnum.SelectedField] });
        if (game.state[PieceEnum.SelectedField]) {
            this.render(this.props);
        }
    }

    override connected(): void {
        this.innerHTML = `
            <style>
                ${MenuBuildRailway.tagName} {
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
    }: PropsMenuBuildRailway) {

        this.buttonsList.innerHTML = '';



        if (selectedField) {

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

export default MenuBuildRailway;