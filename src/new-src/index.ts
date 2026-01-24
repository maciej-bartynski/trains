import BuildingElement from "./elements/BuildingElement.js";
import FieldElement from "./elements/FieldElement.js";
import FieldMenuElement from "./elements/FieldMenuElement.js";
import BoardModel from "./models/BoardModel.js";
import PieceEnum from "./models/BoardModel.type.js";
import AddressUtils from "./utils/AddressUtils.js";
import DB from "./framework/DbService.js";
import WorldElement from "./elements/WorldElement.js";
import MenuBuildRailway from "./elements/MenuBuildRailway.js";
import TrackElement from "./elements/TrackElement.js";

// indexedDB.deleteDatabase('game');

customElements.define(FieldElement.tagName, FieldElement);
customElements.define(BuildingElement.tagName, BuildingElement);
customElements.define(FieldMenuElement.tagName, FieldMenuElement);
customElements.define(MenuBuildRailway.tagName, MenuBuildRailway);
customElements.define(WorldElement.tagName, WorldElement);
customElements.define(TrackElement.tagName, TrackElement);

const GameInstance = BoardModel.I();

export default GameInstance;

const resetGameBtn = document.createElement('button');
resetGameBtn.innerText = 'Again';

document.addEventListener('DOMContentLoaded', async () => {
    await GameInstance.configured;

    const worldElement = WorldElement.createElement();
    const fieldMenuElement = document.createElement(FieldMenuElement.tagName);
    const menuBuildRailway = document.createElement(MenuBuildRailway.tagName);

    resetGameBtn.onclick = async () => {
        GameInstance.unsubscribePiece(gameSub)
        await DB.I().drop();
        worldElement.clearFrameHTML();
        await GameInstance.configure();
        GameInstance.subscribePiece(gameSub, { type: PieceEnum.Fields })
        GameInstance.subscribePiece(gameSub, { type: PieceEnum.Buildings })
    }

    document.body.appendChild(resetGameBtn);
    document.body.appendChild(fieldMenuElement);
    document.body.appendChild(menuBuildRailway);
    document.body.appendChild(worldElement);

    document.oncontextmenu = (e => {
        GameInstance.setSelectedField({ selectedField: null })
    })

    const gameSub = () => {

        const fields = GameInstance.state.fields;
        const buildings = GameInstance.state.buildings;
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

            if (!fieldElement.isConnected) {
                worldElement.appendFrameChild(fieldElement)
            }
        });

        fieldElements.forEach(el => {
            el.remove()
        });

        ///

        const _buildingElements = document.querySelectorAll(`${BuildingElement.tagName}[data-field]`) as NodeListOf<BuildingElement>;
        let buildingElements = [..._buildingElements];

        buildings.forEach((buildingModel, addressKey) => {
            let foundId;
            let buildingEl = buildingElements.find((el, id) => {
                if (AddressUtils.isAddressEqual(el.props.address, buildingModel.state.address)) {
                    foundId = id;
                    return true;
                }
                return false;
            });

            if (typeof foundId === 'number') {
                buildingElements = [
                    ...buildingElements.slice(0, foundId),
                    ...buildingElements.slice(foundId + 1)
                ]
            }

            if (!buildingEl) {
                buildingEl = document.createElement(BuildingElement.tagName) as BuildingElement;
                buildingEl.setAttribute('data-field', buildingModel.state._id);
                buildingEl.props = buildingModel.state;
            }

            if (!buildingEl.isConnected) {
                worldElement.appendFrameChild(buildingEl)
            }
        });

        buildingElements.forEach(el => {
            el.remove()
        });

        ///

        const _trackElements = document.querySelectorAll(`${TrackElement.tagName}[data-field]`) as NodeListOf<TrackElement>;
        let trackElements = [..._trackElements];
        const tracks = GameInstance.state.tracks;

        tracks.forEach((trackModel, addressKey) => {
            let foundId;
            let trackEl = trackElements.find((el, id) => {
                if (AddressUtils.isAddressEqual(el.props.address, trackModel.state.address)) {
                    foundId = id;
                    return true;
                }
                return false;
            });

            if (typeof foundId === 'number') {
                trackElements = [
                    ...trackElements.slice(0, foundId),
                    ...trackElements.slice(foundId + 1)
                ]
            }

            if (!trackEl) {
                trackEl = document.createElement(TrackElement.tagName) as TrackElement;
                trackEl.setAttribute('data-field', trackModel.state._id);
                trackEl.props = trackModel.state;
            }

            if (!trackEl.isConnected) {
                worldElement.appendFrameChild(trackEl)
            }
        });

        trackElements.forEach(el => {
            el.remove()
        });
    }

    GameInstance.subscribePiece(gameSub, { type: PieceEnum.Fields });
    GameInstance.subscribePiece(gameSub, { type: PieceEnum.Buildings });
    GameInstance.subscribePiece(gameSub, { type: PieceEnum.Tracks });
});