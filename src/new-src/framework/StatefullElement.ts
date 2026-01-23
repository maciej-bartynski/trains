import BoardModel from "../models/BoardModel.js";

abstract class StatefullElement<
    TState extends object = {},
    TProps extends object = {}
> extends HTMLElement {
    static game: BoardModel;

    protected abstract state: Partial<TState>;

    props: TProps = {} as TProps;

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.changed = this.changed.bind(this);
        this.mounted = this.mounted.bind(this);
        this.connected = this.connected.bind(this);
        this.setState = this.setState.bind(this);
        this.setProps = this.setProps.bind(this);
    }

    public setState(newState: Partial<TState>) {
        const nextState = {
            ...this.state,
            ...newState
        }
        const nextStateToken = JSON.stringify(Object.entries(nextState).sort());
        const prevStateToken = JSON.stringify(Object.entries(this.state).sort());
        if (nextStateToken !== prevStateToken) {
            this.state = nextState;
            this.render(this.props);
            this.changed();
        }
    }

    public setProps(newProps: Partial<TProps>) {
        const nextProps = {
            ...this.props,
            ...newProps
        }
        const nextPropsToken = JSON.stringify(Object.entries(nextProps).sort());
        const prevStateToken = JSON.stringify(Object.entries(this.props).sort());
        if (nextPropsToken !== prevStateToken) {
            this.props = nextProps;
            this.render(this.props);
            this.changed();
        }
    }

    abstract mounted(): void;

    abstract changed(): void;

    abstract render(props: TProps): void;

    abstract connected(): void;

    connectedCallback() {
        if (!StatefullElement.game) {
            throw new Error('Seems you try to mount component before store is ready!')
        }
        this.connected();
        this.render(this.props);
        this.mounted();
    }
}

export default StatefullElement;




