import { Element } from './element';
import {
    emptySpace,
    Space,
    spaceMeasurer,
    stakesFromScales
} from './space';
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

        const measure = spaceMeasurer();

        data.forEach((d) => {
            const x = scales.x.from(d);
            const y = scales.y.from(d);
            const y0 = scales.y.value(0);
            const w = scales.x.type === ScaleType.Ordinal ?
                (scales.x as OrdinalScale<any, number>).stepSize() * (1 - options.padding) :
                options.minWidth;
            const x0 = x - w / 2;
            const h = Math.abs(y - y0);
            measure.rect(x0, y0, w, h);

            context
                .rect(x0, y0, w, h)
                .fill();
        });

        return {
            stakes: stakesFromScales(scales),
            bounds: measure.bounds()
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
