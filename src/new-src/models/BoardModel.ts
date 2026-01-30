import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import Orientation, { OrientationGeneral } from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import DB from "../framework/DbService.js";
import State from "../framework/State.js";
import StatefullElement from "../framework/StatefullElement.js";
import baseSetup from "../scenarios/base.js";
import Address from "../types/Address.js";
import AddressUtils from "../utils/AddressUtils.js";
import AdjacentFields from "../utils/AdjacentFields.js";
import BuildingUtils, { CanBuildParams } from "../utils/BuildingUtils.js";
import OrientationUtils from "../utils/OrientationUtils.js";
import TrackUtils from "../utils/TrackUtils.js";
import PieceEnum, { BoardState, SetupState } from "./BoardModel.type.js";
import BuildingModel from "./BuildingModel.js";
import EventsModel from "./EventsModel.js";
import FieldModel from "./FieldModel.js";
import TrackModel from "./TrackModel.js";
import TrainModel from "./TrainModel.js";

class BoardModel {

    private _state: BoardState = {} as BoardState;

    get state() {
        return this._state;
    }

    _listenersByPiece: Record<PieceEnum, (() => void)[]> = {
        [PieceEnum.Buildings]: [],
        [PieceEnum.Fields]: [],
        [PieceEnum.Events]: [],
        [PieceEnum.Trains]: [],
        [PieceEnum.Tracks]: [],
        [PieceEnum.SelectedField]: []
    }

    private _notifyListeners(type?: PieceEnum) {
        if (type) {
            this._listenersByPiece[type].forEach(l => l())
        } else {
            Object.values(this._listenersByPiece).forEach(litenersArray => {
                litenersArray.forEach(l => l());
            })
        }
    }

    public subscribePiece(listener: () => void, options?: { type?: PieceEnum }) {
        if (options?.type) {
            if (!this._listenersByPiece[options.type].includes(listener)) {
                this._listenersByPiece[options.type].push(listener);
                listener();
            }
        } else {
            Object.values(this._listenersByPiece).forEach(litenersArray => {
                if (!litenersArray.includes(listener)) {
                    litenersArray.push(listener);
                    listener();
                }
            })
        }
    }

    public unsubscribePiece(listener: () => void, options?: { type?: PieceEnum }) {
        if (options?.type) {
            if (this._listenersByPiece[options.type].includes(listener)) {
                this._listenersByPiece[options.type] = this._listenersByPiece[options.type].filter(l => l !== listener);
                listener();
            }
        } else {
            Object.entries(this._listenersByPiece).forEach(([key, litenersArray]) => {
                const piece = key as PieceEnum;
                if (litenersArray.includes(listener)) {
                    this._listenersByPiece[piece] = litenersArray.filter(l => l !== listener)
                }
            })
        }
    }

    private setState(newState: Partial<BoardState>): void;
    private setState<T extends PieceEnum>(newState: Pick<BoardState, T>, type: T): void
    private setState<T extends PieceEnum>(newState: Partial<BoardState> | Pick<BoardState, T>, type?: T): void {
        this._state = {
            ...this._state,
            ...newState,
        }

        if (type) {
            this._notifyListeners(type as PieceEnum)
        } else {
            this._notifyListeners()
        }
    }

    public getStateByAddress(address: Address) {
        const key = AddressUtils.toKey(address);
        const field = this.state.fields.get(key);
        const events = this.state.events.get(key);
        const trains: TrainModel[] = [];
        const tracks = this.state[PieceEnum.Tracks].get(key);
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
                buildings,
                tracks
            }
        }

        return null;
    }

    private _resolveConfigured?: (value: void | PromiseLike<void>) => void

    public configured: Promise<void> = new Promise((r) => {
        this._resolveConfigured = r;
    });

    public async configure() {
        let stateFromSetup: BoardState;
        const dbService = DB.I();
        const dbExists = await DB.exists()

        if (!dbExists) {
            await dbService.createDb();
            const initialSetup: SetupState = baseSetup;
            stateFromSetup = {
                ...baseSetup,
                fields: new Map(
                    Object
                        .entries(initialSetup.fields)
                        .map(entry => {
                            const [key, state] = entry;
                            return [key, new FieldModel(state)]
                        })
                ),
                events: new Map(
                    Object
                        .entries(initialSetup.events)
                        .map(entry => {
                            const [key, state] = entry;
                            return [key, new EventsModel(state)]
                        })
                ),
                buildings: new Map(
                    Object
                        .entries(initialSetup.buildings)
                        .map(entry => {
                            const [key, state] = entry;
                            return [key, new BuildingModel(state)]
                        })
                ),
                trains: new Map(
                    Object
                        .entries(initialSetup.trains)
                        .map(entry => {
                            const [key, state] = entry;
                            return [key, new TrainModel(state)]
                        })
                ),
                tracks: new Map(
                    Object
                        .entries(initialSetup.tracks)
                        .map(entry => {
                            const [key, state] = entry;
                            return [key, new TrackModel(state)]
                        })
                ),
            }
        } else {
            await dbService.createDb();
            stateFromSetup = {
                ...baseSetup,
                fields: new Map(
                    Object
                        .entries(await DB.I().getAll(PieceEnum.Fields))
                        .map(([key, state]) => [key, new FieldModel(state)])
                ),
                buildings: new Map(
                    Object
                        .entries(await DB.I().getAll(PieceEnum.Buildings))
                        .map(([key, state]) => [key, new BuildingModel(state)])
                ),
                events: new Map(
                    Object
                        .entries(await DB.I().getAll(PieceEnum.Events))
                        .map(([key, state]) => [key, new EventsModel(state)])
                ),
                trains: new Map(
                    Object
                        .entries(await DB.I().getAll(PieceEnum.Trains))
                        .map(([key, state]) => [key, new TrainModel(state)])
                ),
                tracks: new Map(
                    Object
                        .entries(await DB.I().getAll(PieceEnum.Tracks))
                        .map(([key, state]) => [key, new TrackModel(state)])
                ),
            };
        }
        this.setState(stateFromSetup);
        this._resolveConfigured?.()
    }

    public async restart() {
        await DB.I().drop();
        await DB.I().createDb();
    }

    private static _i: BoardModel;
    static I() {
        if (!BoardModel._i) {
            BoardModel._i = new BoardModel();
        }
        return BoardModel._i;
    }

    private constructor() {
        this.configure = this.configure.bind(this);
        this.restart = this.restart.bind(this);
        this.onUncoverField = this.onUncoverField.bind(this);
        this.onBuildBuilding = this.onBuildBuilding.bind(this);
        this.onBuildTrack = this.onBuildTrack.bind(this);
        this.subscribePiece = this.subscribePiece.bind(this);
        this.unsubscribePiece = this.unsubscribePiece.bind(this);
        this.setSelectedField = this.setSelectedField.bind(this);

        BuildingUtils.game = this;
        TrackUtils.game = this;
        State.game = this;
        StatefullElement.game = this;
        FieldModel.game = this;
        BuildingModel.game = this;

        this.configure();
    }


    public setSelectedField(payload: { selectedField: null | Address }) {
        this.state[PieceEnum.SelectedField] = payload.selectedField;
        this._notifyListeners(PieceEnum.SelectedField)
    }

    public onUncoverField(params: { address: Address }) {
        const { address } = params;
        const adjacentAddresses = AdjacentFields.getAdjacentAddresses({ address });

        Object
            .entries(adjacentAddresses)
            .forEach(entry => {
                const [direction, address] = entry as [Direction, Address];
                if (address) {
                    const key = AddressUtils.toKey(address);
                    const field = this.state.fields.get(key);
                    if (!field) {
                        this.state.fields.set(key, new FieldModel(address));
                    }
                }
            });

        this._notifyListeners(PieceEnum.Fields);
    }

    public onBuildBuilding(params: CanBuildParams) {
        const { address, buildingKind, options } = params;
        const key = AddressUtils.toKey(address);

        const canBuild = BuildingUtils.canBuild(params)

        if (canBuild) {
            this.state[PieceEnum.Buildings].set(key, new BuildingModel({
                _id: key,
                address,
                kind: buildingKind as BuildingKind,
                production: null,
                storage: null,
            }));

            if (buildingKind === BuildingKind.Harbour) {
                const seaKey = AddressUtils.toKey(options.seaAddress);
                this.state[PieceEnum.Buildings].set(seaKey, new BuildingModel({
                    _id: seaKey,
                    address: options.seaAddress,
                    kind: buildingKind as BuildingKind,
                    production: null,
                    storage: null,
                }));
            }

            this._notifyListeners(PieceEnum.Buildings);
        }
    }

    public onBuildTrack(params: {
        address: Address,
        kind: TrackKind,
        orientation: Orientation,
    }) {
        const { address, kind } = params;
        const key = AddressUtils.toKey(address);

        const canBuild = TrackUtils.canBuild({
            address,
            trackKind: kind,
            options: { orientations: params.orientation }
        })

        if (canBuild) {
            const { tracks } = this.getStateByAddress(address) ?? {};

            let existingTracks: Record<TrackKind, Orientation | null> = Object.assign({}, tracks?.state.orientations ?? {
                [TrackKind.Railway]: null,
                [TrackKind.Road]: null,
                [TrackKind.Sail]: null,
                [TrackKind.Fly]: null,
            });

            const toBeUpdatedKind = existingTracks[params.kind];

            if (!toBeUpdatedKind) {
                existingTracks[params.kind] = params.orientation
            } else {
                existingTracks = OrientationUtils.mergeOrientations({
                    orientations: existingTracks,
                    orientationsUpdate: {
                        [params.kind]: params.orientation
                    }
                });
            }

            let model = this.state[PieceEnum.Tracks].get(key);

            if (!model) {
                this.state[PieceEnum.Tracks].set(key, new TrackModel({
                    _id: key,
                    address,
                    orientations: existingTracks
                }));
            } else {
                model.updateOrientation(existingTracks)
            }

            this._notifyListeners(PieceEnum.Tracks);
        }
    }
}

export default BoardModel;