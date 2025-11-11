import { Operation } from "./types.js";

class PointerOperations {

    private _listeners: ((operation: Operation | null) => void)[] = [];

    private _operation: Operation | null = null;

    get operation() {
        return this._operation;
    }

    public subscribe(listener: (operation: Operation | null) => void) {
        if (this._listeners.includes(listener)) {
            return;
        }
        this._listeners.push(listener);
        listener(this._operation);
    }

    public unsubscribe(listener: (operation: Operation | null) => void) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    private _notifyListeners() {
        this._listeners.forEach(listener => listener(this._operation));
    }

    constructor() { }

    public onSetOperation(operation: Operation) {
        this._operation = operation;
        this._notifyListeners();
    }

    public onClearOperation() {
        this._operation = null;
        this._notifyListeners();
    }
}

const pointerOperations = new PointerOperations();
export default pointerOperations;

export {
    PointerOperations,
};