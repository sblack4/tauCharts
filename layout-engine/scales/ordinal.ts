import { ScaleType, OrdinalScale } from './scale';
import { scalePoint, ScalePoint } from 'd3';
import { unique } from '../utils';

interface OrdinalScaleOptions {
    sorter?: 'date' | 'string' | 'number';
}

const defaultOrdinalScaleOptions: OrdinalScaleOptions = {
    sorter: 'string'
};

const sorters = {
    'date': (a: Date, b: Date) => Number(a) - Number(b),
    'string': (a: string, b: string) => String(a).localeCompare(String(b)),
    'number': (a: number, b: number) => Number(a) - Number(b)
};

class ScaleOrdinal implements OrdinalScale<any, number>{

    type: 'ordinal';
    dimension: string;
    private _scale: ScalePoint<any>;
    private _options: OrdinalScaleOptions;

    constructor(dimension: string, options: OrdinalScaleOptions) {
        this.type = ScaleType.Ordinal;
        this.dimension = dimension;
        this._options = Object.assign({},
            defaultOrdinalScaleOptions,
            options);
        this._scale = scalePoint<any>().padding(0.5);
    }

    value(x: any) {
        return this._scale(x);
    }

    from(data: Object) {
        return this._scale(data[this.dimension]);
    }

    invert(x: number): any {
        throw new Error('`ScaleOrdinal.invert(x)` is not implemented');
    }

    domain(): any[];
    domain(values: any[]): this;
    domain(values?: any[]) {
        if (values === undefined) {
            return this._scale.domain();
        }
        this._scale.domain(values);
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

    stepSize() {
        return this._scale.step();
    }
}

export default function createOrdinalScale(
    data: Object[],
    dimension: string,
    _options: OrdinalScaleOptions = {}) {

    const options = Object.assign({},
        defaultOrdinalScaleOptions,
        _options);

    const domain = unique(data.map((d) => d[dimension]))
        .sort(sorters[options.sorter]);

    return new ScaleOrdinal(dimension, options)
        .domain(domain);
}
