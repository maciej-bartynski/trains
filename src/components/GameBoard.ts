import Config from "#src/config.js";
import BaseComponent from "#src/framework/BaseComponent/BaseComponent.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import GameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import TrainModel from "#src/models/TrainModel.js";
import FloatersService from "#src/service/FloatersService/FloatersService.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "./GameFieldElement/GameFieldElement.js";
import TrainRunElement from "./TrainRun/TrainRun.js";

type GameBoardElementState = {

}

type GameBoardElementProps = {
    trains: Record<string, TrainModel>,
    fields: Record<string, FieldModel>
    furthestRow: number,
    furthestColumn: number,
}

class GameBoardElement extends StatefullComponent<GameBoardElementState, GameBoardElementProps> {

    static componentName = 'game-board-element';

    private worldBgElement = document.createElement('div');

    constructor() {
        super();
        this.manageWorldBgElement = this.manageWorldBgElement.bind(this);
    }

    override render() {
        const gameBoard = this.getProps();
        const fields = gameBoard.fields;
        const trains = gameBoard.trains;

        Object.entries(fields).forEach(([key, field]) => {
            /**
             * Any bulk fields logic
             */
            let gameField = this.querySelector(`${GameFieldElement.componentName}[data-key="${key}"]`) as GameFieldElement;
            const address = AddressUtils.fromKey(key);
            if (!gameField && address) {
                gameField = document.createElement(GameFieldElement.componentName) as GameFieldElement;
                gameField.setAttribute('data-key', key);
                gameField.setAddress(address);
                this.appendChild(gameField);
            }
        });

        Object.entries(trains).forEach(([trainId, train]) => {
            /**
             * Any bulk trains logic
             */

            const trainElement = TrainRunElement.trainSelector(trainId);
            const fieldElement = GameFieldElement.selectFieldByAddress(train.state.location);
            if (!trainElement && fieldElement) {
                const trainAnimation = TrainRunElement.createTrainElement({
                    trainId: trainId,
                });

                if (trainAnimation) {
                    fieldElement.appenTrainElement(trainAnimation);
                }
            }

        });
    }

    manageWorldBgElement() {
        this.worldBgElement = document.querySelector('.GameBoardElement_world-bg') as HTMLDivElement;
        this.worldBgElement.style.left = FloatersService.getInstance().state.left + 'px';
        this.worldBgElement.style.width = (Config.cellSizePx * Config.boardSize) + 'px';
        this.worldBgElement.style.top = FloatersService.getInstance().state.top + 'px';
        this.worldBgElement.style.height = (Config.cellSizePx * Config.boardSize) + 'px';
    }

    connectedCallback() {
        GameBoard.getInstance().subscribe(this.setProps);
        GameBoard.ServicesRegistry.floaters.subscribe(this.manageWorldBgElement)
    }

    disconnectedCallback() {
        GameBoard.getInstance().unsubscribe(this.setProps);
    }
}

export default GameBoardElement;