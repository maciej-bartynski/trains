import TrackKind from "../enums/TrackKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import Address from "../types/Address.js";
import RailwayUtils from "../utils/RailwayUtils.js";
import TrackUtils from "../utils/TrackUtils.js";

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
                    min-height: 50px;
                    border: solid 1px black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
            <div>
                <div>Railway options</span>
                <div class="building-buttons-list"></div>
            </div<
        `;

        this.styleEl = this.querySelector('style') as HTMLStyleElement;
        this.buttonsList = this.querySelector('.building-buttons-list') as HTMLDivElement;
    }

    override render({
        selectedField,
    }: PropsMenuBuildRailway) {

        this.buttonsList.innerHTML = '';

        if (selectedField) {

            const asyncSetButtons = async () => {
                Object.entries(RailwayUtils.Variants).forEach(async variantConfig => {
                    const [variant, orientation] = variantConfig;

                    const canBuildRailway = TrackUtils.canBuild({
                        address: selectedField,
                        trackKind: TrackKind.Railway,
                        options: {
                            orientation: orientation
                        }
                    });

                    if (canBuildRailway) {
                        const variantButton = document.createElement('button');
                        variantButton.innerText = variant;
                        variantButton.onclick = () => {
                            BoardModel.I().onBuildTrack({
                                address: selectedField,
                                kind: TrackKind.Railway,
                                orientation
                            })
                        }
                        this.buttonsList.appendChild(variantButton)
                    } else {
                        const variantButton = document.createElement('button');
                        variantButton.innerText = `X[${variant}]X`;
                        variantButton.disabled = true;
                        this.buttonsList.appendChild(variantButton)
                    }
                });
            }

            asyncSetButtons()
        }

        this.appendChild(this.styleEl)
    }

    override changed(): void {

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