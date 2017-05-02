export interface Scale<TIn, TOut> {
    type: string;
    dimension: string;
    // aggregations: string[]; // Note: The idea is to precalculate multiple data aggregations.
    value(input: TIn): TOut;
    from(data: Object): TOut;
    invert(output: TOut): TIn;
    domain(): TIn[];
    domain(values: TIn[]): this;
    range(): [number, number];
    range(range: [number, number]): this;
}

export interface ContinuousScale<TIn, TOut> extends Scale<TIn, TOut> {
    type: 'continuous';
}

export interface OrdinalScale<TIn, TOut> extends Scale<TIn, TOut> {
    type: 'ordinal';
    stepSize(): TOut;
}

export const ScaleType = {
    Continuous: 'continuous' as 'continuous',
    Ordinal: 'ordinal' as 'ordinal'
};

export type ScaleFactory = (
    data: Object[],
    dimension: string,
    options?: Object[]
) => Scale<any, any>;

export interface ScaleModel {
    [model: string]: Scale<any, any>;
}
