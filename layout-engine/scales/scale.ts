type Value = (number | string | Date);

export interface Scale<TIn extends Value, TOut extends Value> {
    type: string;
    dimension: string;
    aggregations: string[];
    value(input: TIn): TOut;
    from(data: Object): TOut;
    invert(output: TOut): TIn;
    domain(): TIn[];
    domain(values: TIn[]): this;
    range(): [number, number];
    range(range: [number, number]): this;
}

export interface ContinuousScale<TIn extends Value, TOut extends Value> extends Scale<TIn, TOut> {
    type: 'continuous';
}

export interface OrdinalScale<TIn extends Value, TOut extends Value> extends Scale<TIn, TOut> {
    type: 'ordinal';
}

export const ScaleType = {
    Continuous: 'continuous',
    Ordinal: 'ordinal'
};

export type ScaleFactory = (
    data: Object[],
    dimension: string,
    options?: Object[]
) => Scale<Value, Value>;

export interface ScaleModel {
    [model: string]: Scale<any, any>;
}
