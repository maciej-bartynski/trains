import Config from "#src/config.js";
import Address from "../types/Address.js";
import Diagonal from "../enums/Diagonal.js";
import AddressUtils from "./AddressUtils.js";
import { FieldState } from "../models/FieldModel.type.js";
//import GameInstance from '../index.js';
import BoardModel from "../models/BoardModel.js";

// const gameInstance = () => BoardModel.I();

function getAdjacentAddresses(params: {
    address: Address,
}): {
    top: Address | undefined,
    bottom: Address | undefined,
    left: Address | undefined,
    right: Address | undefined,
} {
    let topAdjacentAddress: Address | undefined = undefined;
    if (params.address.row - 1 >= 0) {
        topAdjacentAddress = {
            row: params.address.row - 1,
            column: params.address.column,
        };
    }

    let bottomAdjacentAddress: Address | undefined = undefined;
    if (params.address.row + 1 <= Config.boardSize - 1) {
        bottomAdjacentAddress = {
            row: params.address.row + 1,
            column: params.address.column,
        };
    }

    let leftAdjacentAddress: Address | undefined = undefined;
    if (params.address.column - 1 >= 0) {
        leftAdjacentAddress = {
            row: params.address.row,
            column: params.address.column - 1,
        };
    }

    let rightAdjacentAddress: Address | undefined = undefined;
    if (params.address.column + 1 <= Config.boardSize - 1) {
        rightAdjacentAddress = {
            row: params.address.row,
            column: params.address.column + 1,
        };
    };

    return {
        top: topAdjacentAddress,
        bottom: bottomAdjacentAddress,
        left: leftAdjacentAddress,
        right: rightAdjacentAddress,
    };
}

function getDiagonalAddresses(params: {
    address: Address,
}): {
    [Diagonal.TopLeft]: Address | undefined,
    [Diagonal.TopRight]: Address | undefined,
    [Diagonal.BottomLeft]: Address | undefined,
    [Diagonal.BottomRight]: Address | undefined,
} {
    let topLeftAddress: Address | undefined = undefined;
    let topRightAddress: Address | undefined = undefined;
    let bottomLeftAddress: Address | undefined = undefined;
    let bottomRightAddress: Address | undefined = undefined;

    if (params.address.row - 1 >= 0 && params.address.column - 1 >= 0) {
        topLeftAddress = {
            row: params.address.row - 1,
            column: params.address.column - 1,
        };
    }

    if (params.address.row - 1 >= 0 && params.address.column + 1 <= Config.boardSize - 1) {
        topRightAddress = {
            row: params.address.row - 1,
            column: params.address.column + 1,
        };
    }

    if (params.address.row + 1 <= Config.boardSize - 1 && params.address.column - 1 >= 0) {
        bottomLeftAddress = {
            row: params.address.row + 1,
            column: params.address.column - 1,
        };
    }

    if (params.address.row + 1 <= Config.boardSize - 1 && params.address.column + 1 <= Config.boardSize - 1) {
        bottomRightAddress = {
            row: params.address.row + 1,
            column: params.address.column + 1,
        };
    }

    return {
        [Diagonal.TopLeft]: topLeftAddress,
        [Diagonal.TopRight]: topRightAddress,
        [Diagonal.BottomLeft]: bottomLeftAddress,
        [Diagonal.BottomRight]: bottomRightAddress,
    }
}

// function getAdjacentFields(params: {
//     address: Address,
// }): {
//     top: FieldState | undefined,
//     bottom: FieldState | undefined,
//     left: FieldState | undefined,
//     right: FieldState | undefined,
// } {
//     if (!this?.game as any) {
//         throw new Error('AdjacentFields uses before game initialization')
//     }

//     const adjacentAddresses = getAdjacentAddresses({ address: params.address });

//     const adjacentFields: {
//         top: FieldState | undefined,
//         bottom: FieldState | undefined,
//         left: FieldState | undefined,
//         right: FieldState | undefined,
//     } = {
//         top: undefined,
//         bottom: undefined,
//         left: undefined,
//         right: undefined,
//     };

//     Object.entries(adjacentAddresses).forEach(([position, address]) => {
//         const field = address ? ((this as any)!.game as BoardModel).state.fields.get(AddressUtils.toKey(address))?.state : undefined;
//         adjacentFields[position as keyof typeof adjacentFields] = field;
//     });
//     return adjacentFields;
// }

// function getDiagonalFields (params: {
//     address: Address,
// }): {
//     [Diagonal.TopLeft]: FieldState | undefined,
//     [Diagonal.TopRight]: FieldState | undefined,
//     [Diagonal.BottomLeft]: FieldState | undefined,
//     [Diagonal.BottomRight]: FieldState | undefined,
// } {
//     if (!(this as any)?.game as any) {
//         throw new Error('AdjacentFields uses before game initialization')
//     }

//     const diagonalAddresses = getDiagonalAddresses({ address: params.address });

//     const diagonalFields: {
//         [Diagonal.TopLeft]: FieldState | undefined,
//         [Diagonal.TopRight]: FieldState | undefined,
//         [Diagonal.BottomLeft]: FieldState | undefined,
//         [Diagonal.BottomRight]: FieldState | undefined,
//     } = {
//         [Diagonal.TopLeft]: undefined,
//         [Diagonal.TopRight]: undefined,
//         [Diagonal.BottomLeft]: undefined,
//         [Diagonal.BottomRight]: undefined,
//     };

//     Object.entries(diagonalAddresses).forEach(([diagonal, address]) => {
//         const field = address ? ((this as any)!.game as BoardModel)!.state.fields.get(AddressUtils.toKey(address))?.state : undefined;
//         diagonalFields[diagonal as keyof typeof diagonalFields] = field;
//     });

//     return diagonalFields;
// }

interface addressUtils {
    game?: BoardModel,
    getAdjacentAddresses: (params: {
        address: Address;
    }) => {
        top: Address | undefined;
        bottom: Address | undefined;
        left: Address | undefined;
        right: Address | undefined;
    },
    getAdjacentFields: (params: {
        address: Address;
    }) => {
        top: FieldState | undefined;
        bottom: FieldState | undefined;
        left: FieldState | undefined;
        right: FieldState | undefined;
    },
    getDiagonalAddresses: (params: {
        address: Address;
    }) => {
        [Diagonal.TopLeft]: Address | undefined;
        [Diagonal.TopRight]: Address | undefined;
        [Diagonal.BottomLeft]: Address | undefined;
        [Diagonal.BottomRight]: Address | undefined;
    },
    getDiagonalFields: (params: {
        address: Address;
    }) => {
        [Diagonal.TopLeft]: FieldState | undefined;
        [Diagonal.TopRight]: FieldState | undefined;
        [Diagonal.BottomLeft]: FieldState | undefined;
        [Diagonal.BottomRight]: FieldState | undefined;
    }
}
const AdjacentFields: addressUtils = {
    getAdjacentAddresses: getAdjacentAddresses.bind(this),
    getAdjacentFields(params: {
        address: Address,
    }): {
        top: FieldState | undefined,
        bottom: FieldState | undefined,
        left: FieldState | undefined,
        right: FieldState | undefined,
    } {
        const game = this.game
        if (!game) {
            throw new Error('AdjacentFields uses before game initialization')
        }

        const adjacentAddresses = getAdjacentAddresses({ address: params.address });

        const adjacentFields: {
            top: FieldState | undefined,
            bottom: FieldState | undefined,
            left: FieldState | undefined,
            right: FieldState | undefined,
        } = {
            top: undefined,
            bottom: undefined,
            left: undefined,
            right: undefined,
        };

        Object.entries(adjacentAddresses).forEach(([position, address]) => {
            const field = address ? game.state.fields.get(AddressUtils.toKey(address))?.state : undefined;
            adjacentFields[position as keyof typeof adjacentFields] = field;
        });
        return adjacentFields;
    },
    getDiagonalAddresses: getDiagonalAddresses.bind(this),
    getDiagonalFields(params: {
        address: Address,
    }): {
        [Diagonal.TopLeft]: FieldState | undefined,
        [Diagonal.TopRight]: FieldState | undefined,
        [Diagonal.BottomLeft]: FieldState | undefined,
        [Diagonal.BottomRight]: FieldState | undefined,
    } {
        const game = this.game;
        if (!game) {
            throw new Error('AdjacentFields uses before game initialization')
        }

        const diagonalAddresses = getDiagonalAddresses({ address: params.address });

        const diagonalFields: {
            [Diagonal.TopLeft]: FieldState | undefined,
            [Diagonal.TopRight]: FieldState | undefined,
            [Diagonal.BottomLeft]: FieldState | undefined,
            [Diagonal.BottomRight]: FieldState | undefined,
        } = {
            [Diagonal.TopLeft]: undefined,
            [Diagonal.TopRight]: undefined,
            [Diagonal.BottomLeft]: undefined,
            [Diagonal.BottomRight]: undefined,
        };

        Object.entries(diagonalAddresses).forEach(([diagonal, address]) => {
            const field = address ? game.state.fields.get(AddressUtils.toKey(address))?.state : undefined;
            diagonalFields[diagonal as keyof typeof diagonalFields] = field;
        });

        return diagonalFields;
    }
};

export default AdjacentFields;