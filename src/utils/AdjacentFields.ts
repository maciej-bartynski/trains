import Config from "#src/config.js";
import gameBoard from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import Address from "#src/types/Address.js";
import Diagonal from "#src/types/Diagonal.js";
import AddressUtils from "./AddressUtils.js";

const getAdjacentAddresses = (params: {
    address: Address,
}): {
    top: Address | undefined,
    bottom: Address | undefined,
    left: Address | undefined,
    right: Address | undefined,
} => {
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

const getDiagonalAddresses = (params: {
    address: Address,
}): {
    [Diagonal.TopLeft]: Address | undefined,
    [Diagonal.TopRight]: Address | undefined,
    [Diagonal.BottomLeft]: Address | undefined,
    [Diagonal.BottomRight]: Address | undefined,
} => {
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

const getAdjacentFields = (params: {
    address: Address,
}): {
    top: FieldModel | undefined,
    bottom: FieldModel | undefined,
    left: FieldModel | undefined,
    right: FieldModel | undefined,
} => {
    const adjacentAddresses = getAdjacentAddresses({ address: params.address });

    const adjacentFields: {
        top: FieldModel | undefined,
        bottom: FieldModel | undefined,
        left: FieldModel | undefined,
        right: FieldModel | undefined,
    } = {
        top: undefined,
        bottom: undefined,
        left: undefined,
        right: undefined,
    };

    Object.entries(adjacentAddresses).forEach(([position, address]) => {
        const field = address ? gameBoard.fields[AddressUtils.toKey(address)] : undefined;
        adjacentFields[position as keyof typeof adjacentFields] = field;
    });
    return adjacentFields;
}

const getDiagonalFields = (params: {
    address: Address,
}): {
    [Diagonal.TopLeft]: FieldModel | undefined,
    [Diagonal.TopRight]: FieldModel | undefined,
    [Diagonal.BottomLeft]: FieldModel | undefined,
    [Diagonal.BottomRight]: FieldModel | undefined,
} => {
    const diagonalAddresses = getDiagonalAddresses({ address: params.address });

    const diagonalFields: {
        [Diagonal.TopLeft]: FieldModel | undefined,
        [Diagonal.TopRight]: FieldModel | undefined,
        [Diagonal.BottomLeft]: FieldModel | undefined,
        [Diagonal.BottomRight]: FieldModel | undefined,
    } = {
        [Diagonal.TopLeft]: undefined,
        [Diagonal.TopRight]: undefined,
        [Diagonal.BottomLeft]: undefined,
        [Diagonal.BottomRight]: undefined,
    };

    Object.entries(diagonalAddresses).forEach(([diagonal, address]) => {
        const field = address ? gameBoard.fields[AddressUtils.toKey(address)] : undefined;
        diagonalFields[diagonal as keyof typeof diagonalFields] = field;
    });

    return diagonalFields;
}

const AdjacentFields = {
    getAdjacentAddresses,
    getAdjacentFields,
    getDiagonalAddresses,
    getDiagonalFields,
};

export default AdjacentFields;