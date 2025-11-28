import GameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import TrainModel from "#src/models/TrainModel.js";
import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Direction, { OpositeDirection } from "#src/types/Direction.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import TrainRouteEvent, { TrainArrivalEvent, TrainDepartureEvent, TrainTrespassingEvent } from "#src/types/TrainTrespassingEvent.js";
import TrainTrespassingLight from "#src/types/TrainTresspasingLight.js";
import AddressUtils from "./AddressUtils.js";
import AdjacentFields from "./AdjacentFields.js";

const areFieldRailwaysConnected = (fieldA: FieldModel, fieldB: FieldModel) => {

    if (!listFieldRailwayDirections(fieldA.state.railwayOrientation).length || !listFieldRailwayDirections(fieldB.state.railwayOrientation).length) {
        return false;
    }

    let departureDirection: Direction | null = null;
    let arrivalDirection: Direction | null = null;
    const adjacentToFieldA = AdjacentFields.getAdjacentFields({ address: fieldA.state.address });
    Object
        .entries(adjacentToFieldA)
        .forEach(entry => {
            const [direction, field] = entry as [Direction, FieldModel | undefined];
            if (
                field &&
                AddressUtils.isAddressEqual(field.state.address, fieldB.state.address) &&
                fieldB.state.railwayOrientation[OpositeDirection[direction]] &&
                fieldA.state.railwayOrientation[direction]
            ) {
                departureDirection = direction;
                arrivalDirection = OpositeDirection[direction];
            }
        })

    return departureDirection && arrivalDirection && fieldB.state.railwayOrientation[arrivalDirection]
}

const isDeadEnd = (field: FieldModel) => {
    const isDeadEnd = Object.values(field.state.railwayOrientation).filter(item => item).length === 1;
    return isDeadEnd && field.state.building === BuildingKind.RailwayTrack;
}

const isRouteEnd = (field: FieldModel) => {
    const deadEnd = isDeadEnd(field);
    const isStation = field.state.building === BuildingKind.RailwayStation;
    const isGarage = field.state.building === BuildingKind.RailwayGarage;
    const isRoutePartEnd = deadEnd || isStation || isGarage;
    return isRoutePartEnd;
}

const isTShape = (field: FieldModel) => {
    const isTShape = Object.values(field.state.railwayOrientation).filter(item => item).length === 3;
    const isRailway = field.state.building === BuildingKind.RailwayTrack;
    return isTShape && isRailway;
}

const isXShape = (field: FieldModel) => {
    const isXShape = Object.values(field.state.railwayOrientation).filter(item => item).length === 4;
    const isRailway = field.state.building === BuildingKind.RailwayTrack;
    return isXShape && isRailway;
}

const isTurnable = (field: FieldModel) => {
    return field.state.railwayOrientationSquareVariant === OrientationSquareVariant.Intersection;
}

const isJunctionTurnable = (field: FieldModel) => {
    return isTShape(field) || (isXShape(field) && isTurnable(field))
}

const isSingleOrientation = (field: FieldModel) => {
    const isBidirectional = Object.values(field.state.railwayOrientation).filter(item => item).length === 2;
    const isNonTurnableCrossing = isXShape(field) && !isTurnable(field);
    return isBidirectional || isNonTurnableCrossing;
}

const isRepeatedEvent = (events: TrainRouteEvent[], nextEvent: TrainArrivalEvent | TrainTrespassingEvent) => {
    return events.some(_event => {
        return AddressUtils.isAddressEqual(_event.address, nextEvent.address) && _event.to === nextEvent.to;
    })
}

const isTurningAroundEvent = (events: TrainRouteEvent[], nextEvent: TrainRouteEvent) => {
    const lastEvent = events[events.length - 1];
    if (lastEvent && lastEvent.to && nextEvent.to) {
        return nextEvent.to === OpositeDirection[lastEvent.to];
    }
    return false;
}

const nextEventWithDeadEndAssumption = (events: (TrainTrespassingEvent | TrainDepartureEvent)[]): TrainArrivalEvent | null => {
    const lastEvent = events[events.length - 1];
    if (lastEvent && lastEvent.to) {
        const addresses = AdjacentFields.getAdjacentAddresses({ address: lastEvent.address });
        const nextAddress = addresses[lastEvent.to];
        if (!nextAddress) {
            return null;
        }

        const currentField = GameBoard.getInstance().getField(nextAddress);
        const fieldEventsCost = (currentField?.state.events.length ?? 0);
        const fieldTresspassingCost = 1;
        return {
            light: TrainTrespassingLight.Red,
            address: nextAddress,
            from: OpositeDirection[lastEvent.to],
            to: null,
            durationMiliseconds: 1000,
            cost: lastEvent.cost + fieldEventsCost + fieldTresspassingCost
        }
    }
    return null;
}

const countFieldRailwayDirections = (orientation: Orientation) => {
    return Object.entries(orientation).filter(entry => entry[1]).length
        ? Object.entries(orientation).filter(entry => entry[1]).length
        : null
}

const listFieldRailwayDirections = (orientation: Orientation): Direction[] => {
    return Object
        .entries(orientation)
        .map(entry => {
            if (entry[1]) {
                return entry[0]
            }
            return null;
        })
        .filter(dir => !!dir) as Direction[];
}

/**
 * 
 * @param _eventTemplate 
 * @param field 
 * @returns {Direction|null|undefined}
 * 
 * null means arrival, undefined means error
 */
const getFirstAvailableDepartureDirection = (eventTemplate: TrainRouteEvent, field: FieldModel): Direction | null | undefined => {

    if (countFieldRailwayDirections(field.state.railwayOrientation) === 0) {
        /** Error, field not connected */
        return undefined
    }

    if (eventTemplate.from === null) {
        const firstAvailableDirection = listFieldRailwayDirections(field.state.railwayOrientation)[0];
        if (firstAvailableDirection) {
            /** Departure - route starts */
            return firstAvailableDirection
        } else {
            /** Error - departure not possible */
            return undefined
        }
    } else {

        if (field.state.building === BuildingKind.RailwayGarage || field.state.building === BuildingKind.RailwayStation) {
            /** Station or Garage - route ends */
            return null;
        }

        if (field.state.building === BuildingKind.RailwayTrack && (countFieldRailwayDirections(field.state.railwayOrientation) === 1)) {
            /** Dead end - route ends*/
            return null
        }

        const isNonTurnableCrossing = isXShape(field) && !isTurnable(field);

        if (isNonTurnableCrossing) {
            const oppositeToArrival = OpositeDirection[eventTemplate.from];
            const isAvailable = field.state.railwayOrientation[oppositeToArrival];
            return isAvailable ? oppositeToArrival : undefined;
        }

        if (isSingleOrientation(field) && !isNonTurnableCrossing) {

            return listFieldRailwayDirections(field.state.railwayOrientation).find(dir => dir !== eventTemplate.from);
        }

        if (isJunctionTurnable(field)) {
            return listFieldRailwayDirections(field.state.railwayOrientation).find(dir => dir !== eventTemplate.from);
        }

        return undefined;
    }
}


type NonEmptyArray<T> = [T, ...T[]];

const estimateDistanceLeft = (from: Address, to: Address) => {
    const distanceCol = Math.abs(to.column - from.column);
    const distanceRow = Math.abs(to.row - from.row);
    return distanceCol + distanceRow;
}

const getLastRouteEvent = (route: NonEmptyArray<TrainRouteEvent>) => {
    return route[route.length - 1] as TrainRouteEvent;
}

const deleteRouteFromRoutesStack = (
    routes: NonEmptyArray<NonEmptyArray<TrainRouteEvent>>,
    route: NonEmptyArray<TrainRouteEvent>
): (NonEmptyArray<TrainRouteEvent>)[] => {
    return routes.filter(r => r !== route);
}

const getShortestRoute = (allRoutes: NonEmptyArray<NonEmptyArray<TrainRouteEvent>>, destination: Address) => {
    allRoutes.sort((a, b) => {
        const lastAEvent = a[a.length - 1] as TrainRouteEvent;
        const lastBEvent = b[b.length - 1] as TrainRouteEvent;

        const lastAEventCost = lastAEvent?.cost ?? 0;
        const lastBEventCost = lastBEvent?.cost ?? 0;

        const estimatedCostLeftA = lastAEvent?.address ? estimateDistanceLeft(lastAEvent.address, destination) : Infinity;
        const estimatedCostLeftB = lastBEvent?.address ? estimateDistanceLeft(lastBEvent.address, destination) : Infinity;

        return (lastAEventCost + estimatedCostLeftA) - (lastBEventCost + estimatedCostLeftB);
    });

    return allRoutes[0]
}

// const performAStarRouteSearching = (train: TrainModel) => {
const performAStarRouteSearching = (train: {
    location: Address,
    destination: Address,
}) => {
    const pointA = GameBoard.getInstance().getField(train.location);
    const pointB = train.destination ? GameBoard.getInstance().getField(train.destination) : null;
    if (!pointA || !pointB) return;

    const _allRoutes: TrainRouteEvent[][] = listFieldRailwayDirections(pointA.state.railwayOrientation)
        .map(direction => {
            const route: NonEmptyArray<TrainDepartureEvent> = [
                {
                    light: TrainTrespassingLight.Red,
                    address: train.location,
                    from: null,
                    to: direction,
                    durationMiliseconds: 1000,
                    cost: 1,
                }
            ];
            return route;
        });

    if (!_allRoutes.length) return;

    let allRoutes: NonEmptyArray<NonEmptyArray<TrainRouteEvent>> = _allRoutes as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>;

    let iterationCount = 0;
    let routeFound: NonEmptyArray<TrainRouteEvent> | null = null;

    while (!routeFound) {
        const currentRoute = getShortestRoute(allRoutes, pointB.state.address);
        const previousEvent = getLastRouteEvent(currentRoute) as (TrainDepartureEvent | TrainTrespassingEvent);
        const previousField = GameBoard.getInstance().getField(previousEvent.address);
        if (!previousField) {
            /** Something went wrong. Clear this route and forget */
            const _allRoutesOrEmptyStack = deleteRouteFromRoutesStack(allRoutes, currentRoute);
            if (_allRoutesOrEmptyStack.length === 0) {
                /** It was only route. Stop searching. */
                break;
            } else {
                allRoutes = _allRoutesOrEmptyStack as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>
                continue;
            }
        }

        const routeFinishedNotInPointB = getLastRouteEvent(currentRoute).to === null && !AddressUtils.isAddressEqual(getLastRouteEvent(currentRoute).address, pointB.state.address);
        if (routeFinishedNotInPointB) {
            const _allRoutesOrEmptyStack = deleteRouteFromRoutesStack(allRoutes, currentRoute);
            if (_allRoutesOrEmptyStack.length === 0) {
                /** It was only route. Stop searching. */
                break;
            } else {
                allRoutes = _allRoutesOrEmptyStack as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>
                continue;
            }
        }

        const fieldsAdjacentToPrevious = AdjacentFields.getAdjacentFields(previousField.state);
        const currentField = fieldsAdjacentToPrevious[previousEvent.to];
        const currentFieldNotExistOrNotConnected = !currentField || !areFieldRailwaysConnected(previousField, currentField);

        if (currentFieldNotExistOrNotConnected) {
            /** Route not built. Remove it. */
            const _allRoutesOrEmptyStack = deleteRouteFromRoutesStack(allRoutes, currentRoute);
            if (_allRoutesOrEmptyStack.length === 0) {
                /** It was only route. Stop searching. */
                break;
            } else {
                allRoutes = _allRoutesOrEmptyStack as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>
                continue;
            }
        }

        const currentEventArriveFrom = OpositeDirection[previousEvent.to];

        let nextPossibleDepartureDirections: ((Direction[]) | [null]) = [];

        if (isRouteEnd(currentField)) {
            nextPossibleDepartureDirections = [null];
        } else {
            nextPossibleDepartureDirections = listFieldRailwayDirections(currentField.state.railwayOrientation)
                .filter(deartureDirection => {
                    const isTurningAround = deartureDirection === currentEventArriveFrom;
                    if (isTurningAround) {
                        return false;
                    }

                    const isDuplicatedEvent = currentRoute.some(event => {
                        return AddressUtils.isAddressEqual(event.address, currentField.state.address) && event.to === deartureDirection;
                    });

                    if (isDuplicatedEvent) {
                        return false;
                    }

                    const isNonTurnableCross = isXShape(currentField) && !isJunctionTurnable(currentField);
                    if (isNonTurnableCross) {
                        const isOpositeDirection = OpositeDirection[currentEventArriveFrom] === deartureDirection;
                        return isOpositeDirection;
                    }

                    return true;
                });
        }

        const isNotBuiltRoute = nextPossibleDepartureDirections.length === 0;

        if (isNotBuiltRoute) {
            const _allRoutesOrEmptyStack = deleteRouteFromRoutesStack(allRoutes, currentRoute);
            if (_allRoutesOrEmptyStack.length === 0) {
                /** It was only route. Stop searching. */
                break;
            } else {
                allRoutes = _allRoutesOrEmptyStack as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>
                continue;
            }
        }

        const nextPossibleRouteClones = nextPossibleDepartureDirections.map((nextDirection) => {
            const fieldEventsCost = (currentField.state.events.length ?? 0);
            const fieldTresspassingCost = 1;
            const currentRouteClone: NonEmptyArray<TrainRouteEvent> = [
                ...currentRoute,
                {
                    light: TrainTrespassingLight.Red,
                    address: currentField.state.address,
                    from: currentEventArriveFrom,
                    to: nextDirection,
                    durationMiliseconds: 1000,
                    cost: previousEvent.cost + fieldTresspassingCost + fieldEventsCost,
                }
            ];
            return currentRouteClone;
        });

        allRoutes = deleteRouteFromRoutesStack(allRoutes, currentRoute) as NonEmptyArray<NonEmptyArray<TrainRouteEvent>>;
        allRoutes = [...allRoutes, ...nextPossibleRouteClones];

        routeFound = nextPossibleRouteClones.find(route => {
            const lastEvent = getLastRouteEvent(route);
            return AddressUtils.isAddressEqual(lastEvent.address, pointB.state.address);
        }) ?? null;
    }

    return routeFound;
}


const findAllRoutes = async (train: TrainModel) => {

    const departureFrom = GameBoard.getInstance().getField(train.state.location);
    const routes: TrainRouteEvent[][] = [];

    const iterateDirections = (params: { route: (TrainDepartureEvent | TrainTrespassingEvent)[] }) => {

        const route = [...params.route];

        const lastEvent = route[route.length - 1]!;
        const lastField = GameBoard.getInstance().getField(lastEvent.address);
        const adjacentFields = AdjacentFields.getAdjacentFields({ address: lastEvent.address });
        const lastEventTo = lastEvent.to;

        if (route.length >= 25) {
            return;
        }

        if (!lastEventTo || !lastField) {
            /** If previous was null (route end) */
            return;
        }

        const nextField = adjacentFields[lastEventTo];

        if (!nextField || !listFieldRailwayDirections(nextField.state.railwayOrientation).length) {
            /** Track not finished - dead end. Not a route part. */
            return;
        }

        const nextFieldConnects = areFieldRailwaysConnected(nextField, lastField);

        if (!nextFieldConnects) {
            /** Track not connected - dead end. Not a route part. */
            return;
        }

        const isRoutePartEnd = isRouteEnd(nextField)

        if (isRoutePartEnd) {
            const arrivalEvent = nextEventWithDeadEndAssumption(route);
            if (!arrivalEvent) return;
            const finishedRoute: TrainRouteEvent[] = [...route];
            finishedRoute.push(arrivalEvent);
            routes.push(finishedRoute);
            return;
        }

        if (isJunctionTurnable(nextField)) {
            const nextEventTemplate = nextEventWithDeadEndAssumption(route);
            if (!nextEventTemplate) {
                return;
            }
            const notYetFinishedRoute: (TrainDepartureEvent | TrainTrespassingEvent)[] = [...route];
            Object.entries(nextField.state.railwayOrientation).forEach(entry => {

                const iterableCopyOfRoute: (TrainDepartureEvent | TrainTrespassingEvent)[] = [...notYetFinishedRoute];
                const [direction, hasRailway] = entry as [Direction, boolean];

                if (hasRailway) {
                    const trespassingEvent: TrainTrespassingEvent = Object.assign({}, nextEventTemplate, { to: direction });
                    if (!isRepeatedEvent(notYetFinishedRoute, trespassingEvent) && !isTurningAroundEvent(notYetFinishedRoute, trespassingEvent)) {
                        iterableCopyOfRoute.push(trespassingEvent);
                        iterateDirections({ route: iterableCopyOfRoute })
                    }
                }
            })
            return;
        }

        if (isSingleOrientation(nextField)) {

            const nextEventTemplate = nextEventWithDeadEndAssumption(route);
            if (!nextEventTemplate) {
                return;
            }

            const availabeDepartureDirection = getFirstAvailableDepartureDirection(nextEventTemplate, nextField);

            if (!availabeDepartureDirection) {
                return
            }

            const trespassingEvent: TrainTrespassingEvent = Object.assign({}, nextEventTemplate,
                {
                    to: availabeDepartureDirection
                }
            );

            const copyR = [...route]
            copyR.push(trespassingEvent);

            iterateDirections({ route: copyR });
        }
    }

    if (departureFrom) {

        Object.entries(departureFrom.state.railwayOrientation).forEach((entry) => {

            const [direction, hasRailway] = entry as [Direction, boolean];

            if (hasRailway) {
                const route: TrainDepartureEvent[] = [
                    {
                        light: TrainTrespassingLight.Red,
                        address: train.state.location,
                        from: null,
                        to: direction,
                        durationMiliseconds: 1000,
                        cost: 1,
                    }
                ]

                iterateDirections({ route })
            }
        })
    }

    return routes;
}

const pickShortestRoute = (routes: TrainRouteEvent[][]) => {
    routes.sort((a, b) => {
        return (a[a.length - 1]?.cost ?? 0) - (b[b.length - 1]?.cost ?? 0)
    });

    return routes[0];
}

const Pathfinder = {
    findAllRoutes,
    pickShortestRoute,
    performAStarRouteSearching
}

export default Pathfinder;