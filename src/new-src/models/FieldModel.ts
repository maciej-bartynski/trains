import State from "../framework/State";

type FieldState = {
    terrain: string,
    address: number,
    storage: {
        wood: number,
        iron: string
    },
    building: null | {
        progress: number,
        type: string,
    }
}

class FieldModel {

    state = new State<FieldState>({
        initialState: {
            terrain: '',
            building: {
                progress: 1,
                type: ''
            }
        },
        initialListeners: [],
        initialNotify: false,
    });

    constructor() { }

    setTerrain() {
        this.state.setState({
            terrain: 'bla bla bla'
        })
    }

    buildBuilding() {

    }

}



