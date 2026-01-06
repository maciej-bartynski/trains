import GameInstance from "../index.js";
import { FBlock, FCloseLine, FLine, FOpenLine, Formatter, FSpace, FText, FToggle } from './Debg.js';

customElements.define('f-formatter', Formatter);
customElements.define('f-block', FBlock);
customElements.define('f-line', FLine);
customElements.define('f-open-line', FOpenLine);
customElements.define('f-close-line', FCloseLine);
customElements.define('f-space', FSpace);
customElements.define('f-toggle', FToggle);
customElements.define('f-text', FText);

document.addEventListener('DOMContentLoaded', () => {
    GameInstance.subscribePiece('fields', () => {
        const fields = GameInstance.state.fields;
        const toObject: Record<string, object> = {}
        fields.forEach((fieldModel, addressKey) => {
            toObject[addressKey] = fieldModel.state;
        });
        const formatter = document.createElement('f-formatter');
        formatter.innerHTML = JSON.stringify(toObject);
        document.body.innerHTML = '';
        document.body.appendChild(formatter);
    })
});
