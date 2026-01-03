type TState = {
    [k: (string | number)]: (string | number | boolean | undefined | null | TState)
}

class State<T extends TState> {
    private _state: Partial<T> = {}

    get state() {
        return this._state;
    }

    private listeners: (() => void)[] = [];

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    constructor(params?: {
        initialState?: Partial<T>,
        initialListeners?: (() => void)[],
        initialNotify?: boolean;
    }) {
        if (params?.initialState) {
            this._state = params.initialState
        }

        if (params?.initialListeners) {
            this.listeners = params.initialListeners
        }

        if (params?.initialNotify) {
            this.notifyListeners();
        }
    }

    public willChange(newState: undefined | Partial<T>): boolean {
        const oldStateToken = JSON.stringify(this.state).split('').sort();
        const newStateToken = JSON.stringify(newState).split('').sort();
        if (oldStateToken === newStateToken) return false;
        return true;
    }

    public setState(newState: Partial<T>) {
        if (this.willChange(newState)) {
            this.notifyListeners();
        }
    }

    public subscribe(listener: () => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener)
        }

        listener();
    }

    public unsubscribe(listener: () => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }
}

export default State;