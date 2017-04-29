import { Element } from './element';
import { DrawingContext } from '../graphics/context';
import { Scale, ScaleModel } from '../scales/scale'

export interface CartesianElement extends Element {

    data: Object[],
    scales: { [model: string]: Scale<any, any> },
    children?: CartesianElement[],

    getRequiredSpace(awailableSpace?: CartesianSpace): CartesianSpace;
    draw(context: DrawingContext): void;

}

export interface CartesianSpace {
    stakes: [[number, number], [number, number]],
    bounds: [[number, number], [number, number]]
}

export interface CartesianContainerOptions {
    viewport?: [number, number]
}

type CartesianScales = ScaleModel & {
    x: Scale<any, number>,
    y: Scale<any, number>
};

class CartesianContainer implements CartesianElement {

    private _options: CartesianContainerOptions;
    data: Object[];
    scales: CartesianScales;
    children: CartesianElement[];

    constructor(
        data: Object[],
        scales: CartesianScales,
        children: CartesianElement[],
        options: CartesianContainerOptions) {

        this.data = data;
        this.scales = scales;
        this.children = children;
        this._options = options;
    }

    getRequiredSpace(awailableSpace?: CartesianSpace): CartesianSpace {

        const { children } = this;

        if (children.length === 0) {
            return {
                stakes: [[0, 0], [0, 0]],
                bounds: [[0, 0], [0, 0]]
            };
        }

        // Todo: This should be calculated multiple times with specified required/awailable ratio.
        const spaces = children.map((c) => c.getRequiredSpace(awailableSpace));
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
                [borders.left + stakes.width, borders.top + stakes.height]
            ],
            bounds: [
                [0, 0],
                [borders.left + stakes.width + borders.right, borders.top + stakes.height + borders.bottom]
            ]
        }
    }

    draw(context: DrawingContext) {
        const { children } = this;
        children.forEach((c) => c.draw(context));
    }

}

export default function createCartesianContainer(
    data: Object[],
    scales: CartesianScales,
    children: CartesianElement[],
    options: CartesianContainerOptions) {

    return new CartesianContainer(data, scales, children, options);
}
