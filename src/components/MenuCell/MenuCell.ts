import gameBoard from "#src/GameBoard.js";
import TrainModel from "#src/models/TrainModel.js";
import pointerOperations from "#src/service/PointerOperations/PointerOperations.js";
import OperationType, { Operation } from "#src/service/PointerOperations/types.js";
import BuildingKind from "#src/types/BuildingKind.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import Pathfinder from "#src/utils/Pathfinder.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";

class MenuCellElement extends HTMLElement {
    static componentName = 'menu-cell-element';

    constructor() {
        super();
        this.render = this.render.bind(this);

        pointerOperations.subscribe(this.render);
        gameBoard.subscribe(this.render);
    }


    render() {

        const operation = pointerOperations.operation;
        if (operation?.type !== OperationType.SelectCell) {
            this.innerHTML = '';
            this.style.display = 'none';
            return;
        }

        const { address } = operation.payload;
        const field = gameBoard.getField(address);

        if (!field) {
            this.innerHTML = '';
            this.style.display = 'none';
            return;
        }

        this.style.display = 'block';

        if (!field.building) {
            this.innerHTML = `
                <div class="menu-cell">
                    <${GameFieldElement.componentName} data-key="${AddressUtils.toKey(address)}"></${GameFieldElement.componentName}>
                    <span class="menu-cell_address">R: ${address.row}, C: ${address.column}</span>
                    <span class="menu-cell_terrain">Terrain: ${field.terrain}</span>
                </div>
            `;
        }

        else if (field.building === BuildingKind.RailwayGarage) {
            this.innerHTML = `
                <div class="menu-cell">
                    <${GameFieldElement.componentName} data-key="${AddressUtils.toKey(address)}"></${GameFieldElement.componentName}>
                    <span class="menu-cell_address">R: ${address.row}, C: ${address.column}</span>
                    <span class="menu-cell_terrain">Terrain: ${field.terrain}</span>
                    <span class="menu-cell_building">${field.building}</span>

                    <div class="menu-cell_garage-operations">
                        <button class="menu-cell_operation_build">
                            Build Train
                        </button>
                    </div>

                    <div class="menu-cell_garage-trains"></div>
                </div>
            `;

            const buildTrainButton = this.querySelector('.menu-cell_operation_build') as HTMLButtonElement;
            buildTrainButton.onclick = () => {
                gameBoard.setTrain(TrainModel.build({ address: address }));
            };

            const trainsList = this.querySelector('.menu-cell_garage-trains') as HTMLDivElement;
            trainsList.innerHTML = '';
            Object.values(gameBoard.trains).forEach((train: TrainModel) => {
                trainsList.innerHTML += `
                    <button class="menu-cell_train" data-train-id="${train.id}">
                        ID: ${train.id}
                    </button>
                `;
            });

            const trainsListButtons = this.querySelectorAll('.menu-cell_train') as NodeListOf<HTMLButtonElement>;
            trainsListButtons.forEach((button: HTMLButtonElement) => {
                button.onclick = async (e) => {
                    const trainId = (e.target as HTMLButtonElement).getAttribute('data-train-id');
                    if (!trainId) return;
                    const train = gameBoard.getTrain(trainId);
                    if (!train) return;
                    const routes = await Pathfinder.findAllRoutes(train);
                    const route = Pathfinder.pickShortestRoute(routes);
                    if (!route) return;
                    train.setRoute({ route: [...route] })
                };
            });


        } else if (field.building === BuildingKind.RailwayStation) {
            this.innerHTML = `
                <div class="menu-cell">
                    <${GameFieldElement.componentName} data-key="${AddressUtils.toKey(address)}"></${GameFieldElement.componentName}>
                    <span class="menu-cell_address">R: ${address.row}, C: ${address.column}</span>
                    <span class="menu-cell_terrain">Terrain: ${field.terrain}</span>
                    <span class="menu-cell_building">${field.building}</span>
                </div>
            `;
        }
        else if (field.building === BuildingKind.RailwayTrack) {
            this.innerHTML = `
                <div class="menu-cell">
                    <${GameFieldElement.componentName} data-key="${AddressUtils.toKey(address)}"></${GameFieldElement.componentName}>
                    <span class="menu-cell_address">R: ${address.row}, C: ${address.column}</span>
                    <span class="menu-cell_terrain">Terrain: ${field.terrain}</span>
                    <span class="menu-cell_building">${field.building}</span>
                </div>
            `;
        }

        const gameField = this.querySelector(GameFieldElement.componentName) as GameFieldElement;
        gameField.setAddress(address);
        gameField.style.left = '0';
        gameField.style.top = '0';
    }
}

customElements.define(MenuCellElement.componentName, MenuCellElement);

export default MenuCellElement;