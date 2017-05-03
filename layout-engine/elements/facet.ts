import { Element, Space } from './element';
import { CartesianContainer } from './cartesian';
import { Context } from '../graphics/context';
import { OrdinalScale, ScaleType, ScaleModel } from '../scales/scale';

export interface FacetOptions {
    padding?: number;
}

const defaultFacetOptions: FacetOptions = {
    padding: 16
};

type FacetScales = ScaleModel & {
    x?: OrdinalScale<Object[], number>;
    y?: OrdinalScale<Object[], number>;
};

class FacetContainer implements Element {

    data: Object[][];
    scales: FacetScales;
    options: FacetOptions;
    children: CartesianContainer[];

    constructor(
        data: Object[][],
        scales: FacetScales,
        options: FacetOptions,
        children: CartesianContainer[]) {

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

        const xcount = scales.x ? scales.x.domain().length : 1;
        const ycount = scales.y ? scales.y.domain().length : 1;

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

        const { scales } = this;
        // const dx = scales.x ? -scales.x.stepSize() / 2 : 0;
        // const dy = scales.y ? -scales.y.stepSize() / 2 : 0;

        this.children.forEach((c) => {
            const d = c.data[0];
            const x = scales.x ? scales.x.from(d) : 0;
            const y = scales.y ? scales.y.from(d) : 0;

            const rangeX = c.scales.x.range();
            const rangeY = c.scales.y.range();
            const dx = scales.x ? - (rangeX[1] + rangeX[0]) / 2 : 0;
            const dy = scales.y ? - (rangeY[1] + rangeY[0]) / 2 : 0;

            context.translate(x + dx, y + dy);

            c.draw(context);

            context.resetTransform();
        });

    }

}

export default function createFacetContainer(
    data: Object[][],
    scales: FacetScales,
    options: FacetOptions,
    children: CartesianContainer[]) {

    return new FacetContainer(data, scales, options, children);
}
