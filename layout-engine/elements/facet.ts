import { Element, Space } from './element';
import { Context } from '../graphics/context';
import { OrdinalScale, ScaleType, ScaleModel } from '../scales/scale';

export interface FacetOptions {
    padding?: number;
    matrix?: [Element[]];
}

const defaultFacetOptions: FacetOptions = {
    padding: 16,
    matrix: [[]]
};

type FacetScales = ScaleModel & {
    x: OrdinalScale<any, number>;
    y: OrdinalScale<any, number>;
};

class FacetContainer implements Element {

    data: Object[];
    scales: FacetScales;
    options: FacetOptions;
    children: Element[];

    constructor(
        data: Object[],
        scales: FacetScales,
        options: FacetOptions,
        children: Element[]) {

        this.data = data;
        this.scales = scales;
        this.children = children;
        this.options = Object.assign({},
            defaultFacetOptions,
            options);
    }

    getRequiredSpace(awailableSpace?: Space): Space {

        const { children, scales } = this;
        const options = this.options;

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

    draw(context: Context) {



    }

}

export default function createFacetContainer(
    data: Object[],
    scales: FacetScales,
    options: FacetOptions,
    children: Element[]) {

    return new FacetContainer(data, scales, options, children);
}
