import BoardModel from "./models/BoardModel.js";
import FieldModel from "./models/FieldModel.js";
import defaultSetup from "./scenarios/initial.js";
import AddressUtils from "./utils/AddressUtils.js";

const GameInstance = new BoardModel({
    setup: defaultSetup
});

export default GameInstance;

setTimeout(() => {
    const address = { column: 10, row: 10 };
    const key = AddressUtils.toKey(address);
    const readyField = new FieldModel(address);
    FieldModel.game.state.fields.set(key, readyField);
    readyField.handleUncover();
})