import Address from "#src/types/Address.js";

const isAddressEqual = (address1: Address, address2: Address) => {
    return address1.row === address2.row && address1.column === address2.column;
}

export default isAddressEqual;