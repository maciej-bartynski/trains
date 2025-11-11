import Address from "#src/types/Address.js";

const AddressUtils = {
    toKey: (address: Address) => {
        return `${address.row}-${address.column}`;
    },
    fromKey: (key: string | null): Address | null => {
        if (typeof key !== 'string' || key.trim() === '') {
            return null;
        }

        const [_row, _column] = key.split('-');

        const row = _row && typeof parseInt(_row) === 'number' && !isNaN(parseInt(_row))
            ? parseInt(_row)
            : null;

        const column = _column && typeof parseInt(_column) === 'number' && !isNaN(parseInt(_column))
            ? parseInt(_column)
            : null;

        if (typeof row !== 'number' || typeof column !== 'number') {
            return null;
        }

        return {
            row,
            column,
        };
    },
    isAddressEqual: (address1: Address, address2: Address) => {
        return address1.row === address2.row && address1.column === address2.column;
    },
}

export default AddressUtils;