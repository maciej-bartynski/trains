import GameBoard from "#src/GameBoard";

type StateListener<T> = ((state: T) => void)

abstract class Service<TState extends Object> {

    static gameBoard: GameBoard;

    static register(gameBoard: GameBoard) {
        Service.gameBoard = gameBoard;
    }

    private _listeners: ((state: TState) => void)[] = [];

    abstract state: TState;

    public setState(newState: Partial<TState>) {
        this.state = {
            ...this.state,
            ...newState
        }
        this._notifyListeners();
    }

    public subscribe(listener: StateListener<TState>) {
        if (!this._listeners.includes(listener)) {
            this._listeners.push(listener);
            listener(this.state);
        }
    }

    public unsubscribe(listener: StateListener<TState>) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    protected _notifyListeners() {
        this._listeners.forEach(l => l(this.state))
    }
}

export default Service;