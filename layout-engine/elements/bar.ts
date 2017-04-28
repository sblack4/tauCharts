import { CartesianElement, CartesianElementSpace } from './cartesian';
import { DrawingContext } from '../graphics/context';
import { Scale, ScaleType } from '../scales/scale';

export interface BarGroupOptions {
    flip?: boolean,
    minHeight?: number,
    minWidth?: number,
    padding?: number
}

const defaultBarGroupOptions: BarGroupOptions = {
    flip: false,
    minHeight: 16,
    minWidth: 4,
    padding: 0.25
};

interface BarGroupScales {
    x: Scale<any, number>,
    y: Scale<any, number>
}

class BarGroup implements CartesianElement {

    private _options: BarGroupOptions;

    constructor(options: BarGroupOptions) {
        this._options = Object.assign({},
            defaultBarGroupOptions,
            options);
    }

    getRequiredSpace({ data, scales, ratio }: {
        data: Object[],
        scales: { [model: string]: Scale<any, any> } & BarGroupScales,
        ratio: [number, number]
    }): CartesianElementSpace {

        const s = this._options;

        const count = data.length;
        if (count === 0) {
            return {
                stakes: [[0, 0], [0, 0]],
                bounds: [[0, 0], [0, 0]]
            };
        }

        const barWidth = s.minWidth;

        const stakes: [number, number] = [
            count * barWidth + (count - 1) * s.padding * barWidth,
            s.minHeight
        ];
        const bounds: [number, number] = [
            stakes[0],
            stakes[1] + scales.x.type === ScaleType.Continuous ? barWidth : 0
        ];
        if (s.flip) {
            stakes.reverse();
            bounds.reverse();
        }

        return {
            stakes: [[0, 0], stakes],
            bounds: [[0, 0], bounds]
        };
    }

    draw(context: DrawingContext, { data, scales }: {
        data: Object[],
        scales: { [model: string]: Scale<any, any> } & BarGroupScales
    }) {

        context.fillStyle({ color: '#d42' });

        data.forEach((d) => {
            const x = scales.x.from(d);
            const y = scales.y.from(d);
            const y0 = scales.y.value(0);
            const w = this._options.minWidth;
            const x0 = x - w / 2;
            const h = Math.abs(y - y0);

            context
                .rect(x0, y0, w, h)
                .fill();
        });

    }

}

class Bar {

}

export default function createBarGroup(options: BarGroupOptions = {}) {
    return new BarGroup(options);
}
