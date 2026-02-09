import BuildingKind from "../enums/BuildingKind.js";
import Direction from "../enums/Direction.js";
import Orientation from "../enums/Orientation.js";
import TrackKind from "../enums/TrackKind.js";
import DB from "../framework/DbService.js";
import State from "../framework/State.js";
import StatefullElement from "../framework/StatefullElement.js";
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
import baseSetup from "../scenarios/base.js";
import SailUtils from "../utils/SailUtils.js";
import RailwayUtils from "../utils/RailwayUtils.js";

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

    private _initialized = false;

    public init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;

        BuildingUtils.game = this;
        TrackUtils.game = this;
        SailUtils.game = this;

        AdjacentFields.game = this;

        State.game = this;
        StatefullElement.game = this;
        FieldModel.game = this;
        BuildingModel.game = this;

        this.configure();
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
    }


    public setSelectedField(payload: { selectedField: null | Address }) {
        this.state[PieceEnum.SelectedField] = payload.selectedField;
        this._notifyListeners(PieceEnum.SelectedField)
    }

    private getRailwayIncomingDirections(address: Address): Direction[] {
        const adjacent = AdjacentFields.getAdjacentAddresses({ address });
        const incoming: Direction[] = [];

        const hasNode = (orientation: Orientation, node: Direction): boolean => {
            if (orientation.center && orientation.center[node]) {
                return true;
            }
            const connections = orientation[node];
            if (!connections) return false;
            return Object.values(connections).some(Boolean);
        };

        Object.entries(adjacent).forEach(entry => {
            const [dir, neighborAddress] = entry as [Direction, Address | undefined];
            if (!neighborAddress) return;
            const neighborTracks = this.state[PieceEnum.Tracks].get(AddressUtils.toKey(neighborAddress))?.state.orientations[TrackKind.Railway] ?? null;
            if (!neighborTracks) return;
            const opposite = OrientationUtils.OpositeDirections[dir];
            if (hasNode(neighborTracks, opposite)) {
                incoming.push(dir);
            }
        });

        return incoming;
    }

    private buildRailwayCenterOrientation(direction: Direction): Orientation {
        const centerConnections = {
            [Direction.Top]: direction === Direction.Top,
            [Direction.Right]: direction === Direction.Right,
            [Direction.Bottom]: direction === Direction.Bottom,
            [Direction.Left]: direction === Direction.Left,
        };
        const makeEdgeConnections = (self: Direction) => ({
            [Direction.Top]: self === Direction.Top ? false : false,
            [Direction.Right]: self === Direction.Right ? false : false,
            [Direction.Bottom]: self === Direction.Bottom ? false : false,
            [Direction.Left]: self === Direction.Left ? false : false,
            center: true,
        } as Record<Direction | 'center', boolean>);

        return {
            [Direction.Top]: direction === Direction.Top ? makeEdgeConnections(Direction.Top) : null,
            [Direction.Right]: direction === Direction.Right ? makeEdgeConnections(Direction.Right) : null,
            [Direction.Bottom]: direction === Direction.Bottom ? makeEdgeConnections(Direction.Bottom) : null,
            [Direction.Left]: direction === Direction.Left ? makeEdgeConnections(Direction.Left) : null,
            center: centerConnections,
        } as Orientation;
    }

    private buildRailwaySwitchOrientation(directions: Direction[]): Orientation {
        const nodes = new Set(directions);
        const makeConnections = (self: Direction) => {
            const connections: Record<Direction | 'center', boolean> = {
                [Direction.Top]: false,
                [Direction.Right]: false,
                [Direction.Bottom]: false,
                [Direction.Left]: false,
                center: false,
            };
            directions.forEach(dir => {
                if (dir !== self) {
                    connections[dir] = true;
                }
            });
            return connections;
        };

        return {
            [Direction.Top]: nodes.has(Direction.Top) ? makeConnections(Direction.Top) : null,
            [Direction.Right]: nodes.has(Direction.Right) ? makeConnections(Direction.Right) : null,
            [Direction.Bottom]: nodes.has(Direction.Bottom) ? makeConnections(Direction.Bottom) : null,
            [Direction.Left]: nodes.has(Direction.Left) ? makeConnections(Direction.Left) : null,
            center: null,
        } as Orientation;
    }


    private updateRailwayCenterConnections(address: Address) {
        const data = this.getStateByAddress(address);
        const buildingKind = data?.buildings?.state.kind;
        if (!data || !buildingKind) return;

        const isWarehouse = buildingKind === BuildingKind.RoadWarehouse;
        const isCargoPort = [
            BuildingKind.CargoPortTop,
            BuildingKind.CargoPortBottom,
            BuildingKind.CargoPortLeft,
            BuildingKind.CargoPortRight,
        ].includes(buildingKind);

        if (!isWarehouse && !isCargoPort) return;

        const incoming = this.getRailwayIncomingDirections(address);

        let allowedIncoming = incoming;

        if (isWarehouse) {
            const roadOrientation = data.tracks?.state.orientations[TrackKind.Road];
            if (!roadOrientation?.center) return;
            const roadDir = (Object.entries(roadOrientation.center)
                .find(([, isConnected]) => isConnected)?.[0] ?? null) as Direction | null;
            if (!roadDir) return;
            allowedIncoming = incoming.filter(dir => dir !== roadDir);
        }

        if (isCargoPort) {
            let allowedDir: Direction | null = null;
            switch (buildingKind) {
                case BuildingKind.CargoPortTop:
                    allowedDir = Direction.Top;
                    break;
                case BuildingKind.CargoPortBottom:
                    allowedDir = Direction.Bottom;
                    break;
                case BuildingKind.CargoPortLeft:
                    allowedDir = Direction.Left;
                    break;
                case BuildingKind.CargoPortRight:
                    allowedDir = Direction.Right;
                    break;
            }
            if (!allowedDir) return;
            allowedIncoming = incoming.filter(dir => dir === allowedDir);
        }

        if (allowedIncoming.length === 0) return;

        const firstDirection = allowedIncoming[0];
        if (!firstDirection) {
            return;
        }

        const newRailwayOrientation = allowedIncoming.length === 1 || isCargoPort
            ? this.buildRailwayCenterOrientation(firstDirection)
            : this.buildRailwaySwitchOrientation(allowedIncoming);

        const key = AddressUtils.toKey(address);
        const existingTracks: Record<TrackKind, Orientation | null> = Object.assign({}, data.tracks?.state.orientations ?? {
            [TrackKind.Railway]: null,
            [TrackKind.Road]: null,
            [TrackKind.Sail]: null,
            [TrackKind.Fly]: null,
        });

        existingTracks[TrackKind.Railway] = newRailwayOrientation;

        let trackModel = this.state[PieceEnum.Tracks].get(key);
        if (!trackModel) {
            this.state[PieceEnum.Tracks].set(key, new TrackModel({
                _id: key,
                address,
                orientations: existingTracks
            }));
        } else {
            trackModel.updateOrientation(existingTracks);
        }

        this._notifyListeners(PieceEnum.Tracks);
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

            if ([
                BuildingKind.RoadWarehouse,
                BuildingKind.CargoPortTop,
                BuildingKind.CargoPortBottom,
                BuildingKind.CargoPortLeft,
                BuildingKind.CargoPortRight,
            ].includes(buildingKind)) {
                this.updateRailwayCenterConnections(address);
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
            options: { orientation: params.orientation }
        })

        if (canBuild) {

            const { tracks } = this.getStateByAddress(address) ?? {};

            const existingTracks: Record<TrackKind, Orientation | null> = Object.assign({}, tracks?.state.orientations ?? {
                [TrackKind.Railway]: tracks?.state.orientations.railway ?? null,
                [TrackKind.Road]: tracks?.state.orientations.road ?? null,
                [TrackKind.Sail]: tracks?.state.orientations.sail ?? null,
                [TrackKind.Fly]: tracks?.state.orientations.fly ?? null,
            });

            if (params.kind === TrackKind.Railway) {
                if (existingTracks[TrackKind.Railway]) {
                    existingTracks[TrackKind.Railway] = RailwayUtils.mergeRailwayOrientations({
                        orientation: existingTracks[TrackKind.Railway],
                        orientationUpdate: params.orientation
                    }) as any;
                } else {
                    existingTracks[TrackKind.Railway] = params.orientation;
                }
            }

            if (params.kind === TrackKind.Sail) {
                existingTracks[TrackKind.Sail] = params.orientation;
            }

            if (params.kind === TrackKind.Road) {
                existingTracks[TrackKind.Road] = params.orientation;
            }

            const model = this.state[PieceEnum.Tracks].get(key);

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