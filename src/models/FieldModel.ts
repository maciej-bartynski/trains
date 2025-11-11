import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ConstructionSite from "#src/types/ConstructionSite.js";
import ConstructionState from "#src/types/ConstructionState.js";
import Direction from "#src/types/Direction.js";
import FieldVisibility from "#src/types/FieldVisibility.js";
import Orientation, { OrientationHorizontal, OrientationSquare, OrientationSquareVariant, OrientationVertical } from "#src/types/Orientation.js";
import TerrainKind from "#src/types/TerrainKind.js";
import TrainRouteEvent from "#src/types/TrainTrespassingEvent";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import AdjacentFields from "#src/utils/AdjacentFields.js";
import Terrain from "#src/utils/Terrain.js";

interface FieldState {
    constructionSite: ConstructionSite | null;
    address: Address,
    visibility: FieldVisibility,
    terrain: TerrainKind | null,
    terrainImageNumber: 1 | 2 | 3 | 4,
    terrainImageRotation: 1 | 2 | 3 | 4,
    railwayOrientation: Orientation,
    railwayOrientationSquareVariant: OrientationSquareVariant | null,
    building: BuildingKind | null,
    events: (TrainRouteEvent & { id: string })[],
}

type FieldListener = (state: FieldModel) => void;

class FieldModel implements FieldState {
    private _constructionInterval: number | null = null;

    private _address;
    private _constructionSite: ConstructionSite | null = null;
    private _visibility;
    private _terrain;
    private _terrainImageNumber;
    private _terrainImageRotation;
    private _railwayOrientation;
    private _railwayOrientationSquareVariant;
    private _building;
    private _events: (TrainRouteEvent & { id: string })[] = [];

    get address() {
        return this._address;
    }

    get constructionSite() {
        return this._constructionSite;
    }

    get visibility() {
        return this._visibility;
    }

    get terrain() {
        return this._terrain;
    }

    get terrainImageNumber() {
        return this._terrainImageNumber;
    }

    get terrainImageRotation() {
        return this._terrainImageRotation;
    }

    get railwayOrientation() {
        return this._railwayOrientation;
    }

    get railwayOrientationSquareVariant() {
        return this._railwayOrientationSquareVariant;
    }

    get building() {
        return this._building;
    }

    get events() {
        return this._events;
    }

    private _listeners: FieldListener[] = [];

    public unsubscribe(listener: FieldListener) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    public subscribe(listener: FieldListener) {
        if (this._listeners.includes(listener)) {
            return;
        }
        this._listeners.push(listener);
        listener(this);
    }

    private _notifyListeners() {
        this._listeners.forEach(listener => listener(this));
    }

    private constructor(params: FieldState) {
        this._address = params.address;
        this._visibility = params.visibility;
        this._terrain = params.terrain;
        this._terrainImageNumber = params.terrainImageNumber;
        this._terrainImageRotation = params.terrainImageRotation;
        this._railwayOrientation = params.railwayOrientation;
        this._railwayOrientationSquareVariant = params.railwayOrientationSquareVariant;
        this._building = params.building;
        this._events = params.events;

        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this._notifyListeners = this._notifyListeners.bind(this);
        this.uncover = this.uncover.bind(this);
        this.buildRailway = this.buildRailway.bind(this);
        this.buildRailwayStation = this.buildRailwayStation.bind(this);
        this.bookTrainRoute = this.bookTrainRoute.bind(this);
        this.signalTrespassed = this.signalTrespassed.bind(this);
        this.resolveTrainRoutes = this.resolveTrainRoutes.bind(this);
        this.signalTrespassing = this.signalTrespassing.bind(this);
    }

    public uncover() {
        if (this._visibility === FieldVisibility.Visible) {
            return;
        }
        this._visibility = FieldVisibility.Visible;
        this._terrain = Terrain.getTerrainKind({ address: this._address });
        this._terrainImageNumber = Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4;
        this._terrainImageRotation = Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4;
        this._notifyListeners();
    }

    private async _startConstruction(params: {
        durationSeconds: number,
        kind: BuildingKind,
    }) {

        const currentConstructionSite: ConstructionSite = {
            kind: params.kind,
            state: ConstructionState.Awaiting,
            startedAt: Date.now(),
            progressPercentage: 0,
            durationSeconds: params.durationSeconds,
        };

        this._constructionSite = currentConstructionSite;

        this._notifyListeners();

        currentConstructionSite.state = ConstructionState.Started;
        this._constructionSite = currentConstructionSite;
        this._notifyListeners();

        await new Promise<void>((res) => {
            this._constructionInterval = setInterval(() => {
                const currentTime = Date.now();
                const elapsedMiliseconds = currentTime - currentConstructionSite.startedAt;
                const elapsedSeconds = elapsedMiliseconds / 1000;
                const _progressPercentage = Math.round((elapsedSeconds / currentConstructionSite.durationSeconds) * 100);
                const progressPercentage = Math.min(_progressPercentage, 100);
                currentConstructionSite.progressPercentage = progressPercentage;
                currentConstructionSite.state = ConstructionState.InProgress;
                this._constructionSite = currentConstructionSite;
                this._notifyListeners();
                if (progressPercentage >= 100) {
                    currentConstructionSite.state = ConstructionState.Completed;
                    this._constructionSite = currentConstructionSite;
                    clearInterval(this._constructionInterval as number);
                    this._constructionInterval = null;
                    this._notifyListeners();
                    res();
                }
            }, 1000);
        });
    }

    public canBuildRailway(orientation: Orientation, orientationSquareVariant?: OrientationSquareVariant | null) {
        if (this._building && this._building !== BuildingKind.RailwayTrack) {
            return false;
        }

        if (!this._building) {
            return true;
        }

        const nextOrientation: Orientation = {
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        } as Record<Direction, boolean>;
        Object.entries(orientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })
        Object.entries(this._railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        const nextOrientationIsSquare = Object.values(nextOrientation).every(value => value);

        if (!nextOrientationIsSquare && orientationSquareVariant) {
            return false;
        }

        if (this._building === BuildingKind.RailwayTrack) {

            let atLeastOneDirectionIsFree = false;

            Object.entries(orientation).forEach(entry => {
                const [direction, value] = entry as [Direction, boolean];
                if (value && !this._railwayOrientation[direction]) {
                    atLeastOneDirectionIsFree = true;
                }
            })

            if (atLeastOneDirectionIsFree) {
                return true;
            }

            const isSquareUpgrade = this._railwayOrientationSquareVariant === OrientationSquareVariant.Cross && orientationSquareVariant === OrientationSquareVariant.Intersection;

            if (isSquareUpgrade) {
                return true;
            }
        }

        return false;
    }

    public canBuildRailwayStation(orientation: Orientation) {
        let hasOrWillHaveDifferentBuildingThanRailwayStation: boolean = false;

        if (this._building && this._building !== BuildingKind.RailwayStation) {
            hasOrWillHaveDifferentBuildingThanRailwayStation = true;
        }
        if (this.constructionSite && this.constructionSite?.kind !== BuildingKind.RailwayStation) {
            hasOrWillHaveDifferentBuildingThanRailwayStation = true;
        }

        if (hasOrWillHaveDifferentBuildingThanRailwayStation) {
            return false;
        }

        const nextOrientation: Orientation = {
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        } as Record<Direction, boolean>;
        Object.entries(orientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })
        Object.entries(this._railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        const nextOrientationIsSquare = Object.values(nextOrientation).every(value => value);

        const adjacentFields = AdjacentFields.getAdjacentFields({ address: this._address });
        let isStandaloneRailwayStation = true;

        Object.values(adjacentFields).forEach(field => {
            if (field && (field.building || field.constructionSite?.kind) && isStandaloneRailwayStation) {
                isStandaloneRailwayStation = (field.building === BuildingKind.RailwayTrack) || (field.building === null && field.constructionSite?.kind === BuildingKind.RailwayTrack);
            }
        })

        if (!isStandaloneRailwayStation) {
            return false;
        }


        if (this._building === BuildingKind.RailwayStation) {
            const isUpgrade = this._railwayOrientationSquareVariant === null && nextOrientationIsSquare;
            if (isUpgrade) {
                return true;
            }

            const isCrossDirection = Object.values(this._railwayOrientation).filter(value => value).length === 2 && Object.values(nextOrientation).filter(value => value).length === 4;
            if (isCrossDirection) {
                return true;
            }

            return false;
        }

        return true;
    }

    public canBuildRailwayGarage(orientation: Orientation) {

        if (this._building || this.constructionSite) {
            return false;
        }

        let canBuildRailwayGarage = true;

        const adjacentFields = AdjacentFields.getAdjacentFields({ address: this._address });

        Object.entries(adjacentFields).forEach(entry => {
            const [direction, field] = entry as [Direction, FieldModel | undefined];

            if (field && field.building === BuildingKind.RailwayStation) {
                canBuildRailwayGarage = false;
            }

            if (field && field.constructionSite?.kind === BuildingKind.RailwayStation) {
                canBuildRailwayGarage = false;
            }

            if (orientation[direction] && canBuildRailwayGarage) {
                const fieldInThatDirection = field;
                if (!fieldInThatDirection) {
                    canBuildRailwayGarage = true;
                } else {
                    const isFree = fieldInThatDirection._building === null && fieldInThatDirection.constructionSite === null;
                    const hasRailways = (fieldInThatDirection._building === BuildingKind.RailwayTrack) || (fieldInThatDirection.constructionSite?.kind === BuildingKind.RailwayTrack);
                    canBuildRailwayGarage = isFree || hasRailways;
                }
            }
        })

        return canBuildRailwayGarage;
    }

    public async buildRailway(params: {
        orientation: Orientation,
        orientationSquareVariant?: OrientationSquareVariant | null
    }) {

        const { orientation, orientationSquareVariant } = params;

        let nextOrientationSquareVariant: OrientationSquareVariant | null = orientationSquareVariant ?? null;

        const nextOrientation: Orientation = {
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        } as Record<Direction, boolean>;
        Object.entries(orientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })
        Object.entries(this._railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        const nextOrientationIsSquare = Object.values(nextOrientation).every(value => value);

        if (nextOrientationIsSquare) {
            nextOrientationSquareVariant = orientationSquareVariant ?? OrientationSquareVariant.Intersection;
        }

        if (this.canBuildRailway(orientation, nextOrientationSquareVariant)) {
            this._railwayOrientation = nextOrientation;
            this._railwayOrientationSquareVariant = nextOrientationSquareVariant;
            const durationSeconds = 0.5 //1 * Object.entries(orientation).filter(([_, value]) => value).length;
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayTrack });
            this._building = BuildingKind.RailwayTrack;
            this._notifyListeners();
        }
    }

    public async buildRailwayStation(params: {
        orientation: OrientationVertical | OrientationHorizontal | OrientationSquare
    }) {
        if (this._building && this._building !== BuildingKind.RailwayStation) {
            return;
        }

        const { orientation } = params;

        const nextOrientation: Orientation = {
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
        } as Record<Direction, boolean>;
        Object.entries(orientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })
        Object.entries(this._railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        if (this.canBuildRailwayStation(orientation)) {
            this._railwayOrientation = nextOrientation;
            const durationSeconds = 0.5; // 2 * Object.entries(orientation).filter(([_, value]) => value).length;
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayStation });
            this._building = BuildingKind.RailwayStation;
            this._notifyListeners();
        }
    }

    public async buildRailwayGarage(params: { direction: Direction }) {
        const { direction } = params;

        let nextOrientation: Orientation = {
            [Direction.Top]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
            [Direction.Right]: false,
            [direction]: true,
        };

        if (this.canBuildRailwayGarage(nextOrientation)) {
            this._railwayOrientation = nextOrientation;
            this._railwayOrientationSquareVariant = null;
            const durationSeconds = 0.5//4;
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayGarage });
            this._building = BuildingKind.RailwayGarage;
            this._notifyListeners();
        }
    }

    private _loopIsRunning = false;
    private async resolveTrainRoutes() {
        if (this._loopIsRunning) {
            return;
        }
        this._loopIsRunning = true;
        let order = 0;
        for (const event of this._events) {
            if (order === 0) {
                event.light = TrainTrespassingLight.Green;
            } else {
                event.light = TrainTrespassingLight.Red;
            }
            order += 1;
        }
        this._loopIsRunning = false;
        this._notifyListeners();
    }

    public signalTrespassing(params: { trainId: string }) {
        this.resolveTrainRoutes();
    }

    public signalTrespassed(params: { trainId: string }) {
        const { trainId } = params;
        let foundEvent = false;

        this._events = this._events.filter(event => {
            if (event.id === trainId && !foundEvent) {
                foundEvent = true;
                return false;
            }
            return true;
        });

        this.resolveTrainRoutes();
    }

    public bookTrainRoute(params: {
        event: TrainRouteEvent,
        id: string
    }) {
        const { event, id } = params;
        this._events.push({ ...event, light: TrainTrespassingLight.Red, id });
    }

    static touch(address: Address) {
        return FieldModel.fromJSON({
            address: address,
            visibility: FieldVisibility.Ready,
            terrain: null,
            terrainImageNumber: null as any as 1 | 2 | 3 | 4,
            terrainImageRotation: null as any as 1 | 2 | 3 | 4,
            railwayOrientation: {
                [Direction.Top]: false,
                [Direction.Bottom]: false,
                [Direction.Left]: false,
                [Direction.Right]: false,
            },
            railwayOrientationSquareVariant: null,
            building: null,
            constructionSite: null,
            events: [],
        });
    }

    static fromJSON(json: FieldState) {
        return new FieldModel(json);
    }

    public toJSON(): FieldState {
        return JSON.parse(JSON.stringify({
            ...this
        }));
    }
}

export default FieldModel;