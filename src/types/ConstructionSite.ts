import BuildingKind from "./BuildingKind.js";
import ConstructionState from "./ConstructionState.js";

type ConstructionSite = {
    // materials: {
    //     wood: number,
    //     stone: number,
    //     iron: number,
    //     gold: number,
    //     copper: number,
    //     coal: number,
    // },
    kind: BuildingKind,
    durationSeconds: number,
    startedAt: number,
    progressPercentage: number,
    state: ConstructionState,
}

export default ConstructionSite;