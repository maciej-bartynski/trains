const getTemplateDirRelativeToIndexHtml = (atomName: string) => `./src/styleguide/${atomName}`;

async function getTemplateAsset(atomName: string, type: 'html' | 'css') {
    const url = getTemplateDirRelativeToIndexHtml(atomName);
    return await fetch(`${url}/${atomName}.${type}`)
        .then(response => response.text())
        .catch(e => {
            console.error(`Failed to fetch ${url}/${atomName}.${type}`)
            console.error(e);
        });
}

async function getCSS(atomName: string) {
    return getTemplateAsset(atomName, 'css');
}

async function getHTML(atomName: string) {
    return getTemplateAsset(atomName, 'html');
}

async function handleAssets(
    atomName: string,
) {
    const wrapper = document.createElement('div');
    const html = await getHTML(atomName);
    wrapper.innerHTML = html ?? ':C';
    const style = document.createElement('style');
    const css = await getCSS(atomName);
    style.innerHTML = css ?? "";
    wrapper.appendChild(style);
    document.body.appendChild(wrapper);
}

const StyleguideHelper = {
    getCSS,
    getHTML,
    handleAssets
}

export default StyleguideHelper;