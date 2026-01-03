import Service from "#src/framework/Service/Service.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ConstructionSite from "#src/types/ConstructionSite.js";
import ConstructionState from "#src/types/ConstructionState.js";
import Direction from "#src/types/Direction.js";
import FieldVisibility from "#src/types/FieldVisibility.js";
import ResourceKind from "#src/types/ResourceKind.js";
import Orientation, { OrientationHorizontal, OrientationSquare, OrientationSquareVariant, OrientationVertical } from "#src/types/Orientation.js";
import TerrainKind from "#src/types/TerrainKind.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import AdjacentFields from "#src/utils/AdjacentFields.js";
import OrientationUtils from "#src/utils/OrientationUtils.js";
import Terrain from "#src/utils/Terrain.js";
import RouteEventModel from "./RouteEventModel.js";

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
    events: RouteEventModel[],
    resources: ResourceKind[],
    production: Partial<Record<ResourceKind, ({
        qty: number,
        progress: number,
    } | undefined)>> | null;
    storage?: Partial<Record<ResourceKind, number>>
}

class FieldModel extends Service<FieldState> {
    private _constructionInterval: number | null = null;
    private _productionInterval: Partial<Record<ResourceKind, number | null>> = {}
    private _maxLoad = 10;

    state: FieldState;

    private constructor(params: FieldState) {
        super();
        this.state = params;
        this.state.events = params.events.map(event => {
            if (event instanceof RouteEventModel) {
                /** This should never happen */
                return event
            } else {
                /** Events are "booked" by trains */
                return null;
            }
        }).filter(item => !!item);
        this.toJSON = this.toJSON.bind(this);
        this.uncover = this.uncover.bind(this);
        this.buildRailway = this.buildRailway.bind(this);
        this.buildRailwayStation = this.buildRailwayStation.bind(this);
        this.onEventUpdate = this.onEventUpdate.bind(this);
        this.registerEvent = this.registerEvent.bind(this);
        this.unregisterEvent = this.unregisterEvent.bind(this);

        this.canBuildProductionBuilding = this.canBuildProductionBuilding.bind(this);
        this.buildTimber = this.buildTimber.bind(this);
        this._startProduction = this._startProduction.bind(this);
        this.startProduction = this.startProduction.bind(this);
        this._pauseProduction = this._pauseProduction.bind(this);
        this.pickUpResource = this.pickUpResource.bind(this);
        this.dumpResource = this.dumpResource.bind(this);

        setTimeout(() => {
            Object.keys(this.state.production ?? {}).forEach(key => {
                const resourceKind = key as ResourceKind;
                if (resourceKind) this._startProduction(resourceKind);
            });
        }, 1000)
    }

    public uncover() {
        if (this.state.visibility === FieldVisibility.Visible) {
            return;
        }
        const terrainKind = Terrain.getTerrainKind({ address: this.state.address });
        this.setState({
            visibility: FieldVisibility.Visible,
            terrain: terrainKind,
            terrainImageNumber: Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4,
            terrainImageRotation: Math.round(Math.random() * 3) + 1 as 1 | 2 | 3 | 4,
            resources: Terrain.ResourcesByTerrainMap[terrainKind]
        })
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

        this.setState({
            constructionSite: currentConstructionSite
        })

        this.setState({
            constructionSite: {
                ...currentConstructionSite,
                state: ConstructionState.Started
            }
        })
        await new Promise<void>((res) => {
            this._constructionInterval = setInterval(() => {
                const site = { ...currentConstructionSite };
                const currentTime = Date.now();
                const elapsedMiliseconds = currentTime - site.startedAt;
                const elapsedSeconds = elapsedMiliseconds / 1000;
                const _progressPercentage = Math.round((elapsedSeconds / site.durationSeconds) * 100);
                const progressPercentage = Math.min(_progressPercentage, 100);
                site.progressPercentage = progressPercentage;
                site.state = ConstructionState.InProgress;
                this.setState({
                    constructionSite: site
                })
                if (progressPercentage >= 100) {
                    const nextSite = { ...site }
                    nextSite.state = ConstructionState.Completed;
                    this.setState({
                        constructionSite: nextSite
                    })
                    clearInterval(this._constructionInterval as number);
                    this._constructionInterval = null;
                    res();
                }
            }, 1000);
        });
    }

    private _pauseProduction(resourceKind: ResourceKind): boolean {
        if (((this.state.production?.[resourceKind]?.qty) ?? 0) >= this._maxLoad) {
            if (this._productionInterval[resourceKind]) {
                clearInterval(this._productionInterval[resourceKind]);
                this._productionInterval[resourceKind] = null;
            }
            this.setState({
                production: {
                    ...(this.state.production ?? {}),
                    [resourceKind]: {
                        qty: this._maxLoad,
                        progress: 0,
                    }
                }
            });
            return true;
        }
        return false;
    }

    private async _startProduction(resourceKind: ResourceKind) {
        if (this._pauseProduction(resourceKind)) {
            return;
        }

        if (this._productionInterval[resourceKind]) {
            return;
        }

        if (!this.state.production || !this.state.production[resourceKind]) {
            return;
        }

        const onePercentDurationMilisec = 10;

        this._productionInterval[resourceKind] = setInterval(() => {
            if (this._pauseProduction(resourceKind)) {
                return;
            }

            const production = this.state.production?.[resourceKind];
            if (!production && this._productionInterval[resourceKind]) {
                clearInterval(this._productionInterval[resourceKind]);
                this._productionInterval[resourceKind] = null;
                return;
            } else if (!production) {
                return;
            }

            const currentQty = production.qty ?? 0;
            const currentProgress = production.progress ?? 0;
            let nextQty = 0;
            let nextProgress = 0;

            if (currentProgress >= 100) {
                nextQty = currentQty + 1;
                nextQty = nextQty > this._maxLoad ? this._maxLoad : nextQty;
                nextProgress = 0;
            } else {
                nextQty = currentQty;
                nextProgress = currentProgress + 1;
            }

            this.setState({
                production: {
                    ...this.state.production,
                    [resourceKind]: {
                        qty: nextQty,
                        progress: nextProgress,
                    }
                }
            })

        }, onePercentDurationMilisec);
    }

    public async startProduction(resourceKind: ResourceKind) {
        await this._startProduction(resourceKind)
    }

    public dumpResource(resourceKind: ResourceKind, qty: number) {
        this.setState({
            storage: {
                ...(this.state.storage ?? {}),
                [resourceKind]: (this.state.storage?.[resourceKind] ?? 0) + qty
            }
        });
    }

    public pickUpResource(resourceKind: ResourceKind): [ResourceKind, number] {
        if ((this.state.production?.[resourceKind]?.qty ?? 0) > 0) {
            this.setState({
                production: {
                    ...(this.state.production ?? {}),
                    [resourceKind]: {
                        ...(this.state.production?.[resourceKind] ?? {}),
                        qty: (this.state.production?.[resourceKind]?.qty ?? 1) - 1,
                    }
                }
            });
            return [resourceKind, 1]
        }

        return [resourceKind, 0]
    }

    public canBuildRailway(orientation: Orientation, orientationSquareVariant?: OrientationSquareVariant | null) {
        if (this.state.building && this.state.building !== BuildingKind.RailwayTrack) {
            return false;
        }

        if (!this.state.building) {
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
        Object.entries(this.state.railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        const nextOrientationIsSquare = Object.values(nextOrientation).every(value => value);

        if (!nextOrientationIsSquare && orientationSquareVariant) {
            return false;
        }

        if (this.state.building === BuildingKind.RailwayTrack) {

            let atLeastOneDirectionIsFree = false;

            Object.entries(orientation).forEach(entry => {
                const [direction, value] = entry as [Direction, boolean];
                if (value && !this.state.railwayOrientation[direction]) {
                    atLeastOneDirectionIsFree = true;
                }
            })

            if (atLeastOneDirectionIsFree) {
                return true;
            }

            const isSquareUpgrade = this.state.railwayOrientationSquareVariant === OrientationSquareVariant.Cross && orientationSquareVariant === OrientationSquareVariant.Intersection;

            if (isSquareUpgrade) {
                return true;
            }
        }

        return false;
    }

    public canBuildRailwayStation(orientation: Orientation) {
        let hasOrWillHaveDifferentBuildingThanRailwayStation: boolean = false;

        if (this.state.building && this.state.building !== BuildingKind.RailwayStation) {
            hasOrWillHaveDifferentBuildingThanRailwayStation = true;
        }
        if (this.state.constructionSite && this.state.constructionSite?.kind !== BuildingKind.RailwayStation) {
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
        Object.entries(this.state.railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        const nextOrientationIsSquare = Object.values(nextOrientation).every(value => value);

        const adjacentFields = AdjacentFields.getAdjacentFields({ address: this.state.address });
        let isStandaloneRailwayStation = true;

        Object.values(adjacentFields).forEach(field => {
            if (field && (field.state.building || field.state.constructionSite?.kind) && isStandaloneRailwayStation) {
                isStandaloneRailwayStation = (field.state.building === BuildingKind.RailwayTrack) || (field.state.building === null && field.state.constructionSite?.kind === BuildingKind.RailwayTrack);
            }
        })

        if (!isStandaloneRailwayStation) {
            return false;
        }


        if (this.state.building === BuildingKind.RailwayStation) {
            const isUpgrade = Object.values(this.state.railwayOrientation).filter(value => value).length === 2 && nextOrientationIsSquare;
            if (isUpgrade) {
                return true;
            }

            return false;
        }

        return true;
    }

    public canBuildRailwayGarage(orientation: Orientation) {

        if (this.state.building || this.state.constructionSite) {
            return false;
        }

        let canBuildRailwayGarage = true;

        const adjacentFields = AdjacentFields.getAdjacentFields({ address: this.state.address });

        Object.entries(adjacentFields).forEach(entry => {
            const [direction, field] = entry as [Direction, FieldModel | undefined];

            if (field && field.state.building === BuildingKind.RailwayStation) {
                canBuildRailwayGarage = false;
            }

            if (field && field.state.constructionSite?.kind === BuildingKind.RailwayStation) {
                canBuildRailwayGarage = false;
            }

            if (orientation[direction] && canBuildRailwayGarage) {
                const fieldInThatDirection = field;
                if (!fieldInThatDirection) {
                    canBuildRailwayGarage = true;
                } else {
                    const isFree = fieldInThatDirection.state.building === null && fieldInThatDirection.state.constructionSite === null;
                    const hasRailways = (fieldInThatDirection.state.building === BuildingKind.RailwayTrack) || (fieldInThatDirection.state.constructionSite?.kind === BuildingKind.RailwayTrack);
                    canBuildRailwayGarage = isFree || hasRailways;
                }
            }
        })

        return canBuildRailwayGarage;
    }

    public canBuildProductionBuilding(kind: BuildingKind) {
        const currentBuilding = this.state.building;
        const currentOrientation = this.state.railwayOrientation;

        let buildingSpecificRequirementsMet = false;

        switch (kind) {
            case BuildingKind.Timber: {
                buildingSpecificRequirementsMet = this.state.terrain === TerrainKind.Forest
            }
        }

        if (this.state.constructionSite === null || this.state.constructionSite.state === 'completed') {
            if (currentBuilding !== BuildingKind.RailwayTrack) {
                return false;
            }
            if (OrientationUtils.isVerticalOnly(currentOrientation)) {
                return buildingSpecificRequirementsMet;
            } else if (OrientationUtils.isHorizontalOnly(currentOrientation)) {
                return buildingSpecificRequirementsMet;
            } else {
                return false;
            }
        }
        return false;
    }

    public async buildTimber() {
        if (this.canBuildProductionBuilding(BuildingKind.Timber)) {
            const durationSeconds = 0.5 //1 * Object.entries(orientation).filter(([_, value]) => value).length;
            await this._startConstruction({ durationSeconds, kind: BuildingKind.Timber });
            this.setState({
                building: BuildingKind.Timber,
                production: {
                    [ResourceKind.Wood]: {
                        progress: 0,
                        qty: 0,
                    },
                    [ResourceKind.Coal]: {
                        progress: 0,
                        qty: 0,
                    },
                    [ResourceKind.Clay]: {
                        progress: 0,
                        qty: 0,
                    },
                }
            });
            this._startProduction(ResourceKind.Wood);
            this._startProduction(ResourceKind.Coal);
            this._startProduction(ResourceKind.Clay);
        }
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
        Object.entries(this.state.railwayOrientation).forEach(entry => {
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
            const durationSeconds = 0.5 //1 * Object.entries(orientation).filter(([_, value]) => value).length;
            this.setState({
                railwayOrientation: nextOrientation,
                railwayOrientationSquareVariant: nextOrientationSquareVariant
            })
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayTrack });
            this.setState({
                building: BuildingKind.RailwayTrack
            })
        }
    }

    public async buildRailwayStation(params: {
        orientation: OrientationVertical | OrientationHorizontal | OrientationSquare
    }) {
        if (this.state.building && this.state.building !== BuildingKind.RailwayStation) {
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
        Object.entries(this.state.railwayOrientation).forEach(entry => {
            const [direction, value] = entry as [Direction, boolean];
            if (value) {
                nextOrientation[direction] = value;
            }
        })

        if (this.canBuildRailwayStation(orientation)) {
            const durationSeconds = 0.5; // 2 * Object.entries(orientation).filter(([_, value]) => value).length;
            this.setState({
                railwayOrientation: nextOrientation,
            })
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayStation });
            this.setState({
                building: BuildingKind.RailwayStation,
                storage: Object.values(ResourceKind).reduce((result, item) => {
                    result[item] = 0;
                    return result;
                }, {} as Record<ResourceKind, number>)
            })
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
            this.setState({
                railwayOrientation: nextOrientation,
                railwayOrientationSquareVariant: null
            })
            const durationSeconds = 0.5//4;
            await this._startConstruction({ durationSeconds, kind: BuildingKind.RailwayGarage });
            this.setState({
                building: BuildingKind.RailwayGarage
            })
        }
    }

    public onEventUpdate(eventState: RouteEventModel['state']) {

        let order = 0;

        for (const event of this.state.events) {
            if (order === 0 && event.state.light !== TrainTrespassingLight.Green) {
                event.lightGreen();
            }
            if (order > 0 && event.state.light === TrainTrespassingLight.Green) {
                event.lightRed();
            }
            order += 1;
        }
    }

    public unregisterEvent(routeEvent: RouteEventModel) {
        routeEvent.unsubscribe(this.onEventUpdate)
        this.setState({
            events: this.state.events.filter(event => {
                return event !== routeEvent;
            })
        });

        this.onEventUpdate(routeEvent.state)
    }

    public registerEvent(routeEvent: RouteEventModel) {
        this.setState({
            events: [...this.state.events, routeEvent]
        });
        routeEvent.subscribe(this.onEventUpdate);
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
            resources: [],
            production: null,
            storage: {}
        });
    }

    static fromJSON(json: FieldState) {
        return new FieldModel(json);
    }

    public toJSON(): FieldState {
        return JSON.parse(JSON.stringify(this.state));
    }
}

export default FieldModel;