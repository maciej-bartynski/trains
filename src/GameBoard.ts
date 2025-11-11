import FieldModel from "./models/FieldModel.js";
import TrainModel from "./models/TrainModel.js";
import Address from "./types/Address.js";
import ConstructionState from "./types/ConstructionState.js";
import FieldVisibility from "./types/FieldVisibility.js";
import AddressUtils from "./utils/AddressUtils.js";
import AdjacentFields from "./utils/AdjacentFields.js";

interface GameBoardState {
    fields: Record<string, FieldModel>;
}

type GameBoardListener = (params: GameBoard) => void;

class GameBoard implements GameBoardState {

    private _listeners: GameBoardListener[] = [];

    private _fields: Record<string, FieldModel> = {};

    private _trains: Record<string, TrainModel> = {};

    public get trains() {
        return this._trains;
    }

    public get fields() {
        return this._fields;
    }

    constructor(params: GameBoardState) {
        Object.entries(params.fields).forEach(([key, field]) => {
            this._fields[key] = FieldModel.fromJSON(field);
        });
        this.onBuild = this.onBuild.bind(this);
    }

    public setTrain(train: TrainModel) {
        this._trains[train.id] = train;
        this._notifyListeners();
    }

    public getTrain(id: string) {
        return this._trains[id];
    }

    public getField(address: Address) {
        return this._fields[AddressUtils.toKey(address)];
    }

    public getFieldElement(address: Address) {
        return document.querySelector(`[data-key="${AddressUtils.toKey(address)}"]`)
    }

    public setField(address: Address) {
        if (this._fields[AddressUtils.toKey(address)]) {
            return;
        }
        const newField = FieldModel.touch(address);
        this._fields[AddressUtils.toKey(address)] = newField;
        this._notifyListeners();
    }

    public onBuild(state: FieldModel) {
        if (state.constructionSite?.state === ConstructionState.Started) {
            const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address: state.address });
            Object.values(adjacentAddresses).forEach(address => {
                if (address) {
                    const adjacentField = this.getField(address);
                    if (!adjacentField) {
                        this.setField(address);
                    } else if (adjacentField?.visibility === FieldVisibility.Hidden || adjacentField?.visibility === FieldVisibility.Ready) {
                        adjacentField.uncover();
                        this.uncoverField(address)
                    }
                }
            });
        }
    }

    public uncoverField(address: Address) {
        const existingField = this._fields[AddressUtils.toKey(address)];
        const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address: address });
        if (!existingField) {
            return;
        }
        existingField.uncover();

        existingField.subscribe(this.onBuild);
        Object.values(adjacentAddresses).forEach(address => {
            if (address) {
                const adjacentField = this.getField(address);
                if (!adjacentField) {
                    const fieldTouched = FieldModel.touch(address);
                    this._fields[AddressUtils.toKey(address)] = fieldTouched;
                }
            }
        });
        this._notifyListeners();
    }

    public unsubscribe(listener: GameBoardListener) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    public subscribe(listener: GameBoardListener) {
        if (this._listeners.includes(listener)) {
            return;
        }
        this._listeners.push(listener);
        listener(this);
    }

    private _notifyListeners() {
        this._listeners.forEach(listener => listener(this));
    }

    public toJSON(): GameBoardState {
        return JSON.parse(JSON.stringify({
            ...this
        }));
    }

    static fromJSON(json: GameBoardState) {
        return new GameBoard(json);
    }
}

const gameBoard = new GameBoard({
    fields: {},
});

export default gameBoard;

export { GameBoard };