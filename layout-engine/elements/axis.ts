import { CartesianElement, CartesianElementSpace } from './cartesian';
import { DrawingContext, TextStyle } from '../graphics/context';
import { Scale, ScaleType } from '../scales/scale';
import { measureText } from '../graphics/text';
import d3 from 'd3';

export interface AxisOptions {
    label?: string,
    anchorPadding?: number,
    tickLength?: number,
    textPadding?: number,
    labelPadding?: number,
    textStyle?: TextStyle,
    labelStyle?: TextStyle
}

const defaultAxisOptions: AxisOptions = {
    label: '',
    anchorPadding: 10,
    tickLength: 4,
    textPadding: 1,
    labelPadding: 0,
    textStyle: {
        family: 'sans-serif',
        size: 12,
        style: 'normal',
        weight: 'normal',
        anchor: 'middle',
        baseline: 'hanging'
    },
    labelStyle: {
        family: 'sans-serif',
        size: 16,
        style: 'normal',
        weight: 'normal',
        anchor: 'middle',
        baseline: 'hanging'
    }
};

function deepAssign<
    A extends Object,
    B extends Object,
    C extends Object,
    D extends Object,
    E extends Object>
    (a: A, b?: B, c?: C, d?: D, e?: E): A & B & C & D & E {
    const objects: Object[] = Array.from(arguments).filter((obj) => obj);
    var result: Object = Object.assign.apply(null, objects);
    for (var prop in result) {
        if (typeof result[prop] === 'object' && result[prop] !== null) {
            let objProps = objects
                .filter((obj) => typeof obj[prop] === 'object')
                .map((obj) => obj[prop]);
            result[prop] = deepAssign.apply(null, objProps);
        }
    }
    return result as A & B & C & D & E;
}

interface AxisScales {
    x: Scale<any, number>,
    y: Scale<any, number>
}

class AxisBottom implements CartesianElement {

    private _options: AxisOptions;

    constructor(options: AxisOptions) {
        this._options = deepAssign({},
            defaultAxisOptions,
            options);
    }

    getRequiredSpace(options: {
        data: Object[],
        scales: { [model: string]: Scale<any, any> } & AxisScales,
        ratio: [number, number]
    }): CartesianElementSpace {

        const s = this._getLayout(options);

        const sw = s.tsize.width + s.tpad;
        const sh = 0;

        const bw = Math.max(
            s.tsize.width * 2 + s.tpad * 3,
            s.lsize.width + s.lpad * 2);
        const bh = s.apad
            + s.line
            + s.tpad * 2 + s.tsize.height
            + (this._options.label ? s.lpad * 2 + s.lsize.height : 0);

        return {
            stakes: [[-sw / 2, 0], [sw / 2, sh]],
            bounds: [[-bw / 2, 0], [bw / 2, bh]]
        };
    }

    draw(context: DrawingContext, { data, scales }: {
        data: Object[],
        scales: { [model: string]: Scale<any, any> } & AxisScales
    }) {

        const s = this._getLayout({ data, scales });

        const [x0, x1] = scales.x.range();
        const y0 = scales.y.range()[1] + s.apad;
        const innerSideTicksW = s.tsize.width + s.tpad;
        const midW = (x1 - x0 - innerSideTicksW);
        const awailMidTicksCount = Math.max(0, Math.floor(midW / (s.tsize.width + s.tpad)));

        const domain = scales.x.domain();
        const ticks = scales.x.type === ScaleType.Ordinal ?
            domain :
            d3.ticks(domain[0], domain[domain.length - 1], awailMidTicksCount + 2);

        context.strokeStyle({ color: '#222', width: 1 });
        context
            .line(x0, y0, x1, y0)
            .stroke();
        ticks.forEach((t) => context
            .line(scales.x.value(t), y0, scales.x.value(t), y0 + s.line)
            .stroke());

        context
            .fillStyle({ color: '#222' })
            .textStyle(this._options.textStyle);
        ticks.forEach((t) => context
            .text(scales.x.value(t), y0 + s.line + s.tpad, String(t))
            .fill());

        if (this._options.label) {
            context
                .textStyle(this._options.labelStyle)
                .text((x0 + x1) / 2, y0 + s.line + s.tpad * 2 + s.tsize.height + s.lpad, this._options.label)
                .fill();
        }
    }

    private _getLayout({ data, scales }: {
        data: Object[],
        scales: { [model: string]: Scale<any, any> } & AxisScales
    }) {

        const {
            textStyle,
            textPadding,
            label,
            labelPadding,
            labelStyle,
            tickLength,
            anchorPadding
         } = this._options;

        const ticksSizes = scales.x.domain()
            .map((d) => String(d)) // Todo: Format.
            .map((t) => measureText(textStyle, t));

        const tpad = textStyle.size * textPadding;
        const tsize = {
            width: Math.max(...ticksSizes.map((size) => size.width)),
            height: Math.max(...ticksSizes.map((size) => size.height))
        };

        const lpad = labelStyle.size * labelPadding;
        const lsize = measureText(labelStyle, label);

        return {
            tpad,
            tsize,
            lpad,
            lsize,
            line: tickLength,
            apad: anchorPadding
        };
    }

}

export function createAxisBottom(options: AxisOptions = {}) {
    return new AxisBottom(options);
}
