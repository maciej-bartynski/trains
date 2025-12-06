import TemplateHepler from "../TemplateHelper.js";
import TemplateName from "../TemplateName.js";

class TrafficLight extends HTMLElement {
    static templateName = TemplateName.TrafficLight;
    static elementName = 'traffic-light';

    async connectedCallback() {
        const html = await TemplateHepler.handleAssets(TrafficLight.templateName);
        if (!(this.innerHTML || "").trim()) {
            this.appendChild(html);
        }
    }

    static createElement(): TrafficLight {
        const trainElement = document.createElement(TrafficLight.elementName) as TrafficLight;
        return trainElement;
    }
}

export default TrafficLight;