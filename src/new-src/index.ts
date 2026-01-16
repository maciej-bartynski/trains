import FieldElement from "./elements/FieldElement.js";
import BoardModel from "./models/BoardModel.js";

customElements.define(FieldElement.tagName, FieldElement);

const GameInstance = BoardModel.I();

export default GameInstance;