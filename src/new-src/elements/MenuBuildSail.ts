import TrackKind from "../enums/TrackKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import FieldModel from "../models/FieldModel.js";
import Address from "../types/Address.js";
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
                const variants = Object.values(TrackUtils.TrackVariants).map(variantConfig => {
                    const { variant, orientation } = variantConfig;
                    return {
                        can: TrackUtils.canBuild({
                            address: selectedField,
                            trackKind: TrackKind.Sail,
                            options: {
                                orientations: orientation
                            }
                        }),
                        orientation,
                        variant,
                    }
                });

                this.buttonsList.innerHTML = '';

                variants.forEach(data => {
                    const { can, variant, orientation } = data;
                    if (can) {
                        const variantButton = document.createElement('button');
                        variantButton.innerText = variant;
                        variantButton.onclick = () => {
                            BoardModel.I().onBuildTrack({
                                address: selectedField,
                                kind: TrackKind.Sail,
                                orientation
                            })
                        }
                        this.buttonsList.appendChild(variantButton)
                    }
                })
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
