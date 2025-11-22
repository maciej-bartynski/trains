import TemplateName from "./TemplateName.js";

const getTemplateDirRelativeToIndexHtml = (atomName: TemplateName) => `./templates/${atomName}`;

async function getTemplateAsset(atomName: TemplateName, type: 'html' | 'css') {
    const url = getTemplateDirRelativeToIndexHtml(atomName);
    return await fetch(`${url}/${atomName}.${type}`)
        .then(response => response.text())
        .catch(e => {
            console.error(`Failed to fetch ${url}/${atomName}.${type}`)
            console.error(e);
        });
}

async function getCSS(atomName: TemplateName) {
    return getTemplateAsset(atomName, 'css');
}

async function getHTML(atomName: TemplateName) {
    return getTemplateAsset(atomName, 'html');
}

const atomsCSSFetching: Record<string, boolean> = {

}

const atomsHTMLFetching: Record<string, boolean> = {

}

async function handleAssets(
    atomName: TemplateName,
    options: {
        assetTypes: ('css' | 'html')[]
    } = {
            assetTypes: ['css', 'html']
        }
) {
    while (atomsHTMLFetching[atomName] || atomsCSSFetching[atomName]) {
        await new Promise((res) => setTimeout(() => res(true), 100));
    }

    const { assetTypes } = options;
    const templates = document.querySelector('templates-element') ?? document.createElement('div');
    let templateHtml = templates.querySelector(`template[data-selector="${atomName}"`) as HTMLTemplateElement | null;
    let templateStyle = document.head.querySelector(`style[data-selector="${atomName}"`) as HTMLStyleElement | null;

    if (!templateHtml && assetTypes.includes('html') && !atomsHTMLFetching[atomName]) {
        atomsHTMLFetching[atomName] = true;
        let html = await getHTML(atomName);
        templateHtml = document.createElement('template');
        templateHtml.setAttribute('data-selector', atomName);
        templateHtml.innerHTML = html ?? '<div>:C</div>';;
        templates.appendChild(templateHtml)
    }

    if (!templateStyle && assetTypes.includes('css') && !atomsCSSFetching[atomName]) {
        atomsCSSFetching[atomName] = true;
        let css = await getCSS(atomName);
        templateStyle = document.createElement('style');
        templateStyle.setAttribute('data-selector', atomName);
        if (css) {
            templateStyle.innerHTML = css;
            document.head.appendChild(templateStyle)
        }
    }

    if (!templateHtml) {
        templateHtml = document.createElement('template');
        templateHtml.setAttribute('data-selector', atomName);
        templateHtml.innerHTML = '<div>:((</div>';
        templates.appendChild(templateHtml)
    }

    delete atomsCSSFetching[atomName];
    delete atomsHTMLFetching[atomName];

    return templateHtml.content.cloneNode(true);
}

const TemplateHepler = {
    getCSS,
    getHTML,
    handleAssets
}

export default TemplateHepler;