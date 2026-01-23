import TerrainKind from "../enums/TerrainKind.js";
import BoardModel from "../models/BoardModel.js";
import Address from "../types/Address.js";
import TrackKind from "../enums/TrackKind.js";
import Orientation from "../enums/Orientation.js";
import Direction from "../enums/Direction.js";

export async function canBuildRailwayTrack(
    address: Address,
    game: BoardModel,
    trackKind: TrackKind,
    options: {
        orientations: Orientation
    }) {

    const {
        field,
        buildings,
        tracks,
    } = game.getStateByAddress(address) ?? {};

    if (buildings || !field?.state.terrain) {
        return false;
    }

    if ([TerrainKind.Water, TerrainKind.WaterCold].includes(field.state.terrain)) {
        return false;
    }

    type TrackNode = Direction | 'center';

    const getOccupiedNodes = (orientation?: Orientation | null): Set<TrackNode> => {
        const occupied = new Set<TrackNode>();
        if (!orientation) return occupied;

        if (orientation.center) {
            occupied.add('center');
            Object.entries(orientation.center).forEach(([dir, isConnected]) => {
                if (isConnected) occupied.add(dir as Direction);
            });
        }

        Object.entries(orientation).forEach(([node, connections]) => {
            if (node === 'center' || !connections) return;
            const hasConnection = Object.values(connections).some(Boolean);
            if (hasConnection) occupied.add(node as Direction);
            if ((connections as Record<string, boolean>)['center']) occupied.add('center');
        });

        return occupied;
    };

    const isSubset = (subset: Set<TrackNode>, superset: Set<TrackNode>) => {
        for (const v of subset) {
            if (!superset.has(v)) return false;
        }
        return true;
    };

    const newNodes = getOccupiedNodes(options.orientations);
    const existingOrientations = tracks?.state.orientations ?? {};

    const existingNodesByKind = Object.entries(existingOrientations).reduce<Record<string, Set<TrackNode>>>(
        (acc, [kind, orientation]) => {
            acc[kind] = getOccupiedNodes(orientation as Orientation | null);
            return acc;
        },
        {}
    );

    const hasAnyExistingTrack = Object.values(existingNodesByKind).some(nodes => nodes.size > 0);
    const anyExistingCenter = Object.values(existingNodesByKind).some(nodes => nodes.has('center'));

    // Center always occupies whole field.
    if (newNodes.has('center')) {
        return !hasAnyExistingTrack;
    }

    // If something already uses center, nothing else can be built.
    if (anyExistingCenter) {
        return false;
    }

    // Duplicate if all new nodes already occupied by SAME track kind (new ⊆ existing).
    const sameKindNodes = existingNodesByKind[trackKind];
    if (sameKindNodes && isSubset(newNodes, sameKindNodes)) {
        return false;
    }

    // Different track kinds cannot share any node.
    for (const [existingKind, existingNodes] of Object.entries(existingNodesByKind)) {
        if (existingKind === trackKind) continue;
        const overlaps = [...newNodes].some(node => existingNodes.has(node));
        if (overlaps) return false;
    }

    return true;
}

type CanBuildParams = {
    address: Address,
    trackKind: TrackKind,
    options: {
        orientations: Orientation
    }
}

interface trackUtils {
    game?: BoardModel;
    canBuild(params: CanBuildParams): Promise<boolean>;
    canBuildRailwayTrack(address: Address, game: BoardModel, trackKind: TrackKind, options: { orientations: Orientation }): Promise<boolean>;
}

const TrackUtils: trackUtils = {
    async canBuild({
        address,
        trackKind,
        options
    }: CanBuildParams) {
        if (!this.game) return false;
        await this.game.configured;

        switch (trackKind) {

            case TrackKind.Railway: {
                return this.canBuildRailwayTrack(address, this.game, trackKind, options);
            }

            default: {
                return false;
            }

        }
    },

    canBuildRailwayTrack,
}

export default TrackUtils;

enum TrackVariantName {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
    TopRight = 'top-right',
    RightBottom = 'right-bottom',
    BottomLeft = 'bottom-left',
    LeftTop = 'left-top',
    CenterTop = 'center-top',
    CenterRight = 'center-right',
    CenterBottom = 'center-bottom',
    CenterLeft = 'center-left'
}

const TRUE = true as true;
const FALSE = false as false;

const TrackVariantVertical = {
    variant: TrackVariantName.Vertical,
    orientation: {
        [Direction.Top]: {
            [Direction.Right]: FALSE,
            [Direction.Bottom]: TRUE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Right]: null,
        [Direction.Bottom]: {
            [Direction.Top]: TRUE,
            [Direction.Right]: FALSE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Left]: null,
        'center': null,
    }
}
const TrackVariantHorizontal = {
    variant: TrackVariantName.Horizontal,
    orientation: {
        [Direction.Top]: null,
        [Direction.Bottom]: null,
        [Direction.Right]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: TRUE,
            'center': FALSE,
        },
        [Direction.Left]: {
            [Direction.Top]: FALSE,
            [Direction.Bottom]: FALSE,
            [Direction.Right]: TRUE,
            'center': FALSE,
        },
        'center': null,
    }
}
const TrackVariantTR = {
    variant: TrackVariantName.TopRight,
    orientation: {
        [Direction.Top]: {
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            [Direction.Right]: TRUE,
            'center': FALSE,
        },
        [Direction.Bottom]: null,
        [Direction.Right]: {
            [Direction.Top]: TRUE,
            [Direction.Bottom]: FALSE,
            [Direction.Left]: FALSE,
            'center': FALSE,
        },
        [Direction.Left]: null,
        'center': null,
    }
}
