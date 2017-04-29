import { CartesianElement, CartesianSpace } from './cartesian';
import { DrawingContext } from '../graphics/context';
import { OrdinalScale, Scale, ScaleType, ScaleModel } from '../scales/scale';

export interface FacetOptions {
    padding?: number,
    matrix?: [CartesianElement[]]
}

const defaultFacetOptions: FacetOptions = {
    padding: 16,
    matrix: [[]]
};

type FacetScales = ScaleModel & {
    x: OrdinalScale<any, number>,
    y: OrdinalScale<any, number>
};

class FacetContainer implements CartesianElement {

    private _options: FacetOptions;
    data: Object[];
    scales: FacetScales;
    children: CartesianElement[];

    constructor(
        data: Object[],
        scales: FacetScales,
        children: CartesianElement[],
        options: FacetOptions) {

        this.data = data;
        this.scales = scales;
        this.children = children;
        this._options = Object.assign({},
            defaultFacetOptions,
            options);
    }

    getRequiredSpace(awailableSpace?: CartesianSpace) {

        const { children, scales } = this;
        const options = this._options;

        if (children.length === 0) {
            return {
                stakes: [[0, 0], [0, 0]],
                bounds: [[0, 0], [0, 0]]
            };
        }

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

        const xcount = scales.x.domain().length;
        const ycount = scales.y.domain().length;

        const cellW = borders.left + stakes.width + borders.right;
        const cellH = borders.top + stakes.height + borders.bottom;

        return {
            stakes: [
                [cellW / 2, cellH / 2],
                [cellW * (xcount - 0.5) + options.padding * (xcount - 1), cellH * (ycount - 0.5) + options.padding * (ycount - 1)]
            ],
            bounds: [
                [0, 0],
                [cellW * xcount + options.padding * (xcount - 1), cellH * ycount + options.padding * (ycount - 1)]
            ]
        };
    }

    draw(context: DrawingContext) {

        

    }

}

export default function createFacetContainer(
    data: Object[],
    scales: FacetScales,
    children: CartesianElement[],
    options: FacetOptions) {

    return new FacetContainer(data, scales, children, options);
}
