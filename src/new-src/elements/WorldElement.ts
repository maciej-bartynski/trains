import Config from "#src/config.js";
import StatefullElement from "../framework/StatefullElement.js";
import PieceEnum from "../models/BoardModel.type.js";
import Address from "../types/Address.js";

class WorldElement extends StatefullElement<{
    keys: Record<string, Address>,
    lastSelectedKey: Address | null
}, {}> {

    static tagName = 'x-world';

    static createElement() {
        return document.createElement(WorldElement.tagName) as WorldElement;
    }

    private frameElement = document.createElement('div');

    override state = {
        keys: {} as Record<string, Address>,
        lastSelectedKey: null as Address | null
    }

    private onFieldsUpdated() {
        StatefullElement.game.state[PieceEnum.Fields].forEach(entry => {
            if (!this.state.keys[entry.state._id]) {
                this.state.keys[entry.state._id] = entry.state.address;
                this.setState({
                    keys: {
                        ...this.state.keys,
                        [entry.state._id]: entry.state.address,
                    },
                    lastSelectedKey: entry.state.address
                })
            }
        });
    }

    constructor() {
        super();
        this.onFieldsUpdated = this.onFieldsUpdated.bind(this);
        this.appendFrameChild = this.appendFrameChild.bind(this);
        this.clearFrameHTML = this.clearFrameHTML.bind(this);
    }

    public appendFrameChild(child: HTMLElement) {
        this.frameElement.appendChild(child);
    }

    public clearFrameHTML() {
        this.frameElement.innerHTML = '';
    }

    override connected(): void {
        this.innerHTML = `
            <div class="x-world_frame"></div>
        `;

        this.frameElement = this.querySelector('.x-world_frame') as HTMLDivElement;
        this.frameElement.style.width = `${Config.boardSize * Config.cellSizePx}px`;
        this.frameElement.style.height = `${Config.boardSize * Config.cellSizePx}px`;
        StatefullElement.game.subscribePiece(this.onFieldsUpdated, { type: PieceEnum.Fields });
    }

    override render() {
        if (this.state.lastSelectedKey) {

            const offsetLeft = (this.getBoundingClientRect().width - Config.cellSizePx) / 2;
            const offsetTop = (this.getBoundingClientRect().height - Config.cellSizePx) / 2;

            this.scrollTo({
                top: -offsetTop + (Config.cellSizePx * this.state.lastSelectedKey.row),
                left: -offsetLeft + (Config.cellSizePx * this.state.lastSelectedKey.column)
            })
        }
    }

    override changed(): void {

    }

    override mounted(): void {
    }

    disconnectedCallback() {
        StatefullElement.game.unsubscribePiece(this.onFieldsUpdated, { type: PieceEnum.Fields });
    }
}

export default WorldElement;