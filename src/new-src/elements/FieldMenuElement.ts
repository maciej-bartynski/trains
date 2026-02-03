import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import StatefullElement from "../framework/StatefullElement.js";
import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import BuildingModel from "../models/BuildingModel.js";
import { BuildingState } from "../models/BuildingModel.type.js";
import FieldModel from "../models/FieldModel.js";
import { FieldState } from "../models/FieldModel.type.js";
import TrackModel from "../models/TrackModel.js";
import { TrackState } from "../models/TrackModel.type.js";
import Address from "../types/Address.js";
import AdjacentFields from "../utils/AdjacentFields.js";
import BuildingUtils from "../utils/BuildingUtils.js";

type FieldMenuState = {
    buildingsToBuild: Array<BuildingKind>,
    harboursToBuild: Array<Direction>,
}

type FieldMenuProps = {
    selectedField: Address | null;
    field: FieldModel['state'];
    building: BuildingModel['state'] | null;
    tracks: TrackModel['state'] | null
}

class FieldMenuElement extends StatefullElement<FieldMenuState, FieldMenuProps> {

    static tagName = 'x-field-menu';

    static createElement() {
        return document.createElement('x-field') as FieldMenuElement;
    }

    private styleEl!: HTMLStyleElement;

    private buttonsList!: HTMLDivElement;

    override state: FieldMenuState = {
        buildingsToBuild: [],
        harboursToBuild: []
    }

    constructor() {
        super();
        this.subscribeBoardModel = this.subscribeBoardModel.bind(this);
        this.subscribeBuildings = this.subscribeBuildings.bind(this);
        this.subscribeTracks = this.subscribeTracks.bind(this);
        this.subscribeField = this.subscribeField.bind(this);
    }

    private subscribeField(params: FieldState) {
        this.setProps({ field: params });
    }

    private subscribeBuildings(params: BuildingState) {
        this.setProps({ building: params });
    }

    private subscribeTracks(params: TrackState) {
        this.setProps({ tracks: params });
    }

    private subscribeBoardModel() {
        const game = BoardModel.I();
        const selectedField = game.state[PieceEnum.SelectedField];
        const previousSelectedField = this.props.selectedField;

        if (previousSelectedField) {
            const prevFieldData = game.getStateByAddress(previousSelectedField);
            prevFieldData?.field.unsubscribe(this.subscribeField);
            prevFieldData?.buildings?.unsubscribe(this.subscribeBuildings)
            prevFieldData?.tracks?.unsubscribe(this.subscribeTracks)
        }

        if (selectedField) {
            const currFieldData = game.getStateByAddress(selectedField);
            currFieldData?.field.subscribe(this.subscribeField);
            currFieldData?.buildings?.subscribe(this.subscribeBuildings);
            currFieldData?.tracks?.subscribe(this.subscribeTracks);
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
    }: FieldMenuProps) {

        this.buttonsList.innerHTML = '';

        const buildingLabels: Partial<Record<BuildingKind, string>> = {
            [BuildingKind.CargoPortLeft]: 'port left',
            [BuildingKind.CargoPortRight]: 'port right',
            [BuildingKind.CargoPortTop]: 'port top',
            [BuildingKind.CargoPortBottom]: 'port bottom',
        };

        if (selectedField) {
            this.state.buildingsToBuild.forEach(kind => {
                const btn = document.createElement('button');
                btn.innerText = buildingLabels[kind] ?? kind;
                btn.onclick = () => {
                    BoardModel.I().onBuildBuilding({
                        address: selectedField,
                        buildingKind: kind as Exclude<BuildingKind, BuildingKind.Harbour>,
                    })
                }
                this.buttonsList.appendChild(btn);
            });

            if (this.state.harboursToBuild.length) {
                this.buttonsList.appendChild(document.createElement('hr'));

                this.state.harboursToBuild.forEach(harbourDirection => {
                    const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address: selectedField });
                    const seaAddress = adjacentAddresses[harbourDirection];
                    if (!seaAddress) {
                        return;
                    }
                    const btn = document.createElement('button');
                    btn.innerText = `Harbour: ${harbourDirection}, ${JSON.stringify(selectedField)}`;
                    btn.onclick = () => {
                        BoardModel.I().onBuildBuilding({
                            address: selectedField,
                            buildingKind: BuildingKind.Harbour,
                            options: {
                                seaAddress,
                            }
                        })
                    }
                    this.buttonsList.appendChild(btn);
                });
            }
        }

        this.appendChild(this.styleEl)
    }

    override changed(): void {
        const address = this.props.selectedField;
        if (address) {
            const buildingsToBuild: Array<BuildingKind> = [];
            const harboursToBuild: Array<Direction> = [];

            for (const buildingKind of Object.values(BuildingKind)) {

                switch (buildingKind) {
                    case BuildingKind.Harbour: {
                        Object.entries(AdjacentFields.getAdjacentAddresses({ address })).forEach(entry => {

                            const [direction, adjacentAddress] = entry as [Direction, Address | undefined];
                            if (adjacentAddress && BuildingUtils.canBuild({
                                address,
                                buildingKind: BuildingKind.Harbour,
                                options: {
                                    seaAddress: adjacentAddress
                                }
                            })) {

                                harboursToBuild.push(direction);
                            }

                        })
                        break;
                    }
                    default: {
                        if (BuildingUtils.canBuild({
                            address,
                            buildingKind,
                            options: undefined
                        })) {
                            buildingsToBuild.push(buildingKind);
                        }
                    }
                }
            }

            this.setState({
                buildingsToBuild,
                harboursToBuild
            })
        } else {
            this.setState({
                buildingsToBuild: [],
                harboursToBuild: []
            })
        }
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