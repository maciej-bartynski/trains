import GameFieldElement from "./components/GameFieldElement/GameFieldElement.js";
import Service from "./framework/Service/Service.js";
import FieldModel from "./models/FieldModel.js";
import TrainModel from "./models/TrainModel.js";
import ActionsMenuService from "./service/ActionsMenuService/ActionsMenuService.js";
import actionsMenuService from "./service/ActionsMenuService/index.js";
import FloatersService from "./service/FloatersService/FloatersService.js";
import Address from "./types/Address.js";
import ConstructionState from "./types/ConstructionState.js";
import Direction from "./types/Direction.js";
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

    static ServicesRegistry: {
        floaters: FloatersService,
        actionsMenu: ActionsMenuService,
    } = {
            floaters: null!,
            actionsMenu: null!
        }

    private registerServices() {
        Service.register(this);
        GameBoard.ServicesRegistry.floaters = FloatersService.getInstance();
        GameBoard.ServicesRegistry.actionsMenu = ActionsMenuService.getInstance();
    }

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

    private constructor() {
        this.onBuild = this.onBuild.bind(this);
    }

    private configure(game: GameBoardState | null) {
        if (game) {
            Object.entries(game.fields).forEach(([key, field]) => {
                this._fields[key] = FieldModel.fromJSON(field);
            });
            Object.entries(game.trains).forEach(([key, train]) => {
                this._trains[key] = TrainModel.fromJSON(train);
            });
            this._furthestColumn = game.furthestColumn;
            this._furthestRow = game.furthestRow;
        }
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

    static instance: GameBoard;
    static getInstance() {
        if (!GameBoard.instance) {
            const gameString = window.localStorage.getItem('game');
            const game = gameString ? JSON.parse(gameString) : null;

            GameBoard.instance = new GameBoard();
            GameBoard.instance.registerServices();
            GameBoard.instance.configure(game ? game : null);

            if (!gameString) {
                const gameBoard = GameBoard.instance;
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
        }
        return GameBoard.instance
    }
}

export default GameBoard;
