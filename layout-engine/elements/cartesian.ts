import { Element } from './element';
import { DrawingContext } from '../graphics/context';
import { Scale } from '../scales/scale'

export interface CartesianElement extends Element {

    getRequiredSpace(
        options: {
            data: Object[],
            scales: { [model: string]: Scale<any, any> },
            ratio: [number, number]
        }
    ): CartesianElementSpace;

    draw(
        context: DrawingContext,
        options: {
            data: Object[],
            scales: { [model: string]: Scale<any, any> }
        }
    ): void;

}

export interface CartesianElementSpace {
    stakes: [[number, number], [number, number]],
    bounds: [[number, number], [number, number]]
}

// export class CartesianContainer implements CartesianElement {

// }
