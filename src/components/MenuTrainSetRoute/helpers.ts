import Address from "#src/types/Address.js";
import classify from "#src/utils/classify.js";

const getLocationGridLabel = (address: Address) => `C:${address.column ?? '(?)'} &#10005; R:${address.row ?? '(?)'}`;

const classNames = classify('MenuTrainSetRoute', {
    content: 'content',
    header: {
        preview: 'preview',
        previewWrapper: 'preview-wrapper',
        name: 'name',
        location: 'location',
        state: 'state',
        cargo: {
            list: 'list',
            listItem: 'list-item',
            listItemImage: 'list-item-image',
            listItemLabel: 'list-item-label'
        }
    },
    empty: 'empty',
    locationGridLabel: 'location-grid-label',
    distance: {
        label: 'label',
        content: 'content',
        data: 'data',
        arrivalIndicatorWrapper: 'arrival-indicator-wrapper',
        departureIndicatorWrapper: 'arrival-indicator-wrapper'
    },
    loadCargo: {
        label: 'label',
        list: 'list',
        listItem: 'list-item',
        listItemActions: 'list-item-actions'
    },
    standingBy: {
        label: 'label'
    },
    destinations: {
        destination: 'destination',
        header: 'header',
        operations: 'operations',
        act: 'act',
        item: 'item',
        field: 'field',
        address: 'address',
        fieldData: 'field-data'
    },
    routeDoneAction: 'route-done-action'
})

export { classNames, getLocationGridLabel };

