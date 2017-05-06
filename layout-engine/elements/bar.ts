import { Element } from './element';
import { Space, emptySpace } from './space';
import { Context } from '../graphics/context';
import { Scale, ScaleType, ScaleModel, OrdinalScale } from '../scales/scale';

export interface BarOptions {
    flip?: boolean;
    minHeight?: number;
    minWidth?: number;
    padding?: number;
}

const defaultBarOptions: BarOptions = {
    flip: false,
    minHeight: 16,
    minWidth: 4,
    padding: 0.25
};

export type BarScales = ScaleModel & {
    x: Scale<any, number>;
    y: Scale<any, number>;
};

class BarGroup implements Element {

    data: Object[];
    scales: BarScales;
    options: BarOptions;

    constructor(
        data: Object[],
        scales: BarScales,
        options: BarOptions) {

        this.data = data;
        this.scales = scales;
        this.options = Object.assign({},
            defaultBarOptions,
            options);
    }

    getRequiredSpace(availableSpace?: Space): Space {

        const opt = this.options;
        const { data, scales } = this;

        const count = data.length;
        if (count === 0) {
            return emptySpace();
        }

        const barWidth = opt.minWidth;

        const stakes: [number, number] = [
            count * barWidth + (count - 1) * opt.padding * barWidth,
            opt.minHeight
        ];
        const b0: [number, number] = [-barWidth / 2, 0];
        const b1: [number, number] = [stakes[0] + barWidth / 2, stakes[1]];
        if (opt.flip) {
            stakes.reverse();
            b0.reverse();
            b1.reverse();
        }

        return {
            stakes: {
                top: 0,
                right: stakes[0],
                bottom: stakes[1],
                left: 0
            },
            bounds: {
                top: b0[1],
                right: b1[0],
                bottom: b1[1],
                left: b0[0]
            }
        };
    }

    draw(context: Context, available?: Space) {

        const { data, scales, options } = this;

        if (data.length === 0) {
            return emptySpace();
        }

        context.fillStyle({ color: '#d42' });

        var top = Number.MAX_VALUE;
        var right = Number.MIN_VALUE;
        var bottom = Number.MIN_VALUE;
        var left = Number.MAX_VALUE;

        data.forEach((d) => {
            const x = scales.x.from(d);
            const y = scales.y.from(d);
            const y0 = scales.y.value(0);
            const w = scales.x.type === ScaleType.Ordinal ?
                (scales.x as OrdinalScale<any, number>).stepSize() * (1 - options.padding) :
                options.minWidth;
            const x0 = x - w / 2;
            const h = Math.abs(y - y0);

            top = Math.min(top, y0);
            right = Math.max(right, x0 + w);
            bottom = Math.max(bottom, y0 + h);
            left = Math.min(left, x0);

            context
                .rect(x0, y0, w, h)
                .fill();
        });

        const xRange = scales.x.range();
        const yRange = scales.y.range();

        return {
            stakes: {
                top: yRange[0],
                right: xRange[1],
                bottom: yRange[1],
                left: xRange[0]
            },
            bounds: {
                top,
                right,
                bottom,
                left
            }
        };

    }

}

class Bar {

}

export default function createBarGroup(
    data: Object[],
    scales: BarScales,
    options: BarOptions = {}) {

    return new BarGroup(data, scales, options);
}
