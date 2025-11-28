import GameBoardElement from "#src/components/GameBoard.js";
import Config from "#src/config.js";
import Address from "#src/types/Address.js";
import Service from "../../framework/Service/Service.js";

class FloatersService extends Service<{
    left: number | null,
    top: number | null
}> {
    private static instance: FloatersService;

    state = {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2
    }

    static getInstance(): FloatersService {

        if (!Service.gameBoard) {
            throw new Error('FloatersService not registered')
        }

        if (FloatersService.instance) {
            return FloatersService.instance
        }

        FloatersService.instance = new FloatersService();
        return FloatersService.instance;
    }

    private constructor() {
        super();

        this.onGameBoard = this.onGameBoard.bind(this);
        Service.gameBoard.subscribe(this.onGameBoard);

        window.onresize = () => {
            clearTimeout(this.notifyTimer);
            this.notifyTimer = setTimeout(() => {
                this.setState({
                    left: window.innerWidth / 2,
                    top: window.innerHeight / 2,
                })
                this.onGameBoard();
            }, 100)
        };
    }

    private notifyTimer: number | undefined;

    onNewAddressUncovered(address: Address) {
        setTimeout(() => {
            const nextLeftScrollPosition = ((address.column * Config.cellSizePx) + (Config.cellSizePx / 2));
            const nextTopScrollPosition = ((address.row * Config.cellSizePx) + (Config.cellSizePx / 2));
            const boardElement = document.querySelector(GameBoardElement.componentName);
            boardElement?.scroll({
                top: nextTopScrollPosition,
                left: nextLeftScrollPosition
            })
        }, 0);
    }

    onGameBoard() {
        const topRightFloater = document.getElementById('GameBoardElement_floater-top-right');
        const bottomLeftFloater = document.getElementById('GameBoardElement_floater-bottom-left');

        if (topRightFloater) {
            const currentLeft = parseInt(topRightFloater.style.left) ?? 0;
            const nextLeft = (this.state.left * 2) + (Config.cellSizePx * Config.boardSize);

            if (currentLeft !== nextLeft) {
                topRightFloater.style.left = `${nextLeft}px`;
            }
        }

        if (bottomLeftFloater) {
            const currentTop = parseInt(bottomLeftFloater.style.top) ?? 0;
            const nextTop = (this.state.top * 2) + (Config.cellSizePx * Config.boardSize);
            if (currentTop !== nextTop) {
                bottomLeftFloater.style.top = `${nextTop}px`;
            }
        }
    }
}

export default FloatersService;