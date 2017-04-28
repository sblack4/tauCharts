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

export interface CartesianContainerOptions {
    children: CartesianElement[],
    viewport?: [number, number]
}

interface CartesianScales {
    x: Scale<any, number>,
    y: Scale<any, number>
}

class CartesianContainer implements CartesianElement {

    private _options: CartesianContainerOptions;

    constructor(options: CartesianContainerOptions) {
        this._options = options;
    }

    getRequiredSpace(
        options: {
            data: Object[],
            scales: { [model: string]: Scale<any, any> } & CartesianScales,
            ratio: [number, number]
        }
    ): CartesianElementSpace {

        const { children } = this._options;

        // Todo: This should be calculated multiple times with specified required/awailable ratio.
        const spaces = children.map((c) => c.getRequiredSpace(options));
        const borders = {
            left: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, stakes[0][0] - bounds[0][0]))),
            right: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, bounds[1][0] - stakes[1][0]))),
            top: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, stakes[0][1] - bounds[0][1]))),
            bottom: Math.max(...spaces.map(({ stakes, bounds }) => Math.max(0, bounds[1][1] - stakes[1][1]))),
        };

        const stakes = {
            width: Math.max(...spaces.map(({ stakes }) => Math.max(0, stakes[1][0] - stakes[0][0]))),
            height: Math.max(...spaces.map(({ stakes }) => Math.max(0, stakes[1][1] - stakes[0][1])))
        };

        return {
            stakes: [
                [borders.left, borders.top],
                [borders.left + stakes.width, borders.left + stakes.width]
            ],
            bounds: [
                [0, 0],
                [borders.left + stakes.width + borders.right, borders.left + stakes.width + borders.right]
            ]
        }
    }

    draw(
        context: DrawingContext,
        options: {
            data: Object[],
            scales: { [model: string]: Scale<any, any> } & CartesianScales
        }
    ) {
        const { children } = this._options;
        children.forEach((c) => c.draw(context, options));
    }

}

export default function createCartesianContainer(options: CartesianContainerOptions) {
    return new CartesianContainer(options);
}
