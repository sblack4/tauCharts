import { ScaleType, Scale } from './scale';
import { scaleLinear, ScaleLinear } from 'd3';

class LinearScale implements Scale<number>{

    type: string;
    private _scale: ScaleLinear<number, number>;

    constructor() {
        this.type = ScaleType.Continuous;
        this._scale = scaleLinear<number, number>();
    }

    get(x: number) {
        return this._scale(x);
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
}

export default function createLinearScale() {
    return new LinearScale();
}
