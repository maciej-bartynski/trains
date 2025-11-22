
type Props = unknown | undefined;
type State = unknown | undefined;

interface iStatefullComponent<S, P> {
    setProps(param: P): void;
}

class StatefullComponent<
    TState extends State,
    TProps extends Props
> extends HTMLElement
    implements iStatefullComponent<TState, TProps> {

    private _state: TState = undefined as TState;
    private _props: TProps = undefined as TProps;

    protected getState() {
        return this._state
    }

    protected getProps() {
        return this._props;
    }

    protected setState(update: TState) {

        let isOrWillBePrimitive = update === null || this._state === null;

        switch (typeof this._state) {
            case 'string':
            case 'number': // including NaN
            case 'boolean':
            case 'undefined': {
                isOrWillBePrimitive = true;
            }
        }

        switch (typeof update) {
            case 'string':
            case 'number': // including NaN
            case 'boolean':
            case 'undefined': {
                isOrWillBePrimitive = true;
            }
        }

        if (isOrWillBePrimitive) {
            this._state = update;
            this.render();
        }

        const isOrWillBeArray = this._state instanceof Array || update instanceof Array;

        if (isOrWillBeArray) {
            this._state = update;
            this.render();
        }

        const isAndWillBeObject = this._state instanceof Object && update instanceof Object;

        if (isAndWillBeObject && !isOrWillBePrimitive /** in case of null */) {
            const oldState = this._state as Object;
            this._state = {
                ...oldState,
                ...update
            }
            this.render();
        }
    }

    constructor() {
        super();
        this.render = this.render.bind(this);
        this.setState = this.setState.bind(this);
        this.setProps = this.setProps.bind(this);
        this.getState = this.getState.bind(this);
        this.getProps = this.getProps.bind(this);
    }

    public setProps(props: TProps) {
        this._props = props;
        this.render()
    }

    protected render() {
        /**
         * Override this
         */
    }
}

export default StatefullComponent;