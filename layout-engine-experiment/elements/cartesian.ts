import { Element } from './element';
import { Scale } from '../scales/scale'

export interface CartesianElement extends Element {

    getRequiredSpace(options: {
        data: Object[],
        scales: { [model: string]: Scale<any> },
        ratio: [number, number]
    }): CartesianElementSpace;

    draw(context: any, options: {
        data: Object[],
        scales: { [model: string]: Scale<any> }
    });

}

export interface CartesianElementSpace {
    stakes: [[number, number], [number, number]],
    bounds: [[number, number], [number, number]]
}

// export class CartesianContainer implements CartesianElement {

// }
