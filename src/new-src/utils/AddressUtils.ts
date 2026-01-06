import Address from "../types/Address.js";

const AddressUtils = {
    toKey(address: Address) {
        return `{row:${address.row},column:${address.column}}`;
    },

    fromKey(key: string): Address | null {
        try {
            const address = JSON.parse(key) as Address;
            if (typeof address.column === 'number' && typeof address.row === 'number') {
                return address;
            } {
                return null;
            }
        } catch (e) {
            console.error(e)
            return null
        }
    },

    isAddressEqual: (address1: Address, address2: Address) => {
        return address1.row === address2.row && address1.column === address2.column;
    },
}

export default AddressUtils