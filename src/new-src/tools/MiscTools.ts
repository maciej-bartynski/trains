const MiscTools = {
    mapToString: (map: Map<string, any>, options?: {
        valueProcessor?: (item: any) => any
    }) => {
        const json: Record<string, any> = {};
        map.forEach((value, key) => {
            json[key] = options?.valueProcessor
                ? options?.valueProcessor(value)
                : value;
        });
        return JSON.stringify(json);
    },

    stringToMap: (data: string, options?: {
        valueProcessor?: (item: any) => any
    }): Map<string, any> => {
        const json = JSON.parse(data) as Record<string, any>;
        const map = new Map(Object.entries(json).map(entry => {
            const [key, value] = entry;
            return [key, options?.valueProcessor ? options.valueProcessor(value) : value];
        }));
        return map;
    },

    objectToMap(data: object) {
        const map = new Map(Object.entries(data));
        return map;
    },

    mapToObject(data: Map<string, any>, options?: {
        valueProcessor?: (item: any) => any
    }) {

    }
}

export default MiscTools;