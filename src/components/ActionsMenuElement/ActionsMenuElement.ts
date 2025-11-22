import actionsMenuService from "#src/service/ActionsMenuService/index.js";
import ActionsMenuService from "#src/service/ActionsMenuService/ActionsMenuService.js";
import ActionsMenuOptionName from "#src/service/ActionsMenuService/types.js";
import GameBoard from "#src/GameBoard.js";

class ActionMenuElement extends HTMLElement {
    static componentName = 'action-menu';

    private styleguideButton() {
        const button = document.createElement('a') as HTMLAnchorElement;
        button.classList.add('action-menu_action-btn');
        button.innerHTML = `
            <span class="action-menu_action-btn-ornament"></span>
            <span>SG</span>
            <span class="action-menu_action-btn-dot"></span>
        `;
        button.href = 'styleguide.html';
        return button;
    }

    private populateSaveButton() {
        const button = document.createElement('button') as HTMLButtonElement;
        button.classList.add('action-menu_action-btn');
        button.innerHTML = `
            <span class="action-menu_action-btn-ornament"></span>
            <span>Save</span>
            <span class="action-menu_action-btn-dot"></span>
        `;
        button.onclick = () => {
            const gameJson = GameBoard.getInstance().toJSON();
            const gameString = JSON.stringify(gameJson);
            window.localStorage.setItem('game', gameString);
        }
        return button;
    }

    private populateButton(params: { actionKind: ActionsMenuOptionName }) {
        const button = document.createElement('button') as HTMLButtonElement;
        const { actionKind } = params;
        button.classList.add('action-menu_action-btn');
        button.setAttribute('data-action', actionKind);
        button.innerHTML = `
            <span class="action-menu_action-btn-ornament"></span>
            <img src="images/icons/${actionKind}.png" />
            <span class="action-menu_action-btn-dot"></span>
        `;
        const handlersMap = {
            [ActionsMenuOptionName.BuildBuilding]: this.onBuildBuilding,
            [ActionsMenuOptionName.BuildRailway]: this.onBuildRailway,
            [ActionsMenuOptionName.TrainsList]: this.onTrainsList,
            [ActionsMenuOptionName.Destroy]: this.onDestroy,
            [ActionsMenuOptionName.BuildTrain]: this.onBuildTrain,
            [ActionsMenuOptionName.TrainSetRoute]: this.onSetRoute
        }
        button.onclick = handlersMap[actionKind];
        return button;
    }

    private buildRailwayBtn: HTMLButtonElement = this.populateButton({ actionKind: ActionsMenuOptionName.BuildRailway });
    private buildBuildingBtn: HTMLButtonElement = this.populateButton({ actionKind: ActionsMenuOptionName.BuildBuilding });
    private listTrainsBtn: HTMLButtonElement = this.populateButton({ actionKind: ActionsMenuOptionName.TrainsList });
    private destroyBtn: HTMLButtonElement = this.populateButton({ actionKind: ActionsMenuOptionName.Destroy });
    private buildTrainBtn: HTMLButtonElement = this.populateButton({ actionKind: ActionsMenuOptionName.Destroy });
    private sgButton: HTMLAnchorElement = this.styleguideButton();
    private saveButton: HTMLButtonElement = this.populateSaveButton();


    constructor() {
        super();

        this.populateButton = this.populateButton.bind(this);
        this.onActionsMenuServiceState = this.onActionsMenuServiceState.bind(this);

        this.onBuildBuilding = this.onBuildBuilding.bind(this);
        this.onBuildRailway = this.onBuildRailway.bind(this);
        this.onBuildTrain = this.onBuildTrain.bind(this);
        this.onTrainsList = this.onTrainsList.bind(this);
        this.onDestroy = this.onDestroy.bind(this);

        actionsMenuService.subscribe(this.onActionsMenuServiceState)

    }

    private onActionsMenuServiceState(state: ActionsMenuService['state']): void {
        const currentAction = state.action?.type;
        const buttonsMap = {
            [ActionsMenuOptionName.BuildBuilding]: this.buildBuildingBtn,
            [ActionsMenuOptionName.BuildRailway]: this.buildRailwayBtn,
            [ActionsMenuOptionName.TrainsList]: this.listTrainsBtn,
            [ActionsMenuOptionName.Destroy]: this.destroyBtn,
            [ActionsMenuOptionName.BuildTrain]: this.buildTrainBtn,
        }
        Object.entries(buttonsMap).forEach(entry => {
            const [actionKind, btnElement] = entry as [ActionsMenuOptionName, HTMLButtonElement];
            if (actionKind === currentAction) {
                btnElement.classList.add('--active');
            } else {
                btnElement.classList.remove('--active');
            }
        })
    }

    onBuildRailway() {
        if (actionsMenuService.state.action?.type === ActionsMenuOptionName.BuildRailway) {
            actionsMenuService.onClear();
        } else {
            actionsMenuService.onBuildRailwayOption();
        }
    }

    onBuildBuilding() {
        if (actionsMenuService.state.action?.type === ActionsMenuOptionName.BuildBuilding) {
            actionsMenuService.onClear();
        } else {
            actionsMenuService.onBuildBuildingOption();
        }
    }

    onBuildTrain() {
        if (actionsMenuService.state.action?.type === ActionsMenuOptionName.BuildTrain) {
            actionsMenuService.onClear();
        } else {
            actionsMenuService.onBuildTrainOption();
        }
    }

    onTrainsList() {
        if (actionsMenuService.state.action?.type === ActionsMenuOptionName.TrainsList) {
            actionsMenuService.onClear();
        } else {
            actionsMenuService.onTrainsListOption();
        }
    }

    onDestroy() {
        if (actionsMenuService.state.action?.type === ActionsMenuOptionName.Destroy) {
            actionsMenuService.onClear();
        } else {
            actionsMenuService.onDestroyOption();
        }
    }

    onSetRoute() {

    }

    connectedCallback() {
        this.appendChild(this.buildRailwayBtn)
        this.appendChild(this.buildBuildingBtn)
        this.appendChild(this.listTrainsBtn)
        this.appendChild(this.destroyBtn);
        this.appendChild(this.sgButton);
        this.appendChild(this.saveButton);
    }

}

customElements.define(ActionMenuElement.componentName, ActionMenuElement);

export default ActionMenuElement