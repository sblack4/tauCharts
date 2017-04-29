import { Element } from './elements/element';
import { CartesianElement } from './elements/cartesian';
import { Scale } from './scales/scale';

export interface SpecUnit {
    type: string,
    data?: Object[],
    scales?: {
        [model: string]: {
            type: string,
            dimension: string,
            options?: Object
        }
    },
    units?: SpecUnit[],
    options?: Object
}

export interface ShortSpec {
    type: string,
    data?: Object[]
}

export interface MultiShortSpec {
    layers: ShortSpec[],
    data?: Object[]
}

export interface LineChartSpec extends ShortSpec {
    type: 'line',
    x: string | string[],
    y: string | string[],
    color?: string,
    label?: string
}

// export interface DrawingNode {
//     data: SpecUnit,
//     scales: { [model: string]: Scale<any, any> },
//     element: CartesianElement,
//     nodes?: DrawingNode[],
//     // parent: DrawingNode | null
// }

//------------------------------------
//
//             Samples:
//

var shortSpec: LineChartSpec = {
    type: 'line',
    x: 'effort',
    y: 'date',
    color: 'team',
    data: [
        { effort: 40, date: new Date(2017, 1, 1), team: 'A' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'A' },
        { effort: 50, date: new Date(2017, 1, 3), team: 'A' },
        { effort: 20, date: new Date(2017, 1, 1), team: 'B' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'B' },
        { effort: 40, date: new Date(2017, 1, 3), team: 'B' }
    ]
};

var multiSpec = {
    layers: [
        {
            type: 'bar',
            x: 'effort',
            y: 'date',
            color: 'team',
        },
        {
            type: 'line',
            x: 'effort',
            y: 'date',
            color: 'team',
        }
    ],
    data: [
        { effort: 40, date: new Date(2017, 1, 1), team: 'A' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'A' },
        { effort: 50, date: new Date(2017, 1, 3), team: 'A' },
        { effort: 20, date: new Date(2017, 1, 1), team: 'B' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'B' },
        { effort: 40, date: new Date(2017, 1, 3), team: 'B' }
    ]
};

var spec: SpecUnit = {
    type: 'cartesian',
    data: [
        { effort: 40, date: new Date(2017, 1, 1), team: 'A' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'A' },
        { effort: 50, date: new Date(2017, 1, 3), team: 'A' },
        { effort: 20, date: new Date(2017, 1, 1), team: 'B' },
        { effort: 30, date: new Date(2017, 1, 2), team: 'B' },
        { effort: 40, date: new Date(2017, 1, 3), team: 'B' }
    ],
    scales: {
        'x': {
            type: 'time',
            dimension: 'date'
        },
        'y': {
            type: 'linear',
            dimension: 'effort'
        },
        'id': {
            type: 'identity',
            dimension: ''
        }
    },
    units: [
        {
            type: 'grid'
        },
        {
            type: 'axis-bottom',
            options: {
                format: 'date-short'
            }
        },
        {
            type: 'axis-left'
        },
        {
            type: 'bar',
            units: [
                {
                    type: 'bar-label',
                    scales: {
                        'label': {
                            type: 'ordinal',
                            dimension: 'effort'
                        }
                    }
                }
            ]
        },
        {
            type: 'line',
            scales: {
                'color': {
                    type: 'palette',
                    dimension: 'team',
                    options: {
                        palette: [
                            '#d42',
                            '#2d4',
                            '#24d'
                        ]
                    }
                }
            }
        }
    ]
};

var facetSpec: SpecUnit = {
    type: 'cartesian',
    data: [
        { country: 'Belarus', city: 'Minsk', people: 2000000 },
        { country: 'Belarus', city: 'Gomel', people: 500000 },
        { country: 'Ukraine', city: 'Kiev', people: 4000000 },
        { country: 'Ukraine', city: 'Lviv', people: 1000000 },
    ],
    scales: {
        'x': {
            type: 'ordinal',
            dimension: 'country'
        },
        'y': {
            type: 'linear',
            dimension: 'people'
        },
        'id': {
            type: 'identity',
            dimension: '#'
        }
    },
    units: [
        {
            type: 'facet',
            units: [
                {
                    type: 'cartesian',
                    scales: {
                        'x': {
                            type: 'ordinal',
                            dimension: 'city'
                        }
                    },
                    units: [
                        {
                            type: 'line'
                        },
                        {
                            type: 'axis-bottom'
                        }
                    ]
                }
            ]
        },
        {
            type: 'axis-bottom',
            options: {
                format: 'date-short'
            }
        },
        {
            type: 'axis-left'
        }
    ]
};
