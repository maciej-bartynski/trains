import Config from "#src/config.js";
import BaseComponent from "#src/framework/BaseComponent/BaseComponent.js";
import GameBoard from "#src/GameBoard.js";
import FloatersService from "#src/service/FloatersService/FloatersService.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "./GameFieldElement/GameFieldElement.js";

class GameBoardElement extends BaseComponent {

    static componentName = 'game-board-element';

    private worldBgElement = document.createElement('div');

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.manageWorldBgElement = this.manageWorldBgElement.bind(this);
    }

    async render(board: GameBoard) {
        await GameBoardElement.appReady;
        const fields = board.fields;
        Object.entries(fields).forEach(([key, field]) => {
            let gameField = this.querySelector(`[data-key="${key}"]`) as GameFieldElement;
            const address = AddressUtils.fromKey(key);
            if (!gameField && address) {
                gameField = document.createElement(GameFieldElement.componentName) as GameFieldElement;
                gameField.setAttribute('data-key', key);
                gameField.setAddress(address);
                this.appendChild(gameField);
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
        GameBoard.getInstance().subscribe(this.render);
        GameBoard.ServicesRegistry.floaters.subscribe(this.manageWorldBgElement)
    }

    disconnectedCallback() {
        GameBoard.getInstance().unsubscribe(this.render);
    }
}

export default GameBoardElement;