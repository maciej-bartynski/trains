import Address from "#src/types/Address.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";

enum OperationType {

    OpenBuildRailwayMenu = 'open-build-railway-menu',
    OpenBuildBuildingMenu = 'open-build-building-menu',


    SelectBuildingToBuild = 'select-building-to-build',
    SelectCell = 'select-cell',
}

export default OperationType;

interface OperationAbstract {
    type: OperationType;
    payload: any;
}

interface OpenBuildRailwayMenu extends OperationAbstract {
    type: OperationType.OpenBuildRailwayMenu,
    payload: null,
}


interface OpenBuildBuildingyMenu extends OperationAbstract {
    type: OperationType.OpenBuildBuildingMenu,
    payload: null,
}

interface BuildOperation extends OperationAbstract {
    type: OperationType.SelectBuildingToBuild;
    payload: {
        kind: BuildingKind;
        orientation: Orientation;
        orientationSquareVariant: OrientationSquareVariant | null;
    };
}

interface SelectCellOperation extends OperationAbstract {
    type: OperationType.SelectCell;
    payload: {
        address: Address;
    };
}

type Operation = BuildOperation | SelectCellOperation | OpenBuildRailwayMenu | OpenBuildBuildingyMenu;

export type {
    Operation,
    BuildOperation,
    SelectCellOperation,
    OpenBuildRailwayMenu,
    OpenBuildBuildingyMenu
}