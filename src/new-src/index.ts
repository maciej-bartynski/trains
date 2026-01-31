import BoardModel from "./models/BoardModel.js";

const GameInstance = BoardModel.I();

import BuildingElement from "./elements/BuildingElement.js";
import FieldElement from "./elements/FieldElement.js";
import FieldMenuElement from "./elements/FieldMenuElement.js";
import PieceEnum from "./models/BoardModel.type.js";
import AddressUtils from "./utils/AddressUtils.js";
import type Address from "./types/Address.js";
import DB from "./framework/DbService.js";
import WorldElement from "./elements/WorldElement.js";
import MenuBuildRailway from "./elements/MenuBuildRailway.js";
import TrackElement from "./elements/TrackElement.js";
import MenuBuildRoad from "./elements/MenuBuildRoad.js";

// indexedDB.deleteDatabase('game');

customElements.define(FieldElement.tagName, FieldElement);
customElements.define(BuildingElement.tagName, BuildingElement);
customElements.define(FieldMenuElement.tagName, FieldMenuElement);
customElements.define(MenuBuildRailway.tagName, MenuBuildRailway);
customElements.define(MenuBuildRoad.tagName, MenuBuildRoad);
customElements.define(WorldElement.tagName, WorldElement);
customElements.define(TrackElement.tagName, TrackElement);

const resetGameBtn = document.createElement('button');
resetGameBtn.innerText = 'Again';

const pick = <T>(arr: T[], condition: (el: T) => boolean) => {
    let foundId: number | undefined;
    let foundItem = arr.find((el, id) => {
        if (condition(el)) {
            foundId = id;
            return true;
        }
        return false;
    });

    if (typeof foundId === 'number') {
        arr = [
            ...arr.slice(0, foundId),
            ...arr.slice(foundId + 1)
        ]
    }

    return { found: foundItem, source: arr };
}

type AddressedState = {
    address: Address;
    _id: string;
};

type ModelWithState<TState extends AddressedState> = {
    state: TState;
};

type ElementWithProps<TState extends AddressedState> = HTMLElement & {
    props: TState;
    isConnected: boolean;
};

const syncElementsByAddress = <
    TState extends AddressedState,
    TModel extends ModelWithState<TState>,
    TElement extends ElementWithProps<TState>
>(params: {
    worldElement: WorldElement;
    selector: string;
    models: Map<string, TModel>;
    createElement: () => TElement;
}) => {
    const sourceElements = document.querySelectorAll(params.selector) as NodeListOf<TElement>;
    let elements = [...sourceElements];

    params.models.forEach((model) => {
        const picked = pick<TElement>(
            elements,
            (fieldElement) => {
                return AddressUtils.isAddressEqual(
                    fieldElement.props.address,
                    model.state.address
                );
            }
        );

        let found = picked.found;
        elements = picked.source;

        if (!found) {
            found = params.createElement();
            found.setAttribute('data-field', model.state._id);
            found.props = model.state;
        }

        if (!found.isConnected) {
            params.worldElement.appendFrameChild(found)
        }
    });

    elements.forEach(el => {
        el.remove()
    });
}

function subscribeFields(worldElement: WorldElement) {
    syncElementsByAddress({
        worldElement,
        selector: `${FieldElement.tagName}[data-field]`,
        models: GameInstance.state.fields,
        createElement: FieldElement.createElement
    });
}

function subscribeTracks(worldElement: WorldElement) {
    syncElementsByAddress({
        worldElement,
        selector: `${TrackElement.tagName}[data-field]`,
        models: GameInstance.state.tracks,
        createElement: TrackElement.createElement
    });
}

function subscribeBuildings(worldElement: WorldElement) {
    syncElementsByAddress({
        worldElement,
        selector: `${BuildingElement.tagName}[data-field]`,
        models: GameInstance.state.buildings,
        createElement: BuildingElement.createElement
    });
}

async function onDOMContentLoadedInitializeGame() {
    await GameInstance.configured;

    const worldElement = WorldElement.createElement();
    const fieldMenuElement = document.createElement(FieldMenuElement.tagName);
    const menuBuildRailway = document.createElement(MenuBuildRailway.tagName);
    const menuBuildRoad = document.createElement(MenuBuildRoad.tagName);

    resetGameBtn.onclick = async () => {
        gameUnsub();
        await DB.I().drop();
        worldElement.clearFrameHTML();
        await GameInstance.configure();
        gameSub();
    }

    document.body.appendChild(resetGameBtn);
    document.body.appendChild(fieldMenuElement);
    document.body.appendChild(menuBuildRailway);
    document.body.appendChild(menuBuildRoad);
    document.body.appendChild(worldElement);

    document.oncontextmenu = (e => {
        GameInstance.setSelectedField({ selectedField: null })
    })

    const onFieldsChange = () => {
        subscribeFields(worldElement);
    };

    const onBuildingsChange = () => {
        subscribeBuildings(worldElement);
    };

    const onTracksChange = () => {
        subscribeTracks(worldElement);
    };

    const gameSub = () => {
        GameInstance.subscribePiece(onFieldsChange, { type: PieceEnum.Fields });
        GameInstance.subscribePiece(onBuildingsChange, { type: PieceEnum.Buildings });
        GameInstance.subscribePiece(onTracksChange, { type: PieceEnum.Tracks });
    };

    const gameUnsub = () => {
        GameInstance.unsubscribePiece(onFieldsChange, { type: PieceEnum.Fields });
        GameInstance.unsubscribePiece(onBuildingsChange, { type: PieceEnum.Buildings });
        GameInstance.unsubscribePiece(onTracksChange, { type: PieceEnum.Tracks });
    };

    gameSub();
}

document.addEventListener('DOMContentLoaded', onDOMContentLoadedInitializeGame);