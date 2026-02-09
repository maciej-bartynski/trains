import TrackKind from "../enums/TrackKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import Address from "../types/Address.js";
import SailUtils, { SailOrientationName } from "../utils/SailUtils.js";
import TrackUtils from "../utils/TrackUtils.js";

type PropsMenuBuildSail = {
    selectedField: Address | null,
}

class MenuBuildSail extends StatefullElement<{}, PropsMenuBuildSail> {

    static tagName = 'x-menu-build-sail';

    static createElement() {
        return document.createElement(MenuBuildSail.tagName) as MenuBuildSail;
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
                ${MenuBuildSail.tagName} {
                    width: 90%;
                    height: 50px;
                    border: solid 1px black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
            <div>
                <div>Sail options</span>
                <div class="building-buttons-list"></div>
            </div<
        `;

        this.styleEl = this.querySelector('style') as HTMLStyleElement;
        this.buttonsList = this.querySelector('.building-buttons-list') as HTMLDivElement;
    }

    override render({
        selectedField,
    }: PropsMenuBuildSail) {
        this.buttonsList.innerHTML = '';

        if (selectedField) {
            const asyncSetButtons = () => {
                this.buttonsList.innerHTML = '';

                Object.entries(SailUtils.Orientations).forEach(variantConfigEntry => {
                    const [variantName, variantConfig] = variantConfigEntry as [SailOrientationName, typeof SailUtils.Orientations[keyof typeof SailUtils.Orientations]];

                    console.log("variant", variantName, variantConfig)

                    const canBuildVariant = TrackUtils.canBuild({
                        address: selectedField,
                        trackKind: TrackKind.Sail,
                        options: {
                            orientation: variantConfig
                        }
                    });

                    if (canBuildVariant) {
                        const variantButton = document.createElement('button');
                        variantButton.innerText = variantName;
                        variantButton.onclick = () => {
                            BoardModel.I().onBuildTrack({
                                address: selectedField,
                                kind: TrackKind.Sail,
                                orientation: variantConfig
                            })
                        }
                        this.buttonsList.appendChild(variantButton)
                    } else {
                        const variantButton = document.createElement('button');
                        variantButton.innerText = `X[${variantName}]X`;
                        variantButton.disabled = true;
                        variantButton.onclick = () => { }
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

export default MenuBuildSail;
