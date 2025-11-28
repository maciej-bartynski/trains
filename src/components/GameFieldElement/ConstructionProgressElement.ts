class ConstructionProgressElement extends HTMLElement {
    static componentName = 'construction-progress-element';

    private imageElement: HTMLImageElement;
    private progressElement: HTMLDivElement;
    private progressCircleElement: HTMLDivElement;

    constructor() {
        super();
        this.imageElement = document.createElement('img') as HTMLImageElement;
        this.progressElement = document.createElement('div') as HTMLDivElement;
        this.progressCircleElement = document.createElement('div') as HTMLDivElement;
        this.imageElement.src = 'images/buildings/construction-site/default.svg';
        this.progressElement.classList.add('progress');
        this.progressCircleElement.classList.add('progress-circle');
        this.progressElement.innerText = '0%';
    }

    public setProgress(progress: number) {
        this.progressElement.innerText = progress.toString() + '%';
    }

    connectedCallback() {
        this.appendChild(this.imageElement);
        this.appendChild(this.progressElement);
        this.appendChild(this.progressCircleElement);
    }
}

export default ConstructionProgressElement;

