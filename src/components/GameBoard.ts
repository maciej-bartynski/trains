import gameBoard, { GameBoard } from "#src/GameBoard.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "./GameFieldElement/GameFieldElement.js";

class GameBoardElement extends HTMLElement {

    static componentName = 'game-board-element';
    constructor() {
        super();
        this.render = this.render.bind(this);
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

    connectedCallback() {
        gameBoard.subscribe(this.render);
    }

    disconnectedCallback() {
        gameBoard.unsubscribe(this.render);
    }
}

customElements.define(GameBoardElement.componentName, GameBoardElement);

export default GameBoardElement;