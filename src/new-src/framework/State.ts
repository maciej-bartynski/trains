import BoardModel from "../models/BoardModel.js";

class State<T extends Object> {
    private _state: T = {} as T;

    get state() {
        return this._state;
    }

    private listeners: (() => void)[] = [];

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    constructor(params: {
        initialState: T,
        initialListeners?: (() => void)[],
        initialNotify?: boolean;
    }) {

        this.willChange = this.willChange.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.notifyListeners = this.notifyListeners.bind(this);
        this.setState = this.setState.bind(this);

        this._state = params.initialState;

        if (params?.initialListeners) {
            this.listeners = params.initialListeners
        }

        if (params?.initialNotify) {
            this.notifyListeners();
        }
    }

    public willChange(newState: Partial<T>): boolean {
        const oldStateToken = JSON.stringify(this.state).split('').sort();
        const newStateToken = JSON.stringify(newState).split('').sort();
        if (oldStateToken === newStateToken) return false;
        return true;
    }

    public setState(newState: Partial<T>) {
        if (this.willChange(newState)) {
            this._state = {
                ...this._state,
                ...newState,
            }
            this.notifyListeners();
        }
    }

    public subscribe(listener: () => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
            listener();
        }
    }

    public unsubscribe(listener: () => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }
}

export default State;