import BuildingKind from "../enums/BuildingKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BuildingModel from "../models/BuildingModel.js";

class BuildingElement extends StatefullElement<{
    selected: boolean;
}, BuildingModel['state']> {

    static tagName = 'x-building';

    static createElement() {
        return document.createElement(BuildingElement.tagName) as BuildingElement;
    }

    private styleEl!: HTMLStyleElement;

    override state = {
        selected: false
    }

    constructor() {
        super();
    }


    override connected(): void {
        this.innerHTML = `
            <style>
                x-building {
                    width: 20px;
                    height: 20px;
                    position: absolute;
                    transform: translate(15px, 15px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 7px;
                    font-family: sans-serif;
                    color: black;
                    user-select: none;
                    cursor: pointer;
                    background-color: red;
                    z-index: 2;
                    overflow: hidden;
                }
            </style>
        `;

        this.styleEl = this.querySelector('style') as HTMLStyleElement;
    }

    override render({
        address,
        kind
    }: BuildingModel['state']) {
        this.style.left = `${50 * address.column}px`;
        this.style.top = `${50 * address.row}px`;
        this.innerText = kind;
        let color = '';

        switch (this.props.kind) {
            case BuildingKind.RailwayGarage: {
                color = 'gray'
                break;
            }
            case BuildingKind.RailwayTerminus: {
                color = 'purple'
                break;
            }
            case BuildingKind.RailwayStation: {
                color = 'black'
                break;
            }
            case BuildingKind.Harbour: {
                color = 'pink'
                break;
            }
            case BuildingKind.RoadGarage: {
                color = 'dimgray'
                break;
            }
            case BuildingKind.RoadWarehouse: {
                color = 'saddlebrown'
                break;
            }
            case BuildingKind.CargoPortTop:
            case BuildingKind.CargoPortBottom:
            case BuildingKind.CargoPortLeft:
            case BuildingKind.CargoPortRight: {
                color = 'deepskyblue'
                break;
            }

            // raw materials production
            case BuildingKind.WoodFactory: {
                color = 'brown'
                break;
            }
            case BuildingKind.CoalFactory: {
                color = 'black'
                break;
            }
            case BuildingKind.StoneFactory: {
                color = 'gray'
                break;
            }
            case BuildingKind.IronFactory: {
                color = 'silver'
                break;
            }
            case BuildingKind.ClayFactory: {
                color = 'orange'
                break;
            }

            // advanced materials production
            case BuildingKind.BuildingMaterialsFactory: {
                color = 'yellow'
                break;
            }
            case BuildingKind.SteelFactory: {
                color = 'blue'
                break;
            }
            case BuildingKind.FuelFactory: {
                color = 'olive'
                break;
            }
        }

        this.style.backgroundColor = color;
        this.style.border = 'none';

        if (this.props.kind === BuildingKind.CargoPortTop) {
            this.style.borderTop = '3px solid black';
        }
        if (this.props.kind === BuildingKind.CargoPortBottom) {
            this.style.borderBottom = '3px solid black';
        }
        if (this.props.kind === BuildingKind.CargoPortLeft) {
            this.style.borderLeft = '3px solid black';
        }
        if (this.props.kind === BuildingKind.CargoPortRight) {
            this.style.borderRight = '3px solid black';
        }
        this.appendChild(this.styleEl);
    }

    override changed(): void {

    }

    override mounted(): void {
        const params = BuildingModel.game.getStateByAddress(this.props.address);
        if (params?.buildings) {
            params.buildings.subscribe(this.setProps);
        }
    }

    disconnectedCallback() {
        const params = BuildingModel.game.getStateByAddress(this.props.address);
        if (params?.buildings) {
            params.buildings.unsubscribe(this.setProps);
        }
    }
}

export default BuildingElement;