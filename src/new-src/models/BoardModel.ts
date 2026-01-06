import Config from "#src/config.js";
import Direction from "../enums/Direction.js";
import State from "../framework/State.js";
import MiscTools from "../tools/MiscTools.js";
import Address from "../types/Address.js";
import AddressUtils from "../utils/AddressUtils.js";
import AdjacentFields from "../utils/AdjacentFields.js";
import { addresAsKey, BoardState, uniqueIdAsKey } from "./BoardModel.type.js";
import BuildingModel from "./BuildingModel.js";
import { BuildingState } from "./BuildingModel.type.js";
import EventsModel from "./EventsModel.js";
import { EventsState } from "./EventsModel.type.js";
import FieldModel from "./FieldModel.js";
import { FieldState } from "./FieldModel.type.js";
import TrainModel from "./TrainModel.js";
import { TrainState } from "./TrainModel.type.js";

type Piece = 'fields' | 'trains' | 'events' | 'buildings';

class BoardModel extends State<BoardState> {

    private _fieldListeners: (() => void)[] = [];

    private _eventsListeners: (() => void)[] = [];

    private _trainListeners: (() => void)[] = [];

    private _buildingListeners: (() => void)[] = [];

    private _notifyListeners(type: Piece) {
        switch (type) {
            case 'fields': {
                this._fieldListeners.forEach(l => l());
                break;
            }
            case 'trains': {
                this._trainListeners.forEach(l => l());
                break;
            }
            case 'events': {
                this._eventsListeners.forEach(l => l());
                break;
            }
            case 'buildings': {
                this._buildingListeners.forEach(l => l());
                break;
            }
        }
        this.setState({});

        if (this._savingMode) {
            window.localStorage.setItem(Config.storageKeyGameBoard, JSON.stringify({
                fields: JSON.parse(MiscTools.mapToString(this.state.fields, { valueProcessor: (value: FieldModel) => value.state })),
                events: MiscTools.mapToString(this.state.events, { valueProcessor: (value: EventsModel) => value.state }),
                buildings: MiscTools.mapToString(this.state.buildings, { valueProcessor: (value: BuildingModel) => value.state }),
                trains: MiscTools.mapToString(this.state.trains, { valueProcessor: (value: TrainModel) => value.state }),
            }))
        }
    }

    public subscribePiece(type: Piece, listener: () => void) {
        switch (type) {
            case 'fields': {
                this._fieldListeners.push(listener);
                listener();
                break;
            }
            case 'trains': {
                this._trainListeners.push(listener);
                listener();
                break;
            }
            case 'events': {
                this._eventsListeners.push(listener);
                listener();
                break;
            }
            case 'buildings': {
                this._buildingListeners.push(listener);
                listener();
                break;
            }
        }
    }

    public unsubscribePiece(type: Piece, listener: () => void) {
        switch (type) {
            case 'fields': {
                this._fieldListeners.filter(l => l !== listener);
                break;
            }
            case 'trains': {
                this._trainListeners.filter(l => l !== listener);
                break;
            }
            case 'events': {
                this._eventsListeners.filter(l => l !== listener);
                break;
            }
            case 'buildings': {
                this._buildingListeners.filter(l => l !== listener);
                break;
            }
        }
    }

    public getStateByAddress(address: Address) {
        const key = AddressUtils.toKey(address);
        const field = this.state.fields.get(key);
        const events = this.state.events.get(key);
        const trains: TrainModel[] = [];
        this.state.trains.forEach((train) => {
            if (AddressUtils.isAddressEqual(train.state.location, address)) {
                trains.push(train);
            }
        });
        const buildings = this.state.buildings.get(key);

        if (field) {
            return {
                field,
                events,
                trains,
                buildings
            }
        }

        return null;
    }

    private _savingMode = true;

    constructor(params: {
        setup: {
            fields: Record<addresAsKey, FieldState>,
            events: Record<addresAsKey, EventsState[]>,
            buildings: Record<addresAsKey, BuildingState>,
            trains: Record<uniqueIdAsKey, TrainState>,
        }
    }) {

        super({
            initialState: {
                fields: new Map(),
                events: new Map(),
                buildings: new Map(),
                trains: new Map(),
            }
        });

        this.onUncoverField = this.onUncoverField.bind(this);
        this.subscribePiece = this.subscribePiece.bind(this);
        this.unsubscribePiece = this.unsubscribePiece.bind(this);

        FieldModel.game = this;

        const { fields, events, trains, buildings } = params.setup;

        const loadedBoardState: BoardState = {
            fields: new Map(
                Object
                    .entries(fields)
                    .map(entry => {
                        const [key, state] = entry;
                        return [key, new FieldModel(state)]
                    })
            ),
            events: new Map(
                Object
                    .entries(events)
                    .map(entry => {
                        const [key, states] = entry;
                        const models = states.map(s => new EventsModel(s))
                        return [key, models]
                    })
            ),
            buildings: new Map(
                Object
                    .entries(buildings)
                    .map(entry => {
                        const [key, state] = entry;
                        return [key, new BuildingModel(state)]
                    })
            ),
            trains: new Map(
                Object
                    .entries(trains)
                    .map(entry => {
                        const [key, state] = entry;
                        return [key, new TrainModel(state)]
                    })
            ),
        }

        this.setState(loadedBoardState);
    }

    public onUncoverField(params: { address: Address }) {
        const { address } = params;
        const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address });

        Object
            .entries(adjacentAddresses)
            .forEach(entry => {
                const [direction, address] = entry as [Direction, Address];
                const key = AddressUtils.toKey(address);
                const field = this.state.fields.get(key);
                if (address && !field) {
                    this.state.fields.set(key, new FieldModel(address));
                }
            });

        this._notifyListeners('fields');
    }
}

export default BoardModel;