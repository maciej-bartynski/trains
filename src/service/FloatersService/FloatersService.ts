import GameBoardElement from "#src/components/GameBoard.js";
import Config from "#src/config.js";
import GameBoard from "#src/GameBoard.js";
import Address from "#src/types/Address.js";

class FloatersService {

    private _listeners: ((params: { left: number, top: number }) => void)[] = [];

    private _scrollLeftOffsetPx = window.innerWidth / 2;
    private _scrollTopOffsetPx = window.innerHeight / 2;

    get scrollLeftOffsetPx() {
        return this._scrollLeftOffsetPx;
    }

    get scrollTopOffsetPx() {
        return this._scrollTopOffsetPx;
    }

    subscribe(listener: (params: { left: number, top: number }) => void) {
        if (!this._listeners.includes(listener)) {
            this._listeners.push(listener);
            listener({ left: this._scrollLeftOffsetPx, top: this._scrollTopOffsetPx });
        }
    }

    unsubscribe(listener: (params: { left: number, top: number }) => void) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    notifyListeners() {
        this._listeners.forEach(l => l({ left: this._scrollLeftOffsetPx, top: this._scrollTopOffsetPx }));
    }

    private notifyTimer: number | undefined;

    private static instance: FloatersService;

    private constructor() {

        this.onGameBoard = this.onGameBoard.bind(this);
        // GameBoard.getInstance().subscribe(this.onGameBoard);

        window.onresize = () => {
            clearTimeout(this.notifyTimer);
            this.notifyTimer = setTimeout(() => {
                this._scrollLeftOffsetPx = window.innerWidth / 2;
                this._scrollTopOffsetPx = window.innerHeight / 2;
                this.onGameBoard();
                this.notifyListeners();
            }, 100)
        };
    }

    static getInstance(): FloatersService {
        if (FloatersService.instance) {
            return FloatersService.instance
        }

        FloatersService.instance = new FloatersService();
        return FloatersService.instance;
    }

    onNewAddressUncovered(address: Address) {
        setTimeout(() => {
            const nextLeftScrollPosition = ((address.column * Config.cellSizePx) + (Config.cellSizePx / 2)); this._scrollLeftOffsetPx;
            const nextTopScrollPosition = ((address.row * Config.cellSizePx) + (Config.cellSizePx / 2)); this._scrollTopOffsetPx;
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
            const nextLeft = (this._scrollLeftOffsetPx * 2) + (Config.cellSizePx * Config.boardSize);

            if (currentLeft !== nextLeft) {
                topRightFloater.style.left = `${nextLeft}px`;
            }
        }

        if (bottomLeftFloater) {
            const currentTop = parseInt(bottomLeftFloater.style.top) ?? 0;
            const nextTop = (this._scrollTopOffsetPx * 2) + (Config.cellSizePx * Config.boardSize);
            if (currentTop !== nextTop) {
                bottomLeftFloater.style.top = `${nextTop}px`;
            }
        }
    }
}

export default FloatersService;