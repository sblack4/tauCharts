import { Element } from './element';
import {
    emptySpace,
    overflowsSpace,
    Space,
    stakesFromScales
} from './space';
import { Context } from '../graphics/context';
import { TextStyle } from '../graphics/style';
import { Scale, ScaleType, ScaleModel } from '../scales/scale';
import { measureText } from '../graphics/text';
import { deepAssign } from '../utils';
import d3 from 'd3';

export interface AxisOptions {
    label?: string;
    anchorPadding?: number;
    tickLength?: number;
    textPadding?: number;
    labelPadding?: number;
    textStyle?: TextStyle;
    labelStyle?: TextStyle;
}

const defaultAxisTextStyle: TextStyle = {
    family: 'sans-serif',
    size: 12,
    style: 'normal',
    weight: 'normal'
};

const defaultAxisLabelStyle: TextStyle = {
    family: 'sans-serif',
    size: 16,
    style: 'normal',
    weight: 'normal'
};

const defaultAxisOptions: AxisOptions = {
    label: '',
    anchorPadding: 10,
    tickLength: 4,
    textPadding: 1,
    labelPadding: 0
};

const defaultAxisBottomOptions: AxisOptions = deepAssign({}, defaultAxisOptions, {
    textStyle: Object.assign({}, defaultAxisTextStyle, {
        anchor: 'middle',
        baseline: 'hanging'
    }),
    labelStyle: Object.assign({}, defaultAxisLabelStyle, {
        anchor: 'middle',
        baseline: 'hanging'
    })
});

const defaultAxisLeftOptions: AxisOptions = deepAssign({}, defaultAxisOptions, {
    textStyle: Object.assign({}, defaultAxisTextStyle, {
        anchor: 'end',
        baseline: 'middle'
    }),
    labelStyle: Object.assign({}, defaultAxisLabelStyle, {
        anchor: 'end',
        baseline: 'middle'
    })
});

type AxisScales = ScaleModel & {
    x: Scale<any, number>;
    y: Scale<any, number>;
};

class AxisBottom implements Element {

    data: Object[];
    scales: AxisScales;
    options: AxisOptions;

    constructor(
        data: Object[],
        scales: AxisScales,
        options: AxisOptions) {

        this.data = data;
        this.scales = scales;
        this.options = deepAssign({},
            defaultAxisBottomOptions,
            options);
    }

    getRequiredSpace(available?: Space, captured?: Space): Space {

        const s = this._getLayout(available, captured);

        const sw = s.textSize.width + s.tickTextPad;
        const sh = 0;

        const bw = Math.max(
            s.textSize.width * 2 + s.tickTextPad * 3,
            s.lableSize.width + s.labelPad * 2);
        const bh = s.anchorPad
            + s.tickLineLen
            + s.tickTextPad * 2 + s.textSize.height
            + (this.options.label ? s.labelPad * 2 + s.lableSize.height : 0);

        const space = {
            stakes: {
                top: s.yShift,
                right: sw / 2,
                bottom: s.yShift + sh,
                left: -sw / 2
            },
            bounds: {
                top: s.yShift,
                right: bw / 2,
                bottom: s.yShift + bh,
                left: -bw / 2
            }
        };

        // Todo: Shift considering captured space.
        if (available && overflowsSpace(space, available)) {
            return emptySpace();
        }
        return space;
    }

    draw(context: Context, available?: Space, captured?: Space) {

        const { scales } = this;

        const s = this._getLayout(available, captured);

        const [x0, x1] = scales.x.range();
        const y0 = scales.y.range()[1] + s.anchorPad + s.yShift;
        const innerSideTicksW = s.textSize.width + s.tickTextPad;
        const midW = (x1 - x0 - innerSideTicksW);
        const awailMidTicksCount = Math.max(0, Math.floor(midW / (s.textSize.width + s.tickTextPad)));

        const domain = scales.x.domain();
        const ticks = scales.x.type === ScaleType.Ordinal ?
            domain :
            d3.ticks(domain[0], domain[domain.length - 1], awailMidTicksCount + 2);

        context.strokeStyle({ color: '#222', width: 1 });
        context
            .line(x0, y0, x1, y0)
            .stroke();
        ticks.forEach((t) => context
            .line(scales.x.value(t), y0, scales.x.value(t), y0 + s.tickLineLen)
            .stroke());

        context
            .fillStyle({ color: '#222' })
            .textStyle(this.options.textStyle);

        const tickFormat = (t) => String(t);

        ticks.forEach((t) => context
            .text(scales.x.value(t), y0 + s.tickLineLen + s.tickTextPad, tickFormat(t))
            .fill());

        if (this.options.label) {
            context
                .textStyle(this.options.labelStyle)
                .text((x0 + x1) / 2, y0 + s.tickLineLen + s.tickTextPad * 2 + s.textSize.height + s.labelPad, this.options.label)
                .fill();
        }

        const stakes = stakesFromScales(scales);

        return {
            stakes,
            bounds: {
                top: y0 - s.anchorPad,
                right: stakes.right + s.textSize.width / 2,
                bottom: y0 + s.tickLineLen + s.tickTextPad * 2 + s.textSize.height + (this.options.label ? s.lableSize.height + s.labelPad * 2 : 0),
                left: stakes.left - s.textSize.width / 2
            }
        };
    }

    private _getLayout(available?: Space, captured?: Space) {

        const { data, scales } = this;

        const yShift = captured ? Math.max(0, captured.bounds.bottom - captured.stakes.bottom) : 0;

        const {
            textStyle,
            textPadding,
            label,
            labelPadding,
            labelStyle,
            tickLength,
            anchorPadding
         } = this.options;

        const ticksSizes = scales.x.domain()
            .map((d) => String(d)) // Todo: Format.
            .map((t) => measureText(textStyle, t));

        const tickPad = textStyle.size * textPadding;
        const textSize = {
            width: Math.max(...ticksSizes.map((size) => size.width)),
            height: Math.max(...ticksSizes.map((size) => size.height))
        };

        const labelPad = labelStyle.size * labelPadding;
        const lableSize = measureText(labelStyle, label);

        return {
            tickTextPad: tickPad,
            textSize,
            labelPad,
            lableSize,
            tickLineLen: tickLength,
            anchorPad: anchorPadding,
            yShift
        };
    }

}

class AxisLeft implements Element {

    data: Object[];
    scales: AxisScales;
    options: AxisOptions;

    constructor(
        data: Object[],
        scales: AxisScales,
        options: AxisOptions) {

        this.data = data;
        this.scales = scales;
        this.options = deepAssign({},
            defaultAxisLeftOptions,
            options);
    }

    getRequiredSpace(available?: Space, captured?: Space): Space {

        const s = this._getLayout(available, captured);

        const sh = s.textSize.height + s.tickTextPad;

        const bw = s.anchorPad
            + s.tickLineLen
            + s.tickTextPad * 2 + s.textSize.width
            + (this.options.label ? s.labelPad * 2 + s.labelSize.width : 0);
        const bh = Math.max(
            s.textSize.height * 2 + s.tickTextPad * 3,
            s.labelSize.height + s.labelPad * 2);

        return {
            stakes: {
                top: -sh / 2,
                right: s.xShift,
                bottom: sh / 2,
                left: s.xShift
            },
            bounds: {
                top: -bh / 2,
                right: s.xShift,
                bottom: bh / 2,
                left: s.xShift - bw
            }
        };
    }

    draw(context: Context, available?: Space, captured?: Space): Space {

        const { scales } = this;

        const s = this._getLayout(available, captured);

        const [y0, y1] = scales.y.range();
        const x0 = scales.x.range()[0] - s.anchorPad + s.xShift;
        const innerSideTicksH = s.textSize.height + s.tickTextPad;
        const midH = (y1 - y0 - innerSideTicksH);
        const awailMidTicksCount = Math.max(0, Math.floor(midH / (s.textSize.height + s.tickTextPad)));

        const domain = scales.y.domain();
        const ticks = scales.y.type === ScaleType.Ordinal ?
            domain :
            d3.ticks(domain[0], domain[domain.length - 1], awailMidTicksCount + 2);

        context.strokeStyle({ color: '#222', width: 1 });
        context
            .line(x0, y0, x0, y1)
            .stroke();
        ticks.forEach((t) => context
            .line(x0, scales.y.value(t), x0 - s.tickLineLen, scales.y.value(t))
            .stroke());

        context
            .fillStyle({ color: '#222' })
            .textStyle(this.options.textStyle);
        ticks.forEach((t) => context
            .text(x0 - s.tickLineLen - s.tickTextPad, scales.y.value(t), String(t))
            .fill());

        if (this.options.label) {
            context
                .textStyle(this.options.labelStyle)
                .text(x0 - s.tickLineLen - s.tickTextPad * 2 - s.textSize.height - s.labelPad, (y0 + y1) / 2, this.options.label)
                .fill();
        }

        const stakes = stakesFromScales(scales);

        return {
            stakes,
            bounds: {
                top: stakes.top - s.textSize.height / 2,
                right: x0 + s.anchorPad,
                bottom: stakes.bottom + s.textSize.height / 2,
                left: x0 - s.tickLineLen - s.tickTextPad * 2 - s.textSize.width - (this.options.label ? s.labelSize.width + s.labelPad * 2 : 0)
            }
        };
    }

    private _getLayout(available?: Space, captured?: Space) {

        const { data, scales } = this;

        const xShift = captured ? Math.min(0, captured.bounds.left - captured.stakes.left) : 0;

        const {
            textStyle,
            textPadding,
            label,
            labelPadding,
            labelStyle,
            tickLength,
            anchorPadding
         } = this.options;

        const ticksSizes = scales.x.domain()
            .map((d) => String(d)) // Todo: Format.
            .map((t) => measureText(textStyle, t));

        const tickPad = textStyle.size * textPadding;
        const textSize = {
            width: Math.max(...ticksSizes.map((size) => size.width)),
            height: Math.max(...ticksSizes.map((size) => size.height))
        };

        const labelPad = labelStyle.size * labelPadding;
        const labelSize = measureText(labelStyle, label);

        return {
            tickTextPad: tickPad,
            textSize,
            labelPad,
            labelSize,
            tickLineLen: tickLength,
            anchorPad: anchorPadding,
            xShift
        };
    }

}

export function createAxisBottom(
    data: Object[],
    scales: AxisScales,
    options: AxisOptions = {}) {

    return new AxisBottom(data, scales, options);
}

export function createAxisLeft(
    data: Object[],
    scales: AxisScales,
    options: AxisOptions = {}) {

    return new AxisLeft(data, scales, options);
}
