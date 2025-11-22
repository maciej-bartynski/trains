import GameFieldElement from "./components/GameFieldElement/GameFieldElement.js";
import FieldModel from "./models/FieldModel.js";
import TrainModel from "./models/TrainModel.js";
import Address from "./types/Address.js";
import ConstructionState from "./types/ConstructionState.js";
import FieldVisibility from "./types/FieldVisibility.js";
import AddressUtils from "./utils/AddressUtils.js";
import AdjacentFields from "./utils/AdjacentFields.js";

interface GameBoardState {
    fields: Record<string, FieldModel>;
    trains: Record<string, TrainModel>;
    furthestRow: number;
    furthestColumn: number;
}

type GameBoardListener = (params: GameBoard) => void;

class GameBoard implements GameBoardState {

    private _listeners: GameBoardListener[] = [];

    private _fields: Record<string, FieldModel> = {};

    private _trains: Record<string, TrainModel> = {};

    private _furthestRow: number = 0;

    private _furthestColumn: number = 0;

    public get trains() {
        return this._trains;
    }

    public get fields() {
        return this._fields;
    }

    public get furthestRow() {
        return this._furthestRow;
    }

    public get furthestColumn() {
        return this._furthestColumn;
    }

    public get state() {
        return {
            fields: this._fields,
            trains: this._trains,
            furthestRow: this._furthestRow,
            furthestColumn: this._furthestColumn
        }
    }

    private constructor(params: GameBoardState) {
        Object.entries(params.fields).forEach(([key, field]) => {
            this._fields[key] = FieldModel.fromJSON(field);
        });
        Object.entries(params.trains).forEach(([key, train]) => {
            this._trains[key] = TrainModel.fromJSON(train);
        });
        this._furthestColumn = params.furthestColumn;
        this._furthestRow = params.furthestRow;
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

    public getFieldElement(address: Address): GameFieldElement {
        return document.querySelector(`${GameFieldElement.componentName}[data-key="${AddressUtils.toKey(address)}"]`) as GameFieldElement
    }

    public setField(address: Address) {
        if (this._fields[AddressUtils.toKey(address)]) {
            return;
        }
        const newField = FieldModel.touch(address);
        this._fields[AddressUtils.toKey(address)] = newField;
        this._notifyListeners();
    }

    private setUpField(address: Address, field: FieldModel) {
        this._fields[AddressUtils.toKey(address)] = field;
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

        Object.values({
            ...adjacentAddresses,
            'center': existingField.address
        }).forEach(address => {
            if (address) {
                this._furthestColumn = address.column > this._furthestColumn ? address.column : this._furthestColumn;
                this._furthestRow = address.row > this._furthestRow ? address.row : this._furthestRow;
            }
        })

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

    public toJSON(): any {
        return JSON.parse(JSON.stringify(this.state));
    }

    static fromJSON(json: GameBoardState) {
        const listeners = [...GameBoard.instance._listeners];
        GameBoard.instance = new GameBoard(json);
        GameBoard.instance._listeners = listeners;
        GameBoard.instance._notifyListeners();
        Object.entries(GameBoard.instance.fields).forEach(fieldEntry => {
            const [stringAddress, fieldModelData] = fieldEntry;
            const address = AddressUtils.fromKey(stringAddress);
            const fieldModel = FieldModel.fromJSON(fieldModelData);
            if (address) {
                GameBoard.instance.setUpField(address, fieldModel);
                fieldModel.subscribe(GameBoard.instance.onBuild)
            }
        });
        GameBoard.instance._notifyListeners();
        Object.entries(GameBoard.instance._trains).forEach(train => {
            const [trainId, trainModelData] = train;
            const trainModel = TrainModel.fromJSON(trainModelData);
            GameBoard.instance.setTrain(trainModel);
        });
        GameBoard.instance._notifyListeners();
    }

    static instance: GameBoard;
    static getInstance() {
        if (!GameBoard.instance) {
            GameBoard.instance = new GameBoard({
                fields: {},
                trains: {},
                furthestRow: 0,
                furthestColumn: 0
            });
        }
        return GameBoard.instance
    }
}

export default GameBoard;

export { GameBoard };