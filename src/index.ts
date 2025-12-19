import GameBoard from './GameBoard.js';
import GameBoardElement from '#src/components/GameBoard.js';
import ActionMenuElement from '#src/components/ActionsMenuElement/ActionsMenuElement.js';
import GameFieldElement from '#src/components/GameFieldElement/GameFieldElement.js';
import MenuBottomElement from '#src/components/MenuBottomElement/MenuBottomElement.js';
import MenuTrainsElement from '#src/components/MenuTrainsElement/MenuTrainsElement.js';
import MenuTrainSetRoute from '#src/components/MenuTrainSetRoute/MenuTrainSetRoute.js';
import TrainRunElement from '#src/components/TrainRun/TrainRun.js';
import TrainAtom from '#src/atoms/TrainAtom/TrainAtom.js';
import ConstructionProgressElement from './components/GameFieldElement/ConstructionProgressElement.js';
import OperationIndicatorElement from './components/GameFieldElement/OperationIndicatorElement.js';
import BuildingButtonElement from '#src/components/MenuBottomElement/BuildingButton.js';
import BaseComponent from './framework/BaseComponent/BaseComponent.js';
import TrafficLight from './atoms/TrafficLight/TrafficLight.js';
import FieldMenuElement from './components/FieldMenuElement/FieldMenuElement.js'

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
    GameBoard.getInstance();
    customElements.define(GameBoardElement.componentName, GameBoardElement);
    customElements.define(ActionMenuElement.componentName, ActionMenuElement);
    customElements.define(ConstructionProgressElement.componentName, ConstructionProgressElement);
    customElements.define(OperationIndicatorElement.componentName, OperationIndicatorElement);
    customElements.define(BuildingButtonElement.componentName, BuildingButtonElement);
    customElements.define(GameFieldElement.componentName, GameFieldElement);
    customElements.define(MenuBottomElement.componentName, MenuBottomElement);
    customElements.define(MenuTrainsElement.componentName, MenuTrainsElement);
    customElements.define(MenuTrainSetRoute.componentName, MenuTrainSetRoute);
    customElements.define(TrainRunElement.componentName, TrainRunElement);
    customElements.define(TrainAtom.elementName, TrainAtom);
    customElements.define(TrafficLight.elementName, TrafficLight);
    customElements.define(FieldMenuElement.componentName, FieldMenuElement);
    BaseComponent.resolve?.(true)
});