import BoardModel from "../models/BoardModel.js";
import PieceEnum from "../models/BoardModel.type.js";
import DB from "./DbService.js";

abstract class State<T extends Object & { _id: string }> {

    static game: BoardModel;

    private _state: T = {} as T;

    get state() {
        return this._state;
    }

    private _listeners: ((state: T) => void)[] = [];

    private async _notifyListeners() {
        this._listeners.forEach(l => l(this.state));
    }

    private _storeName: PieceEnum;

    constructor(params: {
        store: PieceEnum;
        initialState: T & { _id: string },
        initialListeners?: (() => void)[],
        initialNotify?: boolean;
    }) {
        this.willChange = this.willChange.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.setState = this.setState.bind(this);
        this._notifyListeners = this._notifyListeners.bind(this);

        this._storeName = params.store;
        this._state = params.initialState;

        if (params?.initialListeners) {
            this._listeners = params.initialListeners
        }

        if (params?.initialNotify) {
            this._notifyListeners();
        }

        DB.I().set(this._storeName, params.initialState);
    }

    private willChange(newState: Partial<T>): boolean {
        const oldState = this.state;
        const nextState = {
            ...oldState,
            ...newState,
        }

        const oldStateToken = JSON.stringify(oldState).split('').sort();
        const newStateToken = JSON.stringify(nextState).split('').sort();
        if (oldStateToken === newStateToken) {
            return false;
        }
        return true;
    }

    protected setState(newState: Partial<T>) {
        if (this.willChange(newState)) {
            const nextState = {
                ...this.state,
                ...newState,
            }
            this._state = nextState;
            this._notifyListeners();
            DB.I().set(this._storeName, nextState);
        }
    }

    public subscribe(listener: (state: T) => void) {
        if (!this._listeners.includes(listener)) {
            this._listeners.push(listener);
            listener(this.state);
        }
    }

    public unsubscribe(listener: (state: T) => void) {
        if (this._listeners.includes(listener)) {
            this._listeners = this._listeners.filter(l => l !== listener)
        }
    }
}

export default State;