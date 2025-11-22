import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import { GameBoard } from "#src/GameBoard.js";
import FieldModel from "#src/models/FieldModel.js";
import TrainModel from "#src/models/TrainModel.js";
import ActionsMenuService from "#src/service/ActionsMenuService/ActionsMenuService.js";
import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import pointerOperations from "#src/service/PointerOperations/PointerOperations.js";
import OperationType, { Operation } from "#src/service/PointerOperations/types.js";
import BuildingKind from "#src/types/BuildingKind.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import Pathfinder from "#src/utils/Pathfinder.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";

type ElementState = {}

type ElementProps = {
    fields: Record<string, FieldModel>;
    trains: Record<string, TrainModel>;
    furthestRow: number;
    furthestColumn: number;
    action: ActionsMenuService["state"]['action']
}

class MenuTrainsElement extends StatefullComponent<ElementState, ElementProps> {
    static componentName = 'menu-trains-element';

    private wrapper: HTMLDialogElement = document.createElement('dialog');
    private closeButton: HTMLButtonElement = document.createElement('button');
    private garageHeader: HTMLDivElement = document.createElement('div');
    private fieldPreview: HTMLDivElement = document.createElement('div');
    private fieldPreviewBuildingKind: HTMLDivElement = document.createElement('div');
    private fieldPreviewAddress: HTMLDivElement = document.createElement('div');
    private fieldPreviewOrientation: HTMLDivElement = document.createElement('div');
    private trainsSection: HTMLDivElement = document.createElement('div');
    private trainsList: HTMLUListElement = document.createElement('ul');
    private trainsListItem: HTMLLIElement = document.createElement('li');
    private buildTrainButton: HTMLButtonElement = document.createElement('button');
    private dialogTitle: HTMLSpanElement = document.createElement('span');

    constructor() {
        super();

        let currentProps: ElementProps = {
            fields: {},
            trains: {},
            furthestRow: 0,
            furthestColumn: 0,
            action: null
        }

        GameBoard.getInstance().subscribe(() => {
            const nextState = GameBoard.getInstance().state;
            const nextProps = { ...currentProps, ...nextState }
            currentProps = nextProps;
            this.setProps(nextProps)
        });

        actionsMenuService.subscribe((actionsMenu) => {
            const nextProps = { ...currentProps, ...actionsMenu }
            currentProps = nextProps;
            this.setProps(nextProps)
        });
    }

    connectedCallback() {

        this.innerHTML = `
            <dialog class="box-secondary menu-trains-dialog">
                <button class="close-button box-tertiary"></button>

                <div class="field-preview">
                    <div data-selector="field-preview_field"></div>
                    <span data-selector="field-preview_kind">
                        Trains garage
                    </span>
                    <span data-selector="field-preview_address">
                        X column, Y row
                    </span>
                    <span data-selector="field-preview_orientation">
                        <span class="menu-buildings_preview-node --active"></span> to direction
                    </span>

                    <div class="build-train-wrapper">
                    <button class="box-primary" data-action="build-train-button">
                        <img src="images/icons/build-train.png" width="20px" height="20px"/>
                        <span>Build train</span>
                    </button>
                    </div>
                </div>
               
                <div class="trains-section">
                    <div class="list_header"> 
                        <img src="images/icons/trains-list.png" width="20px" height="20px"/>
                        <span data-dialog-title>Trains located here</span>
                    </div>
                    <ul class="list">
                    </ul>
                </div>
            </dialog>
        `;

        this.wrapper = this.querySelector('dialog') as HTMLDialogElement;
        this.closeButton = this.querySelector('button.close-button') as HTMLButtonElement;
        this.garageHeader = this.querySelector('div.field-preview') as HTMLDivElement;
        this.trainsSection = this.querySelector('div.trains-section') as HTMLDivElement;
        this.fieldPreview = this.querySelector('div[data-selector="field-preview_field"]') as HTMLDivElement;
        this.fieldPreviewBuildingKind = this.querySelector('[data-selector="field-preview_kind"]') as HTMLDivElement;
        this.fieldPreviewAddress = this.querySelector('[data-selector="field-preview_address"]') as HTMLDivElement;
        this.fieldPreviewOrientation = this.querySelector('[data-selector="field-preview_orientation"]') as HTMLDivElement;
        this.trainsList = this.querySelector('ul') as HTMLUListElement;
        // this.trainsListItem = this.querySelector('li.trains-list-item') as HTMLLIElement;
        this.buildTrainButton = this.querySelector('button[data-action="build-train-button"]') as HTMLButtonElement;
        this.dialogTitle = this.querySelector('[data-dialog-title]') as HTMLSpanElement;

        this.closeButton.onclick = () => {
            actionsMenuService.onClear();
            this.wrapper.close();
        }

        this.buildTrainButton.onclick = () => {
            const props = this.getProps();
            if (props.action?.type === ActionsMenuOptionName.BuildTrain) {
                const address = props.action.payload?.address;
                if (address) {
                    const newTrain = TrainModel.build({ address });
                    GameBoard.getInstance().setTrain(newTrain)
                }
            }

        }
    }

    static getTrainsListItem(train: TrainModel) {
        document.createElement('li');
        const listItemContent = document.createElement('li');
        listItemContent.classList.add('list_item')
        listItemContent.setAttribute('data-train', train.id);
        listItemContent.innerHTML = `
            <train-atom data-train="${train.id}" data-color="${train.randomColor}" class="--presentation"></train-atom>
            <span class="train-name">${train.name}</span>
            <button class="box-primary set-route">Set route</button>
        `;
        const trainEl = listItemContent.querySelector('train-atom') as TrainAtom;
        listItemContent.onmouseenter = () => trainEl?.classList.add('--moving');
        listItemContent.onmouseleave = () => trainEl?.classList.remove('--moving');
        const btn = listItemContent.querySelector('button') as HTMLButtonElement;
        btn.onclick = () => {
            actionsMenuService.onTrainSetRoute({ trainId: train.id });
        }
        return listItemContent;
    }

    override render() {

        const state = this.getState();
        const props = this.getProps();

        if (props.action?.type === ActionsMenuOptionName.BuildTrain) {
            const payload = props.action.payload;

            if (payload) {
                const { address } = payload;
                const field = GameBoard.getInstance().getField(address);
                const preview = field ? GameFieldElement.renderPreviewDuplicate(field.address) : null;
                if (field?.building === BuildingKind.RailwayGarage && preview) {

                    if (!this.garageHeader.isConnected) {
                        this.wrapper.insertBefore(this.garageHeader, this.trainsSection);
                    }

                    this.fieldPreview.innerHTML = '';
                    this.fieldPreview.appendChild(preview);
                    preview.style.width = '100px';
                    preview.style.height = '100px';
                    this.wrapper.showModal();

                    this.fieldPreviewBuildingKind.innerText = 'Train Garage'
                    this.fieldPreviewAddress.innerHTML = `<span class="indicator-address" style="display: inline-block;"></span> C:${field.address.column} &#10005; R:${field.address.row}`;
                    this.fieldPreviewOrientation.innerHTML = `<span class="indicator-blue" style="display: inline-block;"></span> to ${Object.entries(field.railwayOrientation).find(entry => entry[1])?.[0]}`;

                    this.trainsList.innerHTML = '';
                    let trainsAmountHere = 0;
                    Object.values(props.trains).forEach(train => {
                        if (AddressUtils.isAddressEqual(train.location, field.address)) {
                            this.trainsList.appendChild(MenuTrainsElement.getTrainsListItem(train));
                            trainsAmountHere += 1;
                        }
                    })

                    this.dialogTitle.innerText = trainsAmountHere > 0 ? 'Trains located here:' : 'No trains are located here.'
                } else {
                    /**
                     * error;
                     */
                }
            }
        } else if (props.action?.type === ActionsMenuOptionName.TrainsList) {

            const hasTrains = Object.values(props.trains).length > 0;
            this.dialogTitle.innerText = hasTrains ? 'All trains:' : 'No trains yet. Trains can be constructed in any garage.'
            this.garageHeader.remove();
            this.wrapper.showModal();

            this.trainsList.innerHTML = ''
            Object.values(props.trains).forEach(train => {
                this.trainsList.appendChild(MenuTrainsElement.getTrainsListItem(train));
            })
        } else {
            this.wrapper.close();
        }
    }
}

customElements.define(MenuTrainsElement.componentName, MenuTrainsElement);

export default MenuTrainsElement;