import TemplateHepler from "#src/atoms/TemplateHelper.js";
import TemplateName from "#src/atoms/TemplateName.js";
import classify from "#src/utils/classify.js";
import StatefullComponent from "#src/framework/StatefullComponent/StatefullComponent.js";
import Service from "#src/framework/Service/Service.js";
import Address from "#src/types/Address.js";
import TrainModel from "#src/models/TrainModel.js";
import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import AddressUtils from "#src/utils/AddressUtils.js";
import GameFieldElement from "../GameFieldElement/GameFieldElement.js";
import GameBoard from "#src/GameBoard.js";
import BuildingKind from "#src/types/BuildingKind.js";
import ResourceKind from "#src/types/ResourceKind.js";

type TState = {
    prevAddress: Address | null;
    currAddress: Address | null;
    trainsLocatedHere: (TrainModel['state'])[]
}

type TProps = undefined;

class FieldMenuElement extends StatefullComponent<TState, TProps> {
    static componentName = 'field-menu';

    static createFieldMenu(): FieldMenuElement {
        const fieldMenu = document.querySelector(FieldMenuElement.componentName)
            ? document.querySelector(FieldMenuElement.componentName) as FieldMenuElement
            : document.createElement(FieldMenuElement.componentName) as FieldMenuElement;
        if (fieldMenu && !fieldMenu.isConnected) {
            document.body.appendChild(fieldMenu);
        }
        return fieldMenu;
    }

    static selectFieldMenu() {
        const fieldMenu = document.querySelector(FieldMenuElement.componentName) as FieldMenuElement;
        if (fieldMenu) {
            return fieldMenu;
        }
        return FieldMenuElement.createFieldMenu();
    }

    getTrainsListItem(train: TrainModel['state']) {
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
            this.onCloseMenu();
            GameBoard.ServicesRegistry.actionsMenu.onTrainSetRoute({ trainId: train.id });
        }
        return listItemContent;
    }

    private trainsList: HTMLUListElement = document.createElement('ul');
    private trainsListTitle: HTMLSpanElement = document.createElement('span');
    private kindEl: HTMLSpanElement = document.createElement('span');
    private orientationEl: HTMLSpanElement = document.createElement('span');
    private addressEl: HTMLSpanElement = document.createElement('span');
    private fieldPreviewEl: HTMLDivElement = document.createElement('div');
    private dialogEl: HTMLDialogElement = document.createElement('dialog');
    private closeButton: HTMLButtonElement = document.createElement('button');
    private trainsSectionEl: HTMLDivElement = document.createElement('div');
    private productionSectionEl: HTMLDivElement = document.createElement('div');
    private productionSectionTerrainEl: HTMLSpanElement = document.createElement('span');
    private productionSectionResourceEl: HTMLSpanElement = document.createElement('span');
    private productionSectionProductionEl: HTMLSpanElement = document.createElement('span');
    private storageSectionRowEl: HTMLDivElement = document.createElement('div');
    private storageSection: HTMLDivElement = document.createElement('div');

    constructor() {
        super();
        this.state = {
            prevAddress: null,
            currAddress: null,
            trainsLocatedHere: [],
        }
        this.getTrainsListItem = this.getTrainsListItem.bind(this);
        this.onOpenMenu = this.onOpenMenu.bind(this);
        this.onCloseMenu = this.onCloseMenu.bind(this);
        this.subscribeTrainTresspasing = this.subscribeTrainTresspasing.bind(this);
        this.render = this.render.bind(this);
    }

    public onOpenMenu(params: { fieldAddress: Address }) {

        const newPrevAddress = this.state.currAddress;
        const newCurrAddress = params.fieldAddress;

        const currField = newCurrAddress
            ? Service.gameBoard.getField(newCurrAddress)
            : null;

        const prevField = newPrevAddress
            ? Service.gameBoard.getField(newPrevAddress)
            : null;

        if (prevField) {
            prevField.unsubscribe(this.render);
        }

        if (currField) {
            currField.subscribe(this.render);
            this.setState({
                prevAddress: newPrevAddress,
                currAddress: newCurrAddress,
                trainsLocatedHere: [],
            });

            Object
                .entries(Service.gameBoard.state.trains)
                .forEach(([trainId, trainModel]) => {
                    trainModel.subscribe(this.subscribeTrainTresspasing);
                    this.subscribeTrainTresspasing(trainModel['state'])
                })

            this.dialogEl.show();
        }
    }

    public onCloseMenu() {
        Object
            .entries(Service.gameBoard.state.trains)
            .forEach(([trainId, trainModel]) => {
                trainModel.unsubscribe(this.subscribeTrainTresspasing)
            })

        const currField = this.state.currAddress
            ? Service.gameBoard.getField(this.state.currAddress)
            : null;
        const prevField = this.state.prevAddress
            ? Service.gameBoard.getField(this.state.prevAddress)
            : null;
        currField?.unsubscribe(this.render);
        prevField?.unsubscribe(this.render);
        this.setState({
            prevAddress: null,
            currAddress: null,
            trainsLocatedHere: []
        });
        this.dialogEl.close();
    }

    private subscribeTrainTresspasing(trainState: TrainModel['state']) {
        const prevState = JSON.stringify([...this.state.trainsLocatedHere].sort() ?? [])
        const trainIsLocatedHere = this.state.currAddress && AddressUtils.isAddressEqual(trainState.location, this.state.currAddress);
        const trainIsNotYetAdded = !this.state.trainsLocatedHere.some(train => train.id === trainState.id);
        let nextState: TrainModel['state'][] = [...this.state.trainsLocatedHere];

        if (trainIsLocatedHere && trainIsNotYetAdded) {
            nextState.push(trainState)
        } else if (!trainIsLocatedHere) {
            nextState = nextState.filter(train => train.id !== trainState.id)
        }
        if (prevState !== JSON.stringify([...nextState].sort())) {
            this.setState({
                trainsLocatedHere: nextState
            })
        }
    }

    override render(): void {
        const address = this.state.currAddress ?? null;
        const field = address
            ? Service.gameBoard.getField(address)
            : null;

        if (field) {
            const preview = GameFieldElement.renderPreviewDuplicate(field.state.address);
            if (preview) {
                this.fieldPreviewEl.innerHTML = '';
                this.fieldPreviewEl.appendChild(preview);
            }

            let orientation = ''

            Object.entries(field.state.railwayOrientation)
                .filter(entry => entry[1])
                .forEach((entry, id, self) => {
                    if (!self.length) {
                        orientation = '';
                        return;
                    }
                    if (self.length === 1) {
                        orientation = `To ${entry[0]}`;
                        return;
                    }
                    orientation += `${!id ? '' : ' - '}${entry[0]}`
                })

            const title = (field.state.building ?? field.state.terrain ?? 'Field').split('-').join(' ');
            this.kindEl.innerText = title;
            this.addressEl.innerHTML = `<span class="${classNames.fieldPreview.address.indicatorAddress}" style="display: inline-block;"></span> C:${field.state.address.column} &#10005; R:${field.state.address.row}`;
            this.orientationEl.innerHTML = orientation ? `<span class="indicator-blue" style="display: inline-block;"></span> ${orientation}` : '';

            const possiblyTrainRestingBuildingKind: (BuildingKind | null)[] = [
                BuildingKind.RailwayGarage,
                BuildingKind.RailwayStation,
                BuildingKind.Timber
            ]
            if (possiblyTrainRestingBuildingKind.includes(field.state.building)) {
                this.trainsListTitle.innerText = 'No trains are located here.';
                this.trainsList.innerHTML = '';
                this.state.trainsLocatedHere.forEach(train => {
                    this.trainsSectionEl.style.display = 'block';
                    this.trainsListTitle.innerText = 'Trains located here:'
                    this.trainsList.appendChild(this.getTrainsListItem(train))
                })
            } else {
                this.trainsSectionEl.style.display = 'none';
                this.trainsListTitle.innerText = 'Trains located here:';
                this.trainsList.innerHTML = '';
                this.state.trainsLocatedHere.forEach(train => {
                    this.trainsSectionEl.style.display = 'block';
                    this.trainsList.appendChild(this.getTrainsListItem(train))
                })
            }

            this.productionSectionEl.innerHTML = '';
            this.productionSectionTerrainEl.innerHTML = `Terrain: <b>${field.state.terrain}</b>`;
            this.productionSectionResourceEl.innerHTML = `Resource: <b>${field.state.resources.map((resource) => resource).join(', ')}</b>`;
            this.productionSectionEl.appendChild(this.productionSectionTerrainEl);
            this.productionSectionEl.appendChild(this.productionSectionResourceEl);
            if (field.state.production) {
                Object.entries(field.state.production).forEach(production => {
                    const [key, productionState] = production;
                    if (productionState) {
                        const resourceKind = key as ResourceKind;
                        const { qty, progress } = productionState;
                        const productionRow = this.productionSectionProductionEl.cloneNode(true) as HTMLSpanElement;
                        productionRow.innerHTML = `Production: ${resourceKind} <b>${qty}/10</b> <i>${progress}%</i>`;
                        this.productionSectionEl.appendChild(productionRow);
                    }
                })
            }
            this.storageSectionRowEl.innerHTML = '';
            this.storageSection.style.display = 'none'

            if (field.state.storage) {
                this.storageSection.style.display = 'block'
                let storageRowInnerHtml = ``;
                Object.entries(field.state.storage).forEach(entry => {
                    const [resource, storageQty] = entry;
                    storageRowInnerHtml += `
                        <span class="${classNames.storageSection.rowItem}">${resource}: <b>${storageQty}</b></span>
                    `;
                });
                this.storageSectionRowEl.innerHTML = storageRowInnerHtml;
            }

        }
    }

    async connectedCallback() {
        this.innerHTML = loader;
        await TemplateHepler.handleAssets(TemplateName.FieldMenu, {
            assetTypes: ['css']
        });
        this.innerHTML = innerHtml;

        this.trainsList = this.querySelector(`.${classNames.trainsSection.list}`) as HTMLUListElement;
        this.trainsListTitle = this.querySelector(`.${classNames.trainsSection.header.title}`) as HTMLSpanElement;
        this.kindEl = this.querySelector(`.${classNames.fieldPreview.kind}`) as HTMLSpanElement;
        this.addressEl = this.querySelector(`.${classNames.fieldPreview.address.root}`) as HTMLSpanElement;
        this.orientationEl = this.querySelector(`.${classNames.fieldPreview.orientation}`) as HTMLSpanElement;
        this.dialogEl = this.querySelector('dialog') as HTMLDialogElement;
        this.fieldPreviewEl = this.querySelector(`.${classNames.fieldPreview.field}`) as HTMLDivElement;
        this.closeButton = this.querySelector('.close-button') as HTMLButtonElement;
        this.closeButton.onclick = this.onCloseMenu;
        this.trainsSectionEl = this.querySelector(`.${classNames.trainsSection.root}`) as HTMLDivElement;
        this.productionSectionEl = this.querySelector(`.${classNames.productionSection.root}`) as HTMLDivElement;
        this.productionSectionTerrainEl = this.querySelector(`.${classNames.productionSection.terrain}`) as HTMLSpanElement;
        this.productionSectionResourceEl = this.querySelector(`.${classNames.productionSection.resource}`) as HTMLSpanElement;
        this.productionSectionProductionEl = this.querySelector(`.${classNames.productionSection.production}`) as HTMLSpanElement;
        this.storageSectionRowEl = this.querySelector(`.${classNames.storageSection.row}`) as HTMLDivElement;
        this.storageSection = this.querySelector(`.${classNames.storageSection.root}`) as HTMLDivElement;
    }
}

const classNames = classify(FieldMenuElement.componentName, {
    loader: 'loader',
    dialog: 'dialog',
    fieldPreview: {
        field: 'field',
        kind: 'kind',
        address: {
            indicatorAddress: 'indicator-address'
        },
        orientation: 'orientation',
        actionButton: 'action-button'
    },
    productionSection: {
        terrain: 'terrain',
        resource: 'resource',
        production: 'production'
    },
    storageSection: {
        head: 'head',
        row: 'row',
        rowItem: 'rowItem'
    },
    trainsSection: {
        header: {
            title: 'title'
        },
        list: 'list'
    }
});

const loader = `
    <dialog class="box-secondary ${classNames.dialog}">
        <div ${classNames.loader}">
            <div></div>
        </div>
    </dialog>
`;

const innerHtml = `
    <dialog class="box-secondary ${classNames.dialog}">
        <button class="close-button box-tertiary"></button>

        <div class="${classNames.fieldPreview.root}">
            <div class="${classNames.fieldPreview.field}"></div>
            <span class="${classNames.fieldPreview.kind}">
                Field kind
            </span>
            <span class="${classNames.fieldPreview.address.root}">
                X column, Y row
            </span>
            <span class="${classNames.fieldPreview.orientation}">
                <span class="menu-buildings_preview-node --active"></span> to direction
            </span>

            <div class="${classNames.fieldPreview.actionButton}">
                <button class="box-primary">
                    <img src="images/icons/build-train.png" width="20px" height="20px"/>
                    <span>Action</span>
                </button>
            </div>
        </div>

        <div class="${classNames.productionSection.root}">
            <span class="${classNames.productionSection.terrain}">Terrain: <b>Forrest</b></span>
            <span class="${classNames.productionSection.resource}">Resource: <b>Wood</b></span>
            <span class="${classNames.productionSection.production}">Production: <b>3/10</b> (<i>55%</i>)</span>
        </div>

        <div class="${classNames.storageSection.root}">
            <span class="${classNames.storageSection.head}"><b>Storage</b></span>
            <div class="${classNames.storageSection.row}">
                <span class="${classNames.storageSection.rowItem}">Wood: <b>3/10</b></span>
                <span class="${classNames.storageSection.rowItem}">Clay: <b>2/10</b></span>
            </div>
        </div>
               
        <div class="${classNames.trainsSection.root}">
            <div class="list_header ${classNames.trainsSection.header.root}"> 
                <img src="images/icons/trains-list.png" width="20px" height="20px"/>
                <span class="${classNames.trainsSection.header.title}">Trains located here</span>
            </div>
            <ul class="list ${classNames.trainsSection.list}">
            </ul>
        </div>
    </dialog>
`;

export default FieldMenuElement