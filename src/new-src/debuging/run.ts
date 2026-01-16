import FieldElement from "../elements/FieldElement.js";
import DB from "../framework/DbService.js";
import GameInstance from "../index.js";
import PieceEnum from "../models/BoardModel.type.js";
import AddressUtils from "../utils/AddressUtils.js";
import { FBlock, FCloseLine, FLine, FOpenLine, Formatter, FSpace, FText, FToggle } from './Debg.js';

customElements.define('f-formatter', Formatter);
customElements.define('f-block', FBlock);
customElements.define('f-line', FLine);
customElements.define('f-open-line', FOpenLine);
customElements.define('f-close-line', FCloseLine);
customElements.define('f-space', FSpace);
customElements.define('f-toggle', FToggle);
customElements.define('f-text', FText);

document.addEventListener('DOMContentLoaded', async () => {

    await GameInstance.configured;

    const container = document.createElement('div') as HTMLDivElement;
    container.style.border = 'solid 1px black';
    container.style.position = 'relative';

    const resetGameBtn = document.createElement('button');
    resetGameBtn.innerText = 'Again';
    resetGameBtn.onclick = async () => {
        GameInstance.unsubscribePiece(gameSub, { type: PieceEnum.Fields })
        await DB.I().drop();
        await GameInstance.configure();
        GameInstance.subscribePiece(gameSub, { type: PieceEnum.Fields })
    }

    document.body.appendChild(resetGameBtn);
    document.body.appendChild(container);

    const gameSub = () => {
        const fields = GameInstance.state.fields;
        const _fieldElements = document.querySelectorAll(`${FieldElement.tagName}[data-field]`) as NodeListOf<FieldElement>;
        let fieldElements = [..._fieldElements];

        fields.forEach((fieldModel, addressKey) => {
            let foundId;
            let fieldElement = fieldElements.find((el, id) => {
                if (AddressUtils.isAddressEqual(el.props.address, fieldModel.state.address)) {
                    foundId = id;
                    return true;
                }
                return false;
            });

            if (typeof foundId === 'number') {
                fieldElements = [
                    ...fieldElements.slice(0, foundId),
                    ...fieldElements.slice(foundId + 1)
                ]
            }

            if (!fieldElement) {
                fieldElement = document.createElement(FieldElement.tagName) as FieldElement;
                fieldElement.setAttribute('data-field', fieldModel.state._id);
                fieldElement.props = fieldModel.state;
            }

            fieldElement.setProps(fieldModel.state); // ?

            if (!fieldElement.isConnected) {
                container.appendChild(fieldElement)
            }
        });

        fieldElements.forEach(el => {
            el.remove()
        })
    }

    GameInstance.subscribePiece(gameSub, { type: PieceEnum.Fields })
});
