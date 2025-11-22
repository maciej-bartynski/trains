type ClassNamesInput = {
    [key: string]: string | ClassNamesInput;
} & {
    root?: never;
}

type ClassifiedNames<T extends ClassNamesInput> = {
    root: string;
} & {
    [K in keyof T]:
    T[K] extends string ? string : T[K] extends ClassNamesInput
    ? ClassifiedNames<T[K]> : never;
}

const classify = <T extends ClassNamesInput>(root: string, classes: T): ClassifiedNames<T> => {
    const rootCssClassName = root;

    const final = Object.entries(classes).reduce((result, entry) => {
        const [jsClassName, jsClassValue] = entry;

        if (typeof jsClassValue === 'string') {
            const cssClassName = jsClassValue;
            const prefixSeparator = (cssClassName.charAt(0) === '-') && (cssClassName.charAt(1) === '-') && (cssClassName.charAt(2) !== '-')
                ? ''
                : '_';

            return {
                ...result,
                [jsClassName]: `${rootCssClassName}${prefixSeparator}${cssClassName}`,
                root: rootCssClassName,
            }

        }

        if (jsClassValue instanceof Object) {
            const cssClassName = jsClassName;
            const subtree: ClassNamesInput = jsClassValue;
            return {
                ...result,
                [jsClassName]: classify(
                    `${rootCssClassName}_${cssClassName}`, {
                    ...subtree,
                }),
                root: rootCssClassName,
            }
        }

        return result;
    }, {
        root: rootCssClassName
    } as ClassifiedNames<T>);

    return final
}

export default classify;

export type {
    ClassifiedNames
}