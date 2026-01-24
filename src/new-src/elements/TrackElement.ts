import Direction, { OpositeDirection } from "../enums/Direction.js";
import TrackKind from "../enums/TrackKind.js";
import StatefullElement from "../framework/StatefullElement.js";
import BuildingModel from "../models/BuildingModel.js";
import TrackModel from "../models/TrackModel.js";

class TrackElement extends StatefullElement<{}, TrackModel['state']> {

    static tagName = 'x-track';

    static createElement() {
        return document.createElement(TrackElement.tagName) as TrackElement;
    }

    static selectElement(parent: HTMLElement) {
        return parent.querySelector(TrackElement.tagName) as TrackElement;
    }

    override state = {

    }

    constructor() {
        super();
    }

    private trackStraight = (() => {
        const el = document.createElement('div');
        el.classList.add(`${TrackElement.tagName}_track-stright`);
        return el;
    })();

    private trackCenter = (() => {
        const el = document.createElement('div');
        el.classList.add(`${TrackElement.tagName}_track-center`);
        return el;
    })();

    private trackCurve = (() => {
        const el = document.createElement('div');
        el.classList.add(`${TrackElement.tagName}_track-curve`);
        return el;
    })();

    private [TrackKind.Railway] = document.createElement('div');
    private [TrackKind.Road] = document.createElement('div');
    private [TrackKind.Sail] = document.createElement('div');
    private [TrackKind.Fly] = document.createElement('div');

    override connected(): void {
        this.innerHTML = ``;

        Object.values(TrackKind).forEach(trackKindName => {
            this[trackKindName].setAttribute('data-selector', trackKindName);
            this[trackKindName].classList.add(`${TrackElement.tagName}_layer-${trackKindName.toLowerCase()}`);
            this.appendChild(this[trackKindName]);
        })

        this.trackCenter.classList.add(`${TrackElement.tagName}_to-center`);
        this.trackStraight.classList.add(`${TrackElement.tagName}_straight`);
        this.trackCurve.classList.add(`${TrackElement.tagName}_curve`);
    }

    override render({
        address,
        orientations
    }: TrackModel['state']) {

        this.style.left = `${50 * address.column}px`;
        this.style.top = `${50 * address.row}px`;

        Object.entries(orientations).forEach(([_trackKind, orientation]) => {
            const trackKind = _trackKind as TrackKind;
            if (orientation) {
                /**
                 * Has tracks of current kind
                 */
                const layerElement = this[trackKind];

                if (orientation.center) {
                    /**
                     * Tracks are centered
                     */
                    const directionFromCenter: Direction | undefined = Object
                        .entries(orientation.center)
                        .find(entry => {
                            const [, isConnected] = entry;
                            return isConnected;
                        })?.[0] as Direction;

                    /** always true */
                    if (directionFromCenter) {
                        const trackElement = this.trackCenter.cloneNode(true) as HTMLDivElement;
                        trackElement.classList.add(`--${directionFromCenter.toLowerCase()}`);
                        layerElement.appendChild(this.trackCenter)
                    }
                } else {
                    /** Any other orientation */

                    const checkedDirectionPairs: Array<[Direction, Direction]> = [];

                    Object.entries(orientation).forEach(directionEntry => {

                        const [direction, connectedDirections] = directionEntry as [Direction | 'center', Record<Direction, boolean> | null];

                        if (direction === 'center') return;

                        if (connectedDirections) {
                            Object.entries(connectedDirections).forEach(entry => {
                                const [connectedDirection, isConnected] = entry as [Direction, boolean];
                                if (isConnected) {
                                    const pair: [Direction, Direction] = [direction, connectedDirection];
                                    const alreadyChecked = checkedDirectionPairs.some(checkedPair => {
                                        return JSON.stringify(checkedPair.sort()) === JSON.stringify(pair.sort())
                                    })

                                    if (!alreadyChecked) {
                                        checkedDirectionPairs.push(pair)
                                    }
                                }
                            })
                        }
                    });

                    checkedDirectionPairs.forEach(uniquePair => {

                        const shape: 'curve' | 'straight' = OpositeDirection[uniquePair[0]] === uniquePair[1]
                            ? 'straight'
                            : 'curve';

                        if (shape === 'straight') {
                            const trackElement = this.trackStraight.cloneNode(true) as HTMLDivElement;
                            layerElement.appendChild(trackElement);

                            const isVertical = uniquePair.some(dir => dir === Direction.Bottom);

                            if (isVertical) {
                                trackElement.classList.add(`--vertical`);
                            } else {
                                trackElement.classList.add(`--horizontal`)
                            }
                        }

                        if (shape === 'curve') {
                            const trackElement = this.trackCurve.cloneNode(true) as HTMLDivElement;
                            layerElement.appendChild(trackElement);

                            const curveVariantClassnames = {
                                [`${[Direction.Top, Direction.Right].sort().join(',')}`]: `--top-right`,
                                [`${[Direction.Right, Direction.Bottom].sort().join(',')}`]: `--right-bottom`,
                                [`${[Direction.Bottom, Direction.Left].sort().join(',')}`]: `--bottom-left`,
                                [`${[Direction.Left, Direction.Top].sort().join(',')}`]: `--left-top`,
                            }

                            const currentClassname = curveVariantClassnames[uniquePair.sort().join(',')]!;

                            trackElement.classList.add(currentClassname)
                        }
                    })
                }
            }
        })

    }

    override changed(): void {

    }

    override mounted(): void {
        const params = StatefullElement.game.getStateByAddress(this.props.address);
        if (params?.tracks) {
            params.tracks.subscribe(this.setProps);
        }
    }

    disconnectedCallback() {
        const params = StatefullElement.game.getStateByAddress(this.props.address);
        if (params?.tracks) {
            params.tracks.unsubscribe(this.setProps);
        }
    }
}

export default TrackElement;