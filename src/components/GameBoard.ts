import Config from "#src/config.js";
import { GameBoard } from "#src/GameBoard.js";
import FloatersService from "#src/service/FloatersService/FloatersService.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "./GameFieldElement/GameFieldElement.js";

class GameBoardElement extends HTMLElement {

    static componentName = 'game-board-element';

    private worldBgElement = document.createElement('div');
    constructor() {
        super();
        this.render = this.render.bind(this);
        this.manageWorldBgElement = this.manageWorldBgElement.bind(this);
    }

    render(board: GameBoard) {
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
        this.worldBgElement.style.left = FloatersService.getInstance().scrollLeftOffsetPx + 'px';
        this.worldBgElement.style.width = (Config.cellSizePx * Config.boardSize) + 'px';
        this.worldBgElement.style.top = FloatersService.getInstance().scrollTopOffsetPx + 'px';
        this.worldBgElement.style.height = (Config.cellSizePx * Config.boardSize) + 'px';
    }

    connectedCallback() {
        GameBoard.getInstance().subscribe(this.render);
        FloatersService.getInstance().subscribe(this.manageWorldBgElement)
    }

    disconnectedCallback() {
        GameBoard.getInstance().unsubscribe(this.render);
    }
}

customElements.define(GameBoardElement.componentName, GameBoardElement);

export default GameBoardElement;