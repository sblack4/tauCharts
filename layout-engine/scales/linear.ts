import { ScaleType, ContinuousScale } from './scale';
import { scaleLinear, ScaleLinear } from 'd3';

interface LinearScaleOptions {
    nice?: boolean;
    includeZero?: boolean;
}

const defaultLinearScaleOptions: LinearScaleOptions = {
    nice: false,
    includeZero: false
};

class LinearScale implements ContinuousScale<number, number>{

    type: 'continuous';
    dimension: string;
    // aggregations: string[];
    // static aggregations = ['min', 'max'];
    private _scale: ScaleLinear<number, number>;
    private _options: LinearScaleOptions;

    constructor(dimension: string, options: LinearScaleOptions) {
        this.type = ScaleType.Continuous;
        this.dimension = dimension;
        this._options = Object.assign({},
            defaultLinearScaleOptions,
            options);
        // this.aggregations = LinearScale.aggregations;
        this._scale = scaleLinear<number, number>();
        if (this._options.nice) {
            this._scale.nice();
        }
    }

    value(x: number) {
        return this._scale(x);
    }

    from(data: Object) {
        return this._scale(data[this.dimension]);
    }

    invert(x: number) {
        return this._scale.invert(x);
    }

    domain(): [number, number];
    domain(values: [number, number]): this;
    domain(values?: [number, number]) {
        if (values === undefined) {
            return this._scale.domain();
        }
        const domain = this._options.includeZero ?
            [Math.min(0, values[0]), Math.max(0, values[1])] :
            values.slice();
        this._scale.domain(domain);
        return this;
    }

    range(): [number, number];
    range(range: [number, number]): this;
    range(range?: [number, number]) {
        if (range === undefined) {
            return this._scale.range();
        }
        this._scale.range(range);
        return this;
    }
}

export default function createLinearScale(
    data: Object[],
    dimension: string,
    options: LinearScaleOptions = {}) {

    const values = data.map((d) => d[dimension])
        .sort((a, b) => a - b);

    return new LinearScale(dimension, options)
        .domain([values[0], values[values.length - 1]]);
}
