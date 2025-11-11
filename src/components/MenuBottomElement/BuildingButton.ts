import pointerOperations from "#src/service/PointerOperations/PointerOperations.js";
import OperationType from "#src/service/PointerOperations/types.js";
import BuildingKind from "#src/types/BuildingKind.js";
import Orientation, { OrientationSquareVariant } from "#src/types/Orientation.js";
import BuildingOrientationUtils from "#src/utils/BuildingOrientationUtils.js";

class BuildingButtonElement extends HTMLElement {

    static componentName = 'building-button-element';

    state: {
        buildingKind: BuildingKind | null,
        orientation: Orientation | null,
        orientationSquareVariant: OrientationSquareVariant | null;
    } = {
            buildingKind: null,
            orientation: null,
            orientationSquareVariant: null
        }

    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.setState = this.setState.bind(this);
    }

    public setState(params: BuildingButtonElement['state']) {
        this.state = params;
    }

    private onClick() {
        const kind = this.state.buildingKind;
        const orientation = this.state.orientation;

        if (!kind || !orientation) {
            return;
        }
    }

    connectedCallback() {
        const kind = this.state.buildingKind;
        const orientation = this.state.orientation;
        const orientationSquareVariant = this.state.orientationSquareVariant;

        const buildingImageUrl = kind && orientation ? BuildingOrientationUtils.orientationToImage({
            kind,
            orientation,
            orientationSquareVariant
        }) : null;

        if (!buildingImageUrl) {
            return;
        }

        this.innerHTML = `
            <button>
                <img src="${buildingImageUrl}" alt="${kind}" />
            </button>
        `;

        const buttonElement = this.querySelector('button') as HTMLButtonElement;
        buttonElement.addEventListener('click', this.onClick);
    }
}

customElements.define(BuildingButtonElement.componentName, BuildingButtonElement);

export default BuildingButtonElement;