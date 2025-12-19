import GameFieldElement from "./components/GameFieldElement/GameFieldElement.js";
import Service from "./framework/Service/Service.js";
import FieldModel from "./models/FieldModel.js";
import RouteEventModel from "./models/RouteEventModel.js";
import TrainModel from "./models/TrainModel.js";
import ActionsMenuService from "./service/ActionsMenuService/ActionsMenuService.js";
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
    resources: {
        wood: number,
        stone: number,
        iron: number,
        coal: number,
        gold: number,
    },
    furthestRow: number;
    furthestColumn: number;
}

class GameBoard extends Service<GameBoardState> {

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

    state: GameBoardState = {
        fields: {},
        trains: {},
        resources: {
            wood: 10,
            stone: 10,
            iron: 10,
            coal: 10,
            gold: 10,
        },
        furthestRow: 0,
        furthestColumn: 0,
    }

    private constructor() {
        super();
        this.onBuild = this.onBuild.bind(this);
    }

    private configure(game: {
        fields: Record<string, FieldModel['state']>,
        trains: Record<string, TrainModel['state']>,
        events: Record<string, RouteEventModel['state']>,
        furthestColumn: number,
        furthestRow: number,
    } | null) {
        if (game) {
            Object.entries(game.fields).forEach(([key, field]) => {
                this.state.fields[key] = FieldModel.fromJSON(field);
            });
            Object.entries(game.trains).forEach(([key, train]) => {
                this.state.trains[key] = TrainModel.fromJSON(train);
            });
            this.state.furthestColumn = game.furthestColumn;
            this.state.furthestRow = game.furthestRow;
        }
    }

    public setTrain(train: TrainModel) {
        this.setState({
            trains: {
                ...this.state.trains,
                [train.state.id]: train,
            }
        })
    }

    public getTrain(id: string) {
        return this.state.trains[id];
    }

    public getField(address: Address) {
        return this.state.fields[AddressUtils.toKey(address)];
    }

    public getFieldElement(address: Address): GameFieldElement {
        return document.querySelector(`${GameFieldElement.componentName}[data-key="${AddressUtils.toKey(address)}"]`) as GameFieldElement
    }

    public setField(address: Address) {
        if (this.getField(address)) {
            return;
        }

        const newField = FieldModel.touch(address);

        this.setState({
            fields: {
                ...this.state.fields,
                [AddressUtils.toKey(address)]: newField
            }
        })
    }

    public onBuild(state: FieldModel['state']) {
        if (state.constructionSite?.state === ConstructionState.Started) {
            const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address: state.address });
            Object.values(adjacentAddresses).forEach(address => {
                if (address) {
                    const adjacentField = this.getField(address);
                    if (!adjacentField) {
                        this.setField(address);
                    } else if (adjacentField?.state.visibility === FieldVisibility.Hidden || adjacentField?.state.visibility === FieldVisibility.Ready) {
                        adjacentField.uncover();
                        this.uncoverField(address)
                    }
                }
            });
        }
    }

    public uncoverField(address: Address) {
        const existingField = this.getField(address);
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
                    this.state.fields[AddressUtils.toKey(address)] = fieldTouched;
                }
            }
        });

        Object.values({
            ...adjacentAddresses,
            'center': existingField.state.address
        }).forEach(address => {
            if (address) {
                this.state.furthestColumn = address.column > this.state.furthestColumn ? address.column : this.state.furthestColumn;
                this.state.furthestRow = address.row > this.state.furthestRow ? address.row : this.state.furthestRow;
            }
        })

        this._notifyListeners();
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
