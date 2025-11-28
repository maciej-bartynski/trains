import TemplateHepler from "../TemplateHelper.js";
import TemplateName from "../TemplateName.js";

class TrainAtom extends HTMLElement {
    static templateName = TemplateName.TrainAtom;
    static elementName = 'train-atom';
    static attributeColor = 'data-color'

    static observedAttributes = [TrainAtom.attributeColor];

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === TrainAtom.attributeColor) {
            this.style.setProperty('--light-color', newValue);
        }
    }

    async connectedCallback() {
        const html = await TemplateHepler.handleAssets(TrainAtom.templateName);
        this.appendChild(html);
        const rootColor = this.getAttribute(TrainAtom.attributeColor);
        if (rootColor) {
            this.style.setProperty('--light-color', rootColor);
        }
    }

    static createElement(): TrainAtom {
        const trainElement = document.createElement(TrainAtom.elementName) as TrainAtom;
        return trainElement;
    }
}

// customElements.define(TrainAtom.elementName, TrainAtom);

export default TrainAtom;