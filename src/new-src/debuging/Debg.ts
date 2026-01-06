class FLine extends HTMLElement { }

class FOpenLine extends HTMLElement { }

class FCloseLine extends HTMLElement { }

class FBlock extends HTMLElement {
    expanded: boolean = true;
    originalContent?: string;
    foldedInd?: string;
    foldedKey?: string;
    foldedLen?: string;

    toggle() {
        this.expanded = !this.expanded;
        this.onToggle();
    }

    onToggle() {
        if (this.expanded) {
            this.style.height = 'unset';
            this.style.overflow = 'unset';
            this.innerHTML = this.originalContent ?? "???";
        } else {
            this.style.height = '17px';
            this.style.overflow = 'hidden';
            this.innerHTML = `
                <f-open-line> 
                    <f-toggle>+</f-toggle> 
                    <f-text style="padding-left: ${this.foldedInd}px;">
                        ${this.foldedKey ? `"${this.foldedKey}": ` : ""} 
                         ${this.foldedLen ? this.foldedLen : ""} 
                    </f-text> 
                </f-open-line>
            `
        }
    }

    connectedCallback() {
        this.originalContent = this.innerHTML;
        this.foldedKey = this.getAttribute('data-folded-key') as string;
        this.foldedInd = this.getAttribute('data-folded-indent') as string;
        this.foldedLen = this.getAttribute('data-length') as string;
    }
}

class FToggle extends HTMLElement {
    connectedCallback() {
        this.onclick = () => {
            const blockParent = this.closest('f-block') as FBlock;
            blockParent.toggle();
        }
    }
}

class FSpace extends HTMLElement { }
class FText extends HTMLElement { }

class Formatter extends HTMLElement {
    static indentPx = 20;

    printPrimitive(primitive: undefined | null | string | number | boolean): string {
        switch (typeof primitive) {
            case 'string':
                return `<span class="value-string">"${primitive}"</span>`
            case 'number': {
                if (isNaN(primitive)) {
                    return `<span class="value-nullable">${primitive}</span>`
                }
                return `<span class="value-number">${primitive}</span>`
            }
            case 'undefined':
            case 'object':
                return `<span class="value-nullable">${primitive}</span>`;
            case 'boolean': {
                if (primitive) {
                    return `<span class="value-true">TRUE</span>`
                }
                return `<span class="value-false">FALSE</span>`
            }
        }
    }

    printKey(key: string | number): string {
        switch (typeof key) {
            case 'string':
                return `<span class="key-string"><span class="mark">"</span>${key}<span><span class="mark">":&nbsp;</span></span></span>`
            case 'number': {
                return `<span class="key-number">${key}</span><span class="mark">:&nbsp;</span>`
            }
        }
    }

    arrayToBlock(params: {
        key?: string,
        value: Array<any>,
        level: number,
    }) {
        const { value, key, level } = params;
        const currentIndent = level * Formatter.indentPx;
        const currentIndentStyle = `style="padding-left: ${currentIndent}px;"`;
        const currentContentIndentStyle = `style="padding-left: ${currentIndent + Formatter.indentPx}px;"`;
        const currentKey = key ? this.printKey(key) : '';

        const htmlContent: string = `
            <f-block 
                data-folded-indent="${currentIndent}" 
                data-folded-key="${key ? key : ""}"
                data-length="[ ${value.length} ]"
            >
                <f-open-line> 
                    <f-toggle>-</f-toggle> 
                    <f-text ${currentIndentStyle}>${currentKey}<span class="mark">[</span></f-text> 
                </f-open-line>
        ${value.map((innerValue, innerKey) => {
            if (innerValue instanceof Array) {
                return this.arrayToBlock({
                    key: `${innerKey}`,
                    value: innerValue,
                    level: level + 1,
                }) ?? ""
            } else if (innerValue instanceof Object) {
                return this.objectToBlock({
                    key: `${innerKey}`,
                    value: innerValue,
                    level: level + 1,
                }) ?? ""
            } else {
                return `
                    <f-line> 
                        <f-space></f-space> 
                        <f-text ${currentContentIndentStyle}>${this.printKey(innerKey)}${this.printPrimitive(innerValue)},</f-text> 
                    </f-line>
                `;
            }
        }).join('')}
                <f-close-line> 
                    <f-space></f-space> 
                    <f-text ${currentIndentStyle}> <span class="mark">]</span>, </f-text> 
                </f-close-line>
            </f-block>
        `;

        return htmlContent
    }

    objectToBlock(params: {
        key?: string,
        value: object,
        level: number,
    }) {
        const { value, key, level } = params;
        const currentIndent = level * Formatter.indentPx;
        const currentIndentStyle = `style="padding-left: ${currentIndent}px;"`;
        const currentContentIndentStyle = `style="padding-left: ${currentIndent + Formatter.indentPx}px;"`;
        const currentKey = key ? this.printKey(key) : '';

        const htmlContent: string = `
            <f-block
                data-folded-indent="${currentIndent}"
                data-folded-key="${key ? key : ""}"
                data-length="{ ${Object.entries(value).length} }"
            >
                <f-open-line> 
                    <f-toggle>-</f-toggle> 
                    <f-text ${currentIndentStyle}>${currentKey}<span class="mark">{</span></f-text> 
                </f-open-line>
        ${Object.entries(value).map(entry => {
            const [innerKey, innerValue] = entry;
            if (innerValue instanceof Array) {
                return this.arrayToBlock({
                    key: innerKey,
                    value: innerValue,
                    level: level + 1,
                }) ?? ""
            } else if (innerValue instanceof Object) {
                return this.objectToBlock({
                    key: innerKey,
                    value: innerValue,
                    level: level + 1,
                }) ?? ""
            } else {
                return `
                    <f-line> 
                        <f-space></f-space> 
                        <f-text ${currentContentIndentStyle}>${this.printKey(innerKey)}${this.printPrimitive(innerValue)},</f-text> 
                    </f-line>
                `;
            }
        }).join('')}
                <f-close-line> 
                    <f-space></f-space> 
                    <f-text ${currentIndentStyle}> <span class="mark">}</span>, </f-text> 
                </f-close-line>
            </f-block>
        `;

        return htmlContent
    }

    connectedCallback() {
        const jsonString = this.innerHTML;
        const jsonData = JSON.parse(jsonString);

        if (jsonData instanceof Array) {
            this.innerHTML = this.arrayToBlock({ value: jsonData, level: 0 });
        } else if (jsonData instanceof Object) {
            this.innerHTML = this.objectToBlock({ value: jsonData, level: 0 });
        }

        // this.innerHTML = `
        //     <div>

        //         <f-block data-level="0">
        //             <f-open-line> <f-toggle>+</f-toggle> <f-text>{</f-text> </f-open-line>
        //             <f-line> <f-space>-</f-space> <f-text>"field1": "value"</f-text> </f-line>
        //             <f-line> <f-space>-</f-space> <f-text>"field2": "value"</f-text> </f-line>
        //             <f-line> <f-space>-</f-space> <f-text>"field3": "value"</f-text> </f-line>
        //             <f-close-line> <f-space>-</f-space> <f-text>}</f-text> </f-close-line>
        //         </f-block>

        //         <f-block data-level="0">

        //             <f-open-line> <f-toggle>+</f-toggle> <f-text>{</f-text> </f-open-line>
        //             <f-line> <f-space>-</f-space> <f-text>"field1": "value"</f-text> </f-line>

        //             <f-block data-level="1">
        //                 <f-open-line> <f-toggle>+</f-toggle> <f-text>{</f-text> </f-open-line>
        //                 <f-line> <f-space>-</f-space> <f-text>"field1": "value"</f-text> </f-line>
        //                 <f-line> <f-space>-</f-space> <f-text>"field2": "value"</f-text> </f-line>
        //                 <f-line> <f-space>-</f-space> <f-text>"field3": "value"</f-text> </f-line>
        //                 <f-close-line> <f-space>-</f-space> <f-text>}</f-text> </f-close-line>
        //             </f-block>

        //             <f-close-line> <f-space>-</f-space> <f-text>}</f-text> </f-close-line>
        //         </f-block>

        //     </div>
        // `
    }
}

export {
    Formatter,
    FBlock,
    FLine,
    FOpenLine,
    FCloseLine,
    FToggle,
    FSpace,
    FText
};