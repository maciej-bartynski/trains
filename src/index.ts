import '#src/components/GameBoard.js';
import { GameBoard } from './GameBoard.js';
import '#src/components/GameFieldElement/GameFieldElement.js';
import '#src/components/MenuBottomElement/BuildingButton.js';
import '#src/components/MenuBottomElement/MenuBottomElement.js';
import '#src/components/TrainRun/TrainRun.js';
import '#src/components/ActionsMenuElement/ActionsMenuElement.js';
import '#src/components/MenuTrainsElement/MenuTrainsElement.js';
import '#src/components/MenuTrainSetRoute/MenuTrainSetRoute.js';
import '#src/atoms/TrainAtom/TrainAtom.js';
import Direction from '#src/types/Direction.js';
import '#src/service/FloatersService/FloatersService.js'
import FloatersService from '#src/service/FloatersService/FloatersService.js';

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
    const gameString = window.localStorage.getItem('game');
    if (gameString) {
        const game = JSON.parse(gameString);
        GameBoard.fromJSON(game);
    } else {
        const gameBoard = GameBoard.getInstance();
        gameBoard.setField({ row: 10, column: 10 });
        gameBoard.uncoverField({ row: 10, column: 10 });
        gameBoard.getField({ row: 10, column: 10 })?.buildRailwayStation({
            orientation: {
                [Direction.Top]: true,
                [Direction.Bottom]: true,
                [Direction.Left]: true,
                [Direction.Right]: true
            }
        });
        gameBoard.setField({ row: 9, column: 10 });
        gameBoard.uncoverField({ row: 9, column: 10 });
        gameBoard.getField({ row: 9, column: 10 })?.buildRailway({
            orientation: {
                [Direction.Top]: true,
                [Direction.Bottom]: true,
                [Direction.Left]: false,
                [Direction.Right]: false
            }
        });
        gameBoard.setField({ row: 8, column: 10 });
        gameBoard.uncoverField({ row: 8, column: 10 });
        gameBoard.getField({ row: 8, column: 10 })?.buildRailway({
            orientation: {
                [Direction.Top]: true,
                [Direction.Bottom]: true,
                [Direction.Left]: false,
                [Direction.Right]: false
            }
        });
        gameBoard.setField({ row: 7, column: 10 });
        gameBoard.uncoverField({ row: 7, column: 10 });
        gameBoard.getField({ row: 7, column: 10 })?.buildRailwayGarage({
            direction: Direction.Bottom
        });
    }

    setTimeout(() => {
        FloatersService.getInstance().onNewAddressUncovered({ column: 10, row: 10 })
    }, 100);
});