import { Element } from './element';
import { Space } from './space';
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

    getRequiredSpace(awailableSpace?: Space): Space {

        const s = this._getLayout();

        const sw = s.tsize.width + s.tpad;
        const sh = 0;

        const bw = Math.max(
            s.tsize.width * 2 + s.tpad * 3,
            s.lsize.width + s.lpad * 2);
        const bh = s.apad
            + s.line
            + s.tpad * 2 + s.tsize.height
            + (this.options.label ? s.lpad * 2 + s.lsize.height : 0);

        return {
            stakes: {
                top: 0,
                right: sw / 2,
                bottom: sh,
                left: -sw / 2
            },
            bounds: {
                top: 0,
                right: bw / 2,
                bottom: bh,
                left: -bw / 2
            }
        };
    }

    draw(context: Context) {

        const { scales } = this;

        const s = this._getLayout();

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
            .textStyle(this.options.textStyle);
        ticks.forEach((t) => context
            .text(scales.x.value(t), y0 + s.line + s.tpad, String(t))
            .fill());

        if (this.options.label) {
            context
                .textStyle(this.options.labelStyle)
                .text((x0 + x1) / 2, y0 + s.line + s.tpad * 2 + s.tsize.height + s.lpad, this.options.label)
                .fill();
        }
    }

    private _getLayout() {

        const { data, scales } = this;

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

    getRequiredSpace(awailableSpace?: Space): Space {

        const s = this._getLayout();

        const sw = 0;
        const sh = s.tsize.height + s.tpad;

        const bw = s.apad
            + s.line
            + s.tpad * 2 + s.tsize.width
            + (this.options.label ? s.lpad * 2 + s.lsize.width : 0);
        const bh = Math.max(
            s.tsize.height * 2 + s.tpad * 3,
            s.lsize.height + s.lpad * 2);

        return {
            stakes: {
                top: -sh / 2,
                right: sw,
                bottom: sh / 2,
                left: 0
            },
            bounds: {
                top: -bh / 2,
                right: bw,
                bottom: bh / 2,
                left: 0
            }
        };
    }

    draw(context: Context) {

        const { scales } = this;

        const s = this._getLayout();

        const [y0, y1] = scales.y.range();
        const x0 = scales.x.range()[0] - s.apad;
        const innerSideTicksH = s.tsize.height + s.tpad;
        const midH = (y1 - y0 - innerSideTicksH);
        const awailMidTicksCount = Math.max(0, Math.floor(midH / (s.tsize.height + s.tpad)));

        const domain = scales.y.domain();
        const ticks = scales.y.type === ScaleType.Ordinal ?
            domain :
            d3.ticks(domain[0], domain[domain.length - 1], awailMidTicksCount + 2);

        context.strokeStyle({ color: '#222', width: 1 });
        context
            .line(x0, y0, x0, y1)
            .stroke();
        ticks.forEach((t) => context
            .line(x0, scales.y.value(t), x0 - s.line, scales.y.value(t))
            .stroke());

        context
            .fillStyle({ color: '#222' })
            .textStyle(this.options.textStyle);
        ticks.forEach((t) => context
            .text(x0 - s.line - s.tpad, scales.y.value(t), String(t))
            .fill());

        if (this.options.label) {
            context
                .textStyle(this.options.labelStyle)
                .text(x0 - s.line - s.tpad * 2 - s.tsize.height - s.lpad, (y0 + y1) / 2, this.options.label)
                .fill();
        }
    }

    private _getLayout() {

        const { data, scales } = this;

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
