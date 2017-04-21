import { Element } from './elements/element';

export interface SpecUnit {
    type: string,
    data: {
        source: Object[],
        aggregations: {
            [property: string]: {
                [aggregation: string]: any
            }
        }
    },
    scales: {
        type: string,
        property: string
    }[],
    units?: SpecUnit[]
}

export interface Spec {

}

export interface DrawingNode {
    config: SpecUnit,
    element: Element,
    nodes?: DrawingNode[]
}