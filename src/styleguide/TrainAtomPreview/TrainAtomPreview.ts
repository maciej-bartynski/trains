import TrainAtom from "#src/atoms/TrainAtom/TrainAtom.js";
import StyleguideHelper from "../StyleguideHelper.js";

document.addEventListener('DOMContentLoaded', async () => {
    await StyleguideHelper.handleAssets('TrainAtomPreview');
    const section = document.querySelector('section[data-selector="trains"]') as HTMLSelectElement;
    const input = section.querySelector('input[name="trains-color"]') as HTMLInputElement;
    const trainElements = section.querySelectorAll('train-atom') as NodeListOf<TrainAtom>;
    input.onchange = () => {
        [...trainElements].forEach(trainElement => {
            trainElement.setAttribute(TrainAtom.attributeColor, input.value);
        })
    }
});